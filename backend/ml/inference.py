import os
import random

# IMPORT YOUR TEAMMATE'S NEW STREAMER
from audio.streamer import stream_audio

HF_MODEL_REPO = "Anish5764/asvspoof-wav2vec2-stage7"
TARGET_SR = 16000
MAX_AUDIO_SECONDS = 4
SPOOF_THRESHOLD = 0.1

_model = None
_extractor = None
_device = None

def load_model():
    """Loads model and feature extractor lazily to device."""
    if os.getenv("MOCK_ML_MODELS") == "true":
        return None, None

    global _model, _extractor, _device
    if _model is None:
        import torch
        from transformers import Wav2Vec2ForSequenceClassification, Wav2Vec2FeatureExtractor
        
        _device = "cuda" if torch.cuda.is_available() else "cpu"
        _model = Wav2Vec2ForSequenceClassification.from_pretrained(HF_MODEL_REPO)
        _extractor = Wav2Vec2FeatureExtractor.from_pretrained(HF_MODEL_REPO)
        _model.eval()
        _model.to(_device)
    return _model, _extractor

def analyze_audio(audio_path: str) -> dict:
    """Runs voice-clone detection on an audio file using batched sliding windows."""
    if os.getenv("MOCK_ML_MODELS") == "true":
        # Return realistic looking mock data for 512MB RAM constraint environments
        is_spoof = random.choice([True, False])
        return {
            "synthetic_probability": round(random.uniform(0.65, 0.99) if is_spoof else random.uniform(0.01, 0.15), 4),
            "speaker_similarity": None,
            "label": "CLONED" if is_spoof else "REAL",
            "alert": is_spoof,
        }

    import torch
    model, extractor = load_model()

    try:
        # Use the new streamer! It handles librosa loading, mono conversion, and chunking all at once
        chunk_generator = stream_audio(
            file_path=audio_path,
            window_sec=MAX_AUDIO_SECONDS,
            overlap=0.5,
            pad_last=True,
            simulate_realtime=False
        )
        # Extract just the audio arrays (ignoring the sr variable it returns)
        chunks = [chunk for chunk, sr in chunk_generator]
        
    except Exception as e:
        raise RuntimeError(f"Failed to load or stream audio file {audio_path}: {e}")

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
        "speaker_similarity": None,
        "label": "CLONED" if is_spoof else "REAL",
        "alert": is_spoof,
    }