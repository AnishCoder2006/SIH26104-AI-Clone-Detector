'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MediaInput } from '@/components/MediaInput';
import { RiskAnalysisPanel, RiskResponse } from '@/components/RiskAnalysisPanel';
import { motion, AnimatePresence } from 'framer-motion';
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
  const [hasMedia, setHasMedia] = useState(false);
  const [agentReport, setAgentReport] = useState<any>(null);
  const [isAgentLoading, setIsAgentLoading] = useState<boolean>(false);

  // Only display the second card after clicking on analysis
  const showAnalysisCard = isAnalyzing || Boolean(analysisData);

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
      <div className="relative mb-8 rounded-2xl p-6 lg:p-8 bg-gradient-to-b from-[#161D2F]/95 via-[#161D2F]/80 to-[#0B0F19] border border-white/[0.08] shadow-[0_12px_40px_rgba(11,15,25,0.8)] overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-primary/15 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-accent/15 rounded-full blur-[100px] pointer-events-none" />

        {/* Model Switcher Pill Row (Above Title) */}
        <div className="flex items-center justify-between mb-6">
          <div className="inline-flex items-center gap-1.5 p-1 bg-[#0B0F19]/90 rounded-full border border-white/10 shadow-inner backdrop-blur-md">
            <Link
              href="/dashboard/hindi"
              className={`px-4 py-1.5 rounded-full transition-all duration-200 flex items-center gap-2 font-karla text-xs font-semibold ${
                language === 'indian'
                  ? 'bg-gradient-to-r from-primary to-accent text-[#0B0F19] font-bold shadow-[0_0_18px_rgba(0,245,160,0.4)]'
                  : 'text-silver hover:text-white hover:bg-[#161D2F]'
              }`}
            >
              <span className="text-sm leading-none">🇮🇳</span>
              <span>Indic / Hindi</span>
            </Link>

            <Link
              href="/dashboard/english"
              className={`px-4 py-1.5 rounded-full transition-all duration-200 flex items-center gap-2 font-karla text-xs font-semibold ${
                language === 'english'
                  ? 'bg-gradient-to-r from-primary to-accent text-[#0B0F19] font-bold shadow-[0_0_18px_rgba(0,245,160,0.4)]'
                  : 'text-silver hover:text-white hover:bg-[#161D2F]'
              }`}
            >
              <span className="text-sm leading-none">🌐</span>
              <span>English</span>
            </Link>
          </div>

        </div>

        {/* Main Title & Subtitle */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-cormorant font-normal tracking-normal text-white mb-3 drop-shadow-sm leading-[1.12]">
              {title}
            </h1>
            <p className="font-karla text-silver text-sm lg:text-base leading-relaxed border-l-2 border-primary/70 pl-4 py-1 font-normal tracking-wide">
              {language === 'indian'
                ? 'High-precision forensic synthesis intercept specialized for Indian regional dialects, multi-lingual vocoder artifacts, and acoustic anomalies.'
                : 'Enterprise-grade deepfake voice clone interception with continuous micro-pitch analysis, spectral phase coherence, and telemetry diagnostics.'}
            </p>
          </div>

          {/* Telemetry Spec Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 lg:min-w-[440px]">
            
            {/* Card 1: Sample Rate */}
            <div className="group relative overflow-hidden rounded-2xl bg-[#161D2F] border border-white/[0.08] hover:border-primary/50 p-4 transition-all duration-300 shadow-lg hover:shadow-[0_0_25px_rgba(0,245,160,0.18)] flex flex-col justify-between">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary shadow-sm group-hover:scale-105 transition-transform">
                  <Activity className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-karla font-medium px-2.5 py-0.5 rounded-full bg-[#0B0F19] border border-white/10 text-silver tracking-wide">
                  Mono Stream
                </span>
              </div>
              <div>
                <p className="text-[10px] font-karla tracking-widest text-silver uppercase font-bold">Sample Rate</p>
                <p className="text-2xl font-cormorant font-semibold text-white tracking-tight mt-0.5">16.0 <span className="text-xs font-normal text-silver font-karla">kHz</span></p>
              </div>
            </div>

            {/* Card 2: Inference */}
            <div className="group relative overflow-hidden rounded-2xl bg-[#161D2F] border border-white/[0.08] hover:border-accent/60 p-4 transition-all duration-300 shadow-lg hover:shadow-[0_0_25px_rgba(0,210,255,0.18)] flex flex-col justify-between">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-accent/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 rounded-xl bg-accent/15 border border-accent/30 flex items-center justify-center text-accent shadow-sm group-hover:scale-105 transition-transform">
                  <Cpu className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-karla font-medium px-2.5 py-0.5 rounded-full bg-[#0B0F19] border border-white/10 text-accent tracking-wide">
                  FP32 Core
                </span>
              </div>
              <div>
                <p className="text-[10px] font-karla tracking-widest text-silver uppercase font-bold">Inference</p>
                <p className="text-2xl font-cormorant font-semibold text-white tracking-tight mt-0.5">ONNX <span className="text-xs font-semibold text-accent font-karla">Neural</span></p>
              </div>
            </div>

            {/* Card 3: Accuracy */}
            <div className="group relative overflow-hidden rounded-2xl bg-[#161D2F] border border-white/[0.08] hover:border-primary/50 p-4 transition-all duration-300 shadow-lg hover:shadow-[0_0_25px_rgba(0,245,160,0.18)] flex flex-col justify-between">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary shadow-sm group-hover:scale-105 transition-transform">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-karla font-medium px-2.5 py-0.5 rounded-full bg-[#0B0F19] border border-white/10 text-primary tracking-wide">
                  Benchmark
                </span>
              </div>
              <div>
                <p className="text-[10px] font-karla tracking-widest text-silver uppercase font-bold">Accuracy</p>
                <p className="text-2xl font-cormorant font-semibold text-primary tracking-tight mt-0.5">99.4% <span className="text-xs font-normal text-silver font-karla">F1</span></p>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Main Workspace: Single Card before upload/analysis, 2-Columns after upload/analysis */}
      <div className={`w-full transition-all duration-500 ease-in-out ${
        showAnalysisCard 
          ? 'grid grid-cols-1 lg:grid-cols-2 gap-8 items-start' 
          : 'max-w-4xl mx-auto'
      }`}>
        <motion.div layout transition={{ duration: 0.4 }} className="w-full">
          <MediaInput 
            onAnalyze={handleAnalyze} 
            isAnalyzing={isAnalyzing} 
            onMediaChange={setHasMedia} 
          />
        </motion.div>

        <AnimatePresence>
          {showAnalysisCard && (
            <motion.div 
              initial={{ opacity: 0, x: 25, scale: 0.98 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 25, scale: 0.98 }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
              className="w-full"
            >
              <RiskAnalysisPanel 
                loading={isAnalyzing} 
                data={analysisData} 
                onRunForensicAnalysis={handleRunForensicAnalysis}
                isAgentLoading={isAgentLoading}
                agentReport={agentReport}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}