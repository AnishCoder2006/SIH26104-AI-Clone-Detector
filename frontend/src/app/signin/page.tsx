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

const INDIA_MAP_PATH = "M34.8,5.0 L38.1,9.5 L37.7,12.6 L39.0,14.5 L38.9,16.5 L36.7,16.0 L37.5,20.2 L40.6,22.6 L44.8,25.3 L42.9,27.0 L41.7,30.6 L44.7,32.0 L47.6,33.9 L51.6,36.0 L55.8,36.5 L57.6,38.4 L60.0,38.8 L63.7,39.7 L66.2,39.6 L66.6,38.1 L66.2,35.7 L66.4,34.1 L68.3,33.3 L68.6,36.3 L68.6,37.0 L71.4,38.5 L73.4,37.9 L76.0,38.1 L78.5,38.0 L78.7,35.7 L77.4,34.5 L79.9,34.0 L82.7,31.1 L86.3,28.7 L88.8,29.6 L91.0,28.0 L92.5,30.4 L91.4,32.0 L94.8,32.6 L95.0,34.0 L93.9,34.7 L94.2,37.1 L92.0,36.4 L88.0,39.0 L88.1,41.2 L86.4,44.4 L86.2,46.3 L84.9,49.4 L82.4,48.5 L82.3,52.5 L81.6,53.8 L82.0,55.4 L80.4,56.3 L78.8,50.3 L78.0,50.3 L77.5,52.7 L75.8,50.7 L76.7,48.6 L78.1,48.3 L79.5,45.1 L77.7,44.5 L74.9,44.5 L72.0,44.0 L71.7,41.3 L70.2,41.2 L67.8,39.5 L66.7,42.1 L68.9,44.1 L67.0,45.5 L66.3,46.9 L68.2,47.9 L67.7,50.2 L68.7,53.1 L69.2,56.3 L68.8,57.6 L66.7,57.6 L62.9,58.4 L63.1,61.3 L61.4,63.5 L57.0,66.1 L53.5,70.6 L51.2,73.0 L48.2,75.5 L48.2,77.2 L46.6,78.2 L43.8,79.5 L42.4,79.7 L41.5,82.6 L42.1,87.6 L42.3,90.8 L41.0,94.4 L41.0,100.9 L39.4,101.1 L38.0,104.0 L38.9,105.2 L36.1,106.3 L35.1,108.9 L33.8,110.0 L30.9,106.4 L29.5,101.1 L28.3,97.3 L27.2,95.4 L25.6,91.8 L24.8,87.0 L24.3,84.6 L21.5,79.4 L20.2,72.0 L19.3,67.1 L19.3,62.5 L18.7,58.9 L14.2,61.2 L12.1,60.8 L8.0,56.1 L9.5,54.7 L8.6,53.3 L5.0,50.0 L7.1,47.5 L13.8,47.5 L13.2,44.2 L11.5,42.3 L11.1,39.3 L9.1,37.6 L12.5,33.6 L16.1,33.9 L19.3,29.9 L21.2,26.0 L24.2,22.2 L24.2,19.5 L26.8,17.3 L24.3,15.4 L23.3,12.8 L22.2,9.5 L23.7,7.8 L28.3,8.8 L31.8,8.2 L34.8,5.0 Z";

const EXACT_SOUNDWAVE_PACKETS = [
  // Packet 1 (small burst)
  { base: 10, min: 7, max: 14, dur: 1.1 },
  { base: 18, min: 12, max: 24, dur: 0.9 },
  { base: 32, min: 22, max: 40, dur: 1.3 },
  { base: 18, min: 12, max: 24, dur: 0.95 },
  { base: 10, min: 7, max: 14, dur: 1.05 },

  // Baseline gap
  { base: 4, min: 3, max: 6, dur: 1.2 },

  // Packet 2 (medium burst)
  { base: 12, min: 8, max: 18, dur: 1.15 },
  { base: 26, min: 18, max: 34, dur: 0.85 },
  { base: 46, min: 34, max: 54, dur: 1.25 },
  { base: 26, min: 18, max: 34, dur: 0.9 },
  { base: 12, min: 8, max: 18, dur: 1.1 },

  // Baseline gap
  { base: 4, min: 3, max: 6, dur: 1.0 },

  // Packet 3 (tallest burst)
  { base: 10, min: 7, max: 16, dur: 1.05 },
  { base: 22, min: 16, max: 30, dur: 0.8 },
  { base: 40, min: 30, max: 50, dur: 1.2 },
  { base: 60, min: 48, max: 68, dur: 0.9 },
  { base: 40, min: 30, max: 50, dur: 1.15 },
  { base: 22, min: 16, max: 30, dur: 0.85 },
  { base: 10, min: 7, max: 16, dur: 1.1 },
];

function SigninContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isRegistered = searchParams.get('registered') === 'true';

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [comingSoonMsg, setComingSoonMsg] = useState<string | null>(null);

  const handleComingSoon = (featureName: string) => {
    setComingSoonMsg(`${featureName} is coming soon!`);
    setTimeout(() => {
      setComingSoonMsg(null);
    }, 3500);
  };

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
      {/* Immersive World Map Background Layer */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-80"
          style={{ backgroundImage: "url('/bg-world-map.png')" }}
        />
        {/* Deep dark overlay gradient for text legibility & cyber aesthetic */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#070B14]/60 via-[#070B14]/30 to-[#070B14]/70" />
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
                {/* Visual Graphic: Exact India Map with Scanlines, VB Badge & 3-Burst Waveform */}
                <div className="h-28 rounded-xl bg-[#09111E] border border-white/10 p-2.5 flex items-center justify-between gap-2 relative overflow-hidden mb-3">
                  {/* Left: Authentic India Map with Scanlines Texture & Center VB Emblem */}
                  <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
                    <svg className="w-full h-full drop-shadow-[0_0_10px_rgba(0,245,160,0.35)] overflow-visible" viewBox="0 0 100 115" fill="none">
                      <defs>
                        <clipPath id="indiaBorderClip">
                          <path d={INDIA_MAP_PATH} />
                        </clipPath>
                        <pattern id="indiaHoriScanlines" width="100" height="3" patternUnits="userSpaceOnUse">
                          <line x1="0" y1="1.5" x2="100" y2="1.5" stroke="#00F5A0" strokeWidth="0.9" strokeOpacity="0.55" />
                        </pattern>
                      </defs>

                      {/* Base Dark Teal Fill */}
                      <path
                        d={INDIA_MAP_PATH}
                        fill="#08231E"
                        stroke="#00F5A0"
                        strokeWidth="1.2"
                        strokeLinejoin="round"
                      />

                      {/* Exact Horizontal Scanline Pattern Clipped to India */}
                      <rect
                        x="0"
                        y="0"
                        width="100"
                        height="115"
                        fill="url(#indiaHoriScanlines)"
                        clipPath="url(#indiaBorderClip)"
                      />

                      {/* Center VB Emblem with Horizontal Voice Line Passing Through */}
                      <g transform="translate(46, 56)">
                        {/* Audio pulse line extending outwards */}
                        <line x1="-22" y1="0" x2="-9.5" y2="0" stroke="#00F5A0" strokeWidth="1.4" strokeLinecap="round" />
                        <line x1="9.5" y1="0" x2="22" y2="0" stroke="#00F5A0" strokeWidth="1.4" strokeLinecap="round" />

                        {/* Outer Dark Badge Circle */}
                        <circle cx="0" cy="0" r="10.5" fill="#07131D" stroke="#00F5A0" strokeWidth="1.6" className="drop-shadow-[0_0_6px_rgba(0,245,160,0.6)]" />

                        {/* Inner Concentric Ring */}
                        <circle cx="0" cy="0" r="8.5" fill="none" stroke="#00F5A0" strokeWidth="0.6" strokeOpacity="0.5" />

                        {/* Centered VB Text / Monogram */}
                        <text
                          x="0"
                          y="3.2"
                          textAnchor="middle"
                          fill="#00F5A0"
                          fontSize="7.5"
                          fontWeight="900"
                          fontFamily="system-ui, -apple-system, sans-serif"
                          letterSpacing="-0.3px"
                          className="select-none"
                        >
                          VB
                        </text>
                      </g>
                    </svg>
                  </div>

                  {/* Right: Exact 3-Burst Symmetrical Soundwave with Fluid Voice Animation */}
                  <div className="flex-1 flex items-center justify-center gap-[2px] sm:gap-[3px] h-20 px-1">
                    {EXACT_SOUNDWAVE_PACKETS.map((bar, i) => (
                      <motion.div
                        key={i}
                        className="w-[3px] sm:w-[3.5px] rounded-full bg-[#00F5A0] shadow-[0_0_6px_rgba(0,245,160,0.5)]"
                        animate={{
                          height: [`${bar.min}px`, `${bar.max}px`, `${bar.min}px`],
                        }}
                        transition={{
                          duration: bar.dur,
                          repeat: Infinity,
                          repeatType: "reverse",
                          ease: "easeInOut",
                          delay: (i * 0.06),
                        }}
                        style={{
                          height: `${bar.base}px`,
                          minHeight: '4px',
                        }}
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
                {/* Visual Graphic: Wireframe Globe & Stacked Telemetry Panels */}
                <div className="h-28 rounded-xl bg-[#09111E] border border-white/10 p-2.5 flex items-center justify-between gap-2.5 relative overflow-hidden mb-3">
                  {/* Left: Digital Wireframe Globe */}
                  <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
                    <svg className="w-full h-full drop-shadow-[0_0_10px_rgba(0,210,255,0.4)]" viewBox="0 0 100 100" fill="none">
                      <defs>
                        <clipPath id="globeInnerClipSignin">
                          <circle cx="50" cy="50" r="42" />
                        </clipPath>
                        <pattern id="globeDotsSignin" width="4" height="4" patternUnits="userSpaceOnUse">
                          <circle cx="2" cy="2" r="0.65" fill="#00D2FF" fillOpacity="0.28" />
                        </pattern>
                      </defs>

                      {/* Dark Blue Globe Base */}
                      <circle cx="50" cy="50" r="42" fill="#06121E" />
                      
                      {/* Dotted Matrix Texture */}
                      <rect x="8" y="8" width="84" height="84" fill="url(#globeDotsSignin)" clipPath="url(#globeInnerClipSignin)" />

                      {/* Outer Ring */}
                      <circle cx="50" cy="50" r="42" stroke="#00D2FF" strokeWidth="1.5" />

                      {/* Latitudes */}
                      <line x1="8" y1="50" x2="92" y2="50" stroke="#00D2FF" strokeWidth="1.2" />
                      <path d="M14,30 Q50,40 86,30" stroke="#00D2FF" strokeWidth="1.0" fill="none" />
                      <path d="M14,70 Q50,60 86,70" stroke="#00D2FF" strokeWidth="1.0" fill="none" />

                      {/* Meridians (Longitudes) */}
                      <line x1="50" y1="8" x2="50" y2="92" stroke="#00D2FF" strokeWidth="1.2" />
                      <ellipse cx="50" cy="50" rx="20" ry="42" stroke="#00D2FF" strokeWidth="1.1" fill="none" />
                      <ellipse cx="50" cy="50" rx="33" ry="42" stroke="#00D2FF" strokeWidth="0.9" fill="none" />
                    </svg>
                  </div>

                  {/* Right: Stacked Sub-Panels (Spectral Wave + Mel-Spectrogram) */}
                  <div className="flex-1 flex flex-col justify-between h-24 py-0.5">
                    {/* Top Panel: Oscilloscope Frequency Envelope on Grid */}
                    <div className="h-[42px] w-full rounded-lg bg-[#060D18] border border-white/10 relative overflow-hidden flex items-center justify-center">
                      {/* Oscilloscope Grid */}
                      <svg className="absolute inset-0 w-full h-full opacity-25" viewBox="0 0 120 44" fill="none">
                        <line x1="0" y1="11" x2="120" y2="11" stroke="#00D2FF" strokeWidth="0.5" strokeDasharray="2 2" />
                        <line x1="0" y1="22" x2="120" y2="22" stroke="#00D2FF" strokeWidth="0.5" />
                        <line x1="0" y1="33" x2="120" y2="33" stroke="#00D2FF" strokeWidth="0.5" strokeDasharray="2 2" />
                        <line x1="24" y1="0" x2="24" y2="44" stroke="#00D2FF" strokeWidth="0.5" />
                        <line x1="48" y1="0" x2="48" y2="44" stroke="#00D2FF" strokeWidth="0.5" />
                        <line x1="72" y1="0" x2="72" y2="44" stroke="#00D2FF" strokeWidth="0.5" />
                        <line x1="96" y1="0" x2="96" y2="44" stroke="#00D2FF" strokeWidth="0.5" />
                      </svg>

                      {/* Spectral Envelope Curve with Filled Area */}
                      <svg className="w-full h-full overflow-visible relative z-10" viewBox="0 0 120 44" fill="none" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="curveGradientSignin" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#00F5A0" stopOpacity="0.45" />
                            <stop offset="60%" stopColor="#00D2FF" stopOpacity="0.18" />
                            <stop offset="100%" stopColor="#00D2FF" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>
                        <path
                          d="M 0,34 Q 8,33 12,28 Q 16,8 20,6 Q 24,5 28,26 Q 34,28 38,16 Q 42,4 46,5 Q 50,7 54,24 Q 60,15 66,16 Q 72,18 78,14 Q 84,12 90,20 Q 98,25 106,18 Q 114,14 120,22 L 120,44 L 0,44 Z"
                          fill="url(#curveGradientSignin)"
                        />
                        <path
                          d="M 0,34 Q 8,33 12,28 Q 16,8 20,6 Q 24,5 28,26 Q 34,28 38,16 Q 42,4 46,5 Q 50,7 54,24 Q 60,15 66,16 Q 72,18 78,14 Q 84,12 90,20 Q 98,25 106,18 Q 114,14 120,22"
                          stroke="#00F5A0"
                          strokeWidth="1.4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="drop-shadow-[0_0_6px_rgba(0,245,160,0.6)]"
                        />
                      </svg>
                    </div>

                    {/* Bottom Panel: Real Mel-Spectrogram Heatmap */}
                    <div className="h-[42px] w-full rounded-lg bg-[#07091A] border border-white/10 relative overflow-hidden p-0.5">
                      <div className="w-full h-full rounded-[6px] overflow-hidden flex relative">
                        <div className="w-[14%] h-full bg-gradient-to-t from-emerald-500/80 via-indigo-700/60 to-purple-900/80 opacity-90" />
                        <div className="w-[8%] h-full bg-[#07091A]" />
                        <div className="w-[16%] h-full bg-gradient-to-t from-[#00F5A0] via-cyan-400/80 to-indigo-600/60 shadow-[0_0_8px_rgba(0,245,160,0.5)]" />
                        <div className="w-[6%] h-full bg-[#07091A]" />
                        <div className="w-[18%] h-full bg-gradient-to-t from-[#00F5A0] via-[#00D2FF] to-purple-700/70" />
                        <div className="w-[5%] h-full bg-[#07091A]" />
                        <div className="w-[15%] h-full bg-gradient-to-t from-teal-400 via-indigo-600/70 to-purple-900/80" />
                        <div className="w-[18%] h-full bg-gradient-to-t from-[#00F5A0]/90 via-emerald-600/70 to-indigo-900" />
                        
                        {/* Horizontal frequency scanline stripes */}
                        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_3px,rgba(0,0,0,0.4)_4px)] bg-[length:100%_4px] pointer-events-none" />

                        {/* Animated subtle sweep */}
                        <motion.div
                          className="absolute top-0 bottom-0 w-8 bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none"
                          animate={{ x: [-20, 160] }}
                          transition={{ duration: 2.2, repeat: Infinity, ease: "linear" }}
                        />
                      </div>
                    </div>
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
                    className="w-full bg-[#0B0F19]/85 border border-[#00D2FF]/40 rounded-xl py-3 px-4 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-white placeholder:text-slate-500 font-sans text-sm shadow-inner"
                    placeholder="analyst@company.com"
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
                    className="w-full bg-[#0B0F19]/85 border border-[#00D2FF]/40 rounded-xl py-3 pl-4 pr-11 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-white placeholder:text-slate-500 font-sans text-sm shadow-inner tracking-wider"
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

              {/* Coming Soon Notification Banner */}
              <AnimatePresence>
                {comingSoonMsg && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.95 }}
                    className="p-3 rounded-xl bg-gradient-to-r from-accent/15 via-primary/10 to-accent/15 border border-accent/40 text-accent text-xs font-karla flex items-center justify-between shadow-[0_0_20px_rgba(0,210,255,0.2)] backdrop-blur-md"
                  >
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-primary animate-pulse shrink-0" />
                      <span className="font-semibold text-slate-100">{comingSoonMsg}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setComingSoonMsg(null)}
                      className="text-silver/70 hover:text-white transition-colors text-xs px-1 font-bold"
                    >
                      ✕
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Secondary Alternate Login Actions */}
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => handleComingSoon('Access with Voice ID')}
                  className="py-2.5 px-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-primary/40 text-xs font-karla text-slate-200 hover:text-white transition-all text-center flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <Fingerprint className="w-3.5 h-3.5 text-primary" />
                  <span>Access with Voice ID</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleComingSoon('SSO Login')}
                  className="py-2.5 px-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-accent/40 text-xs font-karla text-slate-200 hover:text-white transition-all text-center flex items-center justify-center gap-1.5 active:scale-95"
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
