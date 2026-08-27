# SIH26104: AI-Powered Real-Time Detection and Prevention of Voice Cloning Impersonation Attacks

This repository contains the Phase 1 MVP for our SIH project.

## Directory Structure
*   **`/backend`**: FastAPI/Flask REST API and audio processing pipeline (Member 2 & 3).
*   **`/frontend`**: UI layer for uploading audio and displaying risk alerts (Member 4).
*   **`/ml_pipeline`**: Scripts for dataset preparation, training, and evaluating the wav2vec2 model (Member 1 & 2).

## Getting Started

Please see the README files in each sub-directory for detailed setup instructions.

### Installing dependencies

This project has **two separate requirements files**, since the ML
pipeline and the backend/audio service have different dependency weights:

- `backend/requirements.txt` — API server + audio streaming/chunking deps
  (`fastapi`, `uvicorn`, `librosa`, `soundfile`, `numpy`, etc.)
- `ml_pipeline/requirements.txt` — model training/inference deps
  (`torch`, `torchaudio`, `transformers`, etc.)

Install **both** together when setting up the project for the first time:

```bash
pip install -r backend/requirements.txt -r ml_pipeline/requirements.txt
```

> ⚠️ If you only install one of the two, imports will fail depending on
> which part of the codebase you're running (e.g. running the audio module
> without the ML deps, or the model without `librosa`/`fastapi`).

### Running tests

```bash
PYTHONPATH=. pytest tests/ -v
```