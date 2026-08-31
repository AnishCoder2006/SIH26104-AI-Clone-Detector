'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MediaInput } from '@/components/MediaInput';
import { RiskAnalysisPanel, RiskResponse } from '@/components/RiskAnalysisPanel';
import { motion } from 'framer-motion';

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisData, setAnalysisData] = useState<RiskResponse | null>(null);

  useEffect(() => {
    // Basic auth check
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/signin');
    } else {
      setLoading(false);
    }
  }, [router]);

  const handleAnalyze = async (payload: { file: Blob; transaction_value: number; known_contact: boolean }) => {
    setIsAnalyzing(true);
    setAnalysisData(null); // reset

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      
      // Send as file.wav
      formData.append('file', payload.file, 'audio.wav');
      formData.append('transaction_value', payload.transaction_value.toString());
      // Must be string 'true' or 'false'
      formData.append('known_contact', payload.known_contact.toString());

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/analyze-audio`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      if (res.status === 401) {
        localStorage.removeItem('token');
        router.push('/signin');
        return;
      }

      const data = await res.json();
      
      if (res.ok) {
        setAnalysisData(data);
      } else {
        alert(data.detail || 'Analysis failed');
      }
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-serif tracking-tight">Command Center</h1>
        <p className="text-slate-400 mt-1">Real-time voice cloning detection and risk analysis.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="h-[600px]"
        >
          <MediaInput onAnalyze={handleAnalyze} isAnalyzing={isAnalyzing} />
        </motion.div>

        <div className="h-[600px]">
          <RiskAnalysisPanel loading={isAnalyzing} data={analysisData} />
        </div>
      </div>
    </div>
  );
}
