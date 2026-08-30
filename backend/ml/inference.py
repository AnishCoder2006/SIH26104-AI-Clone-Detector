# model_inference.py

import numpy as np
import torch
import librosa
from transformers import Wav2Vec2ForSequenceClassification, Wav2Vec2FeatureExtractor

from audio.chunker import chunk_array

HF_MODEL_REPO = "Anish5764/asvspoof-wav2vec2-stage7"
TARGET_SR = 16000
MAX_AUDIO_SECONDS = 4
SPOOF_THRESHOLD = 0.1

_model = None
_extractor = None
_device = "cuda" if torch.cuda.is_available() else "cpu"


def load_model():
    """Loads model and feature extractor lazily to device."""
    global _model, _extractor
    if _model is None:
        _model = Wav2Vec2ForSequenceClassification.from_pretrained(HF_MODEL_REPO)
        _extractor = Wav2Vec2FeatureExtractor.from_pretrained(HF_MODEL_REPO)
        _model.eval()
        _model.to(_device)
    return _model, _extractor


def analyze_audio(audio_path: str) -> dict:
    """
    Runs voice-clone detection on an audio file using batched sliding windows.

    Loads audio as 16kHz mono, chunks it into overlapping windows, and processes
    all chunks simultaneously on GPU or CPU.

    Args:
        audio_path: Path to the target audio file.

    Returns:
        dict containing synthetic_probability, speaker_similarity, label, and alert.
    """
    model, extractor = load_model()

    try:
        audio_array, _ = librosa.load(audio_path, sr=TARGET_SR, mono=True)
    except Exception as e:
        raise RuntimeError(f"Failed to load audio file {audio_path}: {e}")

    chunks = list(
        chunk_array(
            audio=audio_array,
            sr=TARGET_SR,
            window_sec=MAX_AUDIO_SECONDS,
            overlap=0.5,
            pad_last=True,
        )
    )

    if not chunks:
        return {
            "synthetic_probability": 0.0,
            "speaker_similarity": None,
            "label": "REAL",
            "alert": False,
        }

    inputs = extractor(chunks, sampling_rate=TARGET_SR, return_tensors="pt", padding=True)
    inputs = {k: v.to(_device) for k, v in inputs.items()}

    with torch.no_grad():
        logits = model(**inputs).logits
        probs = torch.softmax(logits, dim=-1)

    spoof_probs = probs[:, 1]
    synthetic_probability = round(torch.max(spoof_probs).item(), 4)

    is_spoof = synthetic_probability > SPOOF_THRESHOLD

    return {
        "synthetic_probability": synthetic_probability,
        "speaker_similarity": None,  # Roadmap item for cross-session voiceprint matching
        "label": "CLONED" if is_spoof else "REAL",
        "alert": is_spoof,
    }