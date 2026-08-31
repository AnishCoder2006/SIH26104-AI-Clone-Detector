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
}

interface RiskAnalysisPanelProps {
  loading: boolean;
  data: RiskResponse | null;
}

export function RiskAnalysisPanel({ loading, data }: RiskAnalysisPanelProps) {
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

      <div className={`p-4 rounded-xl mb-8 flex items-start gap-3 border ${isHighRisk ? 'bg-red-500/10 border-red-500/30 text-red-300' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'}`}>
        {isHighRisk ? <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" /> : <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5" />}
        <div>
          <h4 className="font-semibold mb-1">{isHighRisk ? 'Security Alert' : 'Verification Passed'}</h4>
          <p className="text-sm opacity-90">{data.recommendation}</p>
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
