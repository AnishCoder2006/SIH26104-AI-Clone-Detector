from pydantic import BaseModel


class RiskRequest(BaseModel):
    synthetic_probability: float
    speaker_similarity: float
    transaction_value: float
    known_contact: bool


class RiskResponse(BaseModel):
    risk_score: float
    risk_level: str
    alert: bool
    recommendation: str