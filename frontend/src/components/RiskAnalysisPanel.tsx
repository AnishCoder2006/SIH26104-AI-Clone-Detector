import React from 'react';
import { RadialGauge } from './RadialGauge';
import { 
  AlertTriangle, 
  ShieldCheck, 
  Activity, 
  BarChart2, 
  Radio, 
  Zap, 
  Loader2, 
  RotateCcw,
  Sparkles,
  ArrowLeft,
  Search,
  CheckCircle2
} from 'lucide-react';
import { motion } from 'framer-motion';

export interface Metrics {
  synthetic_voice_probability: number;
  snr_db: number;
  clipping_percent: number;
  rms_energy: number;
  spectral_centroid_hz: number;
  zero_crossing_rate: number;
}

export interface RiskResponse {
  risk_score: number;
  risk_level: string;
  alert: boolean;
  recommendation: string;
  metrics: Metrics;
  synthetic_probability?: number;
  spectral_entropy?: number;
  phase_coherence?: number;
  mel_cepstral_dist?: number;
  pitch_variance?: number;
}

interface RiskAnalysisPanelProps {
  loading: boolean;
  data: RiskResponse | null;
  onRunForensicAnalysis?: () => void;
  isAgentLoading?: boolean;
  agentReport?: any;
  onReset?: () => void;
}

