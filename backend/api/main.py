from fastapi import FastAPI

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