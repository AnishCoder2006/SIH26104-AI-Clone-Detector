from pydantic import BaseModel, Field
from typing import Optional


class UserSignup(BaseModel):
    full_name: str
    email: str
    password: str


class UserSignin(BaseModel):
    email: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str


class TelemetryMetrics(BaseModel):
    """Schema for forensic audio telemetry data."""
    synthetic_voice_probability: Optional[float] = Field(default=0.0, description="Probability of synthetic voice in percent")
    snr_db: float = Field(default=20.0, description="Signal-to-Noise Ratio in dB")
    clipping_percent: float = Field(default=0.0, description="Percentage of audio clipped")
    rms_energy: Optional[float] = None
    spectral_centroid_hz: Optional[float] = None
    zero_crossing_rate: Optional[float] = None


class RiskRequest(BaseModel):
    synthetic_probability: float = Field(..., ge=0.0, le=1.0)
    speaker_similarity: float = Field(..., ge=0.0, le=1.0)
    transaction_value: float = Field(default=0.0, ge=0.0)
    known_contact: bool = False
    
    telemetry_metrics: Optional[TelemetryMetrics] = None


class RiskResponse(BaseModel):
    risk_score: float
    risk_level: str
    alert: bool
    recommendation: str
    synthetic_probability: Optional[float] = 0.0
    
    metrics: Optional[TelemetryMetrics] = None
