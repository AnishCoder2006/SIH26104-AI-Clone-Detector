import numpy as np


def _normalize_audio(audio: np.ndarray) -> np.ndarray:
    """Ensure audio is 1D float32 normalized in range [-1.0, 1.0]."""
    audio = np.asarray(audio, dtype=np.float32)

    # Flatten multi-channel (stereo) audio to 1D via averaging
    if audio.ndim > 1:
        audio = np.mean(audio, axis=-1)

    if audio.size == 0:
        return audio

    # Normalize integer PCM audio (e.g., int16 -> float32 [-1, 1])
    if np.issubdtype(audio.dtype, np.integer):
        max_int = np.iinfo(audio.dtype).max
        audio = audio / max_int

    return audio


def compute_snr(audio: np.ndarray, frame_size: int = 1024) -> float:
    """
    Signal-to-Noise Ratio (SNR) in dB using percentile-based noise estimation.
    Higher = cleaner audio.
    """
    audio = _normalize_audio(audio)
    if audio.size < frame_size:
        return 20.0

    # Truncate to match frame boundary for fast vectorized matrix ops
    n_frames = len(audio) // frame_size
    frames = audio[: n_frames * frame_size].reshape(n_frames, frame_size)

    # Calculate frame energies
    energies = np.sum(frames**2, axis=1)

    # Use 10th percentile energy as noise floor cutoff
    noise_threshold = np.percentile(energies, 10)
    signal_mask = energies > noise_threshold
    noise_mask = ~signal_mask

    if not np.any(signal_mask) or not np.any(noise_mask):
        return 20.0

    signal_power = np.mean(energies[signal_mask])
    noise_power = np.mean(energies[noise_mask])

    if noise_power <= 1e-10:
        return 40.0

    snr = 10 * np.log10(signal_power / noise_power)
    return float(np.clip(snr, -10.0, 60.0))


def compute_clipping_percentage(
    audio: np.ndarray, threshold: float = 0.99
) -> float:
    """
    Percentage of samples clipped near maximum digital scale (+-1.0).
    Lower = better quality.
    """
    audio = _normalize_audio(audio)
    if audio.size == 0:
        return 0.0

    clipped_count = np.sum(np.abs(audio) >= threshold)
    percentage = (clipped_count / audio.size) * 100.0
    return float(percentage)


def compute_rms_energy(audio: np.ndarray) -> float:
    """
    Root Mean Square (RMS) Energy.
    Higher = louder audio.
    """
    audio = _normalize_audio(audio)
    if audio.size == 0:
        return 0.0

    rms = np.sqrt(np.mean(audio**2))
    return float(rms)


def compute_spectral_centroid(audio: np.ndarray, sr: int = 16000) -> float:
    """
    Spectral Centroid (center of mass of the spectrum in Hz).
    Higher = brighter/tinier sound.
    """
    audio = _normalize_audio(audio)
    if audio.size == 0:
        return 0.0

    # Real FFT magnitude spectrum
    spectrum = np.abs(np.fft.rfft(audio))
    freqs = np.fft.rfftfreq(len(audio), d=1.0 / sr)

    total_magnitude = np.sum(spectrum)
    if total_magnitude <= 1e-10:
        return 0.0

    centroid = np.sum(freqs * spectrum) / total_magnitude
    return float(centroid)


def compute_zcr(audio: np.ndarray) -> float:
    """
    Zero-Crossing Rate (ZCR).
    Higher = noisier/fricative sound.
    """
    audio = _normalize_audio(audio)
    if audio.size <= 1:
        return 0.0

    # Vectorized zero crossing calculation
    zero_crossings = np.sum(np.diff(np.signbit(audio)))
    zcr = zero_crossings / (len(audio) - 1)
    return float(zcr)


def compute_all_forensic_metrics(
    audio: np.ndarray, sr: int = 16000
) -> dict[str, float]:
    """
    Compute all 5 forensic telemetry metrics.
    Returns a dict formatted for easy JSON serialization.
    """
    audio = _normalize_audio(audio)
    return {
        "snr_db": compute_snr(audio),
        "clipping_percent": compute_clipping_percentage(audio),
        "rms_energy": compute_rms_energy(audio),
        "spectral_centroid_hz": compute_spectral_centroid(audio, sr),
        "zero_crossing_rate": compute_zcr(audio),
    }