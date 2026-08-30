"""Audio processing, ingestion, sliding-window chunking, and benchmarking module."""

from audio.bench import benchmark_chunk_latency, iter_chunks_for_backend
from audio.chunker import chunk_array, compute_window_params
from audio.streamer import load_audio, stream_audio

__all__ = [
    "stream_audio",
    "load_audio",
    "chunk_array",
    "compute_window_params",
    "benchmark_chunk_latency",
    "iter_chunks_for_backend",
]
