'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Activity, Lock, Database, ChevronRight, Server, Shield, Hexagon, Globe, Cpu } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex-1 flex flex-col w-full bg-background relative overflow-hidden">
      {/* Background Decorative Matrix */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
        <div className="absolute top-[20%] left-[60%] w-[800px] h-[800px] bg-primary/20 rounded-full blur-[180px]" />
        <div className="absolute top-[60%] left-[10%] w-[600px] h-[600px] bg-secondary/10 rounded-full blur-[150px]" />
      </div>

      {/* Hero Section */}
      <section className="relative z-10 w-full max-w-7xl mx-auto px-6 pt-32 pb-24 lg:pt-48 lg:pb-32 flex flex-col lg:flex-row items-center justify-between gap-16">
        
        {/* Left: Value Proposition */}
        <div className="w-full lg:w-1/2 flex flex-col items-start">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 mb-6"
          >
            <span className="text-[11px] font-mono font-bold tracking-[0.2em] text-primary uppercase bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20">
              Zero-Trust Architecture
            </span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl lg:text-7xl font-extrabold tracking-[-0.02em] leading-[1.1] mb-8 text-slate-100 font-serif"
          >
            Authenticate the <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Human.</span><br />
            Isolate the <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-rose-400">Machine.</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-slate-400 leading-[1.8] max-w-[650px] mb-10"
          >
            VoiceShield AI utilizes military-grade forensic telemetry to detect synthetic voice manipulation, deepfakes, and adversarial audio spoofing in real-time. Secure your communications with deterministic precision.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
          >
            <Link 
              href="/signup"
              className="w-full sm:w-auto px-8 py-4 bg-primary hover:bg-primary/90 text-slate-950 font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(0,255,204,0.3)] hover:shadow-[0_0_30px_rgba(0,255,204,0.5)] group"
            >
              Deploy Security Protocol
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              href="/signin"
              className="w-full sm:w-auto px-8 py-4 bg-panel border border-slate-700 hover:border-slate-500 hover:bg-slate-800 text-slate-300 font-bold rounded-xl flex items-center justify-center transition-all"
            >
              Access Dashboard
            </Link>
          </motion.div>
        </div>

        {/* Right: Abstract Security Graphic / Dashboard Preview */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="w-full lg:w-1/2 relative perspective-1000"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-accent/20 blur-3xl rounded-full" />
          <div className="relative glass-panel rounded-2xl p-6 border border-slate-700 shadow-2xl transform rotate-y-[-10deg] rotate-x-[5deg]">
            
            {/* Mock Dashboard Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                <span className="font-mono text-sm tracking-wide">THREAT_MATRIX_UI</span>
              </div>
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              </div>
            </div>

            {/* Mock Telemetry Data */}
            <div className="space-y-4 font-mono text-sm">
              <div className="flex justify-between items-center p-3 bg-slate-900/50 rounded-lg border border-slate-800">
                <span className="text-slate-400">WS_LATENCY_OVERHEAD</span>
                <span className="text-emerald-400">142ms [ULTRA_FAST]</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-900/50 rounded-lg border border-slate-800">
                <span className="text-slate-400">ACTIVE_ENGINE_ROUTING</span>
                <span className="text-primary">INDIC_WAV2VEC2.ONNX</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-900/50 rounded-lg border border-slate-800">
                <span className="text-slate-400">SYNTHETIC_PROBABILITY</span>
                <span className="text-red-400 animate-pulse">0.8921 ANOMALY</span>
              </div>
              
              <div className="mt-6 pt-4 border-t border-slate-800">
                <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-2">Live Node Status</div>
                <div className="font-mono text-xs text-primary/80 break-all">
                  0x7F8C9A... IN_MEMORY_BYTE_DECODE... [ZERO_DISK_IO]
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Tech Stack Trust Bar (Replaced Fake Compliances) */}
      <section className="w-full border-y border-slate-800 bg-slate-900/50 py-10 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-[11px] font-mono font-bold tracking-[0.2em] text-slate-500 uppercase mb-8">
            Powered by Industry-Standard Machine Learning
          </p>
          <div className="flex flex-wrap justify-center items-center gap-12 lg:gap-24 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
            <div className="flex items-center gap-2 font-bold text-lg"><Database className="w-6 h-6"/> PyTorch</div>
            <div className="flex items-center gap-2 font-bold text-lg"><Cpu className="w-6 h-6"/> ONNX Runtime</div>
            <div className="flex items-center gap-2 font-bold text-lg"><Server className="w-6 h-6"/> FastAPI WebSocket</div>
            <div className="flex items-center gap-2 font-bold text-lg"><Hexagon className="w-6 h-6"/> Hugging Face</div>
          </div>
        </div>
      </section>

      {/* Service Buckets */}
      <section className="w-full max-w-7xl mx-auto px-6 py-24 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="glass-panel p-8 rounded-2xl border border-slate-800 hover:border-primary/50 transition-colors group">
            <Activity className="w-10 h-10 text-primary mb-6 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-bold font-serif mb-3">Sub-200ms Live Streaming</h3>
            <p className="text-slate-400 leading-[1.6]">
              Zero disk I/O. We process raw microphone bytes directly in memory utilizing WebSockets and ONNX Runtime for ultra-fast, real-time audio intercepts.
            </p>
          </div>

          <div className="glass-panel p-8 rounded-2xl border border-slate-800 hover:border-primary/50 transition-colors group">
            <Globe className="w-10 h-10 text-primary mb-6 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-bold font-serif mb-3">Dual-Language Neural Nets</h3>
            <p className="text-slate-400 leading-[1.6]">
              Concurrent execution of dedicated English and AI4Bharat Indic models. Audio streams are dynamically routed to the specialized Wav2Vec2 backbone for maximum accuracy.
            </p>
          </div>

          <div className="glass-panel p-8 rounded-2xl border border-slate-800 hover:border-primary/50 transition-colors group">
            <Cpu className="w-10 h-10 text-primary mb-6 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-bold font-serif mb-3">Hybrid Compute Architecture</h3>
            <p className="text-slate-400 leading-[1.6]">
              A dual-pipeline backend: A high-speed ONNX WebSocket layer for real-time inference, alongside a deep-forensic PyTorch REST API for high-fidelity file analysis.
            </p>
          </div>

        </div>
      </section>
    </div>
  );
}