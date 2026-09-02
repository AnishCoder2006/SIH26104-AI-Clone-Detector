'use client';

import { ShieldCheck, User, LogOut } from 'lucide-react';
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

  return (
    <nav className="w-full h-20 border-b border-white/5 bg-[#09090b]/80 backdrop-blur-xl sticky top-0 z-50 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
      <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
        
        {/* Logo */}
        <div className="flex items-center gap-3 group cursor-pointer" onClick={() => router.push('/dashboard')}>
          <div className="p-2 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-all duration-300 border border-primary/20 shadow-[0_0_15px_rgba(0,255,204,0.15)] group-hover:shadow-[0_0_25px_rgba(0,255,204,0.3)]">
            <ShieldCheck className="w-6 h-6 text-primary" />
          </div>
          <span className="font-bold text-2xl tracking-tight text-slate-100 font-serif">
            VoiceShield <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-400 font-light">AI</span>
          </span>
        </div>

        {/* Center: Language Switcher Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 rounded-xl border border-slate-700/60 font-mono text-xs shadow-inner">
          <Link
            href="/dashboard/hindi"
            className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
              pathname.includes('/hindi')
                ? 'bg-primary text-slate-950 font-bold shadow-[0_0_15px_rgba(0,255,204,0.3)]'
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
            }`}
          >
            <span>🇮🇳</span> Indic / Hindi
          </Link>
          <Link
            href="/dashboard/english"
            className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
              pathname.includes('/english')
                ? 'bg-primary text-slate-950 font-bold shadow-[0_0_15px_rgba(0,255,204,0.3)]'
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
            }`}
          >
            <span>🌐</span> English
          </Link>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono font-medium text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
            SECURE NETWORK
          </div>
          
          {/* Only show User Profile on protected routes (dashboard) */}
          {!isAuthPage && (
            <div className="relative">
              <button 
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-tr from-slate-800 to-slate-700 border border-slate-600 cursor-pointer hover:border-primary transition-all shadow-lg hover:shadow-[0_0_15px_rgba(0,255,204,0.2)]"
              >
                <User className="w-4 h-4 text-slate-300" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-3 w-48 bg-[#09090b] border border-white/10 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] py-2 z-50 backdrop-blur-xl">
                  <div className="px-4 py-2 border-b border-white/5 mb-1">
                    <p className="text-xs text-slate-500 font-mono uppercase tracking-wider">Admin Account</p>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2 transition-colors font-medium"
                  >
                    <LogOut className="w-4 h-4" />
                    Secure Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
