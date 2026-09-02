'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MediaInput } from '@/components/MediaInput';
import { RiskAnalysisPanel, RiskResponse } from '@/components/RiskAnalysisPanel';
import { LiveStreamPanel } from '@/components/LiveStreamPanel';
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
  const [mode, setMode] = useState<'forensic' | 'live'>('forensic');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/signin');
    } else {
      setLoading(false);
    }
  }, [router]);

  const handleAnalyze = async (payload: { file: Blob; transaction_value: number; known_contact: boolean }) => {
    setIsAnalyzing(true);
    setAnalysisData(null);

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

      <div className="flex gap-4 mb-8 z-10 relative">
        <button 
          onClick={() => setMode('forensic')}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${mode === 'forensic' ? 'bg-primary text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
        >
          Forensic Scan (File Upload)
        </button>
        <button 
          onClick={() => setMode('live')}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${mode === 'live' ? 'bg-primary text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
        >
          Live Stream (Microphone)
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="min-h-[600px] h-full">
          {mode === 'forensic' ? (
            <MediaInput onAnalyze={handleAnalyze} isAnalyzing={isAnalyzing} />
          ) : (
            {/* Pass the language prop to the Live Stream Panel */}
            <LiveStreamPanel language={language} />
          )}
        </motion.div>

        <div className="min-h-[600px] h-full">
          {mode === 'forensic' ? (
            <RiskAnalysisPanel loading={isAnalyzing} data={analysisData} />
          ) : (
             <div className="h-full flex items-center justify-center bg-slate-900/30 rounded-2xl border border-slate-800 border-dashed text-slate-500">
               Live analysis metrics are displayed on the left panel.
             </div>
          )}
        </div>
      </div>
    </div>
  );
}