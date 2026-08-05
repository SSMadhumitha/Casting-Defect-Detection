import os
import cv2
import torch
import numpy as np
import torch.nn as nn
import datetime

from fastapi import FastAPI, UploadFile, File, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from ultralytics import YOLO
import shutil

from database import engine, Base, get_db
from auth import router as auth_router, get_current_user
from models.user import User
from models.inspection import Inspection
from models.signoff import DailySignoff
from pydantic import BaseModel
from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import func as sqlfunc


# ─── Create DB tables ────────────────────────────────────────────────────────
Base.metadata.create_all(bind=engine)

# ─── U-Net model ────────────────────────────────────────────────────────────

class UNet(nn.Module):
    def __init__(self, in_channels=1, out_channels=1):
        super(UNet, self).__init__()
        self.enc1 = self.conv_block(in_channels, 64)
        self.enc2 = self.conv_block(64, 128)
        self.enc3 = self.conv_block(128, 256)
        self.enc4 = self.conv_block(256, 512)
        self.bottleneck = self.conv_block(512, 1024)
        self.upconv4 = nn.ConvTranspose2d(1024, 512, kernel_size=2, stride=2)
        self.dec4 = self.conv_block(1024, 512)
        self.upconv3 = nn.ConvTranspose2d(512, 256, kernel_size=2, stride=2)
        self.dec3 = self.conv_block(512, 256)
        self.upconv2 = nn.ConvTranspose2d(256, 128, kernel_size=2, stride=2)
        self.dec2 = self.conv_block(256, 128)
        self.upconv1 = nn.ConvTranspose2d(128, 64, kernel_size=2, stride=2)
        self.dec1 = self.conv_block(128, 64)
        self.final_conv = nn.Conv2d(64, out_channels, kernel_size=1)
        self.pool = nn.MaxPool2d(2)

    def conv_block(self, in_channels, out_channels):
        return nn.Sequential(
            nn.Conv2d(in_channels, out_channels, kernel_size=3, padding=1),
            nn.BatchNorm2d(out_channels),
            nn.ReLU(inplace=True),
            nn.Conv2d(out_channels, out_channels, kernel_size=3, padding=1),
            nn.BatchNorm2d(out_channels),
            nn.ReLU(inplace=True)
        )

    def forward(self, x):
        enc1 = self.enc1(x)
        enc2 = self.enc2(self.pool(enc1))
        enc3 = self.enc3(self.pool(enc2))
        enc4 = self.enc4(self.pool(enc3))
        bottleneck = self.bottleneck(self.pool(enc4))
        dec4 = self.upconv4(bottleneck)
        dec4 = torch.cat([dec4, enc4], dim=1)
        dec4 = self.dec4(dec4)
        dec3 = self.upconv3(dec4)
        dec3 = torch.cat([dec3, enc3], dim=1)
        dec3 = self.dec3(dec3)
        dec2 = self.upconv2(dec3)
        dec2 = torch.cat([dec2, enc2], dim=1)
        dec2 = self.dec2(dec2)
        dec1 = self.upconv1(dec2)
        dec1 = torch.cat([dec1, enc1], dim=1)
        dec1 = self.dec1(dec1)
        return torch.sigmoid(self.final_conv(dec1))


torch.set_num_threads(4)
cv2.setNumThreads(4)

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
filter_model = UNet(in_channels=1, out_channels=1).to(device)
filter_model.load_state_dict(torch.load("models/xray_filter_model.pth", map_location=device))
filter_model.eval()

yolo_model = YOLO("models/best.pt")

CLASS_NAMES = {0: "good_casting", 1: "defect"}

# ─── Image helpers ──────────────────────────────────────────────────────────

def load_image(image_path):
    img = cv2.imread(image_path, cv2.IMREAD_UNCHANGED)
    if img is None:
        raise ValueError(f"Could not read image: {image_path}")
    if len(img.shape) == 3:
        if img.shape[2] == 4:
            img = cv2.cvtColor(img, cv2.COLOR_BGRA2GRAY)
        elif img.shape[2] == 3:
            img = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        elif img.shape[2] == 1:
            img = img.squeeze(axis=2)
    if img.dtype == np.uint16:
        return img, 16, 65535.0
    img = img.astype(np.uint8)
    return img, 8, 255.0

def preprocess_image(img, max_val, target_size=960):
    img = cv2.resize(img, (target_size, target_size))
    img = img.astype(np.float32) / max_val
    tensor = torch.from_numpy(img).float().unsqueeze(0).unsqueeze(0)
    return tensor

def postprocess_image(output_tensor, original_shape):
    out = output_tensor.cpu().numpy().squeeze()
    out = (out * 255.0).astype(np.uint8)
    return cv2.resize(out, (original_shape[1], original_shape[0]))

def apply_unsharp_mask(image, sigma=1.0, amount=0.6):
    blurred = cv2.GaussianBlur(image, (0, 0), sigma)
    sharpened = cv2.addWeighted(image, 1.0 + amount, blurred, -amount, 0)
    return np.clip(sharpened, 0, 255).astype(np.uint8)

