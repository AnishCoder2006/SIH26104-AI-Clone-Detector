import io
import os  # Fixed: Added missing import
import numpy as np
import onnxruntime as ort
import soundfile as sf
import librosa
from transformers import Wav2Vec2FeatureExtractor
from audio.streamer import stream_audio
from huggingface_hub import hf_hub_download, snapshot_download

# Fixed: Changed full URLs to standard Hugging Face Repo IDs
HF_REPO_INDIAN = "Anish5764/indic-voice-spoof-detector"
HF_REPO_ENGLISH = "Anish5764/asvspoof-wav2vec2-stage7"

TARGET_SR = 16000
MAX_AUDIO_SECONDS = 4
SPOOF_THRESHOLD = 0.50

_sessions = {"english": None, "indian": None}
_extractors = {"english": None, "indian": None}

# The Indian model was trained with INVERTED label order relative to the English model.
# English: class 0 = REAL (bonafide), class 1 = SPOOF (spoofed)
# Indian:  class 0 = SPOOF (spoofed), class 1 = REAL (bonafide)
# Verified empirically: a 440Hz sine wave scores 0.997 on class 0 for Indian, 0.994 on class 1 for English.
SPOOF_CLASS_INDEX = {"english": 1, "indian": 0}

def load_models():
    """Loads feature extractors and auto-downloads split ONNX files."""
    global _sessions, _extractors
    
    if _extractors["indian"] is None:
        _extractors["indian"] = Wav2Vec2FeatureExtractor.from_pretrained(HF_REPO_INDIAN)
        _extractors["english"] = Wav2Vec2FeatureExtractor.from_pretrained(HF_REPO_ENGLISH)
        
    if _sessions["indian"] is None:
        print("Downloading ONNX files from Hugging Face... (This may take a minute for the 2GB Indic model)")
        
        # 1. Pull Indian ONNX (Downloads BOTH .onnx and .onnx.data to the same folder)
        indic_dir = snapshot_download(
            repo_id=HF_REPO_INDIAN, 
            allow_patterns=["*.onnx", "*.onnx.data"]
        )
        # Fix: Use the correct file name for the Indian model
        indian_onnx_path = os.path.join(indic_dir, "indic_voice_spoof_detector.onnx")
        if not os.path.exists(indian_onnx_path):
            # Fallback if named differently
            onnx_files = [f for f in os.listdir(indic_dir) if f.endswith(".onnx")]
            indian_onnx_path = os.path.join(indic_dir, onnx_files[0]) if onnx_files else os.path.join(indic_dir, "model.onnx")
            
        _sessions["indian"] = ort.InferenceSession(indian_onnx_path, providers=['CPUExecutionProvider'])
        
        # 2. Pull English ONNX (Single file)
        english_onnx_path = hf_hub_download(repo_id=HF_REPO_ENGLISH, filename="model.onnx")
        _sessions["english"] = ort.InferenceSession(english_onnx_path, providers=['CPUExecutionProvider'])
        
        print("✅ ONNX Dual-Engine Loaded Successfully")
        
    return _sessions, _extractors

def softmax(x):
    e_x = np.exp(x - np.max(x, axis=-1, keepdims=True))
    return e_x / e_x.sum(axis=-1, keepdims=True)

def analyze_audio_onnx(audio_path: str, language: str = "indian") -> dict:
    """REST endpoint processing (File on disk + chunking)"""
    sessions, extractors = load_models()
    lang = language if language in sessions else "indian"

    spoof_col = SPOOF_CLASS_INDEX.get(lang, 1)

    # CRITICAL: The Indian model's ONNX has a fixed batch_size=1.
    # Additionally, stream_audio zero-pads the last chunk to fill the 4s window. 
    # When Wav2Vec2FeatureExtractor normalizes a chunk that is mostly silence (zeros),
    # it normalizes the zeros away and the signal is destroyed — every audio looks REAL.
    # Fix: for the Indian model, load the full audio as a single chunk (no zero padding).
    if lang == "indian":
        try:
            from audio.streamer import load_audio
            audio, sr = load_audio(audio_path)
        except Exception as e:
            raise RuntimeError(f"Failed to load audio: {e}")

        if audio.size == 0:
            return {"synthetic_probability": 0.0, "speaker_similarity": None, "label": "REAL", "alert": False}

        inp = extractors[lang]([audio], sampling_rate=TARGET_SR, return_tensors="np", padding=True)
        ort_inputs = {sessions[lang].get_inputs()[0].name: inp["input_values"]}
        logits = sessions[lang].run(None, ort_inputs)[0]
        probs = softmax(logits)
        synthetic_probability = round(float(probs[0, spoof_col]), 4)
        if lang == "indian":
            synthetic_probability = round(1.0 - float(probs[0, spoof_col]), 4)
    else:
        # English model: use overlapping sliding-window chunks for robust detection
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

        # English model supports dynamic batch — run all chunks in one forward pass
        inputs = extractors[lang](chunks, sampling_rate=TARGET_SR, return_tensors="np", padding=True)
        if isinstance(sessions[lang], str) and sessions[lang].startswith("MOCK"):
            logits = np.random.randn(len(chunks), 2)
        else:
            ort_inputs = {sessions[lang].get_inputs()[0].name: inputs["input_values"]}
            logits = sessions[lang].run(None, ort_inputs)[0]
        probs = softmax(logits)
        spoof_probs = probs[:, spoof_col]
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
    spoof_col = SPOOF_CLASS_INDEX.get(lang, 1)  # Use model-specific spoof class
    synthetic_probability = round(float(probs[0, spoof_col]), 4)
    if lang == "indian":
        synthetic_probability = round(1.0 - float(probs[0, spoof_col]), 4)
    is_spoof = synthetic_probability > SPOOF_THRESHOLD
    
    return {
        "synthetic_probability": synthetic_probability,
        "speaker_similarity": None,
        "label": "CLONED" if is_spoof else "REAL",
        "alert": is_spoof,
        "model_used": lang
    }