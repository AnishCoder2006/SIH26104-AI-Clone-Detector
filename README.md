# 🎙️ AI-Powered Real-Time Detection and Prevention of Voice Cloning Impersonation Attacks

[![Python Version](https://img.shields.io/badge/python-3.8%2B-blue.svg)](https://www.python.org/downloads/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.95%2B-009688.svg?logo=fastapi)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-14-black.svg?logo=next.js)](https://nextjs.org/)
[![PyTorch](https://img.shields.io/badge/PyTorch-%23EE4C2C.svg?logo=PyTorch&logoColor=white)](https://pytorch.org/)

> **SIH26104** – Phase 1 Minimum Viable Product (MVP)

Welcome to the official repository for our AI-Powered Voice Cloning Detection system. This project aims to provide real-time, robust detection and prevention mechanisms against sophisticated audio spoofing and voice cloning impersonation attacks.

---

## 📑 Table of Contents

- [Overview](#-overview)
- [Project Architecture](#-project-architecture)
- [Key Features](#-key-features)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Testing](#-testing)
- [Documentation](#-documentation)

---

## 📖 Overview

With the rapid advancement of generative AI, malicious actors can easily synthesize realistic audio to impersonate individuals. This project leverages state-of-the-art machine learning models (such as `wav2vec2`) to analyze audio signals in real-time, extracting acoustic features to accurately classify whether a voice is human or AI-generated.

---

## 🏗️ Project Architecture

The repository is modularized into three primary layers to ensure scalability and separation of concerns:

- **`/frontend`** (UI Layer)
  - Built with **Next.js**, **React**, and **TailwindCSS**.
  - Provides an intuitive interface for users to upload audio files or stream audio and view real-time risk assessments and alerts.
- **`/backend`** (API & Audio Processing Layer)
  - Built with **FastAPI** (and Flask compatibility).
  - Handles real-time audio streaming, chunking, and risk analysis using libraries like `librosa` and `soundfile`.
- **`/ml_pipeline`** (Machine Learning Layer)
  - Built with **PyTorch** and **Hugging Face Transformers**.
  - Contains scripts for dataset preparation, training, evaluation, and inference using our anti-spoofing models.

---

## ✨ Key Features

- **Real-Time Analysis**: Stream audio and receive instantaneous spoofing risk scores.
- **Advanced ML Models**: Utilizes transformer-based acoustic models optimized for deepfake detection.
- **Scalable API**: High-performance RESTful endpoints powered by FastAPI.
- **Modern Dashboard**: A responsive web interface for seamless monitoring and alert management.

---

## 🚀 Getting Started

Please refer to the specific `README.md` files located in each sub-directory (`/frontend`, `/backend`, `/ml_pipeline`) for detailed, component-specific setup instructions. 

### Prerequisites

- **Python 3.8+**
- **Node.js 18+** (for Frontend)
- **pip** and **npm** package managers

### Installation

Because the Machine Learning pipeline and the Backend API have distinct dependency footprints, the project utilizes **two separate requirements files**:

1. **`backend/requirements.txt`**: API server and audio streaming dependencies (`fastapi`, `uvicorn`, `librosa`, `soundfile`, `numpy`).
2. **`ml_pipeline/requirements.txt`**: Model training and inference dependencies (`torch`, `torchaudio`, `transformers`).

**Important**: When setting up the Python environment for the first time, you must install **both** sets of dependencies to ensure all imports resolve correctly across the codebase.

```bash
# Clone the repository
git clone https://github.com/AnishCoder2006/SIH26104-AI-Clone-Detector.git
cd SIH26104-AI-Clone-Detector

# Create a virtual environment (recommended)
python -m venv venv
source venv/bin/activate  # On Windows use `venv\Scripts\activate`

# Install all backend and ML dependencies
pip install -r backend/requirements.txt -r ml_pipeline/requirements.txt
```

> ⚠️ **Warning**: If you only install one requirements file, cross-module imports will fail. For example, running the audio module without ML dependencies or running the model without `librosa`/`fastapi` will throw `ImportError`.

---

## 🧪 Testing

We use `pytest` for executing our test suite. Ensure you have installed all dependencies before running the tests.

To run the full test suite from the root directory:

```bash
PYTHONPATH=. pytest tests/ -v
```

---

## 📚 Documentation

For deeper insights into the project's roadmap and team coordination, check out our internal documentation:
- [`phase1_team_division.md`](./phase1_team_division.md)
- [`phase2_roadmap.md`](./phase2_roadmap.md)