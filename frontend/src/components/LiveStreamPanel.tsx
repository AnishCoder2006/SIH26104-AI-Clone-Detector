'use client';

import { useLiveDetection } from '@/hooks/useLiveDetection';
import { motion } from 'framer-motion';

// Notice we added the { language } prop here!
export function LiveStreamPanel({ language }: { language: 'english' | 'indian' }) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  
  // Pass the language into our custom hook
  const { isRecording, startListening, stopListening, liveRisk } = useLiveDetection(apiUrl, language);

  return (
    <div className="flex flex-col items-center justify-center h-full p-8 bg-slate-900/50 rounded-2xl border border-slate-800 relative overflow-hidden">
      
      {/* Background Pulse Effect when recording */}
      {isRecording && (
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.3, 0.1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className={`absolute inset-0 rounded-full blur-[100px] ${liveRisk?.isFake ? 'bg-red-500' : 'bg-green-500'}`}
        />
      )}

      <div className="z-10 flex flex-col items-center w-full max-w-md">
        <h2 className="text-2xl font-bold mb-8 text-white">Live Audio Feed</h2>
        
        <button
          onClick={isRecording ? stopListening : startListening}
          className={`w-32 h-32 rounded-full flex items-center justify-center shadow-lg transition-all ${
            isRecording ? 'bg-red-500/20 text-red-400 border-2 border-red-500 hover:bg-red-500/30' 
            : 'bg-primary/20 text-primary border-2 border-primary hover:bg-primary/30'
          }`}
        >
          <span className="text-lg font-bold">{isRecording ? 'STOP' : 'LISTEN'}</span>
        </button>

        {liveRisk && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12 w-full bg-slate-950 p-6 rounded-xl border border-slate-800 text-center"
          >
            <p className="text-slate-400 mb-2">Real-Time Synthetic Probability</p>
            <div className={`text-6xl font-black ${liveRisk.isFake ? 'text-red-500' : 'text-green-500'}`}>
              {(liveRisk.prob * 100).toFixed(1)}%
            </div>
            <div className="mt-4 inline-block px-4 py-1 rounded-full bg-slate-800 text-sm font-medium text-slate-300">
              Model: {liveRisk.model?.toUpperCase() || language.toUpperCase()}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}