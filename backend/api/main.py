from fastapi import FastAPI, UploadFile, File, Form, HTTPException
import os
import tempfile
import librosa  # Added to load the audio file for telemetry processing

from ml.inference import analyze_audio
from api.schemas import RiskRequest, RiskResponse
from risk.risk_engine import calculate_risk

# Import the new forensic telemetry module
from ml.forensic_telemetry import compute_all_forensic_metrics 


app = FastAPI(
    title="AI Voice Clone Detection API",
    description="Backend API for detecting AI-generated voice impersonation attacks",
    version="1.0.0"
)


@app.get("/")
def home():
    return {
        "message": "AI Voice Clone Detection Backend is running"
    }


@app.post("/risk-score", response_model=RiskResponse)
def get_risk_score(request: RiskRequest):
    # Convert Pydantic object to dict so the risk engine can use .get() safely
    telemetry = request.telemetry_metrics.model_dump() if request.telemetry_metrics else None
    
    result = calculate_risk(
        synthetic_probability=request.synthetic_probability,
        speaker_similarity=request.speaker_similarity,
        transaction_value=request.transaction_value,
        known_contact=request.known_contact,
        telemetry_metrics=telemetry
    )
    return result


@app.post("/analyze-audio", response_model=RiskResponse)
async def analyze_audio_endpoint(
    file: UploadFile = File(...),
    transaction_value: float = Form(...),
    known_contact: bool = Form(...)
):
    # Flexible validation: accept any "audio/*" MIME type OR a known audio extension
    valid_extensions = (".wav", ".mp3", ".ogg", ".webm", ".flac", ".m4a")
    is_audio_mime = file.content_type and file.content_type.startswith("audio/")
    is_valid_ext = file.filename and file.filename.lower().endswith(valid_extensions)

    if not (is_audio_mime or is_valid_ext):
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file format. Upload an audio file ending in {valid_extensions}"
        )
        
    if file.size == 0:
        raise HTTPException(
            status_code=400,
            detail="Uploaded audio file is empty."
        )

    temp_path = None
    try:
        suffix = os.path.splitext(file.filename)[1]

        with tempfile.NamedTemporaryFile(
            delete=False,
            suffix=suffix
        ) as temp_file:
            temp_file.write(await file.read())
            temp_path = temp_file.name

        # 1. Send audio to ML model
        ml_result = analyze_audio(temp_path)

        # 2. Extract forensic telemetry
        # Wrapped in a try/except in case a client uploads a corrupt file that bypasses the extension check
        try:
            audio_data, sr = librosa.load(temp_path, sr=16000)
        except Exception:
            raise HTTPException(status_code=400, detail="Could not decode audio file. File may be corrupted.")
            
        telemetry = compute_all_forensic_metrics(audio_data, sr)

        # 3. Send ML results and telemetry to risk engine
        result = calculate_risk(
            synthetic_probability=ml_result.get("synthetic_probability", 0.0),
            speaker_similarity=ml_result.get("speaker_similarity", 0.5),
            transaction_value=transaction_value,
            known_contact=known_contact,
            telemetry_metrics=telemetry
        )

        # Optional: Attach telemetry to the final response for client-side debugging/logging
        result["telemetry"] = telemetry

        return result

    finally:
        # Delete temporary audio file
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)