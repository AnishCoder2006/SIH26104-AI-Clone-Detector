"""Unit tests for backend.audio.bench latency benchmarking and backend helper."""

import inspect
from pathlib import Path
import numpy as np
import pytest
import soundfile as sf

from backend.audio.bench import benchmark_chunk_latency, iter_chunks_for_backend


@pytest.fixture
def voiced_audio_wav(tmp_path: Path) -> Path:
    """Fixture creating a 6-second voiced 16kHz audio file with speech-like harmonics."""
    file_path = tmp_path / "voiced_test_audio.wav"
    sr = 16000
    duration = 6.0
    t = np.linspace(0, duration, int(sr * duration), endpoint=False)
    audio = (0.6 * np.sin(2 * np.pi * 200 * t) + 0.3 * np.sin(2 * np.pi * 400 * t)).astype(np.float32)
    sf.write(str(file_path), audio, sr)
    return file_path


class TestBenchmarkChunkLatency:
    """Tests for benchmark_chunk_latency performance profiling."""

    def test_benchmark_returns_valid_metrics(self, voiced_audio_wav: Path):
        """Verify metric keys and positive float execution times."""
        result = benchmark_chunk_latency(voiced_audio_wav, n_chunks=5, window_sec=1.0, overlap=0.5)

        assert isinstance(result, dict)
        assert "avg_ms" in result
        assert "min_ms" in result
        assert "max_ms" in result
        assert "n_chunks" in result

        assert isinstance(result["avg_ms"], float)
        assert isinstance(result["min_ms"], float)
        assert isinstance(result["max_ms"], float)
        assert isinstance(result["n_chunks"], int)

        assert result["n_chunks"] == 5
        assert result["avg_ms"] > 0.0
        assert result["min_ms"] > 0.0
        assert result["max_ms"] >= result["min_ms"]
        assert result["avg_ms"] >= result["min_ms"]
        assert result["avg_ms"] <= result["max_ms"]

    def test_benchmark_handles_short_file_gracefully(self, voiced_audio_wav: Path):
        """When requested n_chunks exceeds total file chunks, report actual measured count."""
        # 6-second audio with 3.0s window and 0.5 overlap has ~3-4 chunks
        result = benchmark_chunk_latency(voiced_audio_wav, n_chunks=100, window_sec=3.0, overlap=0.5)

        assert result["n_chunks"] > 0
        assert result["n_chunks"] < 100
        assert result["avg_ms"] > 0.0

    def test_benchmark_disables_simulate_realtime(self, voiced_audio_wav: Path):
        """Even if simulate_realtime=True is passed, benchmarking measures computational throughput."""
        # Passing simulate_realtime=True should be overridden so latency is under 50ms per chunk, not 1500ms
        result = benchmark_chunk_latency(
            voiced_audio_wav,
            n_chunks=3,
            window_sec=3.0,
            overlap=0.5,
            simulate_realtime=True,
        )
        assert result["n_chunks"] == 3
        # Pure array slicing latency should easily be < 50ms
        assert result["avg_ms"] < 100.0


class TestIterChunksForBackend:
    """Tests for iter_chunks_for_backend production integration helper."""

    def test_iter_chunks_is_generator(self, voiced_audio_wav: Path):
        gen = iter_chunks_for_backend(voiced_audio_wav)
        assert inspect.isgenerator(gen)

    def test_iter_chunks_yields_standard_format(self, voiced_audio_wav: Path):
        """Verify yielded chunks adhere to 48000-sample (3.0s @ 16kHz) float32 contract."""
        chunks = list(iter_chunks_for_backend(voiced_audio_wav))

        assert len(chunks) >= 1
        for chunk, sr in chunks:
            assert sr == 16000
            assert isinstance(chunk, np.ndarray)
            assert chunk.shape == (48000,)
            assert chunk.dtype == np.float32
