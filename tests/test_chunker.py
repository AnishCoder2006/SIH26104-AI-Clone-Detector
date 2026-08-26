"""Unit tests for backend.audio.chunker sliding-window logic and edge cases."""

import inspect
import numpy as np
import pytest

from backend.audio.chunker import chunk_array, compute_window_params


class TestComputeWindowParams:
    """Tests for compute_window_params window/hop sample calculations and validations."""

    def test_standard_parameters(self):
        sr = 16000
        window_sec = 3.0
        overlap = 0.5
        win_size, hop_size = compute_window_params(sr, window_sec, overlap)
        assert win_size == 48000
        assert hop_size == 24000

    def test_no_overlap(self):
        sr = 16000
        window_sec = 2.0
        overlap = 0.0
        win_size, hop_size = compute_window_params(sr, window_sec, overlap)
        assert win_size == 32000
        assert hop_size == 32000

    def test_high_overlap(self):
        sr = 16000
        window_sec = 1.0
        overlap = 0.75
        win_size, hop_size = compute_window_params(sr, window_sec, overlap)
        assert win_size == 16000
        assert hop_size == 4000

    def test_invalid_overlap_raises_value_error(self):
        with pytest.raises(ValueError, match="Overlap must be in the half-open interval"):
            compute_window_params(16000, 3.0, -0.1)

        with pytest.raises(ValueError, match="Overlap must be in the half-open interval"):
            compute_window_params(16000, 3.0, 1.0)

        with pytest.raises(ValueError, match="Overlap must be in the half-open interval"):
            compute_window_params(16000, 3.0, 1.5)

    def test_invalid_window_sec_raises_value_error(self):
        with pytest.raises(ValueError, match="Window length 'window_sec' must be strictly positive"):
            compute_window_params(16000, 0.0, 0.5)

        with pytest.raises(ValueError, match="Window length 'window_sec' must be strictly positive"):
            compute_window_params(16000, -2.0, 0.5)

    def test_invalid_sample_rate_raises_value_error(self):
        with pytest.raises(ValueError, match="Sample rate 'sr' must be a positive integer"):
            compute_window_params(0, 3.0, 0.5)

        with pytest.raises(ValueError, match="Sample rate 'sr' must be a positive integer"):
            compute_window_params(-16000, 3.0, 0.5)


class TestChunkArray:
    """Tests for chunk_array sliding window chunking."""

    def test_is_generator(self):
        audio = np.linspace(-1.0, 1.0, 48000, dtype=np.float32)
        gen = chunk_array(audio, sr=16000, window_sec=1.0, overlap=0.0)
        assert inspect.isgenerator(gen)

    def test_sliding_window_no_overlap_reconstruction(self):
        """Verify no dropped or duplicated samples in exact-multiple audio with 0 overlap."""
        sr = 16000
        window_sec = 2.0
        # 3 full windows = 6 seconds = 96000 samples
        original = np.random.uniform(-1.0, 1.0, 96000).astype(np.float32)

        chunks = list(chunk_array(original, sr=sr, window_sec=window_sec, overlap=0.0))

        assert len(chunks) == 3
        for chunk in chunks:
            assert chunk.shape == (32000,)
            assert chunk.dtype == np.float32

        # Reconstruct signal by concatenation and verify exact equality
        reconstructed = np.concatenate(chunks)
        assert np.array_equal(reconstructed, original)

    def test_sliding_window_with_overlap_alignment(self):
        """Verify 50% overlap chunks align precisely with direct array slices."""
        sr = 16000
        window_sec = 2.0  # 32000 samples
        overlap = 0.5     # hop = 16000 samples
        # 5 seconds = 80000 samples -> (80000 - 32000) // 16000 + 1 = 4 chunks
        audio = np.arange(80000, dtype=np.float32)

        chunks = list(chunk_array(audio, sr=sr, window_sec=window_sec, overlap=overlap))
        assert len(chunks) == 4

        win_size, hop_size = 32000, 16000
        for i, chunk in enumerate(chunks):
            expected = audio[i * hop_size : i * hop_size + win_size]
            assert np.array_equal(chunk, expected)
            assert chunk.shape == (win_size,)
            assert chunk.dtype == np.float32

    def test_audio_shorter_than_one_window_pad_false(self):
        """Short audio with pad_last=False should yield nothing."""
        sr = 16000
        audio = np.ones(20000, dtype=np.float32)  # shorter than 3.0s (48000 samples)
        chunks = list(chunk_array(audio, sr=sr, window_sec=3.0, overlap=0.5, pad_last=False))
        assert len(chunks) == 0

    def test_audio_shorter_than_one_window_pad_true(self):
        """Short audio with pad_last=True should yield exactly 1 zero-padded chunk."""
        sr = 16000
        n_samples = 20000
        audio = np.ones(n_samples, dtype=np.float32)
        chunks = list(chunk_array(audio, sr=sr, window_sec=3.0, overlap=0.5, pad_last=True))

        assert len(chunks) == 1
        chunk = chunks[0]
        assert chunk.shape == (48000,)
        assert chunk.dtype == np.float32
        assert np.array_equal(chunk[:n_samples], audio)
        assert np.all(chunk[n_samples:] == 0.0)

    def test_trailing_audio_pad_false_vs_pad_true(self):
        """Verify trailing samples when total length is not a clean multiple."""
        sr = 16000
        # 3.5 seconds = 56000 samples, window = 2.0s (32000), hop = 1.0s (16000)
        # Windows: [0:32000], [16000:48000], remaining tail [32000:56000] (24000 samples)
        audio = np.arange(56000, dtype=np.float32)

        chunks_no_pad = list(chunk_array(audio, sr=sr, window_sec=2.0, overlap=0.5, pad_last=False))
        assert len(chunks_no_pad) == 2

        chunks_pad = list(chunk_array(audio, sr=sr, window_sec=2.0, overlap=0.5, pad_last=True))
        assert len(chunks_pad) == 3
        # Check the zero-padded trailing chunk
        tail_chunk = chunks_pad[2]
        assert tail_chunk.shape == (32000,)
        assert np.array_equal(tail_chunk[:24000], audio[32000:56000])
        assert np.all(tail_chunk[24000:] == 0.0)

    def test_empty_audio_yields_nothing(self):
        """Empty array yields nothing and does not raise an error."""
        audio = np.array([], dtype=np.float32)
        chunks_no_pad = list(chunk_array(audio, sr=16000, pad_last=False))
        chunks_pad = list(chunk_array(audio, sr=16000, pad_last=True))
        assert len(chunks_no_pad) == 0
        assert len(chunks_pad) == 0

    def test_reject_multidimensional_audio(self):
        """Multi-channel/2D audio must raise ValueError."""
        stereo_audio = np.zeros((2, 16000), dtype=np.float32)
        with pytest.raises(ValueError, match="Input audio must be 1-D"):
            list(chunk_array(stereo_audio, sr=16000))
