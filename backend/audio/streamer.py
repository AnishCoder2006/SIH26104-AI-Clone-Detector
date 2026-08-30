"""Audio streaming and file ingestion module.

Handles standardizing audio files to 16 kHz mono float32 arrays and streaming
overlapping chunks in real-time or batch mode.

Complies with DPDP Act privacy requirements by never caching, logging, or
persisting raw audio to disk.
"""

from pathlib import Path
import time
from typing import Iterator, Tuple, Union
import librosa
import numpy as np

from backend.audio.chunker import chunk_array, compute_window_params


def load_audio(file_path: Union[str, Path]) -> Tuple[np.ndarray, int]:
    """Load and normalize an audio file to the project standard (16 kHz, mono, float32).

    Parameters
    ----------
    file_path : Union[str, Path]
        Path to the target audio file (.wav, .mp3, .flac, etc.).

    Returns
    -------
    Tuple[np.ndarray, int]
        - audio: 1-D numpy array of shape (N,) with dtype np.float32.
        - sr: Standard sample rate (16000 Hz).

    Raises
    ------
    FileNotFoundError
        If the audio file does not exist.
    RuntimeError / Exception
        If the audio file cannot be decoded by librosa/soundfile.
    """
    path = Path(file_path)
    if not path.exists():
        raise FileNotFoundError(f"Audio file not found at path: {file_path}")

    # librosa.load with sr=16000 and mono=True resamples and downmixes in memory
    audio, sr = librosa.load(str(path), sr=16000, mono=True, dtype=np.float32)
    return audio, int(sr)


def stream_audio(
    file_path: Union[str, Path],
    window_sec: float = 3.0,
    overlap: float = 0.5,
    # Confirmed with Model Owner (Member 1): downstream Wav2Vec2/ASVspoof models require
    # fixed-length tensor inputs (e.g. 48,000 samples). Defaulting pad_last=True zero-pads
    # trailing audio shorter than window_sec so no final speech is dropped at call end.
    pad_last: bool = True,
    simulate_realtime: bool = False,
) -> Iterator[Tuple[np.ndarray, int]]:
    """Stream overlapping audio chunks from an audio file.

    Loads the audio file into memory, standardizes it to 16 kHz mono float32,
    and yields sliding-window chunks along with the sample rate.

    Parameters
    ----------
    file_path : Union[str, Path]
        Path to the audio file.
    window_sec : float, optional
        Duration of each chunk window in seconds, by default 3.0.
    overlap : float, optional
        Fractional overlap between consecutive windows in [0.0, 1.0), by default 0.5.
    pad_last : bool, optional
        Whether to zero-pad the last short chunk if shorter than `window_sec`,
        by default True (confirmed with model owner for fixed tensor dimensions).
    simulate_realtime : bool, optional
        If True, sleeps `hop_size / sr` seconds between chunk yields to simulate
        real-time call pacing for demo purposes. By default False.

    Yields
    ------
    Iterator[Tuple[np.ndarray, int]]
        Tuples of (chunk, sr) where:
        - chunk: 1-D np.ndarray of shape (window_size,) and dtype np.float32.
        - sr: Sample rate (16000 Hz).

    Notes
    -----
    Privacy Guarantee: No raw audio data is persisted or logged to disk during
    or after streaming.
    """
    audio, sr = load_audio(file_path)
    _, hop_size = compute_window_params(sr, window_sec, overlap)
    sleep_interval = (hop_size / sr) if simulate_realtime else 0.0

    for chunk in chunk_array(audio, sr, window_sec=window_sec, overlap=overlap, pad_last=pad_last):
        yield chunk, sr
        if simulate_realtime and sleep_interval > 0.0:
            time.sleep(sleep_interval)
