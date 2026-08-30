"""Unit tests for backend.audio.vad voice activity detection and silence filtering."""

from pathlib import Path
import numpy as np
import pytest
import soundfile as sf

from backend.audio.streamer import stream_audio
from backend.audio.vad import has_voice


class TestHasVoice:
    """Tests for has_voice WebRTC VAD classification."""

    def test_synthetic_silence_returns_false(self):
        """Zero amplitude audio must be classified as silence (False)."""
        sr = 16000
        silence = np.zeros(48000, dtype=np.float32)
        assert has_voice(silence, sr=sr) is False

    def test_low_amplitude_noise_returns_false(self):
        """Extremely low-amplitude baseline noise must not trigger voice detection."""
        sr = 16000
        np.random.seed(42)
        low_noise = np.random.uniform(-1e-4, 1e-4, 48000).astype(np.float32)
        assert has_voice(low_noise, sr=sr) is False

    def test_synthetic_voiced_chunk_returns_true(self):
        """Voiced tone in speech frequency range (200 Hz) must be detected as voice (True)."""
        sr = 16000
        duration = 3.0
        t = np.linspace(0, duration, int(sr * duration), endpoint=False)
        # Synthetic speech harmonic: 200 Hz fundamental + harmonics
        voiced = 0.6 * np.sin(2 * np.pi * 200 * t) + 0.3 * np.sin(2 * np.pi * 400 * t)
        voiced = voiced.astype(np.float32)
        assert has_voice(voiced, sr=sr) is True

    def test_non_divisible_chunk_length(self):
        """Chunks not evenly divisible by 30ms sub-frame size must truncate remainder without error."""
        sr = 16000
        # 30ms @ 16kHz = 480 samples. 1000 samples = 2 full frames (960 samples) + 40 remainder
        t = np.linspace(0, 1000 / sr, 1000, endpoint=False)
        voiced = (0.7 * np.sin(2 * np.pi * 220 * t)).astype(np.float32)
        result = has_voice(voiced, sr=sr)
        assert isinstance(result, bool)

    def test_empty_chunk_returns_false(self):
        """Empty array returns False and does not raise."""
        empty = np.array([], dtype=np.float32)
        assert has_voice(empty, sr=16000) is False

    def test_chunk_shorter_than_single_subframe_returns_false(self):
        """Audio shorter than one 30ms subframe (480 samples @ 16kHz) returns False."""
        short_audio = np.ones(200, dtype=np.float32)
        assert has_voice(short_audio, sr=16000) is False

    def test_invalid_sr_raises_value_error(self):
        audio = np.zeros(16000, dtype=np.float32)
        with pytest.raises(ValueError, match="Sample rate 22050 is not supported"):
            has_voice(audio, sr=22050)

    def test_invalid_frame_duration_raises_value_error(self):
        audio = np.zeros(16000, dtype=np.float32)
        with pytest.raises(ValueError, match="Frame duration 15ms is invalid"):
            has_voice(audio, sr=16000, frame_duration_ms=15)

    def test_multidimensional_input_raises_value_error(self):
        audio_2d = np.zeros((2, 16000), dtype=np.float32)
        with pytest.raises(ValueError, match="Input chunk must be 1-D"):
            has_voice(audio_2d, sr=16000)


class TestStreamAudioSilenceFiltering:
    """Tests for stream_audio with skip_silence=True."""

    @pytest.fixture
    def mixed_speech_silence_wav(self, tmp_path: Path) -> Path:
        """Create a 6.0s audio file: 3.0s pure silence followed by 3.0s voiced speech tone."""
        file_path = tmp_path / "mixed_speech_silence.wav"
        sr = 16000
        # 3s silence
        silence = np.zeros(int(3.0 * sr), dtype=np.float32)
        # 3s voiced harmonic tone
        t = np.linspace(0, 3.0, int(3.0 * sr), endpoint=False)
        voiced = (0.6 * np.sin(2 * np.pi * 200 * t) + 0.3 * np.sin(2 * np.pi * 400 * t)).astype(np.float32)
        mixed = np.concatenate([silence, voiced])
        sf.write(str(file_path), mixed, sr)
        return file_path

    def test_skip_silence_filters_out_silent_chunks(self, mixed_speech_silence_wav: Path):
        """Verify skip_silence=True yields strictly fewer chunks and filters silent sections."""
        # Unfiltered stream (3.0s window, 0.5 overlap -> 3 chunks: [0:3s] silence, [1.5:4.5s] mixed, [3:6s] voiced)
        all_chunks = list(
            stream_audio(
                mixed_speech_silence_wav,
                window_sec=3.0,
                overlap=0.5,
                pad_last=False,
                skip_silence=False,
            )
        )

        filtered_chunks = list(
            stream_audio(
                mixed_speech_silence_wav,
                window_sec=3.0,
                overlap=0.5,
                pad_last=False,
                skip_silence=True,
            )
        )

        # Filtered stream should yield fewer chunks than the unfiltered stream
        assert len(filtered_chunks) < len(all_chunks)
        assert len(filtered_chunks) >= 1

        # All chunks in filtered stream must contain voice
        for chunk, sr in filtered_chunks:
            assert has_voice(chunk, sr=sr) is True
