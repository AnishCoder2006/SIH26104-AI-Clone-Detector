import os
import logging
import soundfile as sf
import numpy as np

from backend.audio.streamer import stream_audio
from feature_extractor import process_chunk

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

def main():
    test_file = "test_human.wav"
    
    if not os.path.exists(test_file):
        logging.info(f"Creating test fixture audio file: {test_file}")
        sr = 16000
        duration = 5 
        t = np.linspace(0, duration, int(sr * duration), False)
        audio_data = 0.5 * np.sin(2 * np.pi * 440 * t)
        sf.write(test_file, audio_data, sr)
        
    logging.info("Starting Phase 1 Integration Test (Streaming -> Feature Extraction)")
    
    chunk_count = 0
    for chunk, sr in stream_audio(test_file, window_sec=3.0, overlap=0.5):
        chunk_count += 1
        logging.info(f"Processing chunk {chunk_count}: input shape {chunk.shape}")
        
        # Process and wipe
        features = process_chunk(chunk, sr)
        
        # Assertions for correctness
        assert features.shape == (40,), f"Feature shape mismatch. Expected (40,), got {features.shape}"
        assert np.all(chunk == 0), "Privacy wipe failed: raw chunk data was not securely wiped."
        
        logging.info(f"Chunk {chunk_count} successfully processed and wiped. Feature shape: {features.shape}")

    logging.info(f"Integration Test completed successfully. Processed {chunk_count} chunks.")

if __name__ == "__main__":
    main()
