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
      <header className="w-full max-w-6xl h-16 sm:h-[68px] bg-[#161D2F]/85 backdrop-blur-2xl border border-[#00D2FF]/20 rounded-2xl sm:rounded-full shadow-[0_16px_40px_rgba(11,15,25,0.9),0_0_25px_rgba(0,245,160,0.1)] px-4 sm:px-6 flex items-center justify-between pointer-events-auto relative overflow-visible transition-all">
        
        {/* Subtle Cyber Glow Top Line */}
        <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-primary/60 to-transparent rounded-full pointer-events-none" />

        {/* Left: Brand Identity */}
        <div 
          className="flex items-center gap-3 group cursor-pointer select-none" 
          onClick={() => router.push('/dashboard')}
        >
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-full blur-sm opacity-50 group-hover:opacity-85 transition-all duration-300" />
            <div className="relative w-9 h-9 sm:w-10 sm:h-10 bg-[#0B0F19] rounded-full border border-primary/40 shadow-inner flex items-center justify-center p-2 group-hover:scale-105 transition-transform">
              <img 
                src="/logo-mint.png" 
                alt="VoiceShield Voice Detection" 
                className="w-full h-full object-contain drop-shadow-[0_0_8px_rgba(0,245,160,0.6)]"
              />
            </div>
          </div>
          
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-fraunces font-semibold text-xl tracking-tight text-white">
                VoiceShield
              </span>
              <span className="text-[9px] font-mono font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full bg-primary/15 border border-primary/40 text-primary shadow-[0_0_10px_rgba(0,245,160,0.25)]">
                AI
              </span>
            </div>
            <span className="hidden sm:block text-[9px] font-mono text-silver tracking-[0.2em] uppercase">
              Neural Intercept
            </span>
          </div>
        </div>



        {/* Right: Security Telemetry & Analyst Menu */}
        <div className="flex items-center gap-3">
          

          {/* Analyst Session Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-full bg-[#0B0F19]/90 hover:bg-[#161D2F] border border-white/10 hover:border-primary/50 transition-all shadow-md group"
            >
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-accent/20 to-primary/20 border border-primary/40 flex items-center justify-center text-primary">
                <User className="w-3 h-3" />
              </div>
              <span className="hidden lg:block text-xs font-semibold text-silver group-hover:text-white">Analyst</span>
              <ChevronDown className={`w-3.5 h-3.5 text-silver transition-transform duration-200 ${dropdownOpen ? 'rotate-180 text-primary' : ''}`} />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-3 w-56 bg-[#161D2F]/95 border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(11,15,25,0.95)] py-2 z-50 backdrop-blur-2xl animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-4 py-2.5 border-b border-white/[0.08] mb-1">
                  <p className="text-[10px] font-mono uppercase tracking-widest text-primary font-bold">Secure Session</p>
                  <p className="text-xs font-semibold text-white mt-0.5">Forensic Analyst Node</p>
                  <p className="text-[10px] text-silver font-mono">ID: SEC-NODE-7810</p>
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
