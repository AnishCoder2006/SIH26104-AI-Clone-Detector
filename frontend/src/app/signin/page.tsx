'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Mail, 
  Lock, 
  ShieldAlert, 
  CheckCircle2, 
  ChevronDown, 
  Eye, 
  EyeOff, 
  Loader2, 
  Mic, 
  Video, 
  FileAudio, 
  FileVideo, 
  Globe, 
  ShieldCheck, 
  Activity, 
  Fingerprint, 
  Sparkles,
  KeyRound
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function SigninContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isRegistered = searchParams.get('registered') === 'true';

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok && data.access_token) {
        localStorage.setItem('token', data.access_token);
        // Route to selected language dialect dashboard
        if (dialect === 'Global English') {
          router.push('/dashboard/english');
        } else {
          router.push('/dashboard/hindi');
        }
      } else {
        setError(data.detail || 'Authentication denied. Invalid credentials.');
      }
    } catch (err) {
      setError('Connection to security server failed. Please check your network.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#070B14] text-white relative overflow-x-hidden flex flex-col justify-between selection:bg-primary selection:text-[#0B0F19]">
      {/* Background Decorative Cyber Matrix & Soundwave */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {/* World Map Silhouette Background */}
        <div className="absolute inset-0 opacity-[0.07] bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px]" />
        
        {/* Ambient Radial Glows */}
        <div className="absolute -top-32 left-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[160px]" />
        <div className="absolute top-1/3 right-10 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[150px]" />
        <div className="absolute -bottom-32 left-10 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[160px]" />

        {/* Ambient Soundwave Horizon Lines */}
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

      {/* Main Showcase & Login Workspace */}
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
                {/* Visual Graphic: India Map Contour & Soundwave */}
                <div className="h-28 rounded-lg bg-gradient-to-b from-[#161D2F]/60 to-[#070B14] border border-white/5 p-3 flex items-center justify-center gap-3 relative overflow-hidden mb-3">
                  {/* Stylized India Contour Silhouette SVG */}
                  <svg className="w-16 h-20 text-primary/80 drop-shadow-[0_0_10px_rgba(0,245,160,0.4)] shrink-0" viewBox="0 0 100 120" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M45,10 Q55,8 60,18 Q68,25 65,35 Q75,45 80,55 Q75,65 65,75 Q55,95 50,115 Q45,95 35,75 Q25,65 20,55 Q25,45 35,35 Q32,25 40,18 Z" fill="rgba(0,245,160,0.08)" strokeDasharray="3 2" />
                    <circle cx="50" cy="50" r="8" fill="rgba(0,245,160,0.2)" stroke="currentColor" strokeWidth="1.5" />
                    <circle cx="50" cy="50" r="3" fill="#00F5A0" />
                  </svg>

                  {/* Micro Soundwave Equalizer */}
                  <div className="flex items-end gap-1 h-14">
                    {[35, 60, 90, 45, 80, 100, 70, 50, 85, 40].map((h, i) => (
                      <div
                        key={i}
                        className="w-1 bg-gradient-to-t from-primary to-accent rounded-full animate-pulse"
                        style={{ height: `${h}%`, animationDuration: `${0.4 + (i % 4) * 0.15}s` }}
                      />
                    ))}
                  </div>
                </div>

                <p className="text-xs font-karla font-semibold text-slate-200 tracking-wide text-center">
                  Indic Regional Dialect Engine
                </p>
                <p className="text-[10px] font-mono text-silver/70 text-center mt-0.5">
                  AI4Bharat Wav2Vec2 · 16.0 kHz
                </p>
              </div>

              {/* Sub-Engine 2: Global Temporal Engine */}
              <div className="rounded-xl p-4 bg-[#070B14]/90 border border-white/10 flex flex-col justify-between hover:border-accent/50 transition-all">
                {/* Visual Graphic: Wireframe Globe & Spectrogram */}
                <div className="h-28 rounded-lg bg-gradient-to-b from-[#161D2F]/60 to-[#070B14] border border-white/5 p-3 flex items-center justify-center gap-3 relative overflow-hidden mb-3">
                  {/* Wireframe Globe SVG */}
                  <svg className="w-16 h-16 text-accent/80 drop-shadow-[0_0_10px_rgba(0,210,255,0.4)] shrink-0" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="50" cy="50" r="42" strokeDasharray="4 2" />
                    <ellipse cx="50" cy="50" rx="42" ry="18" />
                    <ellipse cx="50" cy="50" rx="18" ry="42" />
                    <line x1="50" y1="8" x2="50" y2="92" />
                    <line x1="8" y1="50" x2="92" y2="50" />
                  </svg>

                  {/* Simulated Mel-Spectrogram Heatmap */}
                  <div className="flex-1 h-16 rounded bg-gradient-to-r from-blue-900/60 via-purple-800/40 to-emerald-800/60 border border-white/10 p-1 flex flex-col justify-between">
                    <div className="h-2 rounded-sm bg-gradient-to-r from-accent via-primary to-transparent opacity-80" />
                    <div className="h-2 rounded-sm bg-gradient-to-r from-transparent via-accent to-primary opacity-60" />
                    <div className="h-2 rounded-sm bg-gradient-to-r from-primary/80 via-transparent to-accent opacity-75" />
                    <div className="h-2 rounded-sm bg-gradient-to-r from-accent/90 to-primary/60 opacity-90" />
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
            {/* Card 2: On-Demand AI Forensic Deep Agent */}
            <div className="rounded-2xl p-5 bg-[#0E1526]/80 border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.5)] backdrop-blur-md flex flex-col justify-between hover:border-primary/40 transition-all">
              <h3 className="font-karla font-bold text-sm text-white tracking-wide mb-3">
                On-Demand AI Forensic Deep Agent
              </h3>

              {/* Mock Terminal/Console with Diagnostics */}
              <div className="rounded-xl bg-[#070B14] border border-white/10 p-3 mb-3 relative overflow-hidden">
                {/* Terminal Window Header */}
                <div className="flex items-center gap-1.5 pb-2 mb-2 border-b border-white/10">
                  <div className="w-2 h-2 rounded-full bg-rose-500/80" />
                  <div className="w-2 h-2 rounded-full bg-amber-500/80" />
                  <div className="w-2 h-2 rounded-full bg-emerald-500/80" />
                  <span className="text-[9px] font-mono text-silver/50 ml-2">telemetry_agent.bin</span>
                </div>

                {/* Floating Anomaly Badges */}
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

            {/* Card 3: Multi-Source Audio Ingestion */}
            <div className="rounded-2xl p-5 bg-[#0E1526]/80 border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.5)] backdrop-blur-md flex flex-col justify-between hover:border-primary/40 transition-all">
              <h3 className="font-karla font-bold text-sm text-white tracking-wide mb-3">
                Multi-Source Audio Ingestion
              </h3>

              {/* Formats Row */}
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

              {/* In-Browser Mic Ingest */}
              <div className="flex items-center justify-center gap-2 p-2 rounded-xl bg-[#070B14] border border-white/10 text-xs font-karla text-slate-200">
                <Video className="w-4 h-4 text-primary" />
                <span>Live In-Browser Recording</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: The Star — Executive Platform Login Card */}
        <div className="w-full lg:w-5/12 flex flex-col items-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-[440px] rounded-3xl p-7 sm:p-9 bg-gradient-to-b from-[#161D2F]/95 via-[#161D2F]/90 to-[#0B0F19] border border-[#00D2FF]/25 shadow-[0_25px_60px_rgba(0,0,0,0.85),0_0_35px_rgba(0,245,160,0.12)] backdrop-blur-2xl relative overflow-hidden"
          >
            {/* Subtle Top Glowing Cyber Accent */}
            <div className="absolute top-0 left-1/4 right-1/4 h-[1.5px] bg-gradient-to-r from-transparent via-primary/70 to-transparent rounded-full pointer-events-none" />

            {/* Card Header */}
            <div className="text-center mb-6">
              <h2 className="text-3xl sm:text-4xl font-cormorant font-normal text-white tracking-normal mb-1">
                Executive Platform Login
              </h2>
              <p className="text-xs font-karla text-silver">
                Sign in to your analyst profile to continue
              </p>
            </div>

            {isRegistered && (
              <div className="mb-5 flex items-start gap-2.5 text-emerald-300 text-xs font-karla bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/25">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Profile created successfully. Please log in below.</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block font-karla text-xs font-semibold text-silver mb-1.5">
                  Corporate Email
                </label>
                <div className="relative group">
                  <input
                    type="email"
                    required
                    className="w-full bg-[#0B0F19]/85 border border-[#00D2FF]/40 rounded-xl py-3 px-4 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-white placeholder:text-silver/40 font-karla text-sm shadow-inner"
                    placeholder="analyst@enterprise.domain"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block font-karla text-xs font-semibold text-silver mb-1.5">
                  Platform Password
                </label>
                <div className="relative group">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    className="w-full bg-[#0B0F19]/85 border border-[#00D2FF]/40 rounded-xl py-3 pl-4 pr-11 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-white placeholder:text-silver/40 font-karla text-sm shadow-inner"
                    placeholder="Enter security password"
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

              {/* Stay Logged In & Forgot Password Row */}
              <div className="flex items-center justify-between pt-1 pb-1 text-xs font-karla text-silver">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`w-8 h-4 rounded-full transition-colors relative ${rememberMe ? 'bg-primary' : 'bg-white/20'}`}>
                    <div className={`w-3 h-3 rounded-full bg-[#0B0F19] absolute top-0.5 transition-transform ${rememberMe ? 'left-4.5 translate-x-3.5' : 'left-0.5'}`} />
                  </div>
                  <span>Stay Logged In</span>
                </label>

                <button
                  type="button"
                  onClick={() => alert('Password recovery protocol: Please contact your IT Security Administrator.')}
                  className="hover:text-white transition-colors"
                >
                  Forgot Password?
                </button>
              </div>

              {error && (
                <div className="flex items-start gap-2.5 text-rose-300 text-xs font-karla bg-rose-500/10 p-3 rounded-xl border border-rose-500/25">
                  <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Primary Glowing Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#00F5A0] via-[#00F5A0] to-[#00D2FF] hover:from-[#00F5A0]/90 text-[#0B0F19] font-bold py-3.5 rounded-2xl transition-all shadow-[0_0_25px_rgba(0,245,160,0.4)] hover:shadow-[0_0_35px_rgba(0,245,160,0.6)] hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed mt-4 flex flex-col items-center justify-center select-none"
              >
                {loading ? (
                  <span className="inline-flex items-center gap-2 text-sm font-karla font-bold">
                    <Loader2 className="w-4 h-4 animate-spin text-[#0B0F19]" />
                    <span>Verifying Security Clearance...</span>
                  </span>
                ) : (
                  <>
                    <span className="text-base font-karla font-bold leading-tight">Login</span>
                    <span className="text-[10px] font-karla opacity-80 font-medium">Secure Login</span>
                  </>
                )}
              </button>

              {/* Secondary Alternate Login Actions */}
              <div className="grid grid-cols-2 gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => alert('Voice Biometric Authentication: Please speak into your microphone to verify vocal acoustics.')}
                  className="py-2.5 px-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-primary/40 text-xs font-karla text-slate-200 hover:text-white transition-all text-center flex items-center justify-center gap-1.5"
                >
                  <Fingerprint className="w-3.5 h-3.5 text-primary" />
                  <span>Access with Voice ID</span>
                </button>

                <button
                  type="button"
                  onClick={() => alert('Enterprise SSO Portal: Redirecting to SAML / OAuth Gateway...')}
                  className="py-2.5 px-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-primary/40 text-xs font-karla text-slate-200 hover:text-white transition-all text-center flex items-center justify-center gap-1.5"
                >
                  <KeyRound className="w-3.5 h-3.5 text-accent" />
                  <span>SSO Login</span>
                </button>
              </div>
            </form>

            {/* Switch to Register link */}
            <div className="mt-5 text-center">
              <p className="text-xs font-karla text-silver">
                Don't have an analyst profile?{' '}
                <Link 
                  href="/signup" 
                  className="text-primary font-semibold hover:underline transition-colors hover:text-accent"
                >
                  Register here
                </Link>
              </p>
            </div>
          </motion.div>
        </div>
      </main>


    </div>
  );
}

export default function Signin() {
  return (
    <Suspense fallback={
      <div className="min-h-screen w-full bg-[#070B14] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    }>
      <SigninContent />
    </Suspense>
  );
}
