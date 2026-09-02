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

      {/* Top Navbar Header */}
      <header className="relative z-20 w-full px-6 lg:px-12 py-5 flex flex-col md:flex-row items-center justify-between gap-4 border-b border-white/[0.06] backdrop-blur-md bg-[#070B14]/70">
        <div className="flex items-center gap-3 cursor-pointer select-none" onClick={() => router.push('/')}>
          <div className="relative w-11 h-11 rounded-2xl bg-[#0E1526] border border-primary/40 flex items-center justify-center p-2 shadow-[0_0_15px_rgba(0,245,160,0.3)] shrink-0">
            <img 
              src="/logo-mint.png" 
              alt="VoiceShield AI" 
              className="w-full h-full object-contain drop-shadow-[0_0_8px_rgba(0,245,160,0.8)]" 
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-2xl font-cormorant font-bold text-white tracking-tight leading-none">
                VoiceShield AI
              </span>
            </div>
            <p className="text-[11px] font-karla text-silver tracking-wide mt-0.5">
              Indic Voice Clone Detector and Forensic Analysis
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          <div className="hidden lg:flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#0E1526]/80 border border-white/10 text-xs font-karla text-silver shadow-inner">
            <button type="button" onClick={() => router.push('/')} className="px-3 py-1 rounded-full hover:text-white hover:bg-white/5 transition-colors">
              Learn More
            </button>
            <button type="button" onClick={() => router.push('/')} className="px-3 py-1 rounded-full hover:text-white hover:bg-white/5 transition-colors">
              Technology
            </button>
            <button type="button" onClick={() => router.push('/')} className="px-3 py-1 rounded-full hover:text-white hover:bg-white/5 transition-colors">
              Pricing
            </button>
            <button type="button" onClick={() => router.push('/')} className="px-3 py-1 rounded-full hover:text-white hover:bg-white/5 transition-colors">
              Request Demo
            </button>
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setDialectOpen(!dialectOpen)}
              className="px-3.5 py-1.5 rounded-full bg-[#0E1526] border border-white/15 hover:border-primary/50 text-xs font-karla text-white flex items-center gap-2 transition-all shadow-sm"
            >
              <span className="text-silver">Dialect:</span>
              <span className="font-semibold text-primary">{dialect}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-silver transition-transform duration-200 ${dialectOpen ? 'rotate-180' : ''}`} />
            </button>

            {dialectOpen && (
              <div className="absolute right-0 mt-2 w-44 rounded-xl bg-[#0E1526] border border-white/15 shadow-2xl p-1 z-50 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
                {dialects.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => { setDialect(item.label); setDialectOpen(false); }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-karla transition-all ${
                      dialect === item.label
                        ? 'bg-primary/20 text-primary font-bold'
                        : 'text-silver hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0E1526] border border-emerald-500/40 text-emerald-400 text-xs font-mono shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-semibold tracking-wider uppercase">Security Clearance: L3</span>
          </div>
        </div>
      </header>

      {/* Main Showcase & Register Workspace */}
      <main className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-12 py-8 lg:py-12 flex-1 flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-16">
        
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
                <div className="h-28 rounded-lg bg-gradient-to-b from-[#161D2F]/60 to-[#070B14] border border-white/5 p-3 flex items-center justify-center gap-3 relative overflow-hidden mb-3">
                  <svg className="w-16 h-20 text-primary/80 drop-shadow-[0_0_10px_rgba(0,245,160,0.4)] shrink-0" viewBox="0 0 100 120" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M45,10 Q55,8 60,18 Q68,25 65,35 Q75,45 80,55 Q75,65 65,75 Q55,95 50,115 Q45,95 35,75 Q25,65 20,55 Q25,45 35,35 Q32,25 40,18 Z" fill="rgba(0,245,160,0.08)" strokeDasharray="3 2" />
                    <circle cx="50" cy="50" r="8" fill="rgba(0,245,160,0.2)" stroke="currentColor" strokeWidth="1.5" />
                    <circle cx="50" cy="50" r="3" fill="#00F5A0" />
                  </svg>

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
                <div className="h-28 rounded-lg bg-gradient-to-b from-[#161D2F]/60 to-[#070B14] border border-white/5 p-3 flex items-center justify-center gap-3 relative overflow-hidden mb-3">
                  <svg className="w-16 h-16 text-accent/80 drop-shadow-[0_0_10px_rgba(0,210,255,0.4)] shrink-0" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="50" cy="50" r="42" strokeDasharray="4 2" />
                    <ellipse cx="50" cy="50" rx="42" ry="18" />
                    <ellipse cx="50" cy="50" rx="18" ry="42" />
                    <line x1="50" y1="8" x2="50" y2="92" />
                    <line x1="8" y1="50" x2="92" y2="50" />
                  </svg>

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
                  className="w-full bg-[#0B0F19]/85 border border-[#00D2FF]/40 rounded-xl py-2.5 px-4 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-white placeholder-silver/40 font-karla text-sm shadow-inner"
                  placeholder="Dr. Rajesh Sharma"
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
                  className="w-full bg-[#0B0F19]/85 border border-[#00D2FF]/40 rounded-xl py-2.5 px-4 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-white placeholder-silver/40 font-karla text-sm shadow-inner"
                  placeholder="analyst@agency.gov.in"
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
                    className="w-full bg-[#0B0F19]/85 border border-[#00D2FF]/40 rounded-xl py-2.5 pl-4 pr-11 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-white placeholder-silver/40 font-karla text-sm shadow-inner"
                    placeholder="Create secure password"
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

      {/* Footer */}
      <footer className="relative z-20 w-full px-6 lg:px-12 py-5 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-karla text-silver/70">
        <div className="flex flex-wrap items-center gap-2 text-center sm:text-left">
          <span>Developed by: <strong className="text-white font-medium">Cybersecurity Innovations</strong></span>
        </div>

        <div className="flex items-center gap-5 text-xs text-silver">
          <button type="button" onClick={() => alert('DPDP Privacy Policy: All audio streams are ephemeral and processed strictly in-memory without persistent disk retention.')} className="hover:text-white transition-colors">
            Privacy Policy
          </button>
          <button type="button" onClick={() => alert('Terms of Service: Authorized for certified security analysts and enterprise risk officers.')} className="hover:text-white transition-colors">
            Terms of Service
          </button>
          <button type="button" onClick={() => alert('Support: 24/7 Security Operations Center at support@voiceshield.ai')} className="hover:text-white transition-colors">
            Support
          </button>
        </div>
      </footer>
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
