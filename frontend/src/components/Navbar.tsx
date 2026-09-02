'use client';

import { ShieldCheck, User, LogOut, Radio, ChevronDown, Activity, Cpu } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  const isAuthPage = pathname === '/signin' || pathname === '/signup' || pathname === '/';

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/signin');
  };

  if (isAuthPage) return null;

  const isIndic = pathname.includes('/hindi');
  const isEnglish = pathname.includes('/english');

  return (
    <header className="w-full sticky top-0 z-50 bg-[#08090d]/85 backdrop-blur-xl border-b border-slate-800/80 shadow-[0_4px_30px_rgba(0,0,0,0.6)]">
      {/* Top Cyber Line Accent */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        
        {/* Left: Brand Identity */}
        <div 
          className="flex items-center gap-3.5 group cursor-pointer select-none" 
          onClick={() => router.push('/dashboard')}
        >
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-cyan-500 rounded-xl blur-sm opacity-40 group-hover:opacity-75 transition-all duration-300" />
            <div className="relative p-2.5 bg-slate-950 rounded-xl border border-primary/40 shadow-inner flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-primary drop-shadow-[0_0_8px_rgba(0,255,204,0.6)]" />
            </div>
          </div>
          
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-2xl tracking-tight text-white font-sans">
                VoiceShield
              </span>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 rounded-md bg-primary/10 border border-primary/30 text-primary shadow-[0_0_10px_rgba(0,255,204,0.2)]">
                AI CORE
              </span>
            </div>
            <span className="text-[10px] font-mono text-slate-400 tracking-[0.2em] uppercase">
              Neural Audio Intercept // v2.4
            </span>
          </div>
        </div>

        {/* Center: Neural Engine Switcher */}
        <div className="hidden md:flex items-center gap-1.5 p-1 bg-slate-950/90 rounded-2xl border border-slate-800 shadow-2xl font-mono text-xs backdrop-blur-md">
          <Link
            href="/dashboard/hindi"
            className={`px-4 py-2 rounded-xl transition-all duration-200 flex items-center gap-2.5 ${
              isIndic
                ? 'bg-gradient-to-r from-primary to-cyan-400 text-slate-950 font-bold shadow-[0_0_20px_rgba(0,255,204,0.4)]'
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/80'
            }`}
          >
            <span className="text-base leading-none">🇮🇳</span>
            <div className="flex flex-col text-left leading-tight">
              <span className="font-bold">Indic Engine</span>
              <span className={`text-[9px] ${isIndic ? 'text-slate-900/80 font-semibold' : 'text-slate-500'}`}>
                Wav2Vec2-Hindi
              </span>
            </div>
          </Link>

          <Link
            href="/dashboard/english"
            className={`px-4 py-2 rounded-xl transition-all duration-200 flex items-center gap-2.5 ${
              isEnglish
                ? 'bg-gradient-to-r from-primary to-cyan-400 text-slate-950 font-bold shadow-[0_0_20px_rgba(0,255,204,0.4)]'
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/80'
            }`}
          >
            <span className="text-base leading-none">🌐</span>
            <div className="flex flex-col text-left leading-tight">
              <span className="font-bold">English Engine</span>
              <span className={`text-[9px] ${isEnglish ? 'text-slate-900/80 font-semibold' : 'text-slate-500'}`}>
                ASVspoof-Stage7
              </span>
            </div>
          </Link>
        </div>

        {/* Right: Security Telemetry & Analyst Menu */}
        <div className="flex items-center gap-4">
          
          {/* Real-time Defense Status */}
          <div className="hidden sm:flex items-center gap-3 px-3.5 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 shadow-inner">
            <div className="relative flex items-center justify-center">
              <span className="absolute w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping opacity-60" />
              <span className="relative w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]" />
            </div>
            <div className="flex flex-col font-mono text-[10px] leading-tight">
              <span className="font-bold text-emerald-400 tracking-wider">DEFENSE ONLINE</span>
              <span className="text-slate-400">LATENCY: ~32ms</span>
            </div>
          </div>

          {/* Analyst Session Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 hover:border-primary/50 transition-all shadow-md group"
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-500/20 to-primary/20 border border-primary/30 flex items-center justify-center text-primary">
                <User className="w-3.5 h-3.5" />
              </div>
              <div className="hidden lg:flex flex-col text-left leading-tight">
                <span className="text-xs font-semibold text-slate-200 group-hover:text-white">Analyst Active</span>
                <span className="text-[9px] font-mono text-slate-400">Level 4 Clearance</span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180 text-primary' : ''}`} />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-slate-950/95 border border-slate-800 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.9)] py-2 z-50 backdrop-blur-2xl animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-4 py-2.5 border-b border-slate-800/80 mb-1">
                  <p className="text-[10px] font-mono uppercase tracking-widest text-primary font-bold">Secure Session</p>
                  <p className="text-xs font-semibold text-slate-200 mt-0.5">Forensic Analyst Node</p>
                  <p className="text-[10px] text-slate-400 font-mono">ID: SEC-NODE-7810</p>
                </div>

                <div className="px-2 py-1">
                  <Link
                    href="/dashboard/hindi"
                    onClick={() => setDropdownOpen(false)}
                    className="flex md:hidden items-center justify-between px-3 py-2 text-xs text-slate-300 hover:bg-slate-900 rounded-xl"
                  >
                    <span>🇮🇳 Indic / Hindi Model</span>
                    {isIndic && <span className="text-[9px] text-primary font-mono font-bold">ACTIVE</span>}
                  </Link>
                  <Link
                    href="/dashboard/english"
                    onClick={() => setDropdownOpen(false)}
                    className="flex md:hidden items-center justify-between px-3 py-2 text-xs text-slate-300 hover:bg-slate-900 rounded-xl"
                  >
                    <span>🌐 English Model</span>
                    {isEnglish && <span className="text-[9px] text-primary font-mono font-bold">ACTIVE</span>}
                  </Link>

                  <button 
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2.5 text-xs text-rose-400 hover:bg-rose-500/10 rounded-xl flex items-center gap-2 transition-colors font-medium"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Terminate Session
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Bottom Subtle Glowing Line */}
      <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-slate-800 to-transparent" />
    </header>
  );
}
