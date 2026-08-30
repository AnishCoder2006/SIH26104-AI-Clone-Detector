# model_inference.py

import numpy as np
import torch
import librosa
from transformers import Wav2Vec2ForSequenceClassification, Wav2Vec2FeatureExtractor

# IMPORTANT: Adjust this import to match where you saved the chunking script!
from audio.chunker import chunk_array

HF_MODEL_REPO = "Anish5764/asvspoof-wav2vec2-stage7"
TARGET_SR = 16000
MAX_AUDIO_SECONDS = 4
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
    Runs voice-clone detection on an audio file using batched sliding windows.
    """
    model, extractor = load_model()

    # 1. Load and normalize audio
    audio_array, sr = librosa.load(audio_path, sr=None)

    if audio_array.ndim > 1:
        audio_array = audio_array.mean(axis=1)
    if sr != TARGET_SR:
        audio_array = librosa.resample(audio_array, orig_sr=sr, target_sr=TARGET_SR)

    # 2. Generate sliding window chunks and cast generator to a list
    chunks = list(chunk_array(
        audio=audio_array,
        sr=TARGET_SR,
        window_sec=MAX_AUDIO_SECONDS,
        overlap=0.5,
        pad_last=True
    ))

    # Guard against completely empty files
    if not chunks:
        return {
            "synthetic_probability": 0.0,
            "speaker_similarity": None,
            "label": "REAL",
            "alert": False,
        }

    # 3. GPU BATCHING: Pass the entire list of chunks to the extractor
    # The extractor automatically pads and stacks them into a single batched tensor
    inputs = extractor(chunks, sampling_rate=TARGET_SR, return_tensors="pt", padding=True)
    inputs = {k: v.to(_device) for k, v in inputs.items()}

    # 4. Batched Inference
    with torch.no_grad():
        # logits shape: (batch_size, num_classes)
        logits = model(**inputs).logits 
        # Apply softmax across the class dimension
        probs = torch.softmax(logits, dim=-1)

    # 5. Extract spoof probabilities (class index 1) for all chunks in the batch
    # probs[:, 1] grabs the synthetic probability column for the entire batch
    spoof_probs = probs[:, 1]
    
    # Aggregate using GPU-native max pooling, then move the single scalar back to CPU
    synthetic_probability = round(torch.max(spoof_probs).item(), 4)

    is_spoof = synthetic_probability > SPOOF_THRESHOLD

    return {
        "synthetic_probability": synthetic_probability,
        "speaker_similarity": None,
        "label": "CLONED" if is_spoof else "REAL",
        "alert": is_spoof,
    }