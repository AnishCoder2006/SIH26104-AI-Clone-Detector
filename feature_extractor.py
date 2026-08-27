import librosa
import numpy as np
import gc

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

if __name__ == "__main__":
    import unittest

    class TestFeatureExtractor(unittest.TestCase):
        def test_process_chunk(self):
            dummy_sr = 16000
            dummy_chunk = np.random.randn(3 * dummy_sr).astype(np.float32)
            
            features = process_chunk(dummy_chunk, sr=dummy_sr)
            
            self.assertIsInstance(features, np.ndarray)
            self.assertEqual(features.shape, (40,))

    unittest.main()
