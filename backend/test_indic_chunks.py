import sys
sys.path.append(r'c:\Users\ashwi\OneDrive\Documents\Desktop\SIH_PROJECT\backend')

import numpy as np
import onnxruntime as ort
from transformers import Wav2Vec2FeatureExtractor
from huggingface_hub import snapshot_download
import os

HF_REPO_INDIAN = 'Anish5764/indic-voice-spoof-detector'
indic_dir = snapshot_download(repo_id=HF_REPO_INDIAN, allow_patterns=['*.onnx', '*.onnx.data'])
indian_onnx_path = os.path.join(indic_dir, 'indic_voice_spoof_detector.onnx')
sess = ort.InferenceSession(indian_onnx_path, providers=['CPUExecutionProvider'])
ext = Wav2Vec2FeatureExtractor.from_pretrained(HF_REPO_INDIAN)

sr = 16000

def softmax(x):
    e = np.exp(x - np.max(x, axis=-1, keepdims=True))
    return e / e.sum(axis=-1, keepdims=True)

# The chunk the streamer produces: 4s padded window with 2s tone + 2s silence
tone = (0.3 * np.sin(2*np.pi*440*np.linspace(0, 2.0, sr*2, dtype=np.float32))).astype(np.float32)
chunk_4s = np.zeros(sr * 4, dtype=np.float32)
chunk_4s[:len(tone)] = tone

print("=== 4s window (2s tone + 2s silence padding) ===")
inp = ext([chunk_4s], sampling_rate=sr, return_tensors='np', padding=True)
iv = inp['input_values']
print("Extractor output shape:", iv.shape)
print("Extractor output rms:", float(np.sqrt(np.mean(iv**2))))
logits = sess.run(None, {sess.get_inputs()[0].name: iv})[0]
probs = softmax(logits)
print("Logits:", logits)
print("Class 0 (SPOOF):", round(float(probs[0,0]), 4))
print("Class 1 (REAL):", round(float(probs[0,1]), 4))

print()
print("=== 2s chunk (pure tone, no padding) ===")
inp2 = ext([tone], sampling_rate=sr, return_tensors='np', padding=True)
iv2 = inp2['input_values']
print("Shape:", iv2.shape)
logits2 = sess.run(None, {sess.get_inputs()[0].name: iv2})[0]
probs2 = softmax(logits2)
print("Class 0 (SPOOF):", round(float(probs2[0,0]), 4))
print("Class 1 (REAL):", round(float(probs2[0,1]), 4))

print()
print("=== 4s pure tone (no padding) ===")
tone_4s = (0.3 * np.sin(2*np.pi*440*np.linspace(0, 4.0, sr*4, dtype=np.float32))).astype(np.float32)
inp3 = ext([tone_4s], sampling_rate=sr, return_tensors='np', padding=True)
iv3 = inp3['input_values']
print("Shape:", iv3.shape)
logits3 = sess.run(None, {sess.get_inputs()[0].name: iv3})[0]
probs3 = softmax(logits3)
print("Class 0 (SPOOF):", round(float(probs3[0,0]), 4))
print("Class 1 (REAL):", round(float(probs3[0,1]), 4))
