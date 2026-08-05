import os
import datetime
import random
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from database import get_db
from models.user import User

# Automatically load backend/.env environment variables
def _load_dotenv_file():
    env_path = os.path.join(os.path.dirname(__file__), ".env")
    if os.path.exists(env_path):
        with open(env_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    key, val = line.split("=", 1)
                    key = key.strip()
                    val = val.strip().strip("'").strip('"')
                    os.environ[key] = val

_load_dotenv_file()

SECRET_KEY = os.getenv("JWT_SECRET_KEY", "castingai_secret_key_change_in_production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

router = APIRouter(prefix="/auth", tags=["auth"])

# In-memory store for password reset verification codes: { email: { "code": str, "expires": datetime } }
reset_codes_store = {}

# ─── Schemas ──────────────────────────────────────────────────────────────────

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None
    role: Optional[str] = "Chief Quality Engineer"

class UserRead(BaseModel):
    id: int
    email: str
    full_name: Optional[str]
    role: Optional[str] = "Chief Quality Engineer"
    is_active: bool

    class Config:
        orm_mode = True

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    role: Optional[str] = None

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    email: EmailStr
    code: str
    new_password: str

# ─── Helpers ──────────────────────────────────────────────────────────────────

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def create_token(data: dict, expires_delta: Optional[datetime.timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.datetime.utcnow() + (expires_delta or datetime.timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

from sqlalchemy import func

def get_user_by_email(db: Session, email: str) -> Optional[User]:
    if not email:
        return None
    clean = email.strip().lower()
    return db.query(User).filter(func.lower(User.email) == clean).first()

def send_reset_email(to_email: str, code: str):
    smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    smtp_user = os.getenv("SMTP_USER", "")
    smtp_pass = os.getenv("SMTP_PASSWORD", "")

    if not smtp_user or not smtp_pass:
        print(f"[SMTP ERROR] Cannot send email: SMTP_USER or SMTP_PASSWORD missing in .env")
        raise HTTPException(
            status_code=500,
            detail="Email service not configured. Please contact server administrator."
        )

    try:
        msg = MIMEMultipart()
        msg["From"] = f"CastingAI Security <{smtp_user}>"
        msg["To"] = to_email
        msg["Subject"] = "CastingAI Password Reset Verification Code"
        msg.attach(MIMEText(
            f"Hello,\n\n"
            f"Your 6-digit verification code to reset your CastingAI password is:\n\n"
            f"   {code}\n\n"
            f"This code will expire in 15 minutes.\n"
            f"If you did not request a password reset, please ignore this email.\n\n"
            f"— CastingAI Platform Team",
            "plain"
        ))

        server = smtplib.SMTP(smtp_host, smtp_port)
        server.starttls()
        server.login(smtp_user, smtp_pass)
        server.send_message(msg)
        server.quit()
        print(f"[GMAIL SMTP SUCCESS] Sent password reset verification email to {to_email}")
    except Exception as e:
        print(f"[GMAIL SMTP ERROR] Failed to send email to {to_email}: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to send email to {to_email}. Error: {str(e)}"
        )

# ─── Dependency ───────────────────────────────────────────────────────────────

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    credentials_exc = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if not email:
            raise credentials_exc
    except JWTError:
        raise credentials_exc
    user = get_user_by_email(db, email)
    if not user:
        raise credentials_exc
    return user

import re

def is_valid_gmail(email: str) -> bool:
    if not email:
        return False
    email_clean = email.strip().lower()
    return bool(re.match(r"^[a-zA-Z0-9._%+-]+@(gmail|googlemail)\.com$", email_clean))

# ─── Routes ───────────────────────────────────────────────────────────────────

@router.post("/register", response_model=Token)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    clean_email = user_in.email.strip().lower()
    if not is_valid_gmail(clean_email):
        raise HTTPException(status_code=400, detail="Only valid Gmail accounts (@gmail.com) are permitted to register.")
    if get_user_by_email(db, clean_email):
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(
        email=clean_email,
        hashed_password=hash_password(user_in.password),
        full_name=user_in.full_name,
        role=user_in.role or "Chief Quality Engineer",
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    token = create_token(data={"sub": user.email})
    return {"access_token": token}

@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    if not is_valid_gmail(form_data.username):
        raise HTTPException(status_code=400, detail="Only valid Gmail accounts (@gmail.com) are permitted to sign in.")
    user = get_user_by_email(db, form_data.username)
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    token = create_token(data={"sub": user.email})
    return {"access_token": token}

@router.post("/update-profile", response_model=UserRead)
def update_profile(req: UserUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if req.full_name is not None:
        current_user.full_name = req.full_name
    # Role is permanently locked once assigned
    if req.role is not None and not current_user.role:
        current_user.role = req.role
    db.commit()
    db.refresh(current_user)
    return current_user

@router.post("/forgot-password")
def forgot_password(req: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = get_user_by_email(db, req.email)
    if not user:
        raise HTTPException(status_code=404, detail="No account registered with this email address")
    
    # Generate 6-digit verification code
    code = f"{random.randint(100000, 999999)}"
    expires = datetime.datetime.utcnow() + datetime.timedelta(minutes=15)
    
    reset_codes_store[req.email.lower()] = {
        "code": code,
        "expires": expires
    }
    
    # Send verification code strictly via Gmail SMTP
    send_reset_email(req.email, code)
    
    return {
        "message": f"Verification code successfully sent to {req.email}. Please check your Gmail inbox."
    }

@router.post("/reset-password")
def reset_password(req: ResetPasswordRequest, db: Session = Depends(get_db)):
    email_key = req.email.lower()
    stored = reset_codes_store.get(email_key)
    
    if not stored:
        raise HTTPException(status_code=400, detail="No password reset requested for this email")
    
    if datetime.datetime.utcnow() > stored["expires"]:
        reset_codes_store.pop(email_key, None)
        raise HTTPException(status_code=400, detail="Verification code has expired. Please request a new code.")
    
    if stored["code"] != req.code.strip():
        raise HTTPException(status_code=400, detail="Invalid verification code. Please check your email inbox and try again.")
    
    user = get_user_by_email(db, req.email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if len(req.new_password) < 6:
        raise HTTPException(status_code=400, detail="New password must be at least 6 characters long")
    
    user.hashed_password = hash_password(req.new_password)
    db.commit()
    
    # Clear used code
    reset_codes_store.pop(email_key, None)
    
    return {"message": "Password updated successfully. You can now log in with your new password."}

@router.get("/me", response_model=UserRead)
def me(current_user: User = Depends(get_current_user)):
    return current_user
