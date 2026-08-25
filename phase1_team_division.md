# Phase 1: Team Task Division & Sequential Timeline (10-Day Sprint)

To answer your question directly: **All of these gaps MUST be addressed in Phase 1.** Phase 2 (Roadmap) is for things like dual-engine fusion and telecom integration. Datasets, demo clips, evaluation metrics, and rehearsal are critical for your Phase 1 demo to be credible and successful. 

Based on your feedback that **Model and Backend should lead before Frontend**, here is the revised division of labor and a sequential timeline.

---

## 👥 Updated Division of Labor

### 👤 Member 1: Machine Learning Lead
*   **Dataset Acquisition (Days 1-2):** Owns downloading ASVspoof, understanding its structure, and building train/val splits. (Can pull in Member 2 for help).
*   **Model Training (Days 3-5):** Dedicated time to run epochs, check loss curves, and avoid overfitting.
*   **Evaluation Metrics (Ongoing):** Responsible for tracking EER (Equal Error Rate) and generating confusion matrices. *You must have real numbers for the judges.*
*   **Inference Script:** Creating the standalone Python function for the backend.

### 👤 Member 2: Audio Pipeline & Privacy Lead
*   **Dataset Prep Assist (Days 1-2):** Assist Member 1 with data preprocessing if needed.
*   **Audio Pipeline:** Implement chunking (2-4s sliding windows) for the continuous audio stream.
*   **Privacy Module:** Ensure raw audio is explicitly deleted from memory/disk immediately after feature extraction. 
*   **Handoff:** Pass extracted features to Member 1's classifier.

### 👤 Member 3: Backend & Systems Lead
*   **API & Risk Engine (Days 1-4):** Build the REST API and the Risk Scoring Engine (configurable threshold logic).
*   **System Integration (Days 5-6):** Wire Member 2's pipeline and Member 1's model into the backend. Provide a stable, tested backend for Member 4.

### 👤 Member 4: Frontend & Demo Lead 
*   **Demo Audio Clips (Days 1-2):** While waiting for the backend to be ready, own the creation of the *actual* demo assets. Record real human clips and generate AI-cloned clips (via Coqui TTS or similar) so the team has convincing test data.
*   **Frontend UI (Days 6-8):** Build the web interface (Alerting, Verification Prompt).
*   **API Consumption:** Connect to Member 3's finished backend to display the risk scores.

---

## 📅 Sequential 10-Day Timeline

This timeline reflects your strategy: **Data & Backend first, Frontend later.**

### Stage 1: Foundation (Days 1 - 2)
*   **M1 & M2:** Dataset acquisition, preprocessing, and building train/val splits (ASVspoof).
*   **M3:** Build the backend API skeleton and Risk Engine placeholder.
*   **M4:** Generate the Demo Audio Clips (Convincing real vs AI voice pairs for the final demo).

### Stage 2: Core Engineering & Training (Days 3 - 5)
*   **M1:** Dedicated **Model Training** time. Run epochs, tune hyperparameters.
*   **M2:** Build the audio streaming, sliding windows, and privacy module.
*   **M3:** Refine backend logic and prep for integration.
*   **M4:** *Flex capacity* - assist M3 with backend or design UI mockups.

### Stage 3: Integration & Frontend (Days 6 - 7)
*   **M1 & M2 & M3:** The Backend Merge. Connect the audio pipeline -> model inference -> API endpoints.
*   **M4:** **Frontend Development begins.** Connect the UI to the now-functional API.

### Stage 4: Evaluation & Polish (Days 8 - 9)
*   **End-to-End Test:** Run the demo audio clips through the full UI -> API -> Model flow.
*   **Lock Metrics:** M1 locks in the final EER and confusion matrix numbers for the presentation.
*   **Scope vs. Roadmap:** Finalize the slides explaining what was built vs. what is roadmap.

### Stage 5: Rehearsal (Day 10)
*   **Full Timed Rehearsal:** Run the pitch with a stopwatch. Use the actual Demo Audio clips. Practice the live demo flow to ensure no technical fumbles under pressure.
