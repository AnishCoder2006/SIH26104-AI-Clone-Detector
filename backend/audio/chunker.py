"""Sliding-window audio chunking utilities."""

from typing import Iterator, Tuple
import numpy as np


def compute_window_params(sr: int, window_sec: float, overlap: float) -> Tuple[int, int]:
    """Compute window size and hop size in samples from duration and overlap ratio."""
    if sr <= 0:
        raise ValueError(f"Sample rate 'sr' must be a positive integer, got {sr}.")
    if window_sec <= 0:
        raise ValueError(f"Window length 'window_sec' must be strictly positive, got {window_sec}.")
    if overlap < 0.0 or overlap >= 1.0:
        raise ValueError(f"Overlap must be in the half-open interval [0.0, 1.0), got {overlap}.")

    window_size = int(round(window_sec * sr))
    if window_size <= 0:
        raise ValueError(f"Calculated window_size must be positive, got {window_size} samples.")

    hop_size = int(round(window_size * (1.0 - overlap)))
    if hop_size <= 0:
        hop_size = 1

    return window_size, hop_size


def chunk_array(
    audio: np.ndarray,
    sr: int,
    window_sec: float = 3.0,
    overlap: float = 0.5,
    pad_last: bool = False,
) -> Iterator[np.ndarray]:
    """Generate fixed-size sliding-window chunks from a 1-D audio array."""
    
    # OPTIMIZATION 1: Cast entirely upfront. 
    # Ensures all slices inside the loop are zero-copy memory views.
    audio = np.asarray(audio, dtype=np.float32)

    if audio.ndim != 1:
        raise ValueError(
            f"Input audio must be 1-D (shape: (N,)), but got shape {audio.shape}. "
            "Stereo/multi-channel audio must be downmixed to mono before chunking."
        )

    n_samples = len(audio)
    if n_samples == 0:
        return

    window_size, hop_size = compute_window_params(sr, window_sec, overlap)

    # Edge case: entire audio is shorter than a single window
    if n_samples < window_size:
        if pad_last:
            yield np.pad(audio, (0, window_size - n_samples), mode='constant')
        return

    start = 0
    while start < n_samples:
        end = start + window_size
        
        if end <= n_samples:
            # OPTIMIZATION 2: Zero-copy memory view
            yield audio[start:end]
            start += hop_size
        else:
            if pad_last:
                tail = audio[start:]
                # OPTIMIZATION 3: Fast C-optimized padding
                yield np.pad(tail, (0, window_size - len(tail)), mode='constant')
            break