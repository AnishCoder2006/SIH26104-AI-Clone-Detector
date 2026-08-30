import librosa
import numpy as np
import gc
from spafe.features.lfcc import lfcc

def process_chunk(raw_chunk: np.ndarray, sr: int = 16000) -> np.ndarray:
    """
    Extracts MFCC features from a raw audio chunk and securely wipes the raw audio from memory.
    
    Args:
        raw_chunk (np.ndarray): NumPy array containing the raw audio waveform.
        sr (int): Sample rate of the audio (default 16000).
        
    Returns:
        np.ndarray: NumPy array of shape (40,) containing the time-averaged MFCCs.
    """
    try:
        mfcc = librosa.feature.mfcc(y=raw_chunk, sr=sr, n_mfcc=40)
        features = np.mean(mfcc.T, axis=0)
        
        return features

    finally:
        if raw_chunk is not None and raw_chunk.flags.writeable:
            raw_chunk.fill(0)
            
        del raw_chunk
        gc.collect()

def extract_prosody(audio: np.ndarray, sr: int = 16000) -> np.ndarray:
    """
    Extracts prosody features: pitch (mean, std), pause ratio, and energy variance.
    """
    pitch = librosa.yin(audio, fmin=50, fmax=500)
    intervals = librosa.effects.split(audio, top_db=20)
    pause_ratio = 1 - (sum(e - s for s, e in intervals) / len(audio))
    energy_var = float(np.var(librosa.feature.rms(y=audio)))
    
    return np.array([
        np.mean(pitch), 
        np.std(pitch),
        pause_ratio, 
        energy_var
    ])

def process_chunk_v2(raw_chunk: np.ndarray, sr: int = 16000) -> np.ndarray:
    """
    Phase 2 Feature Extractor: Fuses MFCC, LFCC, and Prosody into an 84-dimensional tensor.
    Securely wipes the raw audio from memory.
    """
    try:
        mfcc = np.mean(librosa.feature.mfcc(y=raw_chunk, sr=sr, n_mfcc=40).T, axis=0)
        lf = np.mean(lfcc(raw_chunk, sr, num_ceps=40, nfilts=41), axis=0)
        prosody = extract_prosody(raw_chunk, sr)
        
        features = np.concatenate([mfcc, lf, prosody])  # shape: (84,)
        return features

    finally:
        if raw_chunk is not None and raw_chunk.flags.writeable:
            raw_chunk.fill(0)
            
        del raw_chunk
        gc.collect()

if __name__ == "__main__":
    import unittest

    class TestFeatureExtractor(unittest.TestCase):
        def test_process_chunk(self):
            dummy_sr = 16000
            dummy_chunk = np.random.randn(3 * dummy_sr).astype(np.float32)
            
            features = process_chunk(dummy_chunk, sr=dummy_sr)
            
            self.assertIsInstance(features, np.ndarray)
            self.assertEqual(features.shape, (40,))

        def test_process_chunk_v2(self):
            dummy_sr = 16000
            dummy_chunk = np.random.randn(3 * dummy_sr).astype(np.float32)
            
            features_v2 = process_chunk_v2(dummy_chunk, sr=dummy_sr)
            
            self.assertIsInstance(features_v2, np.ndarray)
            self.assertEqual(features_v2.shape, (84,))

    unittest.main()
