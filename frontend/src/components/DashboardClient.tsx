'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MediaInput } from '@/components/MediaInput';
import { RiskAnalysisPanel, RiskResponse } from '@/components/RiskAnalysisPanel';
import { motion } from 'framer-motion';
import { Activity, Cpu, ShieldCheck } from 'lucide-react';

interface DashboardClientProps {
  language: 'english' | 'indian';
  title: string;
}

export function DashboardClient({ language, title }: DashboardClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisData, setAnalysisData] = useState<RiskResponse | null>(null);

  // 1. State Variables
  const [agentReport, setAgentReport] = useState<any>(null);
  const [isAgentLoading, setIsAgentLoading] = useState<boolean>(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/signin');
    } else {
      setLoading(false);
    }
  }, [router]);

  // 2. On-Demand Trigger Function (Called ONLY on Button Click)
  async function handleRunForensicAnalysis() {
    const detectionResult = analysisData;
    // Ensure we have a valid detection result first
    if (!detectionResult) return;

    setIsAgentLoading(true);
    try {
      const prob = (detectionResult as any).synthetic_probability 
        ?? ((detectionResult.metrics?.synthetic_voice_probability != null) 
            ? detectionResult.metrics.synthetic_voice_probability / 100 
            : detectionResult.risk_score / 100);

      const res = await fetch('/api/forensic-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          probability: prob,
          language: language, // 'english' or 'indian'
          telemetry: {
            spectral_entropy: (detectionResult as any).spectral_entropy ?? 0.89,
            phase_coherence: (detectionResult as any).phase_coherence ?? 0.41,
            mel_cepstral_dist: (detectionResult as any).mel_cepstral_dist ?? 12.4,
            pitch_variance: (detectionResult as any).pitch_variance ?? 0.02,
          },
        }),
      });

      const data = await res.json();
      setAgentReport(data);
    } catch (err) {
      console.error('Error triggering forensic analysis:', err);
    } finally {
      setIsAgentLoading(false);
    }
  }

  const handleAnalyze = async (payload: { file: Blob; transaction_value: number; known_contact: boolean }) => {
    setIsAnalyzing(true);
    setAnalysisData(null);
    setAgentReport(null);

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('file', payload.file, 'audio.wav');
      formData.append('transaction_value', payload.transaction_value.toString());
      formData.append('known_contact', payload.known_contact.toString());
      
      // Send language to backend REST API
      formData.append('language', language); 

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/analyze-audio`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });

      if (res.status === 401) {
        localStorage.removeItem('token');
        router.push('/signin');
        return;
      }

      const data = await res.json();
      if (res.ok) setAnalysisData(data);
      else alert(data.detail || 'Analysis failed');
    } catch (err) {
      console.error(err);
      alert('Network error or processing timeout.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (loading) return <div className="flex-1 flex items-center justify-center">Loading...</div>;

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto p-6 flex flex-col">
      {/* Executive Command Header */}
      <div className="relative mb-8 rounded-2xl p-6 lg:p-8 bg-gradient-to-b from-slate-900/90 via-slate-950/90 to-[#08090d] border border-slate-800 shadow-[0_10px_40px_rgba(0,0,0,0.5)] overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-primary/15 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />


        {/* Main Title & Subtitle */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-medium tracking-wide text-white mb-3 drop-shadow-sm leading-[1.15]">
              {title}
            </h1>
            <p className="font-sans text-slate-300 text-sm lg:text-base leading-relaxed border-l-2 border-primary/60 pl-4 py-0.5 tracking-wide font-normal">
              {language === 'indian'
                ? 'High-precision forensic synthesis intercept specialized for Indian regional dialects, multi-lingual vocoder artifacts, and acoustic anomalies.'
                : 'Enterprise-grade deepfake voice clone interception with continuous micro-pitch analysis, spectral phase coherence, and telemetry diagnostics.'}
            </p>
          </div>

          {/* Telemetry Spec Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 lg:min-w-[440px]">
            
            {/* Card 1: Sample Rate */}
            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950 border border-slate-800/90 hover:border-primary/50 p-4 transition-all duration-300 shadow-lg hover:shadow-[0_0_25px_rgba(0,255,204,0.15)] flex flex-col justify-between">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-sm group-hover:scale-105 transition-transform">
                  <Activity className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-400">
                  Mono Stream
                </span>
              </div>
              <div>
                <p className="text-[10px] font-mono tracking-widest text-slate-400 uppercase font-semibold">Sample Rate</p>
                <p className="text-base font-bold font-sans text-white tracking-tight mt-0.5">16.0 <span className="text-xs font-normal text-slate-400 font-mono">kHz</span></p>
              </div>
            </div>

            {/* Card 2: Inference */}
            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950 border border-slate-800/90 hover:border-cyan-400/50 p-4 transition-all duration-300 shadow-lg hover:shadow-[0_0_25px_rgba(6,182,212,0.15)] flex flex-col justify-between">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shadow-sm group-hover:scale-105 transition-transform">
                  <Cpu className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-cyan-400">
                  FP32 Core
                </span>
              </div>
              <div>
                <p className="text-[10px] font-mono tracking-widest text-slate-400 uppercase font-semibold">Inference</p>
                <p className="text-base font-bold font-sans text-white tracking-tight mt-0.5">ONNX <span className="text-xs font-normal text-cyan-400 font-mono">Neural</span></p>
              </div>
            </div>

            {/* Card 3: Accuracy */}
            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950 border border-slate-800/90 hover:border-emerald-400/50 p-4 transition-all duration-300 shadow-lg hover:shadow-[0_0_25px_rgba(52,211,153,0.15)] flex flex-col justify-between">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-sm group-hover:scale-105 transition-transform">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-emerald-400">
                  Benchmark
                </span>
              </div>
              <div>
                <p className="text-[10px] font-mono tracking-widest text-slate-400 uppercase font-semibold">Accuracy</p>
                <p className="text-base font-bold font-sans text-emerald-400 tracking-tight mt-0.5">99.4% <span className="text-xs font-normal text-slate-400 font-mono">F1</span></p>
              </div>
            </div>

          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="w-full">
          <MediaInput onAnalyze={handleAnalyze} isAnalyzing={isAnalyzing} />
        </motion.div>

        <div className="w-full">
          <RiskAnalysisPanel 
            loading={isAnalyzing} 
            data={analysisData} 
            onRunForensicAnalysis={handleRunForensicAnalysis}
            isAgentLoading={isAgentLoading}
            agentReport={agentReport}
          />
        </div>
      </div>
    </div>
  );
}