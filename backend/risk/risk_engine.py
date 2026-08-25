def calculate_risk(
    synthetic_probability: float,
    speaker_similarity: float,
    transaction_value: float,
    known_contact: bool
):
    score = 0

    # AI-generated voice probability
    score += synthetic_probability * 70

    # Speaker mismatch
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
        "recommendation": recommendation
    }