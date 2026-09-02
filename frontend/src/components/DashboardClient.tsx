'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MediaInput } from '@/components/MediaInput';
import { RiskAnalysisPanel, RiskResponse } from '@/components/RiskAnalysisPanel';
import { motion } from 'framer-motion';

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
      <div className="mb-6 flex flex-col items-start relative">
        <div className="absolute -top-10 -left-10 w-48 h-48 bg-primary/10 rounded-full blur-[80px] pointer-events-none" />
        <h1 className="text-4xl lg:text-5xl font-extrabold font-serif tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-100 to-slate-400 mb-2">
          {title}
        </h1>
        <p className="text-slate-400 text-sm lg:text-base max-w-xl border-l-2 border-primary/50 pl-4 py-1 relative">
          Real-time {language === 'indian' ? 'Hindi/Indic' : 'English'} voice cloning detection.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="min-h-[600px] h-full">
          <MediaInput onAnalyze={handleAnalyze} isAnalyzing={isAnalyzing} />
        </motion.div>

        <div className="min-h-[600px] h-full">
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