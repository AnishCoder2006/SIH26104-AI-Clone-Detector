"""Sliding-window audio chunking utilities.

Provides pure array-math sliding-window chunking functionality for raw audio
signals without performing any file I/O or persisting raw audio data to disk.
"""

from typing import Iterator, Tuple
import numpy as np


def compute_window_params(sr: int, window_sec: float, overlap: float) -> Tuple[int, int]:
    """Compute window size and hop size in samples from duration and overlap ratio.

    Parameters
    ----------
    sr : int
        Sample rate in Hz (must be a positive integer, typically 16000).
    window_sec : float
        Length of the sliding window in seconds (must be strictly positive).
    overlap : float
        Fractional overlap between consecutive windows in the range [0.0, 1.0).

    Returns
    -------
    Tuple[int, int]
        A tuple of (window_size_samples, hop_size_samples).

    Raises
    ------
    ValueError
        If `sr` <= 0, `window_sec` <= 0, or `overlap` is not in [0.0, 1.0).
    """
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
    # Confirmed with Model Owner (Member 1): downstream Wav2Vec2/ASVspoof models require
    # fixed-length tensor inputs (e.g. 48,000 samples). Defaulting pad_last=True zero-pads
    # trailing audio shorter than window_sec so no final speech is dropped at call end.
    pad_last: bool = True,
) -> Iterator[np.ndarray]:
    """Generate fixed-size sliding-window chunks from a 1-D audio array.

    Slides a window of length `window_sec` over the input audio with a step
    size dictated by `overlap`. Returns a generator yielding 1-D float32 numpy
    arrays.

    Parameters
    ----------
    audio : np.ndarray
        1-D array containing raw audio samples, shape (N,).
    sr : int
        Sample rate of the audio in Hz (e.g. 16000).
    window_sec : float, optional
        Window duration in seconds, by default 3.0.
    overlap : float, optional
        Overlap ratio between consecutive windows in [0.0, 1.0), by default 0.5.
    pad_last : bool, optional
        If True (default, confirmed with model owner), zero-pads trailing audio
        shorter than `window_sec` to produce a full-length chunk. If False,
        trailing samples shorter than one window are dropped.

    Yields
    ------
    Iterator[np.ndarray]
        1-D numpy arrays of shape (window_size,) with dtype np.float32.

    Raises
    ------
    ValueError
        If `audio` is not a 1-D array, or if window parameters are invalid.
    """
    # Cast entirely upfront to ensure slices inside loop are zero-copy memory views
    audio = np.asarray(audio, dtype=np.float32)

    if audio.ndim != 1:
        raise ValueError(
            f"Input audio must be 1-D (shape: (N,)), but got shape {audio.shape} with ndim={audio.ndim}. "
            "Stereo/multi-channel audio must be downmixed to mono before chunking."
        )

    n_samples = len(audio)
    if n_samples == 0:
        return

    window_size, hop_size = compute_window_params(sr, window_sec, overlap)

    # Edge case: entire audio is shorter than a single window
    if n_samples < window_size:
        if pad_last:
            yield np.pad(audio, (0, window_size - n_samples), mode="constant")
        return

    start = 0
    while start < n_samples:
        end = start + window_size
        if end <= n_samples:
            # Zero-copy memory view
            yield audio[start:end]
            start += hop_size
        else:
            if pad_last:
                tail = audio[start:]
                yield np.pad(tail, (0, window_size - len(tail)), mode="constant")
            break