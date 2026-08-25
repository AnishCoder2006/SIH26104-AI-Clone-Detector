# Phase 2: Production Roadmap (Post-MVP)

Phase 2 is your "Roadmap" slide for the pitch. This is what you tell the judges you will build if given the funding and time to take your Phase 1 prototype into a real-world, enterprise-grade product. 

In Phase 2, the team transitions from building a functional demo to building a robust, scalable, and highly accurate telecom product.

---

## 🚀 The Phase 2 Objectives
1.  **Dual-Engine Fusion:** Upgrading from a single `wav2vec2` classifier to a spatial (frequency) + temporal (time) fusion model for higher accuracy.
2.  **ONNX/INT8 Quantization:** Shrinking the model so it can run instantly on edge devices or cheap hardware without lag.
3.  **Real SIP/WebRTC Interception:** Moving away from "uploaded files" to actually intercepting live phone calls on a network level.
4.  **Codec-Degradation Training:** Training the model to handle terrible phone line quality (GSM, G.711 codecs) instead of just clean ASVspoof audio.

---

## 👥 Division of Labor (Phase 2)

### 👤 Member 1: Machine Learning Lead
**Focus: Advanced Architecture & Robustness**
*   **Dual-Engine Fusion:** Implement the spatial+temporal model architecture. This means combining `wav2vec2` (temporal) with something like a CNN on mel-spectrograms (spatial) and fusing their outputs.
*   **Codec-Degradation Training:** Augment the ASVspoof dataset by passing it through simulated phone line compression (e.g., G.711, 8kHz downsampling, background static) so the model learns to detect deepfakes even on terrible WhatsApp or cellular calls.

### 👤 Member 2: Audio Pipeline & Edge Deployment Lead
**Focus: Speed & Optimization**
*   **ONNX/INT8 Quantization:** Convert Member 1's massive PyTorch models into highly optimized ONNX runtimes. Apply INT8 quantization to reduce the model size by 4x and speed up inference.
*   **Edge Privacy Implementation:** Move the feature-extraction and inference directly onto the client device (e.g., running the ONNX model in the browser via WebAssembly or on a mobile app) so audio *never* even hits a centralized backend server.

### 👤 Member 3: Backend & Systems Lead
**Focus: Telecom Integration**
*   **Real SIP/WebRTC Call Interception:** Hook into actual VoIP protocols. Instead of a standard REST API, build a system that can sit inside a Twilio Voice stream, Asterisk PBX, or WebRTC channel to read the audio packets in real-time.
*   **Low-Latency Streaming:** Upgrade the chunking pipeline to handle real-time UDP streams with sub-100ms latency.

### 👤 Member 4: Frontend & Enterprise UI Lead
**Focus: Production Dashboards & Real-Time UX**
*   **Enterprise Dashboard:** Build a high-level analytics dashboard for call centers (showing aggregate stats: "5 impersonations blocked today").
*   **Live Call Overlay:** Develop a real-time overlay or browser extension that a customer support agent would actually use while on a call, showing the live risk score fluctuating second-by-second. 

---

## 💡 How to Pitch This to the Judges
When a judge asks, *"Why didn't you use a dual-engine model?"* or *"How do you handle real phone calls?"*

**Your answer:**
> *"For the 10-day sprint, our strategy was to build a single, highly-optimized classifier and a functional API to prove the end-to-end pipeline and privacy design. A single well-executed engine beats two half-built ones. However, as outlined in our Phase 2 Roadmap, our immediate next steps for production involve fusing spatial and temporal engines for higher accuracy, quantizing to INT8 for edge deployment, and hooking directly into SIP/WebRTC streams for live telecom interception. We deliberately scoped those out of the MVP to ensure a flawless, working prototype today."*
