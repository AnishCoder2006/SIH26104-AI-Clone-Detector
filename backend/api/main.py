from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Depends, status
import os
import tempfile
from fastapi.middleware.cors import CORSMiddleware
import librosa
from datetime import timedelta
from sqlalchemy.orm import Session

from ml.inference import analyze_audio
from api.schemas import RiskRequest, RiskResponse, UserSignup, UserSignin, Token
from risk.risk_engine import calculate_risk
from ml.forensic_telemetry import compute_all_forensic_metrics

from db.database import engine, Base, get_db
from db.models import User
from api.auth import (
    get_password_hash,
    verify_password,
    create_access_token,
    ACCESS_TOKEN_EXPIRE_MINUTES,
    get_current_user,
)

# Automatically create PostgreSQL tables if they don't exist
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AI Voice Clone Detection API",
    description="Backend API for detecting AI-generated voice impersonation attacks",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"message": "AI Voice Clone Detection Backend is running"}

@app.post("/signup", status_code=status.HTTP_201_CREATED)
def signup(user: UserSignup, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    new_user = User(
        full_name=user.full_name,
        email=user.email,
        hashed_password=get_password_hash(user.password)
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return {"message": "User registered successfully"}

@app.post("/signin", response_model=Token)
def signin(user: UserSignin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if not db_user or not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": db_user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/analyze-audio", response_model=RiskResponse)
async def analyze_audio_endpoint(
    file: UploadFile = File(...),
    transaction_value: float = Form(...),
    known_contact: bool = Form(...),
    current_user: User = Depends(get_current_user)
):
    valid_extensions = (".wav", ".mp3", ".ogg", ".webm", ".flac", ".m4a")
    is_audio_mime = file.content_type and file.content_type.startswith("audio/")
    is_valid_ext = file.filename and file.filename.lower().endswith(valid_extensions)

    if not (is_audio_mime or is_valid_ext):
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file format. Upload an audio file ending in {valid_extensions}"
        )
        
    if file.size == 0:
        raise HTTPException(status_code=400, detail="Uploaded audio file is empty.")

    temp_path = None
    try:
        suffix = os.path.splitext(file.filename)[1]
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
            temp_file.write(await file.read())
            temp_path = temp_file.name

        ml_result = analyze_audio(temp_path)

        try:
            audio_data, sr = librosa.load(temp_path, sr=16000, mono=True)
        except Exception:
            raise HTTPException(status_code=400, detail="Could not decode audio file.")
            
        telemetry = compute_all_forensic_metrics(audio_data, sr)

        synthetic_prob = ml_result.get("synthetic_probability", 0.0)
        speaker_sim = ml_result.get("speaker_similarity", 0.5)
        
        result = calculate_risk(
            synthetic_probability=synthetic_prob,
            speaker_similarity=speaker_sim,
            transaction_value=transaction_value,
            known_contact=known_contact,
            telemetry_metrics=telemetry
        )

        telemetry["synthetic_voice_probability"] = synthetic_prob * 100
        result["metrics"] = telemetry
        result["synthetic_probability"] = synthetic_prob

        return result

    finally:
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)