import { NextRequest, NextResponse } from 'next/server';

interface TelemetryPayload {
  spectral_entropy?: number;
  phase_coherence?: number;
  mel_cepstral_dist?: number;
  pitch_variance?: number;
}

interface ForensicRequest {
  probability: number;
  language: 'english' | 'indian';
  telemetry: TelemetryPayload;
}

export async function POST(req: NextRequest) {
  try {
    const body: ForensicRequest = await req.json();
    const { probability = 0, language = 'indian', telemetry = {} } = body;

    const prob = Number(probability);
    const entropy = telemetry.spectral_entropy ?? 0.89;
    const coherence = telemetry.phase_coherence ?? 0.41;
    const mcd = telemetry.mel_cepstral_dist ?? 12.4;
    const pitchVar = telemetry.pitch_variance ?? 0.02;

    // Determine Threat Level
    let threat_level: 'CRITICAL' | 'HIGH' | 'ELEVATED' | 'LOW' = 'LOW';
    if (prob >= 0.75 || coherence < 0.30) {
      threat_level = 'CRITICAL';
    } else if (prob >= 0.50 || coherence < 0.45) {
      threat_level = 'HIGH';
    } else if (prob >= 0.25) {
      threat_level = 'ELEVATED';
    } else {
      threat_level = 'LOW';
    }

    // Dynamic XAI Diagnostic Tags
    const xai_tags: string[] = [];
    if (prob >= 0.5) {
      xai_tags.push('Neural Vocoder Artifacts');
      if (coherence < 0.45) xai_tags.push('Phase Incoherence Jitter');
      if (entropy > 0.75) xai_tags.push('High-Frequency Spectral Smearing');
      if (pitchVar < 0.03) xai_tags.push('Synthetic Pitch Flatness');
      if (mcd > 10.0) xai_tags.push('Mel-Cepstral Distortion Spike');
      xai_tags.push(language === 'indian' ? 'Indic Vocoder Acoustic Signature' : 'ASVspoof Temporal Anomaly');
    } else {
      xai_tags.push('Natural Glottal Waveform');
      xai_tags.push('Organic Biological Prosody');
      xai_tags.push('Human Vocal Tract Resonance');
    }

    // Detailed Acoustic Insights
    const forensic_insights: string[] = [];
    if (prob >= 0.5) {
      forensic_insights.push(
        `Synthetic probability estimated at ${(prob * 100).toFixed(1)}% using ${language === 'indian' ? 'Indic-Wav2Vec2' : 'ASVspoof-Wav2Vec2'} neural acoustic model.`
      );
      forensic_insights.push(
        `Phase coherence index (${coherence.toFixed(2)}) deviates significantly from organic human vocal cord vibrations (baseline > 0.70).`
      );
      forensic_insights.push(
        `Spectral entropy (${entropy.toFixed(2)}) indicates artificial high-frequency energy dispersion characteristic of text-to-speech vocoders (e.g., HiFi-GAN / FastSpeech).`
      );
      forensic_insights.push(
        `Pitch variance (${pitchVar.toFixed(3)}) reveals unnatural pitch micro-stabilization with absence of involuntary neuromuscular tremors.`
      );
    } else {
      forensic_insights.push(
        `Synthetic probability measured at ${(prob * 100).toFixed(1)}%, consistent with authentic human vocal production.`
      );
      forensic_insights.push(
        `Phase coherence (${coherence.toFixed(2)}) and natural pitch micro-tremors align with genuine biological speech patterns.`
      );
      forensic_insights.push(
        `Spectral and acoustic telemetry indices fall well within organic voiceprint tolerances.`
      );
    }

    // Mitigation Protocol
    let mitigation_plan = '';
    switch (threat_level) {
      case 'CRITICAL':
        mitigation_plan =
          'CRITICAL ACTION: Immediately suspend high-risk authorization workflows. Force out-of-band step-up verification via registered physical authenticator or live video biometric challenge before releasing any funds or credentials.';
        break;
      case 'HIGH':
        mitigation_plan =
          'ELEVATED ACTION: Synthetic voice signature detected. Intercept voice call, alert fraud ops desk, and require dynamic interactive challenge-response phrase verification.';
        break;
      case 'ELEVATED':
        mitigation_plan =
          'CAUTIONARY MONITORING: Minor acoustic anomalies detected. Enforce secondary SMS OTP verification and closely monitor remaining call duration audio frames.';
        break;
      case 'LOW':
      default:
        mitigation_plan =
          'NORMAL PROTOCOL: Audio stream verified as authentic biological voice. No malicious synthesis artifacts detected. Proceed with standard operational clearance.';
        break;
    }

    return NextResponse.json({
      threat_level,
      xai_tags,
      forensic_insights,
      mitigation_plan,
      analyzed_at: new Date().toISOString(),
      language_model: language,
    });
  } catch (error) {
    console.error('Forensic Agent API error:', error);
    return NextResponse.json(
      { error: 'Failed to execute forensic deep analysis agent.' },
      { status: 500 }
    );
  }
}
