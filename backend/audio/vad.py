"""Voice Activity Detection (VAD) module.

Provides lightweight speech activity detection over audio chunks using WebRTC VAD.
Operates purely in memory with zero raw audio persistence or logging (DPDP Act compliance).
"""

from typing import Union
import numpy as np
import webrtcvad


def has_voice(
    chunk: np.ndarray,
    sr: int = 16000,
    aggressiveness: int = 2,
    frame_duration_ms: int = 30,
    voice_ratio_threshold: float = 0.3,
) -> bool:
    """Determine whether an audio chunk contains voice/speech activity.

    Divides a 1-D audio chunk into sub-frames (e.g. 30ms) and checks each
    sub-frame with WebRTC VAD. Returns True if the ratio of voiced sub-frames
    meets or exceeds `voice_ratio_threshold`.

    Parameters
    ----------
    chunk : np.ndarray
        1-D array of audio samples, shape (N,), expected dtype np.float32 with
        values in [-1.0, 1.0].
    sr : int, optional
        Sample rate in Hz, by default 16000. Must be one of (8000, 16000, 32000, 48000).
    aggressiveness : int, optional
        WebRTC VAD aggressiveness mode: 0 (least aggressive / most sensitive)
        to 3 (most aggressive / least sensitive to non-speech), by default 2.
    frame_duration_ms : int, optional
        Sub-frame duration in milliseconds for WebRTC VAD: 10, 20, or 30, by default 30.
    voice_ratio_threshold : float, optional
        Minimum fraction of sub-frames that must contain voice activity in [0.0, 1.0],
        by default 0.3 (30%).

    Returns
    -------
    bool
        True if the chunk contains sufficient speech activity, False otherwise.

    Raises
    ------
    ValueError
        If `sr` is not a valid WebRTC sample rate, `frame_duration_ms` is not in (10, 20, 30),
        or `chunk` is not a 1-D array.

    Notes
    -----
    Privacy Guarantee: Operates strictly in memory on byte slices without writing
    audio data to disk or logs.
    """
    if sr not in (8000, 16000, 32000, 48000):
        raise ValueError(
            f"Sample rate {sr} is not supported by webrtcvad. Expected one of (8000, 16000, 32000, 48000)."
        )

    if frame_duration_ms not in (10, 20, 30):
        raise ValueError(
            f"Frame duration {frame_duration_ms}ms is invalid. WebRTC VAD requires 10, 20, or 30 ms."
        )

    if not isinstance(chunk, np.ndarray):
        chunk = np.asarray(chunk)

    if chunk.ndim != 1:
        raise ValueError(f"Input chunk must be 1-D, got shape {chunk.shape} with ndim={chunk.ndim}.")

    n_samples = len(chunk)
    if n_samples == 0:
        return False

    frame_size_samples = int(sr * frame_duration_ms / 1000)
    if n_samples < frame_size_samples:
        return False

    # Convert normalized float32 [-1.0, 1.0] to 16-bit PCM bytes
    pcm_bytes = (np.clip(chunk, -1.0, 1.0) * 32767).astype(np.int16).tobytes()
    frame_size_bytes = frame_size_samples * 2  # 2 bytes per 16-bit sample

    vad = webrtcvad.Vad(aggressiveness)

    total_frames = len(pcm_bytes) // frame_size_bytes
    if total_frames == 0:
        return False

    voiced_frames = 0
    for i in range(total_frames):
        start = i * frame_size_bytes
        frame = pcm_bytes[start : start + frame_size_bytes]
        if vad.is_speech(frame, sr):
            voiced_frames += 1

    ratio = voiced_frames / total_frames
    return ratio >= voice_ratio_threshold
