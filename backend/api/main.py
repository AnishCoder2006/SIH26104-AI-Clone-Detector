from fastapi import FastAPI, UploadFile, File, Form, HTTPException
import os
import tempfile

from ml.inference import analyze_audio

from api.schemas import RiskRequest, RiskResponse
from risk.risk_engine import calculate_risk


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

    result = calculate_risk(
        synthetic_probability=request.synthetic_probability,
        speaker_similarity=request.speaker_similarity,
        transaction_value=request.transaction_value,
        known_contact=request.known_contact
    )
    return result
@app.post("/analyze-audio", response_model=RiskResponse)
async def analyze_audio_endpoint(
    file: UploadFile = File(...),
    transaction_value: float = Form(...),
    known_contact: bool = Form(...)
):
    temp_path = None
    if file.content_type not in {
        "audio/wav",
        "audio/x-wav",
        "audio/mpeg",
        "audio/mp3",
        "audio/ogg",
        "audio/webm"
    }:
        raise HTTPException(
            status_code=400,
            detail="Unsupported file type. Please upload an audio file."
        )
    if file.size == 0:
        raise HTTPException(
            status_code=400,
            detail="Uploaded audio file is empty."
    )

    try:
        suffix = os.path.splitext(file.filename)[1]

        with tempfile.NamedTemporaryFile(
            delete=False,
            suffix=suffix
        ) as temp_file:

            temp_file.write(await file.read())
            temp_path = temp_file.name

        # Send audio to ML model
        ml_result = analyze_audio(temp_path)

        # Send ML results to risk engine
        result = calculate_risk(
            synthetic_probability=ml_result["synthetic_probability"],
            speaker_similarity=ml_result["speaker_similarity"],
            transaction_value=transaction_value,
            known_contact=known_contact
        )

        return result

    finally:
        # Delete temporary audio file
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)