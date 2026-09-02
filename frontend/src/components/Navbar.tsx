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
    <div className="sticky top-3 sm:top-4 z-50 w-full px-3 sm:px-6 flex justify-center pointer-events-none mb-4">
      <header className="w-full max-w-6xl h-16 sm:h-[68px] bg-[#08090e]/85 backdrop-blur-2xl border border-slate-700/60 rounded-2xl sm:rounded-full shadow-[0_16px_40px_rgba(0,0,0,0.7),0_0_25px_rgba(0,255,204,0.08)] px-4 sm:px-6 flex items-center justify-between pointer-events-auto relative overflow-visible transition-all">
        
        {/* Subtle Cyber Glow Top Line */}
        <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent rounded-full pointer-events-none" />

        {/* Left: Brand Identity */}
        <div 
          className="flex items-center gap-3 group cursor-pointer select-none" 
          onClick={() => router.push('/dashboard')}
        >
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-cyan-500 rounded-full blur-sm opacity-40 group-hover:opacity-75 transition-all duration-300" />
            <div className="relative p-2 bg-slate-950 rounded-full border border-primary/40 shadow-inner flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-primary drop-shadow-[0_0_8px_rgba(0,255,204,0.6)]" />
            </div>
          </div>
          
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xl tracking-tight text-white font-sans">
                VoiceShield
              </span>
              <span className="text-[9px] font-mono font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full bg-primary/10 border border-primary/30 text-primary shadow-[0_0_10px_rgba(0,255,204,0.2)]">
                AI
              </span>
            </div>
            <span className="hidden sm:block text-[9px] font-mono text-slate-400 tracking-[0.2em] uppercase">
              Neural Intercept
            </span>
          </div>
        </div>

        {/* Center: Neural Engine Switcher */}
        <div className="hidden md:flex items-center gap-1 p-1 bg-slate-950/90 rounded-full border border-slate-800 shadow-inner font-mono text-xs backdrop-blur-md">
          <Link
            href="/dashboard/hindi"
            className={`px-4 py-1.5 rounded-full transition-all duration-200 flex items-center gap-2 ${
              isIndic
                ? 'bg-gradient-to-r from-primary to-cyan-400 text-slate-950 font-bold shadow-[0_0_16px_rgba(0,255,204,0.35)]'
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/80'
            }`}
          >
            <span className="text-sm leading-none">🇮🇳</span>
            <span className="text-xs font-semibold">Indic / Hindi</span>
          </Link>

          <Link
            href="/dashboard/english"
            className={`px-4 py-1.5 rounded-full transition-all duration-200 flex items-center gap-2 ${
              isEnglish
                ? 'bg-gradient-to-r from-primary to-cyan-400 text-slate-950 font-bold shadow-[0_0_16px_rgba(0,255,204,0.35)]'
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/80'
            }`}
          >
            <span className="text-sm leading-none">🌐</span>
            <span className="text-xs font-semibold">English</span>
          </Link>
        </div>

        {/* Right: Security Telemetry & Analyst Menu */}
        <div className="flex items-center gap-3">
          
          {/* Real-time Defense Status */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950/80 border border-slate-800 shadow-inner">
            <div className="relative flex items-center justify-center">
              <span className="absolute w-2 h-2 rounded-full bg-emerald-400 animate-ping opacity-60" />
              <span className="relative w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.9)]" />
            </div>
            <div className="flex items-center gap-1.5 font-mono text-[10px] leading-tight">
              <span className="font-bold text-emerald-400 tracking-wider">ONLINE</span>
              <span className="text-slate-500">·</span>
              <span className="text-slate-400">32ms</span>
            </div>
          </div>

          {/* Analyst Session Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-full bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 hover:border-primary/50 transition-all shadow-md group"
            >
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-cyan-500/20 to-primary/20 border border-primary/30 flex items-center justify-center text-primary">
                <User className="w-3 h-3" />
              </div>
              <span className="hidden lg:block text-xs font-semibold text-slate-200 group-hover:text-white">Analyst</span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180 text-primary' : ''}`} />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-3 w-56 bg-slate-950/95 border border-slate-800 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.9)] py-2 z-50 backdrop-blur-2xl animate-in fade-in slide-in-from-top-2 duration-150">
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
                    className="w-full text-left px-3 py-2 text-xs text-rose-400 hover:bg-rose-500/10 rounded-xl flex items-center gap-2 transition-colors font-medium"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Terminate Session
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </header>
    </div>
  );
}
