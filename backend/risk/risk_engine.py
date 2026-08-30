def _calculate_transaction_risk(value: float) -> float:
    """Calculates risk points (0-10) based on financial transaction value tiers."""
    if value < 10_000:
        return 0.0
    elif value < 100_000:
        return 3.0
    elif value < 500_000:
        return 6.0
    else:
        return 10.0


def calculate_risk(
    synthetic_probability: float,
    transaction_value: float = 0.0,
    known_contact: bool = False,
    speaker_similarity: float = 0.5,
    is_placeholder_similarity: bool = True,
    telemetry_metrics: dict = None,
) -> dict:
    """
    Combines ML synthetic-voice probability, call metadata, and forensic audio
    telemetry to generate a comprehensive risk assessment score.
    """
    synthetic_probability = max(0.0, min(1.0, float(synthetic_probability)))
    transaction_value = max(0.0, float(transaction_value))

    score = 0.0

    # 1. Synthetic Voice Detection Signal (Primary Weight: Up to 55 Points)
    score += synthetic_probability * 55.0

    # 2. Speaker Verification (Weight: Up to 15 Points)
    if not is_placeholder_similarity and speaker_similarity is not None:
        speaker_similarity = max(0.0, min(1.0, float(speaker_similarity)))
        score += (1.0 - speaker_similarity) * 15.0

    # 3. Caller Identity Context (Weight: Up to 5 Points)
    if not known_contact:
        score += 5.0

    # 4. Financial Exposure Signal (Weight: Up to 10 Points)
    score += _calculate_transaction_risk(transaction_value)

    # 5. Forensic Telemetry Anomalies (Weight: Up to 15 Points)
    # Attackers frequently inject noise or overdrive gain to mask synthetic audio artifacts.
    if telemetry_metrics:
        snr_db = telemetry_metrics.get("snr_db", 20.0)
        clipping = telemetry_metrics.get("clipping_percent", 0.0)

        # Low SNR (< 15 dB) penalty for deliberate noise injection
        if snr_db < 15.0:
            score += min(7.5, (15.0 - max(snr_db, 0.0)))
        
        # High clipping (> 1%) penalty for digital manipulation or poor TTS leveling
        if clipping > 1.0:
            score += min(7.5, clipping * 2.0)

    # 6. Clamp Score Bounds
    score = min(max(score, 0.0), 100.0)

    # 7. Action Matrix Evaluation
    if score >= 70.0:
        risk_level = "HIGH"
        alert = True
        recommendation = "Block transaction & require out-of-band secondary verification"
    elif score >= 40.0:
        risk_level = "MEDIUM"
        alert = True
        recommendation = "Perform stepped-up MFA/biometric re-authentication"
    else:
        risk_level = "LOW"
        alert = False
        recommendation = "Proceed normally"

    return {
        "risk_score": round(score, 2),
        "risk_level": risk_level,
        "alert": alert,
        "recommendation": recommendation,
    }


if __name__ == "__main__":
    # Test passing outputs from forensic_telemetry.py
    mock_telemetry = {
        "snr_db": 8.5,             # Suspiciously noisy (adds risk)
        "clipping_percent": 3.2,   # Suspiciously clipped (adds risk)
        "rms_energy": 0.15,
        "spectral_centroid_hz": 2400.0,
        "zero_crossing_rate": 0.11,
    }
    
    result = calculate_risk(
        synthetic_probability=0.72,
        transaction_value=150000,
        known_contact=False,
        telemetry_metrics=mock_telemetry,
    )
    print(result)