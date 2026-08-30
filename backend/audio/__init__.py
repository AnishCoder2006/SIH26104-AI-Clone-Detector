"""Audio processing, ingestion, sliding-window chunking, and benchmarking module."""

from backend.audio.bench import benchmark_chunk_latency, iter_chunks_for_backend
from backend.audio.chunker import chunk_array, compute_window_params
from backend.audio.streamer import load_audio, stream_audio

__all__ = [
    "stream_audio",
    "load_audio",
    "chunk_array",
    "compute_window_params",
    "benchmark_chunk_latency",
    "iter_chunks_for_backend",
]
