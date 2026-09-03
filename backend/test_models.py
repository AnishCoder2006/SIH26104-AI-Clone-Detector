import sys
sys.path.append(r'c:\Users\ashwi\OneDrive\Documents\Desktop\SIH_PROJECT\backend')

import numpy as np
import wave, struct, io, tempfile, os

import ml.onnx_inference as oi

sr = 16000
t = np.linspace(0, 2.0, sr * 2, dtype=np.float32)

def make_wav_file(audio: np.ndarray, sr: int = 16000) -> str:
    wav_io = io.BytesIO()
    with wave.open(wav_io, 'wb') as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(sr)
        for s in audio:
            w.writeframes(struct.pack('h', int(np.clip(s, -1, 1) * 32767)))
    with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as tf:
        tf.write(wav_io.getvalue())
        return tf.name

# Test 1: 440Hz sine (clear synthetic artifact)
sine = (0.3 * np.sin(2 * np.pi * 440 * t)).astype(np.float32)
tmp_sine = make_wav_file(sine)

print("=== 440Hz Sine Wave (expected: CLONED by both models) ===")
r = oi.analyze_audio_onnx(tmp_sine, 'indian')
print(f"Indian  => label={r['label']}, prob={r['synthetic_probability']}")
r = oi.analyze_audio_onnx(tmp_sine, 'english')
print(f"English => label={r['label']}, prob={r['synthetic_probability']}")

# Test 2: White noise
noise = np.random.uniform(-0.3, 0.3, sr * 2).astype(np.float32)
tmp_noise = make_wav_file(noise)

print()
print("=== White Noise ===")
r = oi.analyze_audio_onnx(tmp_noise, 'indian')
print(f"Indian  => label={r['label']}, prob={r['synthetic_probability']}")
r = oi.analyze_audio_onnx(tmp_noise, 'english')
print(f"English => label={r['label']}, prob={r['synthetic_probability']}")

os.unlink(tmp_sine)
os.unlink(tmp_noise)
