# model_inference.py

import numpy as np
import torch
import librosa
from transformers import Wav2Vec2ForSequenceClassification, Wav2Vec2FeatureExtractor

HF_MODEL_REPO = "Anish5764/asvspoof-wav2vec2-stage7"
TARGET_SR = 16000
MAX_AUDIO_SECONDS = 4
MAX_LENGTH = MAX_AUDIO_SECONDS * TARGET_SR
SPOOF_THRESHOLD = 0.1

_model = None
_extractor = None
_device = "cuda" if torch.cuda.is_available() else "cpu"

def load_model():
    global _model, _extractor
    if _model is None:
        _model = Wav2Vec2ForSequenceClassification.from_pretrained(HF_MODEL_REPO)
        _extractor = Wav2Vec2FeatureExtractor.from_pretrained(HF_MODEL_REPO)
        _model.eval()
        _model.to(_device)
    return _model, _extractor


def analyze_audio(audio_path: str) -> dict:
    """
    Runs voice-clone detection on an audio file.

    Input: path to an audio file (any common format, any sample rate)
    Output: {
        "synthetic_probability": float (0-1, our model's spoof confidence),
        "speaker_similarity": None (not implemented in this MVP — see note below),
        "label": "CLONED" or "REAL",
        "alert": bool
    }
    """
    model, extractor = load_model()

    audio_array, sr = librosa.load(audio_path, sr=None)

    if audio_array.ndim > 1:
        audio_array = audio_array.mean(axis=1)
    if sr != TARGET_SR:
        audio_array = librosa.resample(audio_array, orig_sr=sr, target_sr=TARGET_SR)
    if len(audio_array) > MAX_LENGTH:
        audio_array = audio_array[:MAX_LENGTH]
    else:
        audio_array = np.pad(audio_array, (0, MAX_LENGTH - len(audio_array)))

    inputs = extractor(audio_array, sampling_rate=TARGET_SR, return_tensors="pt")
    inputs = {k: v.to(_device) for k, v in inputs.items()}

    with torch.no_grad():
        logits = model(**inputs).logits
        probs = torch.softmax(logits, dim=-1)[0]

    synthetic_probability = round(probs[1].item(), 4)
    is_spoof = synthetic_probability > SPOOF_THRESHOLD

    return {
        "synthetic_probability": synthetic_probability,
        "speaker_similarity": None,  # not implemented — cross-session voiceprint matching is a roadmap item
        "label": "CLONED" if is_spoof else "REAL",
        "alert": is_spoof,
    }