from pydantic import BaseModel, Field
from typing import Optional


class TelemetryMetrics(BaseModel):
    """Schema for forensic audio telemetry data."""
    snr_db: float = Field(default=20.0, description="Signal-to-Noise Ratio in dB")
    clipping_percent: float = Field(default=0.0, description="Percentage of audio clipped")
    rms_energy: Optional[float] = None
    spectral_centroid_hz: Optional[float] = None
    zero_crossing_rate: Optional[float] = None


class RiskRequest(BaseModel):
    # Added validation boundaries (ge=0.0, le=1.0) for ML probabilities
    synthetic_probability: float = Field(..., ge=0.0, le=1.0)
    speaker_similarity: float = Field(..., ge=0.0, le=1.0)
    transaction_value: float = Field(default=0.0, ge=0.0)
    known_contact: bool = False
    
    # Added optional telemetry dictionary to support the new risk_engine logic
    telemetry_metrics: Optional[TelemetryMetrics] = None


class RiskResponse(BaseModel):
    risk_score: float
    risk_level: str
    alert: bool
    recommendation: str
    
    # Echoes the computed telemetry back to the client for debugging/logging
    telemetry: Optional[TelemetryMetrics] = None