def apply_filter(image_path, output_path):
    img, bit_depth, max_val = load_image(image_path)
    original_shape = img.shape
    img_tensor = preprocess_image(img, max_val, 960).to(device)
    with torch.no_grad():
        output_tensor = filter_model(img_tensor)
    filtered_img = postprocess_image(output_tensor, original_shape)
    filtered_img = apply_unsharp_mask(filtered_img, sigma=2, amount=0.7)
    cv2.imwrite(output_path, filtered_img)
    return output_path

# ─── FastAPI app ─────────────────────────────────────────────────────────────

app = FastAPI(title="CastingAI API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Include auth routes
app.include_router(auth_router)

@app.get("/")
def home():
    return {"message": "CastingAI API v2.0 running"}

from fastapi import Request

def check_is_casting_xray(image_path: str):
    """Check if the image is a valid monochrome casting X-ray vs a natural color photo."""
    img = cv2.imread(image_path)
    if img is None:
        return False, "Could not read image file."
    
    if len(img.shape) == 3 and img.shape[2] == 3:
        b, g, r = cv2.split(img)
        color_diff = float(np.mean(np.abs(r.astype(np.float32) - g.astype(np.float32))) +
                           np.mean(np.abs(g.astype(np.float32) - b.astype(np.float32))))
        if color_diff > 12.0:
            return False, "Color photo detected. Image does not appear to be an industrial casting X-ray radiograph."

    return True, "Valid radiograph scan"


@app.post("/predict")
def predict(
    request: Request,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    file_path = os.path.join(UPLOAD_FOLDER, file.filename)
    filtered_path = os.path.join(UPLOAD_FOLDER, f"filtered_{file.filename}")
    annotated_path = os.path.join(UPLOAD_FOLDER, f"detected_{file.filename}")

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    is_valid_casting, validation_msg = check_is_casting_xray(file_path)

    apply_filter(file_path, filtered_path)
    results = yolo_model(filtered_path, conf=0.5)

    detections = []
    if is_valid_casting:
        for result in results:
            for box in result.boxes:
                class_id = int(box.cls[0])
                confidence = float(box.conf[0])
                detections.append({
                    "class_id": class_id,
                    "class_name": CLASS_NAMES.get(class_id, "unknown"),
                    "confidence": round(confidence, 2),
                })
            annotated_image = result.plot(line_width=5, font_size=2)
            cv2.imwrite(annotated_path, annotated_image)
    else:
        # Save raw copy if invalid
        shutil.copyfile(file_path, annotated_path)

    # Persist this inspection to the database
    has_defects = len(detections) > 0
    max_conf = max((d["confidence"] for d in detections), default=0.0)
    inspection_record = Inspection(
        user_id=current_user.id,
        filename=file.filename,
        has_defects=has_defects,
        defect_count=len(detections),
        max_confidence=max_conf,
        detections=detections,
    )
    db.add(inspection_record)
    db.commit()
    db.refresh(inspection_record)

    # Dynamically build image URLs based on request host
    base_url = str(request.base_url)
    return {
        "filename": file.filename,
        "is_valid_casting": is_valid_casting,
        "validation_message": validation_msg if not is_valid_casting else None,
        "original_image": f"{base_url}uploads/{file.filename}",
        "filtered_image": f"{base_url}uploads/filtered_{file.filename}",
        "output_image": f"{base_url}uploads/detected_{file.filename}",
        "detections": detections,
        "created_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
    }


@app.get("/stats")
def get_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Dashboard stats for the logged-in user."""
    records = db.query(Inspection).filter(Inspection.user_id == current_user.id).all()
    total = len(records)
    defect_records = [r for r in records if r.has_defects]
    pass_records   = [r for r in records if not r.has_defects]
    total_defects  = sum(r.defect_count for r in records)
    pass_rate      = round((len(pass_records) / total) * 100) if total else 0
    avg_conf       = round(sum(r.max_confidence for r in records) / total * 100, 1) if total else 0
    return {
        "total_inspections": total,
        "defects_detected": total_defects,
        "pass_rate": pass_rate,
        "avg_confidence": avg_conf,
    }


@app.get("/analytics")
def get_analytics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Full analytics for the logged-in user."""
    records = db.query(Inspection).filter(Inspection.user_id == current_user.id).all()
    total = len(records)
    defect_records = [r for r in records if r.has_defects]
    pass_records   = [r for r in records if not r.has_defects]
    total_defects  = sum(r.defect_count for r in records)
    pass_rate      = round((len(pass_records) / total) * 100) if total else 0
    avg_conf       = round(sum(r.max_confidence for r in records) / total * 100, 1) if total else 0

    # Monthly breakdown (last 6 months by name)
    from collections import defaultdict
    import datetime
    monthly: dict = defaultdict(lambda: {"inspections": 0, "defects": 0})
    now = datetime.datetime.utcnow()
    for r in records:
        if r.created_at and (now - r.created_at.replace(tzinfo=None)).days <= 180:
            key = r.created_at.strftime("%b")
            monthly[key]["inspections"] += 1
            monthly[key]["defects"]     += r.defect_count

    # Build ordered list for last 6 months
    months_order = [(now - datetime.timedelta(days=30 * i)).strftime("%b") for i in range(5, -1, -1)]
    monthly_data = [
        {"month": m, "inspections": monthly[m]["inspections"], "defects": monthly[m]["defects"]}
        for m in months_order
    ]

    # Defect type distribution from stored detection class_names
    defect_counts: dict = defaultdict(int)
    for r in records:
        for d in (r.detections or []):
            name = d.get("class_name", "unknown")
            if name != "good_casting":
                defect_counts[name] += 1

    defect_distribution = [
        {"name": k, "count": v}
        for k, v in sorted(defect_counts.items(), key=lambda x: -x[1])
    ]

    return {
        "total_inspections": total,
        "total_defects": total_defects,
        "avg_confidence": avg_conf,
        "pass_rate": pass_rate,
        "monthly_data": monthly_data,
        "defect_distribution": defect_distribution,
    }


@app.get("/inspections")
def get_inspections(
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieve all inspections for the logged-in user, sorted by date descending."""
    records = db.query(Inspection).filter(Inspection.user_id == current_user.id).order_by(Inspection.created_at.desc()).all()
    base_url = str(request.base_url)
    
    results = []
    for r in records:
        results.append({
            "id": f"RPT-{str(r.id).zfill(3)}",
            "date": r.created_at.isoformat() if r.created_at else None,
            "file": r.filename,
            "status": "Defect Detected" if r.has_defects else "Passed",
            "defects": r.defect_count,
            "confidence": f"{round(r.max_confidence * 100)}%",
            "color": "#f87171" if r.has_defects else "#4ade80",
            "resultData": {
                "filename": r.filename,
                "original_image": f"{base_url}uploads/{r.filename}",
                "filtered_image": f"{base_url}uploads/filtered_{r.filename}",
                "output_image": f"{base_url}uploads/detected_{r.filename}",
                "detections": r.detections,
            }
        })
    return results


@app.delete("/inspections")
def clear_inspections(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete all inspections for the logged-in user."""
    db.query(Inspection).filter(Inspection.user_id == current_user.id).delete()
    db.commit()
    return {"message": "All inspections cleared"}


class SignoffRequest(BaseModel):
    date: Optional[str] = None
    remarks: Optional[str] = ""


@app.get("/signoff/today")
def get_today_signoff(
    date: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    target_date = date or datetime.datetime.now().strftime("%Y-%m-%d")
    record = db.query(DailySignoff).filter(DailySignoff.date == target_date).first()
    if not record:
        return {"signed": False, "date": target_date, "user_role": current_user.role}
    return {
        "signed": True,
        "date": record.date,
        "signed_by_name": record.signed_by_name,
        "signed_by_email": record.signed_by_email,
        "signed_by_role": record.signed_by_role,
        "remarks": record.remarks,
        "signed_at": record.signed_at.isoformat() if record.signed_at else None,
        "user_role": current_user.role,
    }


@app.post("/signoff")
def create_daily_signoff(
    req: SignoffRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    from fastapi import HTTPException
    # Only Chief Quality Engineer is authorized to digitally sign off daily reports
    if (current_user.role or "").strip().lower() != "chief quality engineer":
        raise HTTPException(
            status_code=403,
            detail="Unauthorized: Only a Chief Quality Engineer is permitted to digitally sign daily inspection reports."
        )

    target_date = req.date or datetime.datetime.now().strftime("%Y-%m-%d")
    existing = db.query(DailySignoff).filter(DailySignoff.date == target_date).first()
    
    if existing:
        existing.signed_by_name = current_user.full_name or "Chief Quality Engineer"
        existing.signed_by_email = current_user.email
        existing.signed_by_role = current_user.role
        existing.remarks = req.remarks or "Verified and approved according to ASTM E155 NDT standards."
        existing.signed_at = datetime.datetime.now(datetime.timezone.utc)
        record = existing
    else:
        record = DailySignoff(
            date=target_date,
            signed_by_name=current_user.full_name or "Chief Quality Engineer",
            signed_by_email=current_user.email,
            signed_by_role=current_user.role,
            remarks=req.remarks or "Verified and approved according to ASTM E155 NDT standards.",
        )
        db.add(record)
    
    db.commit()
    db.refresh(record)
    
    return {
        "message": f"Daily digital sign-off completed for {target_date}",
        "signed": True,
        "date": record.date,
        "signed_by_name": record.signed_by_name,
        "signed_by_email": record.signed_by_email,
        "signed_by_role": record.signed_by_role,
        "remarks": record.remarks,
        "signed_at": record.signed_at.isoformat() if record.signed_at else None,
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

