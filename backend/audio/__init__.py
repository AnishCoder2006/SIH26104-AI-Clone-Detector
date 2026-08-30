"""Audio processing, ingestion, sliding-window chunking, VAD, and benchmarking module."""

from backend.audio.bench import benchmark_chunk_latency, iter_chunks_for_backend
from backend.audio.chunker import chunk_array, compute_window_params
from backend.audio.live import stream_microphone
from backend.audio.streamer import load_audio, stream_audio
from backend.audio.vad import has_voice

__all__ = [
    "stream_audio",
    "load_audio",
    "chunk_array",
    "compute_window_params",
    "has_voice",
    "benchmark_chunk_latency",
    "iter_chunks_for_backend",
    "stream_microphone",
]
