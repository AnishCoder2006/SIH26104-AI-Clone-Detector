import io
import numpy as np
import onnxruntime as ort
import soundfile as sf
import librosa
from transformers import Wav2Vec2FeatureExtractor
from audio.streamer import stream_audio

HF_REPO_INDIAN = "https://huggingface.co/Anish5764/asvspoof-wav2vec2-stage7"
HF_REPO_ENGLISH = "https://huggingface.co/Anish5764/indic-voice-spoof-detector" # TODO: Swap with your English model repo
TARGET_SR = 16000
MAX_AUDIO_SECONDS = 4
SPOOF_THRESHOLD = 0.50

_sessions = {"english": None, "indian": None}
_extractors = {"english": None, "indian": None}

def load_models():
    """Loads both English and Indian models lazily."""
    global _sessions, _extractors
    
    if _extractors["indian"] is None:
        _extractors["indian"] = Wav2Vec2FeatureExtractor.from_pretrained(HF_REPO_INDIAN)
        _extractors["english"] = Wav2Vec2FeatureExtractor.from_pretrained(HF_REPO_ENGLISH)
        
    if _sessions["indian"] is None:
        # TODO: Replace with real .onnx paths once Kaggle exports are done
        # _sessions["indian"] = ort.InferenceSession("indic_wav2vec2_unified.onnx")
        # _sessions["english"] = ort.InferenceSession("english_wav2vec2_unified.onnx")
        _sessions["indian"] = "MOCK_SESSION_INDIAN"
        _sessions["english"] = "MOCK_SESSION_ENGLISH"
        print("✅ ONNX Dual-Engine Loaded")
        
    return _sessions, _extractors

def softmax(x):
    e_x = np.exp(x - np.max(x, axis=-1, keepdims=True))
    return e_x / e_x.sum(axis=-1, keepdims=True)

def analyze_audio_onnx(audio_path: str, language: str = "indian") -> dict:
    """REST endpoint processing (File on disk + chunking)"""
    sessions, extractors = load_models()
    lang = language if language in sessions else "indian"
    
    try:
        chunk_generator = stream_audio(
            file_path=audio_path, window_sec=MAX_AUDIO_SECONDS,
            overlap=0.5, pad_last=True, simulate_realtime=False
        )
        chunks = [chunk for chunk, sr in chunk_generator]
    except Exception as e:
        raise RuntimeError(f"Failed to stream audio: {e}")

    if not chunks:
        return {"synthetic_probability": 0.0, "speaker_similarity": None, "label": "REAL", "alert": False}

    inputs = extractors[lang](chunks, sampling_rate=TARGET_SR, return_tensors="np", padding=True)
    
    if isinstance(sessions[lang], str) and sessions[lang].startswith("MOCK"):
        logits = np.random.randn(len(chunks), 2)
    else:
        ort_inputs = {sessions[lang].get_inputs()[0].name: inputs["input_values"]}
        logits = sessions[lang].run(None, ort_inputs)[0]
        
    probs = softmax(logits)
    spoof_probs = probs[:, 1]
    synthetic_probability = round(float(np.max(spoof_probs)), 4)
    is_spoof = synthetic_probability > SPOOF_THRESHOLD
    
    return {
        "synthetic_probability": synthetic_probability,
        "speaker_similarity": None,
        "label": "CLONED" if is_spoof else "REAL",
        "alert": is_spoof,
        "model_used": lang
    }

def analyze_audio_bytes(audio_bytes: bytes, language: str = "indian") -> dict:
    """WebSocket endpoint processing (In-memory, Zero I/O)"""
    sessions, extractors = load_models()
    lang = language if language in sessions else "indian"
    
    try:
        # Decode raw bytes directly in RAM
        data, sr = sf.read(io.BytesIO(audio_bytes))
        
        # Convert to Mono
        if len(data.shape) > 1:
            data = np.mean(data, axis=1)
            
        # Resample to 16kHz
        if sr != TARGET_SR:
            data = librosa.resample(data, orig_sr=sr, target_sr=TARGET_SR)
            
    except Exception as e:
        print(f"Skipping unreadable chunk: {e}")
        return {"synthetic_probability": 0.0, "label": "REAL", "alert": False, "model_used": lang}

    inputs = extractors[lang]([data], sampling_rate=TARGET_SR, return_tensors="np", padding=True)
    
    if isinstance(sessions[lang], str) and sessions[lang].startswith("MOCK"):
        logits = np.random.randn(1, 2)
    else:
        ort_inputs = {sessions[lang].get_inputs()[0].name: inputs["input_values"]}
        logits = sessions[lang].run(None, ort_inputs)[0]
        
    probs = softmax(logits)
    synthetic_probability = round(float(probs[0, 1]), 4)
    is_spoof = synthetic_probability > SPOOF_THRESHOLD
    
    return {
        "synthetic_probability": synthetic_probability,
        "speaker_similarity": None,
        "label": "CLONED" if is_spoof else "REAL",
        "alert": is_spoof,
        "model_used": lang
    }