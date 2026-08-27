# risk_engine.py

"""
Risk scoring engine — combines model outputs and call context into
a single risk assessment.

NOTE on speaker_similarity: this field is currently a NEUTRAL PLACEHOLDER
(0.5) coming from Member 1's analyze_audio(), since cross-session voiceprint
matching against a known reference is not implemented in this build (it's a
roadmap item — see architecture doc). A constant 0.5 contributes a fixed
10 points to every score, so it doesn't skew results toward false alarms
or missed detections; it just isn't a real signal yet. If a real speaker-
similarity feature gets added later, swap the constant for the actual
computed value with no other changes needed here.
"""

def calculate_risk(
    synthetic_probability: float,
    speaker_similarity: float,
    transaction_value: float,
    known_contact: bool
) -> dict:
    """
    Combines the ML model's synthetic-voice probability with call context
    to produce a final risk score and recommended action.

    Args:
        synthetic_probability: 0-1, from Member 1's analyze_audio()
        speaker_similarity: 0-1, currently a placeholder (see module docstring)
        transaction_value: monetary value associated with the call, if any
        known_contact: whether the caller matches a known/trusted contact

    Returns:
        {
            "risk_score": float (0-100),
            "risk_level": "LOW" | "MEDIUM" | "HIGH",
            "alert": bool,
            "recommendation": str
        }
    """
    score = 0

    # AI-generated voice probability — primary signal
    score += synthetic_probability * 70

    # Speaker mismatch (currently neutral placeholder, see note above)
    score += (1 - speaker_similarity) * 20

    # Unknown caller
    if not known_contact:
        score += 5

    # High-value transaction
    if transaction_value >= 500000:
        score += 5

    score = min(score, 100)

    if score >= 70:
        risk_level = "HIGH"
        alert = True
        recommendation = "Require secondary verification"
    elif score >= 40:
        risk_level = "MEDIUM"
        alert = True
        recommendation = "Perform additional verification"
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
    # Quick manual test
    result = calculate_risk(
        synthetic_probability=0.87,
        speaker_similarity=0.5,   # placeholder value, matches analyze_audio()'s output
        transaction_value=600000,
        known_contact=False,
    )
    print(result)