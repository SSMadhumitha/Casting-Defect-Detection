# CastingAI - Industrial Defect Detection Platform

AI-powered X-ray casting defect detection using U-Net + YOLO.

## Project Structure
```
castingAIapp/
├── backend/          # FastAPI backend (Python)
├── frontend/         # Next.js web app (TypeScript)
├── mobile/           # React Native Expo mobile app
└── models/           # Trained AI model files
```

## Setup & Run

### 1. Backend (FastAPI)
```bash
cd backend
venv\Scripts\activate          # Windows
pip install -r requirements.txt
# Start server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```
> **Note**: Make sure `models/best.pt` and `models/xray_filter_model.pth` are present.

### 2. Frontend (Next.js)
```bash
cd frontend
npm install
npm run dev        # http://localhost:3000
```

### 3. Mobile (Expo)
```bash
cd mobile
npm install
npx expo start
```
Edit `mobile/api/client.ts` and set `API_BASE` to your machine's local IP.

## Auth Flow
1. Register at `/register` → JWT returned
2. Token stored in localStorage (web) / SecureStore (mobile)
3. All `/predict` calls require `Authorization: Bearer <token>`

## Pages (Web)
| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/login` | Sign in |
| `/register` | Create account |
| `/dashboard` | Home dashboard |
| `/upload` | Upload X-ray |
| `/results` | Inspection results |
| `/analytics` | AI analytics |
| `/reports` | Report history |

## Screens (Mobile)
- Home → Login → Register → Dashboard → Upload → Result
