'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, ShieldAlert, CheckCircle2, ChevronRight, Eye, EyeOff, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

function SigninForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isRegistered = searchParams.get('registered') === 'true';

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('token')) {
      router.push('/dashboard');
    }
  }, [router]);

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
        router.push('/dashboard');
      } else {
        setError(data.detail || 'Authentication denied. Invalid credentials.');
      }
    } catch (err) {
      setError('Connection to security server failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {isRegistered && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="mb-6 flex items-start gap-3 text-emerald-300 text-xs font-karla bg-emerald-500/10 p-3.5 rounded-xl border border-emerald-500/25"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block text-white mb-0.5">Profile Registered</span>
            Your enterprise analyst account was created. Please authenticate below.
          </div>
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-karla text-[11px] font-bold tracking-widest text-silver uppercase mb-2">
            Enterprise Email
          </label>
          <div className="relative group">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-silver/60 group-focus-within:text-primary transition-colors" />
            <input
              type="email"
              required
              className="w-full bg-[#0B0F19]/85 border border-white/10 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-primary/70 focus:ring-2 focus:ring-primary/20 transition-all text-white placeholder-silver/40 font-karla text-sm shadow-inner"
              placeholder="analyst@enterprise.domain"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className="block font-karla text-[11px] font-bold tracking-widest text-silver uppercase mb-2">
            Secure Password
          </label>
          <div className="relative group">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-silver/60 group-focus-within:text-primary transition-colors" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              className="w-full bg-[#0B0F19]/85 border border-white/10 rounded-xl py-3 pl-10 pr-11 focus:outline-none focus:border-primary/70 focus:ring-2 focus:ring-primary/20 transition-all text-white placeholder-silver/40 font-karla text-sm shadow-inner"
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
          <motion.div 
            initial={{ opacity: 0, height: 0 }} 
            animate={{ opacity: 1, height: 'auto' }} 
            className="flex items-start gap-2.5 text-rose-300 text-xs font-karla bg-rose-500/10 p-3 rounded-xl border border-rose-500/25"
          >
            <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </motion.div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-primary via-primary to-accent hover:from-primary/90 hover:to-accent/90 text-[#0B0F19] font-karla font-bold py-3.5 rounded-xl transition-all shadow-[0_0_25px_rgba(0,245,160,0.3)] hover:shadow-[0_0_35px_rgba(0,245,160,0.5)] hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed mt-6 flex items-center justify-center gap-2 select-none group"
        >
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-[#0B0F19]" />
              <span>Verifying Credentials...</span>
            </span>
          ) : (
            <>
              <span>Authenticate Session</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </form>
    </>
  );
}

export default function Signin() {
  return (
    <div className="min-h-[calc(100vh-4rem)] w-full flex items-center justify-center p-4 sm:p-6 bg-[#0B0F19] relative overflow-hidden">
      {/* Ambient Cyber Background Glows */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-accent/15 rounded-full blur-[140px] pointer-events-none" />
      
      {/* Centered Luxury Cyber Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="w-full max-w-[440px] relative z-10 rounded-3xl p-7 sm:p-9 bg-gradient-to-b from-[#161D2F]/95 via-[#161D2F]/90 to-[#0B0F19] border border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.85),0_0_35px_rgba(0,245,160,0.08)] backdrop-blur-2xl overflow-hidden"
      >
        {/* Subtle Top Glowing Cyber Accent */}
        <div className="absolute top-0 left-1/4 right-1/4 h-[1.5px] bg-gradient-to-r from-transparent via-primary/70 to-transparent rounded-full pointer-events-none" />

        {/* Card Header & Brand Emblem */}
        <div className="flex flex-col items-center text-center mb-7">
          <div className="relative mb-4">
            <div className="absolute -inset-2 bg-gradient-to-r from-primary to-accent rounded-full blur-md opacity-40" />
            <div className="relative w-14 h-14 rounded-2xl bg-[#0B0F19] border border-primary/40 flex items-center justify-center p-3 shadow-inner">
              <img 
                src="/logo-mint.png" 
                alt="VoiceShield" 
                className="w-full h-full object-contain drop-shadow-[0_0_8px_rgba(0,245,160,0.6)]" 
              />
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl font-cormorant font-normal text-white tracking-tight mb-1.5">
            Analyst Authentication
          </h1>
          <p className="text-xs font-karla text-silver max-w-xs leading-relaxed">
            Enter your credentials to access the neural voice clone detection vault
          </p>
        </div>

        {/* Signin Form */}
        <Suspense fallback={
          <div className="h-48 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        }>
          <SigninForm />
        </Suspense>

        {/* Card Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs font-karla text-silver">
            Don't have an analyst profile?{' '}
            <Link 
              href="/signup" 
              className="text-primary font-semibold hover:underline transition-colors hover:text-accent"
            >
              Register here
            </Link>
          </p>

          <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-center gap-1.5 text-[10px] font-mono text-silver/60">
            <span>🔒</span>
            <span>Zero-Retention Ephemeral Buffer · DPDP Compliant</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
