import React from 'react';
import { RadialGauge } from './RadialGauge';
import { AlertTriangle, ShieldCheck, Activity, BarChart2, Radio, Zap } from 'lucide-react';
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
}

export function RiskAnalysisPanel({
  loading,
  data,
  onRunForensicAnalysis,
  isAgentLoading = false,
  agentReport = null,
}: RiskAnalysisPanelProps) {
  if (loading) {
    return (
      <div className="glass-panel p-6 rounded-2xl h-full flex flex-col animate-pulse">
        <h2 className="text-xl font-bold mb-6">Forensic Analysis</h2>
        <div className="flex-1 flex flex-col items-center justify-center space-y-6">
          <div className="w-48 h-48 rounded-full bg-white/5" />
          <div className="w-3/4 h-8 bg-white/5 rounded" />
          <div className="grid grid-cols-2 gap-4 w-full mt-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-20 bg-white/5 rounded-xl border border-white/5" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="glass-panel p-6 rounded-2xl h-full flex flex-col items-center justify-center text-slate-500 text-center">
        <Activity className="w-16 h-16 mb-4 opacity-50" />
        <h2 className="text-xl font-semibold mb-2">Awaiting Media Payload</h2>
        <p className="max-w-xs text-sm">Upload a media file or record audio to begin the forensic analysis sequence.</p>
      </div>
    );
  }

  const detectionResult = data;
  const handleRunForensicAnalysis = onRunForensicAnalysis;
  const isHighRisk = data.alert || data.risk_score > 50;

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="glass-panel p-6 rounded-2xl h-full flex flex-col"
    >
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-bold font-serif">Forensic Analysis</h2>
        <div className={`px-3 py-1 font-mono text-[11px] tracking-widest uppercase font-bold rounded-full ${isHighRisk ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'}`}>
          {data.risk_level}
        </div>
      </div>

      <div className="flex flex-col items-center mb-8">
        <RadialGauge score={data.risk_score} size={200} />
      </div>

      {/* 1. On-Demand Analysis Trigger Button */}
      {detectionResult && handleRunForensicAnalysis && (
        <div className="mb-6 flex flex-col items-center">
          <button
            onClick={handleRunForensicAnalysis}
            disabled={isAgentLoading}
            className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg hover:shadow-cyan-500/20 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAgentLoading ? (
              <>
                <span className="animate-spin">🔄</span> Running AI Telemetry Agent...
              </>
            ) : (
              <>
                🛡️ Run AI Forensic Deep Analysis
              </>
            )}
          </button>
        </div>
      )}

      {/* 2. Forensic Analysis Results Display Panel (Only renders after click) */}
      {agentReport && (
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 text-white space-y-4 mb-6 shadow-2xl backdrop-blur-md">
          {/* Header & Threat Badge */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-semibold text-lg flex items-center gap-2 text-cyan-400">
              🛡️ AI Threat Intelligence Report
            </h3>
            <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wider ${
              agentReport.threat_level === 'CRITICAL' ? 'bg-red-500/20 text-red-400 border border-red-500/50 animate-pulse' :
              agentReport.threat_level === 'HIGH' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/50' :
              agentReport.threat_level === 'ELEVATED' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50' :
              'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'
            }`}>
              {agentReport.threat_level} THREAT
            </span>
          </div>

          {/* XAI Diagnostic Tags */}
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wider font-mono mb-2">Detected Anomaly Tags</p>
            <div className="flex gap-2 flex-wrap">
              {agentReport.xai_tags?.map((tag: string, idx: number) => (
                <span key={idx} className="bg-cyan-950/80 text-cyan-300 text-xs font-mono px-3 py-1 rounded-md border border-cyan-800/80">
                  🔍 {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Forensic Insights */}
          <div className="space-y-2 text-sm text-slate-300 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
            <p className="font-semibold text-slate-400 text-xs uppercase tracking-wider font-mono">Acoustic Insights</p>
            <ul className="list-disc list-inside space-y-1 text-slate-300">
              {agentReport.forensic_insights?.map((insight: string, idx: number) => (
                <li key={idx}>{insight}</li>
              ))}
            </ul>
          </div>

          {/* Mitigation Protocol */}
          <div className="bg-red-950/20 border border-red-900/40 p-3.5 rounded-xl text-sm text-red-200">
            <p className="font-bold text-red-400 text-xs uppercase tracking-wider font-mono mb-1">Recommended Mitigation Protocol</p>
            <p>{agentReport.mitigation_plan}</p>
          </div>
        </div>
      )}

      <div 
        className={`p-5 rounded-xl mb-8 flex items-start gap-4 border backdrop-blur-md transition-all duration-500 ${
          isHighRisk 
            ? 'bg-gradient-to-r from-red-500/20 to-transparent border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.15)] text-red-100' 
            : 'bg-gradient-to-r from-emerald-500/20 to-transparent border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.15)] text-emerald-100'
        }`}
      >
        {isHighRisk ? <AlertTriangle className="w-6 h-6 shrink-0 mt-0.5 text-red-400 animate-pulse" /> : <ShieldCheck className="w-6 h-6 shrink-0 mt-0.5 text-emerald-400" />}
        <div>
          <h4 className={`font-bold text-sm tracking-widest uppercase mb-1.5 ${isHighRisk ? 'text-red-400' : 'text-emerald-400'}`}>
            {isHighRisk ? 'Critical Security Alert' : 'Verification Passed'}
          </h4>
          <p className="text-sm opacity-90 leading-relaxed font-mono">{data.recommendation}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <MetricCard
          label="Synthetic Voice Prob."
          value={`${data.metrics.synthetic_voice_probability.toFixed(1)}%`}
          icon={<Activity className="w-4 h-4" />}
          alert={data.metrics.synthetic_voice_probability > 50}
        />
        <MetricCard
          label="Signal-to-Noise Ratio"
          value={`${data.metrics.snr_db.toFixed(1)} dB`}
          icon={<Radio className="w-4 h-4" />}
          alert={data.metrics.snr_db < 15}
        />
        <MetricCard
          label="Audio Clipping"
          value={`${data.metrics.clipping_percent.toFixed(2)}%`}
          icon={<Zap className="w-4 h-4" />}
          alert={data.metrics.clipping_percent > 1.0}
        />
        <MetricCard
          label="RMS Energy"
          value={data.metrics.rms_energy.toFixed(3)}
          icon={<BarChart2 className="w-4 h-4" />}
        />
        <MetricCard
          label="Spectral Centroid"
          value={`${Math.round(data.metrics.spectral_centroid_hz)} Hz`}
          icon={<Activity className="w-4 h-4" />}
        />
        <MetricCard
          label="Zero Crossing Rate"
          value={data.metrics.zero_crossing_rate.toFixed(3)}
          icon={<Activity className="w-4 h-4" />}
        />
      </div>
    </motion.div>
  );
}

function MetricCard({ label, value, icon, alert }: { label: string, value: string | number, icon: React.ReactNode, alert?: boolean }) {
  return (
    <div className={`p-4 rounded-xl border bg-white/5 ${alert ? 'border-red-500/50 text-red-400' : 'border-white/10 text-slate-100'}`}>
      <div className="flex items-center gap-2 text-[11px] tracking-[0.15em] uppercase font-mono text-slate-400 mb-2">
        {icon} {label}
      </div>
      <div className="text-xl font-bold font-mono">
        {value}
      </div>
    </div>
  );
}
