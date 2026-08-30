"""Unit tests for backend.audio.streamer audio loading and streaming generator."""

import inspect
import time
from pathlib import Path
import numpy as np
import pytest
import soundfile as sf

from backend.audio.streamer import load_audio, stream_audio


@pytest.fixture
def standard_wav(tmp_path: Path) -> Path:
    """Fixture creating a 4-second 16kHz mono sine wave .wav file."""
    file_path = tmp_path / "standard_16k_mono.wav"
    sr = 16000
    duration = 4.0
    t = np.linspace(0, duration, int(sr * duration), endpoint=False)
    audio = (0.5 * np.sin(2 * np.pi * 440 * t)).astype(np.float32)
    sf.write(str(file_path), audio, sr)
    return file_path


@pytest.fixture
def short_wav(tmp_path: Path) -> Path:
    """Fixture creating a 1.2-second 16kHz mono audio file (shorter than 3.0s window)."""
    file_path = tmp_path / "short_16k_mono.wav"
    sr = 16000
    duration = 1.2
    t = np.linspace(0, duration, int(sr * duration), endpoint=False)
    audio = (0.5 * np.sin(2 * np.pi * 440 * t)).astype(np.float32)
    sf.write(str(file_path), audio, sr)
    return file_path


@pytest.fixture
def nonstandard_sr_wav(tmp_path: Path) -> Path:
    """Fixture creating a 2-second 44.1kHz mono audio file."""
    file_path = tmp_path / "audio_44k_mono.wav"
    sr = 44100
    duration = 2.0
    t = np.linspace(0, duration, int(sr * duration), endpoint=False)
    audio = (0.5 * np.sin(2 * np.pi * 440 * t)).astype(np.float32)
    sf.write(str(file_path), audio, sr)
    return file_path


@pytest.fixture
def stereo_wav(tmp_path: Path) -> Path:
    """Fixture creating a 2-second 44.1kHz stereo audio file with distinct channels."""
    file_path = tmp_path / "audio_stereo.wav"
    sr = 44100
    duration = 2.0
    t = np.linspace(0, duration, int(sr * duration), endpoint=False)
    left = 0.5 * np.sin(2 * np.pi * 440 * t)
    right = 0.5 * np.sin(2 * np.pi * 880 * t)
    stereo = np.stack([left, right], axis=-1).astype(np.float32)
    sf.write(str(file_path), stereo, sr)
    return file_path


class TestLoadAudio:
    """Tests for load_audio normalization, resampling, and channel downmixing."""

    def test_load_standard_16k_mono(self, standard_wav: Path):
        audio, sr = load_audio(standard_wav)
        assert sr == 16000
        assert isinstance(audio, np.ndarray)
        assert audio.ndim == 1
        assert audio.dtype == np.float32
        assert len(audio) == 16000 * 4

    def test_resample_nonstandard_sample_rate(self, nonstandard_sr_wav: Path):
        """Audio at 44.1 kHz must be resampled to 16 kHz."""
        audio, sr = load_audio(nonstandard_sr_wav)
        assert sr == 16000
        assert audio.ndim == 1
        assert audio.dtype == np.float32
        # 2 seconds at 16000 Hz = 32000 samples (+/- rounding error from resampler)
        assert abs(len(audio) - 32000) <= 2

    def test_downmix_stereo_to_mono(self, stereo_wav: Path):
        """Stereo audio must be downmixed to 1-D mono array at 16 kHz."""
        audio, sr = load_audio(stereo_wav)
        assert sr == 16000
        assert audio.ndim == 1
        assert audio.dtype == np.float32
        assert abs(len(audio) - 32000) <= 2

    def test_file_not_found_raises_error(self, tmp_path: Path):
        non_existent = tmp_path / "does_not_exist.wav"
        with pytest.raises(FileNotFoundError):
            load_audio(non_existent)


class TestStreamAudio:
    """Tests for stream_audio streaming generator."""

    def test_stream_is_generator(self, standard_wav: Path):
        gen = stream_audio(standard_wav, window_sec=2.0, overlap=0.5)
        assert inspect.isgenerator(gen)

    def test_default_pad_last_yields_zero_padded_chunk_for_short_audio(self, short_wav: Path):
        """Default stream_audio should pad short audio to fixed 3.0s (48000 samples)."""
        chunks = list(stream_audio(short_wav, window_sec=3.0, overlap=0.5))
        assert len(chunks) == 1
        chunk, sr = chunks[0]
        assert sr == 16000
        assert chunk.shape == (48000,)
        # Tail must be zero-padded
        assert np.all(chunk[int(1.2 * 16000) :] == 0.0)

    def test_explicit_pad_last_false_yields_nothing_for_short_audio(self, short_wav: Path):
        """Explicit pad_last=False drops audio shorter than one window."""
        chunks = list(stream_audio(short_wav, window_sec=3.0, overlap=0.5, pad_last=False))
        assert len(chunks) == 0

    def test_stream_chunk_shapes_and_types(self, standard_wav: Path):
        """4-second audio with window_sec=2.0, overlap=0.5 and pad_last=False should yield 3 chunks."""
        # Window = 2.0s (32000), hop = 1.0s (16000)
        # Windows: [0:32000], [16000:48000], [32000:64000] -> exactly 3 chunks
        chunks = list(stream_audio(standard_wav, window_sec=2.0, overlap=0.5, pad_last=False))
        assert len(chunks) == 3

        for chunk, sr in chunks:
            assert sr == 16000
            assert isinstance(chunk, np.ndarray)
            assert chunk.shape == (32000,)
            assert chunk.dtype == np.float32

    def test_stream_with_simulate_realtime(self, tmp_path: Path):
        """Verify simulate_realtime introduces pacing between yields."""
        file_path = tmp_path / "short_realtime.wav"
        sr = 16000
        duration = 0.3
        t = np.linspace(0, duration, int(sr * duration), endpoint=False)
        audio = (0.5 * np.sin(2 * np.pi * 440 * t)).astype(np.float32)
        sf.write(str(file_path), audio, sr)

        start_time = time.perf_counter()
        chunks = list(
            stream_audio(
                file_path,
                window_sec=0.1,
                overlap=0.0,
                pad_last=False,
                simulate_realtime=True,
            )
        )
        elapsed = time.perf_counter() - start_time

        # 0.3s audio with 0.1s windows and 0 overlap = 3 chunks (2 sleeps of 0.1s = ~0.2s)
        assert len(chunks) == 3
        assert elapsed >= 0.15
