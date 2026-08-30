"""Live microphone audio ingestion module.

Streams real-time microphone audio in 16 kHz mono float32 chunks using sounddevice.
Complies with DPDP Act privacy requirements by never saving audio buffers to disk.
"""

import queue
from typing import Iterator, Optional, Tuple
import numpy as np

try:
    import sounddevice as sd
except ImportError:
    sd = None

from backend.audio.chunker import compute_window_params


def stream_microphone(
    window_sec: float = 3.0,
    overlap: float = 0.5,
    sr: int = 16000,
    device: Optional[int] = None,
) -> Iterator[Tuple[np.ndarray, int]]:
    """Capture live microphone audio and yield sliding-window chunks in real time.

    Streams from the default or specified audio input device using sounddevice,
    accumulating incoming blocks and yielding fixed-size window chunks matching
    the (chunk, sr) contract of `stream_audio`.

    Parameters
    ----------
    window_sec : float, optional
        Window duration in seconds, by default 3.0.
    overlap : float, optional
        Fractional overlap in [0.0, 1.0), by default 0.5.
    sr : int, optional
        Input sampling rate in Hz, by default 16000.
    device : Optional[int], optional
        Input device index or None for system default.

    Yields
    ------
    Iterator[Tuple[np.ndarray, int]]
        Tuples of (chunk, sr) where:
        - chunk: 1-D np.ndarray of shape (window_size,) and dtype np.float32.
        - sr: Sample rate (16000 Hz).

    Raises
    ------
    RuntimeError
        If `sounddevice` is not installed or audio input device is unavailable.

    Notes
    -----
    Smoke-testing Note: Live microphone input requires local audio hardware access.
    To smoke-test manually on a local machine with a microphone:
    >>> for chunk, sr in stream_microphone(window_sec=1.0, overlap=0.5):
    ...     print(f"Captured chunk shape {chunk.shape} at {sr} Hz")
    """
    if sd is None:
        raise RuntimeError("sounddevice is required for stream_microphone but is not installed.")

    window_size, hop_size = compute_window_params(sr, window_sec, overlap)
    audio_queue: queue.Queue[np.ndarray] = queue.Queue()

    def callback(indata: np.ndarray, frames: int, time_info: dict, status: sd.CallbackFlags) -> None:
        if status:
            pass
        # indata shape is (frames, 1), copy as 1-D float32
        audio_queue.put(indata[:, 0].astype(np.float32, copy=True))

    block_size = hop_size  # Read in steps of hop_size
    buffer = np.zeros(0, dtype=np.float32)

    with sd.InputStream(
        samplerate=sr,
        channels=1,
        dtype="float32",
        blocksize=block_size,
        device=device,
        callback=callback,
    ):
        while True:
            try:
                block = audio_queue.get(timeout=2.0)
                buffer = np.concatenate([buffer, block])
                while len(buffer) >= window_size:
                    chunk = buffer[:window_size].copy()
                    buffer = buffer[hop_size:]
                    yield chunk, sr
            except queue.Empty:
                # No audio received within timeout
                break
