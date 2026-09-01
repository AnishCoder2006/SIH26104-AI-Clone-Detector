import numpy as np
import onnxruntime as ort
from transformers import Wav2Vec2FeatureExtractor
from audio.streamer import stream_audio

HF_MODEL_REPO = "Anish5764/asvspoof-wav2vec2-stage7"
TARGET_SR = 16000
MAX_AUDIO_SECONDS = 4
SPOOF_THRESHOLD = 0.1

_session = None
_extractor = None

def load_model():
    global _session, _extractor
    if _extractor is None:
        _extractor = Wav2Vec2FeatureExtractor.from_pretrained(HF_MODEL_REPO)
    
    if _session is None:
        # TODO: Replace with actual model path when training completes
        # _session = ort.InferenceSession("indic_wav2vec2_unified.onnx")
        _session = "MOCK_SESSION"
        
    return _session, _extractor

def softmax(x):
    e_x = np.exp(x - np.max(x, axis=-1, keepdims=True))
    return e_x / e_x.sum(axis=-1, keepdims=True)

def analyze_audio_onnx(audio_path: str) -> dict:
    session, extractor = load_model()
    
    try:
        chunk_generator = stream_audio(
            file_path=audio_path,
            window_sec=MAX_AUDIO_SECONDS,
            overlap=0.5,
            pad_last=True,
            simulate_realtime=False
        )
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

    inputs = extractor(chunks, sampling_rate=TARGET_SR, return_tensors="np", padding=True)
    
    if session == "MOCK_SESSION":
        batch_size = len(chunks)
        logits = np.random.randn(batch_size, 2)
    else:
        ort_inputs = {session.get_inputs()[0].name: inputs["input_values"]}
        logits = session.run(None, ort_inputs)[0]
        
    probs = softmax(logits)
    spoof_probs = probs[:, 1]
    synthetic_probability = round(float(np.max(spoof_probs)), 4)
    
    is_spoof = synthetic_probability > SPOOF_THRESHOLD
    
    return {
        "synthetic_probability": synthetic_probability,
        "speaker_similarity": None,
        "label": "CLONED" if is_spoof else "REAL",
        "alert": is_spoof,
    }
