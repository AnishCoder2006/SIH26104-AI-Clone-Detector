"""Latency benchmarking and backend integration helper module.

Provides performance profiling utilities for chunk ingestion and pre-configured
stream generators for downstream backend integration.
"""

from pathlib import Path
import time
from typing import Any, Dict, Iterator, Tuple, Union
import numpy as np

from backend.audio.streamer import stream_audio


def benchmark_chunk_latency(
    file_path: Union[str, Path],
    n_chunks: int = 20,
    **stream_kwargs: Any,
) -> Dict[str, Union[float, int]]:
    """Measure the latency of audio chunk generation per chunk in milliseconds.

    Iterates through the stream generator and records the wall-clock time required
    to emit each chunk. Automatically disables `simulate_realtime` to measure raw
    pipeline execution speed rather than intentional demo pacing.

    Parameters
    ----------
    file_path : Union[str, Path]
        Path to the test audio file.
    n_chunks : int, optional
        Maximum number of chunks to benchmark, by default 20.
    **stream_kwargs : Any
        Additional keyword arguments forwarded to `stream_audio`.

    Returns
    -------
    Dict[str, Union[float, int]]
        Dictionary containing:
        - "avg_ms": Average time per chunk emission in ms.
        - "min_ms": Minimum time per chunk emission in ms.
        - "max_ms": Maximum time per chunk emission in ms.
        - "n_chunks": Actual number of chunks measured.
    """
    # Force simulate_realtime=False to measure computational latency
    kwargs = dict(stream_kwargs)
    kwargs["simulate_realtime"] = False

    latencies_ms = []
    generator = stream_audio(file_path, **kwargs)

    t_start = time.perf_counter()
    for chunk, _ in generator:
        t_end = time.perf_counter()
        latencies_ms.append((t_end - t_start) * 1000.0)
        if len(latencies_ms) >= n_chunks:
            break
        t_start = time.perf_counter()

    if not latencies_ms:
        return {"avg_ms": 0.0, "min_ms": 0.0, "max_ms": 0.0, "n_chunks": 0}

    return {
        "avg_ms": float(np.mean(latencies_ms)),
        "min_ms": float(np.min(latencies_ms)),
        "max_ms": float(np.max(latencies_ms)),
        "n_chunks": len(latencies_ms),
    }


def iter_chunks_for_backend(file_path: Union[str, Path]) -> Iterator[Tuple[np.ndarray, int]]:
    """Yield pre-configured audio chunks for backend API consumption.

    Wraps `stream_audio` with standard production parameters:
    - 3.0-second sliding windows with 50% overlap.
    - `pad_last=True` for fixed-tensor model compatibility.
    - `skip_silence=True` for VAD voice filtering.
    - `simulate_realtime=False` for maximum throughput.

    Parameters
    ----------
    file_path : Union[str, Path]
        Path to the target audio file.

    Yields
    ------
    Iterator[Tuple[np.ndarray, int]]
        Tuples of (chunk, sr) where:
        - chunk: 1-D numpy array of shape (48000,) with dtype np.float32.
        - sr: Sample rate (16000 Hz).
    """
    return stream_audio(
        file_path=file_path,
        window_sec=3.0,
        overlap=0.5,
        pad_last=True,
        skip_silence=True,
        simulate_realtime=False,
    )
