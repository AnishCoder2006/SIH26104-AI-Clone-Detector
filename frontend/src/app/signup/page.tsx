'use client';

import React, { useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Mail, 
  Lock, 
  User, 
  ShieldAlert, 
  ChevronDown, 
  Eye, 
  EyeOff, 
  Loader2, 
  Mic, 
  Video, 
  FileAudio, 
  FileVideo, 
  Globe, 
  Activity, 
  Fingerprint, 
  KeyRound
} from 'lucide-react';
import { motion } from 'framer-motion';

const SOUNDWAVE_ANIM_BARS = [
  { min: 25, max: 80, dur: 1.2 },
  { min: 35, max: 95, dur: 0.9 },
  { min: 20, max: 100, dur: 1.4 },
  { min: 40, max: 70, dur: 0.8 },
  { min: 30, max: 85, dur: 1.1 },
  { min: 50, max: 100, dur: 0.95 },
  { min: 25, max: 75, dur: 1.3 },
  { min: 35, max: 90, dur: 0.85 },
  { min: 20, max: 65, dur: 1.15 },
  { min: 15, max: 50, dur: 1.0 },
];

function SignupContent() {
  const router = useRouter();
  const [formData, setFormData] = useState({ full_name: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Dialect selector state
  const [dialect, setDialect] = useState('Global English');
  const [dialectOpen, setDialectOpen] = useState(false);

  const dialects = [
    { label: 'Global English', id: 'english' },
    { label: 'Hindi', id: 'hindi' },
    { label: 'Tamil', id: 'tamil' },
    { label: 'Telugu', id: 'telugu' },
    { label: 'Kannada', id: 'kannada' },
    { label: 'Bengali', id: 'bengali' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.status === 201) {
        router.push('/signin?registered=true');
      } else {
        setError(data.detail || 'Registration failed. Please check your credentials.');
      }
    } catch (err) {
      setError('Connection to security server failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#070B14] text-white relative overflow-x-hidden flex flex-col justify-between selection:bg-primary selection:text-[#0B0F19]">
      {/* Background Decorative Cyber Matrix & Soundwave */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute inset-0 opacity-[0.07] bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px]" />
        <div className="absolute -top-32 left-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[160px]" />
        <div className="absolute top-1/3 right-10 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[150px]" />
        <div className="absolute -bottom-32 left-10 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[160px]" />

        {/* Ambient Soundwave Horizon */}
        <div className="absolute top-1/2 left-0 right-0 h-44 -translate-y-1/2 opacity-20 flex items-center justify-between pointer-events-none px-4">
          {[...Array(60)].map((_, i) => (
            <div
              key={i}
              className="w-[1.5px] bg-gradient-to-t from-transparent via-primary to-transparent rounded-full"
              style={{
                height: `${20 + Math.sin(i * 0.3) * 50 + (i % 5) * 8}%`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Main Showcase & Register Workspace */}
      <main className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-12 py-10 flex-1 flex flex-col lg:flex-row items-center justify-center gap-10 lg:gap-16 my-auto">
        
        {/* Left Side: Cyber Feature Architecture Cards */}
        <div className="w-full lg:w-7/12 flex flex-col gap-5">
          {/* Card 1: Dual-Neural Detection Engines */}
          <div className="rounded-2xl p-5 sm:p-6 bg-[#0E1526]/80 border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.5)] backdrop-blur-md relative overflow-hidden group hover:border-primary/40 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-karla font-bold text-base text-white tracking-wide flex items-center gap-2">
                <span>Dual-Neural Detection Engines</span>
              </h3>
              <span className="text-[10px] font-mono text-primary bg-primary/10 border border-primary/25 px-2.5 py-0.5 rounded-full uppercase font-semibold">
                Active Architecture
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Sub-Engine 1: Indic Regional Dialect */}
              <div className="rounded-xl p-4 bg-[#070B14]/90 border border-white/10 flex flex-col justify-between hover:border-primary/50 transition-all">
                {/* Visual Graphic: High-Tech India Contour & Sonar Neural Waveform */}
                <div className="h-28 rounded-xl bg-gradient-to-b from-[#161D2F]/80 via-[#0B0F19] to-[#070B14] border border-white/10 p-3 flex items-center justify-between gap-3 relative overflow-hidden mb-3 group/engine">
                  {/* Subtle Background Radial Glow */}
                  <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-24 h-24 bg-primary/10 rounded-full blur-xl pointer-events-none" />

                  {/* High-Precision Cyber India Map Contour with Animated Sonar Nodes */}
                  <div className="relative w-20 h-24 shrink-0 flex items-center justify-center">
                    <svg className="w-full h-full drop-shadow-[0_0_12px_rgba(0,245,160,0.5)] overflow-visible" viewBox="0 0 100 120" fill="none">
                      <defs>
                        <linearGradient id="indiaGradSignup" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#00F5A0" stopOpacity="0.22" />
                          <stop offset="100%" stopColor="#00D2FF" stopOpacity="0.06" />
                        </linearGradient>
                      </defs>

                      {/* Sonar Beacon Rings radiating from Central India */}
                      <circle cx="50" cy="58" r="30" stroke="#00F5A0" strokeWidth="0.75" className="animate-ping opacity-25" />
                      <circle cx="50" cy="58" r="16" stroke="#00D2FF" strokeWidth="0.75" strokeDasharray="3 2" className="animate-pulse opacity-40" />

                      {/* Detailed Authentic India Geopolitical Contour Path */}
                      <path
                        d="M48,6 C54,8 57,14 53,19 C56,22 64,21 66,25 C69,29 78,28 84,32 C88,35 85,41 78,43 C74,44 68,43 64,48 C62,54 61,62 58,72 C55,83 51,96 48,110 C45,96 40,83 37,72 C33,62 29,59 23,55 C17,50 18,42 26,40 C32,38 33,32 35,26 C37,20 42,9 48,6 Z"
                        fill="url(#indiaGradSignup)"
                        stroke="#00F5A0"
                        strokeWidth="1.75"
                        strokeLinejoin="round"
                        strokeLinecap="round"
                      />

                      {/* Linguistic Cyber Mesh & Telemetry Nodes */}
                      <path d="M46,28 L66,45 L48,82 L34,55 Z" stroke="rgba(0,245,160,0.35)" strokeWidth="0.75" strokeDasharray="2 2" />

                      {/* Delhi Node */}
                      <circle cx="46" cy="28" r="2.5" fill="#00D2FF" />
                      <circle cx="46" cy="28" r="5" stroke="#00D2FF" strokeWidth="0.8" className="animate-ping opacity-60" />

                      {/* Mumbai Node */}
                      <circle cx="34" cy="55" r="2" fill="#00F5A0" />

                      {/* Bengaluru Node */}
                      <circle cx="48" cy="82" r="2.5" fill="#00F5A0" />

                      {/* Kolkata Node */}
                      <circle cx="66" cy="45" r="2" fill="#00D2FF" />
                    </svg>
                  </div>

                  {/* Dynamic Dancing Soundwave Visualizer (Fluid Framer-Motion) */}
                  <div className="flex-1 flex items-end justify-between gap-1.5 h-16 px-1">
                    {SOUNDWAVE_ANIM_BARS.map((bar, i) => (
                      <motion.div
                        key={i}
                        className="flex-1 rounded-full bg-gradient-to-t from-[#00F5A0] via-[#00F5A0] to-[#00D2FF] shadow-[0_0_8px_rgba(0,245,160,0.4)]"
                        animate={{
                          height: [`${bar.min}%`, `${bar.max}%`, `${bar.min * 1.2}%`, `${bar.max * 0.8}%`, `${bar.min}%`],
                        }}
                        transition={{
                          duration: bar.dur,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: i * 0.08,
                        }}
                        style={{ minHeight: '6px' }}
                      />
                    ))}
                  </div>
                </div>

                <p className="text-xs font-karla font-semibold text-slate-200 tracking-wide text-center">
                  India Regional Dialect Engine
                </p>
                <p className="text-[10px] font-mono text-silver/70 text-center mt-0.5">
                  AI4Bharat Wav2Vec2 · 16.0 kHz
                </p>
              </div>

              {/* Sub-Engine 2: Global Temporal Engine */}
              <div className="rounded-xl p-4 bg-[#070B14]/90 border border-white/10 flex flex-col justify-between hover:border-accent/50 transition-all">
                {/* Visual Graphic: Wireframe Globe & Spectrogram */}
                <div className="h-28 rounded-xl bg-gradient-to-b from-[#161D2F]/80 via-[#0B0F19] to-[#070B14] border border-white/10 p-3 flex items-center justify-between gap-3 relative overflow-hidden mb-3">
                  {/* Wireframe Globe SVG */}
                  <div className="relative w-20 h-24 shrink-0 flex items-center justify-center">
                    <svg className="w-18 h-18 text-accent/80 drop-shadow-[0_0_12px_rgba(0,210,255,0.5)]" viewBox="0 0 100 100" fill="none">
                      <circle cx="50" cy="50" r="42" stroke="#00D2FF" strokeWidth="1.5" strokeDasharray="4 2" />
                      <ellipse cx="50" cy="50" rx="42" ry="16" stroke="#00F5A0" strokeWidth="1" strokeDasharray="3 2" />
                      <ellipse cx="50" cy="50" rx="16" ry="42" stroke="#00D2FF" strokeWidth="1" strokeDasharray="3 2" />
                      <circle cx="50" cy="50" r="4" fill="#00F5A0" className="animate-pulse" />
                    </svg>
                  </div>

                  {/* Simulated Mel-Spectrogram Heatmap with Animation */}
                  <div className="flex-1 h-16 rounded bg-[#070B14] border border-white/10 p-1.5 flex flex-col justify-between overflow-hidden">
                    <motion.div 
                      className="h-2 rounded-full bg-gradient-to-r from-accent via-primary to-transparent" 
                      animate={{ opacity: [0.6, 1, 0.7], x: [-3, 3, -3] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <motion.div 
                      className="h-2 rounded-full bg-gradient-to-r from-transparent via-accent to-primary" 
                      animate={{ opacity: [0.8, 0.4, 0.9], x: [3, -3, 3] }}
                      transition={{ duration: 1.6, repeat: Infinity }}
                    />
                    <motion.div 
                      className="h-2 rounded-full bg-gradient-to-r from-primary via-transparent to-accent" 
                      animate={{ opacity: [0.5, 0.95, 0.5] }}
                      transition={{ duration: 1.8, repeat: Infinity }}
                    />
                    <motion.div 
                      className="h-2 rounded-full bg-gradient-to-r from-accent via-primary to-accent" 
                      animate={{ opacity: [0.9, 0.6, 1] }}
                      transition={{ duration: 1.4, repeat: Infinity }}
                    />
                  </div>
                </div>

                <p className="text-xs font-karla font-semibold text-slate-200 tracking-wide text-center">
                  Global Temporal Engine
                </p>
                <p className="text-[10px] font-mono text-silver/70 text-center mt-0.5">
                  ASVspoof Deep ConvNet · FP32
                </p>
              </div>
            </div>
          </div>

          {/* Row: Card 2 (Deep Agent) & Card 3 (Audio Ingestion) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="rounded-2xl p-5 bg-[#0E1526]/80 border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.5)] backdrop-blur-md flex flex-col justify-between hover:border-primary/40 transition-all">
              <h3 className="font-karla font-bold text-sm text-white tracking-wide mb-3">
                On-Demand AI Forensic Deep Agent
              </h3>

              <div className="rounded-xl bg-[#070B14] border border-white/10 p-3 mb-3 relative overflow-hidden">
                <div className="flex items-center gap-1.5 pb-2 mb-2 border-b border-white/10">
                  <div className="w-2 h-2 rounded-full bg-rose-500/80" />
                  <div className="w-2 h-2 rounded-full bg-amber-500/80" />
                  <div className="w-2 h-2 rounded-full bg-emerald-500/80" />
                  <span className="text-[9px] font-mono text-silver/50 ml-2">telemetry_agent.bin</span>
                </div>

                <div className="space-y-2 py-1">
                  <div className="flex items-center justify-between">
                    <div className="h-1.5 w-16 bg-white/10 rounded" />
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-rose-500/15 text-rose-300 border border-rose-500/30">
                      Vocoder Phase Jitter
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="h-1.5 w-24 bg-white/10 rounded" />
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
                      Synthetic Mel Inconsistencies
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-xs font-karla text-silver text-center">
                Forensic Deep Acoustic Diagnostics
              </p>
            </div>

            <div className="rounded-2xl p-5 bg-[#0E1526]/80 border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.5)] backdrop-blur-md flex flex-col justify-between hover:border-primary/40 transition-all">
              <h3 className="font-karla font-bold text-sm text-white tracking-wide mb-3">
                Multi-Source Audio Ingestion
              </h3>

              <div className="flex items-center justify-center gap-4 py-2 mb-2">
                <div className="flex flex-col items-center gap-1 text-slate-300">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-primary">
                    <FileAudio className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono text-silver">.wav</span>
                </div>

                <div className="flex flex-col items-center gap-1 text-slate-300">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-accent">
                    <Activity className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono text-silver">.flac</span>
                </div>

                <div className="flex flex-col items-center gap-1 text-slate-300">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-rose-400">
                    <FileVideo className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono text-silver">.mp4</span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 p-2 rounded-xl bg-[#070B14] border border-white/10 text-xs font-karla text-slate-200">
                <Video className="w-4 h-4 text-primary" />
                <span>Live In-Browser Recording</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Executive Platform Registration Card */}
        <div className="w-full lg:w-5/12 flex flex-col items-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-[440px] rounded-3xl p-7 sm:p-9 bg-gradient-to-b from-[#161D2F]/95 via-[#161D2F]/90 to-[#0B0F19] border border-[#00D2FF]/25 shadow-[0_25px_60px_rgba(0,0,0,0.85),0_0_35px_rgba(0,245,160,0.12)] backdrop-blur-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 left-1/4 right-1/4 h-[1.5px] bg-gradient-to-r from-transparent via-primary/70 to-transparent rounded-full pointer-events-none" />

            <div className="text-center mb-6">
              <h2 className="text-3xl sm:text-4xl font-cormorant font-normal text-white tracking-normal mb-1">
                Executive Registration
              </h2>
              <p className="text-xs font-karla text-silver">
                Provision a verified analyst profile to access the dashboard
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block font-karla text-xs font-semibold text-silver mb-1.5">
                  Full Legal Name
                </label>
                <input
                  type="text"
                  required
                  className="w-full bg-[#0B0F19]/85 border border-[#00D2FF]/40 rounded-xl py-2.5 px-4 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-white placeholder:text-slate-500 font-sans text-sm shadow-inner"
                  placeholder="Rajesh Sharma"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                />
              </div>

              <div>
                <label className="block font-karla text-xs font-semibold text-silver mb-1.5">
                  Corporate Email
                </label>
                <input
                  type="email"
                  required
                  className="w-full bg-[#0B0F19]/85 border border-[#00D2FF]/40 rounded-xl py-2.5 px-4 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-white placeholder:text-slate-500 font-sans text-sm shadow-inner"
                  placeholder="analyst@company.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div>
                <label className="block font-karla text-xs font-semibold text-silver mb-1.5">
                  Platform Password
                </label>
                <div className="relative group">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    className="w-full bg-[#0B0F19]/85 border border-[#00D2FF]/40 rounded-xl py-2.5 pl-4 pr-11 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-white placeholder:text-slate-500 font-sans text-sm shadow-inner tracking-wider"
                    placeholder="••••••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-silver/50 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-2.5 text-rose-300 text-xs font-karla bg-rose-500/10 p-3 rounded-xl border border-rose-500/25">
                  <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#00F5A0] via-[#00F5A0] to-[#00D2FF] hover:from-[#00F5A0]/90 text-[#0B0F19] font-bold py-3.5 rounded-2xl transition-all shadow-[0_0_25px_rgba(0,245,160,0.4)] hover:shadow-[0_0_35px_rgba(0,245,160,0.6)] hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed mt-4 flex flex-col items-center justify-center select-none"
              >
                {loading ? (
                  <span className="inline-flex items-center gap-2 text-sm font-karla font-bold">
                    <Loader2 className="w-4 h-4 animate-spin text-[#0B0F19]" />
                    <span>Provisioning Profile...</span>
                  </span>
                ) : (
                  <>
                    <span className="text-base font-karla font-bold leading-tight">Create Account</span>
                    <span className="text-[10px] font-karla opacity-80 font-medium">Secure Registration</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-5 text-center">
              <p className="text-xs font-karla text-silver">
                Already registered?{' '}
                <Link 
                  href="/signin" 
                  className="text-primary font-semibold hover:underline transition-colors hover:text-accent"
                >
                  Login here
                </Link>
              </p>
            </div>
          </motion.div>
        </div>
      </main>


    </div>
  );
}

export default function Signup() {
  return (
    <Suspense fallback={
      <div className="min-h-screen w-full bg-[#070B14] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    }>
      <SignupContent />
    </Suspense>
  );
}
