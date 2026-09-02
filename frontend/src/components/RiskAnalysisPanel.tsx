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
        <div className="mt-2 p-6 sm:p-8 rounded-2xl bg-[#0E1526]/80 border border-[#00F5A0]/40 shadow-[0_0_35px_rgba(0,245,160,0.12)] backdrop-blur-xl animate-in slide-in-from-bottom-4 fade-in duration-500 space-y-6">
          {/* Header & Threat Badge */}
          <div className="flex items-center justify-between border-b border-[#00F5A0]/20 pb-4">
            <h3 className="font-sans font-bold text-lg sm:text-[19px] flex items-center gap-2.5 text-[#00F5A0]">
              <Sparkles className="w-5 h-5 text-[#00F5A0] drop-shadow-[0_0_8px_rgba(0,245,160,0.8)]" />
              <span>AI Forensic Threat Intelligence Report</span>
            </h3>
            <span className={`px-4 py-1.5 rounded-full text-xs font-mono font-bold tracking-wider ${
              agentReport.threat_level === 'CRITICAL' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/50 shadow-[0_0_15px_rgba(244,63,94,0.4)] animate-pulse' :
              agentReport.threat_level === 'HIGH' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/50 shadow-[0_0_15px_rgba(249,115,22,0.4)]' :
              agentReport.threat_level === 'ELEVATED' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50' :
              'bg-[#00F5A0]/20 text-[#00F5A0] border border-[#00F5A0]/50 shadow-[0_0_15px_rgba(0,245,160,0.3)]'
            }`}>
              {agentReport.threat_level} THREAT
            </span>
          </div>

          {/* XAI Diagnostic Tags */}
          <div>
            <p className="text-xs text-silver/80 uppercase tracking-widest font-mono mb-3 font-semibold">Detected Acoustic Anomaly Tags</p>
            <div className="flex gap-2.5 flex-wrap">
              {agentReport.xai_tags?.map((tag: string, idx: number) => (
                <span key={idx} className="bg-[#0B0F19]/90 text-[#00D2FF] text-xs font-mono font-medium px-4 py-1.5 rounded-full border border-[#00D2FF]/40 shadow-[0_0_10px_rgba(0,210,255,0.15)] flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00D2FF] opacity-80" />
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Forensic Insights */}
          <div className="bg-[#0B0F19]/60 p-5 sm:p-6 rounded-xl border border-white/5 font-sans leading-relaxed">
            <p className="font-bold text-white text-xs uppercase tracking-widest font-mono mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-silver" />
              Forensic Acoustic Insights
            </p>
            <ul className="space-y-3 text-[14px] sm:text-[15px] text-slate-300">
              {agentReport.forensic_insights?.map((insight: string, idx: number) => (
                <li key={idx} className="flex items-start gap-3">
                  <span className="text-[#00F5A0] mt-0.5 opacity-80 text-xs">►</span>
                  <span>{insight}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Mitigation Protocol */}
          <div className="bg-rose-950/30 border-l-4 border-l-rose-500 border-t border-t-rose-900/30 border-r border-r-rose-900/30 border-b border-b-rose-900/30 p-5 sm:p-6 rounded-r-xl text-[14px] sm:text-[15px] text-rose-200 font-sans leading-relaxed">
            <p className="font-bold text-rose-400 text-xs uppercase tracking-widest font-mono mb-3 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              Recommended Mitigation Protocol
            </p>
            <p className="opacity-95">{agentReport.mitigation_plan}</p>
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