export function RiskAnalysisPanel({
  loading,
  data,
  onRunForensicAnalysis,
  isAgentLoading = false,
  agentReport = null,
  onReset,
}: RiskAnalysisPanelProps) {
  // Full-width Loading Skeleton Card
  if (loading) {
    return (
      <div className="relative rounded-2xl p-6 lg:p-8 bg-gradient-to-b from-[#161D2F]/95 via-[#161D2F]/85 to-[#0B0F19] border border-white/10 shadow-[0_20px_50px_rgba(11,15,25,0.85)] flex flex-col overflow-hidden w-full transition-all">
        {/* Ambient Top Glow Line */}
        <div className="absolute top-0 left-1/4 right-1/4 h-[1.5px] bg-gradient-to-r from-transparent via-primary/70 to-transparent rounded-full pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-5 border-b border-white/[0.08] mb-8">
          <div>
            <h2 className="text-2xl lg:text-3xl font-cormorant font-medium text-white">
              Forensic Neural Intercept in Progress
            </h2>
            <p className="text-xs font-karla text-silver mt-1">
              Extracting Mel-spectrogram tensors, vocoder phase anomalies, and temporal features...
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-mono">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
            <span>Scanning Audio</span>
          </div>
        </div>

        {/* Loading Centerpiece */}
        <div className="flex flex-col items-center justify-center py-12">
          <div className="relative mb-6">
            <div className="w-40 h-40 rounded-full border-2 border-primary/20 animate-ping opacity-30" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-primary/20 via-[#161D2F] to-accent/20 border border-primary/40 flex items-center justify-center shadow-[0_0_30px_rgba(0,245,160,0.3)]">
                <Activity className="w-10 h-10 text-primary animate-pulse" />
              </div>
            </div>
          </div>

          <p className="text-sm font-karla font-semibold text-white tracking-wider uppercase mb-2">
            Dissecting Acoustic Vectors
          </p>
          <p className="text-xs font-mono text-silver">
            16.0 kHz Mono • ONNX Neural Engine • Zero Retention Buffer
          </p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="relative rounded-2xl p-8 bg-gradient-to-b from-[#161D2F]/95 via-[#161D2F]/85 to-[#0B0F19] border border-white/10 shadow-[0_20px_50px_rgba(11,15,25,0.85)] flex flex-col items-center justify-center text-center w-full">
        <Activity className="w-14 h-14 mb-4 text-silver/40 animate-pulse" />
        <h2 className="text-2xl font-cormorant font-semibold mb-2 text-white">Awaiting Media Payload</h2>
        <p className="max-w-md text-sm text-silver font-karla">Upload a media file or record audio to begin the forensic analysis sequence.</p>
      </div>
    );
  }

  const detectionResult = data;
  const handleRunForensicAnalysis = onRunForensicAnalysis;
  const isHighRisk = data.alert || data.risk_score > 50;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative rounded-2xl p-6 lg:p-8 bg-gradient-to-b from-[#161D2F]/95 via-[#161D2F]/85 to-[#0B0F19] border border-white/10 shadow-[0_20px_50px_rgba(11,15,25,0.85)] flex flex-col overflow-hidden w-full transition-all"
    >
      {/* Ambient Top Glow Line */}
      <div className="absolute top-0 left-1/4 right-1/4 h-[1.5px] bg-gradient-to-r from-transparent via-primary/70 to-transparent rounded-full pointer-events-none" />

      {/* Header Row: Title & Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/[0.08] mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-2xl lg:text-3xl font-cormorant font-medium text-white tracking-normal leading-tight">
              Forensic Synthesis & Risk Analysis
            </h2>
            <div className={`px-3 py-0.5 font-mono text-[10px] tracking-widest uppercase font-bold rounded-full ${
              isHighRisk 
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow-[0_0_12px_rgba(244,63,94,0.3)]' 
                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
            }`}>
              {data.risk_level}
            </div>
          </div>
          <p className="text-xs font-karla text-silver">
            Multi-band acoustic telemetry · Continuous neural probability assessment
          </p>
        </div>

        {/* Right Actions: Reset/Analyze New Sample */}
        {onReset && (
          <button
            type="button"
            onClick={onReset}
            className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 hover:border-primary/40 text-slate-200 hover:text-white transition-all text-xs font-karla font-semibold flex items-center gap-2 shadow-sm shrink-0 self-start sm:self-auto group"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
            <span>Analyze New Sample</span>
          </button>
        )}
      </div>

      {/* Main Forensic Grid: Left Gauge & Deep AI / Right Alert & Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start mb-6">
        {/* Left Column: Radial Gauge + Deep Agent Trigger (lg:col-span-5) */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 rounded-xl bg-[#0B0F19]/70 border border-white/[0.08] shadow-inner">
          <div className="mb-4 flex flex-col items-center">
            <RadialGauge score={data.risk_score} size={210} />
          </div>

          {/* On-Demand Analysis Trigger Button */}
          {detectionResult && handleRunForensicAnalysis && (
            <div className="w-full mt-2">
              <button
                type="button"
                onClick={handleRunForensicAnalysis}
                disabled={isAgentLoading}
                className="w-full px-5 py-3.5 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-[#0B0F19] font-karla font-bold text-xs tracking-wider uppercase rounded-xl shadow-[0_0_20px_rgba(0,245,160,0.3)] hover:shadow-[0_0_30px_rgba(0,245,160,0.5)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99]"
              >
                {isAgentLoading ? (
                  <span key="agent-loading" className="inline-flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin shrink-0 text-[#0B0F19]" />
                    <span>Running AI Telemetry Agent...</span>
                  </span>
                ) : (
                  <span key="agent-idle" className="inline-flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#0B0F19]" />
                    <span>Run AI Forensic Deep Analysis</span>
                  </span>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Security Alert Banner & Metrics Grid (lg:col-span-7) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {/* Security Alert Banner */}
          <div 
            className={`p-4 sm:p-5 rounded-xl flex items-start gap-3.5 border backdrop-blur-md transition-all duration-300 ${
              isHighRisk 
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-100 shadow-[0_0_20px_rgba(244,63,94,0.1)]' 
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-100 shadow-[0_0_20px_rgba(16,185,129,0.1)]'
            }`}
          >
            {isHighRisk ? (
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-rose-400 animate-pulse" />
            ) : (
              <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5 text-emerald-400" />
            )}
            <div className="min-w-0">
              <h4 className={`font-karla font-bold text-xs tracking-widest uppercase mb-1 ${isHighRisk ? 'text-rose-400' : 'text-emerald-400'}`}>
                {isHighRisk ? 'Critical Forensic Security Alert' : 'Acoustic Verification Passed'}
              </h4>
              <p className="text-xs font-karla opacity-90 leading-relaxed text-slate-200">
                {data.recommendation}
              </p>
            </div>
          </div>

          {/* 6-Metric High-Precision Telemetry Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <MetricCard
              label="Synthetic Voice Prob."
              value={`${data.metrics.synthetic_voice_probability.toFixed(1)}%`}
              icon={<Activity className="w-3.5 h-3.5" />}
              alert={data.metrics.synthetic_voice_probability > 50}
            />
            <MetricCard
              label="Signal-to-Noise Ratio"
              value={`${data.metrics.snr_db.toFixed(1)} dB`}
              icon={<Radio className="w-3.5 h-3.5" />}
              alert={data.metrics.snr_db < 15}
            />
            <MetricCard
              label="Audio Clipping"
              value={`${data.metrics.clipping_percent.toFixed(2)}%`}
              icon={<Zap className="w-3.5 h-3.5" />}
              alert={data.metrics.clipping_percent > 1.0}
            />
            <MetricCard
              label="RMS Energy"
              value={data.metrics.rms_energy.toFixed(3)}
              icon={<BarChart2 className="w-3.5 h-3.5" />}
            />
            <MetricCard
              label="Spectral Centroid"
              value={`${Math.round(data.metrics.spectral_centroid_hz)} Hz`}
              icon={<Activity className="w-3.5 h-3.5" />}
            />
            <MetricCard
              label="Zero Crossing Rate"
              value={data.metrics.zero_crossing_rate.toFixed(3)}
              icon={<Activity className="w-3.5 h-3.5" />}
            />
          </div>
        </div>
      </div>

      {/* AI Threat Intelligence Report Dossier (When triggered) */}
      {agentReport && (
        <div className="p-5 sm:p-6 rounded-xl bg-[#0B0F19]/90 border border-primary/30 text-white space-y-4 shadow-2xl backdrop-blur-md animate-in fade-in duration-300">
          {/* Header & Threat Badge */}
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="font-karla font-bold text-base flex items-center gap-2 text-primary">
              <Sparkles className="w-4 h-4 text-primary" />
              <span>AI Forensic Threat Intelligence Report</span>
            </h3>
            <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wider ${
              agentReport.threat_level === 'CRITICAL' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/50 animate-pulse' :
              agentReport.threat_level === 'HIGH' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/50' :
              agentReport.threat_level === 'ELEVATED' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50' :
              'bg-primary/20 text-primary border border-primary/50'
            }`}>
              {agentReport.threat_level} THREAT
            </span>
          </div>

          {/* XAI Diagnostic Tags */}
          <div>
            <p className="text-[11px] text-silver uppercase tracking-wider font-mono mb-2">Detected Acoustic Anomaly Tags</p>
            <div className="flex gap-2 flex-wrap">
              {agentReport.xai_tags?.map((tag: string, idx: number) => (
                <span key={idx} className="bg-[#161D2F] text-accent text-xs font-mono px-3 py-1 rounded-lg border border-accent/30">
                  🔍 {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Forensic Insights */}
          <div className="space-y-2 text-xs sm:text-sm text-slate-300 bg-[#161D2F]/60 p-4 rounded-xl border border-white/10 font-karla leading-relaxed">
            <p className="font-bold text-white text-xs uppercase tracking-wider font-mono">Forensic Acoustic Insights</p>
            <ul className="list-disc list-inside space-y-1 text-slate-300">
              {agentReport.forensic_insights?.map((insight: string, idx: number) => (
                <li key={idx}>{insight}</li>
              ))}
            </ul>
          </div>

          {/* Mitigation Protocol */}
          <div className="bg-rose-950/20 border border-rose-900/40 p-4 rounded-xl text-xs sm:text-sm text-rose-200 font-karla leading-relaxed">
            <p className="font-bold text-rose-400 text-xs uppercase tracking-wider font-mono mb-1">Recommended Mitigation Protocol</p>
            <p>{agentReport.mitigation_plan}</p>
          </div>
        </div>
      )}
    </motion.div>
  );
}

function MetricCard({ label, value, icon, alert }: { label: string, value: string | number, icon: React.ReactNode, alert?: boolean }) {
  return (
    <div className={`p-3.5 rounded-xl border bg-[#0B0F19]/80 backdrop-blur-sm transition-all ${
      alert 
        ? 'border-rose-500/50 text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.15)]' 
        : 'border-white/[0.08] text-slate-100 hover:border-white/20'
    }`}>
      <div className="flex items-center gap-1.5 text-[10px] tracking-wider uppercase font-mono text-silver mb-1.5 truncate">
        {icon} 
        <span className="truncate">{label}</span>
      </div>
      <div className="text-lg font-bold font-mono text-white tracking-tight">
        {value}
      </div>
    </div>
  );
}
