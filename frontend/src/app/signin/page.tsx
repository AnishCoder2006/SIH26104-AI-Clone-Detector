'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, ShieldAlert, CheckCircle2, ChevronRight, ScanFace } from 'lucide-react';
import { motion } from 'framer-motion';

function SigninForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isRegistered = searchParams.get('registered') === 'true';

  const [formData, setFormData] = useState({ email: '', password: '' });
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
          className="mb-8 flex items-start gap-3 text-emerald-400 text-sm bg-emerald-400/10 p-4 rounded-xl border border-emerald-400/20"
        >
          <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block mb-0.5">Profile Registered</span>
            Your enterprise analyst account was successfully created. Please authenticate below.
          </div>
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block font-mono text-[11px] tracking-[0.15em] text-slate-400 uppercase mb-2">
            Enterprise Email
          </label>
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-primary transition-colors" />
            <input
              type="email"
              required
              className="w-full bg-slate-900/60 border border-slate-700/60 rounded-xl py-3.5 pl-12 pr-4 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-slate-100 placeholder-slate-400 shadow-sm font-sans"
              placeholder="Enter enterprise email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className="block font-mono text-[11px] tracking-[0.15em] text-slate-400 uppercase mb-2 flex justify-between">
            <span>Secure Password</span>
          </label>
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-primary transition-colors" />
            <input
              type="password"
              required
              className="w-full bg-slate-900/60 border border-slate-700/60 rounded-xl py-3.5 pl-12 pr-4 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-slate-100 placeholder-slate-400 shadow-sm font-sans"
              placeholder="Enter secure password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }} 
            animate={{ opacity: 1, height: 'auto' }} 
            className="flex items-start gap-3 text-red-400 text-sm bg-red-400/10 p-4 rounded-xl border border-red-400/20"
          >
            <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </motion.div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary hover:bg-primary/90 text-slate-950 font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,255,204,0.2)] hover:shadow-[0_0_30px_rgba(0,255,204,0.4)] disabled:opacity-50 disabled:cursor-not-allowed mt-8 group"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
          ) : (
            <>
              Authenticate
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </form>
    </>
  );
}

export default function Signin() {
  return (
    <div className="flex-1 flex w-full min-h-[calc(100vh-4rem)] bg-background">
      {/* Left Side - Enterprise Branding */}
      <div className="hidden lg:flex flex-col justify-center w-1/2 p-16 relative overflow-hidden bg-panel/30 border-r border-slate-800">
        <div className="absolute bottom-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-secondary/10 via-transparent to-transparent pointer-events-none" />
        
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 max-w-lg"
        >
          <ScanFace className="w-16 h-16 text-primary mb-8 opacity-100 drop-shadow-[0_0_15px_rgba(0,255,204,0.5)]" />
          <h1 className="text-4xl font-extrabold font-serif tracking-tight mb-6">
            Authentication Protocol
          </h1>
          <p className="text-lg text-slate-400 leading-relaxed mb-8">
            Access the VoiceShield AI command center to run forensic checks on suspicious audio profiles. Authorization requires verified credentials.
          </p>
          
          <div className="grid grid-cols-2 gap-4 text-sm font-medium text-slate-500 mt-8">
            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
              <span className="block text-primary text-2xl font-bold font-mono mb-1">99.8%</span>
              <span className="text-slate-300">Detection Accuracy</span>
            </div>
            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
              <span className="block text-primary text-2xl font-bold font-mono mb-1">&lt; 1s</span>
              <span className="text-slate-300">Latency</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-md"
        >
          <div className="text-center lg:text-left mb-10">
            <h2 className="text-3xl font-bold font-serif mb-3 tracking-tight">Access Dashboard</h2>
            <p className="text-slate-400 text-sm">Sign in to your analyst profile to continue.</p>
          </div>

          <Suspense fallback={<div className="h-64 flex items-center justify-center"><div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /></div>}>
            <SigninForm />
          </Suspense>

          <p className="mt-10 text-center text-sm text-slate-300">
            Don't have an analyst profile?{' '}
            <Link href="/signup" className="text-primary font-medium hover:underline transition-all hover:text-primary/80">
              Request access
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
