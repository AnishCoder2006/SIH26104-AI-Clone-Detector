'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, User, ShieldAlert, ChevronRight, Fingerprint } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Signup() {
  const router = useRouter();
  const [formData, setFormData] = useState({ full_name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
    <div className="flex-1 flex w-full min-h-[calc(100vh-4rem)] bg-background">
      {/* Left Side - Enterprise Branding */}
      <div className="hidden lg:flex flex-col justify-center w-1/2 p-16 relative overflow-hidden bg-panel/30 border-r border-slate-800">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent pointer-events-none" />
        
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 max-w-lg"
        >
          <Fingerprint className="w-16 h-16 text-primary mb-8 opacity-80" />
          <h1 className="text-4xl font-extrabold font-serif tracking-tight mb-6">
            Secure Your Audio Identity
          </h1>
          <p className="text-lg text-slate-400 leading-relaxed mb-8">
            VoiceShield AI utilizes military-grade forensic telemetry to detect synthetic voice manipulation and deepfake audio in real-time. Join the network of enterprise analysts securing their comms.
          </p>
          
          <div className="flex flex-col space-y-4 text-sm font-medium text-slate-500">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_#00FFCC]"></div>
              Real-time deepfake analysis
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_#00FFCC]"></div>
              Lossless PCM audio inspection
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_#00FFCC]"></div>
              Advanced forensic telemetry
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
            <h2 className="text-3xl font-bold font-serif mb-3 tracking-tight">Create Account</h2>
            <p className="text-slate-400 text-sm">Register a new analyst profile to access the dashboard.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block font-mono text-[11px] tracking-[0.15em] text-slate-400 uppercase mb-2">
                Full Name
              </label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-primary transition-colors" />
                <input
                  type="text"
                  required
                  className="w-full bg-slate-900/60 border border-slate-700/60 rounded-xl py-3.5 pl-12 pr-4 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-slate-100 placeholder-slate-400 shadow-sm font-sans"
                  placeholder="Enter your full name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                />
              </div>
            </div>

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
              <label className="block font-mono text-[11px] tracking-[0.15em] text-slate-400 uppercase mb-2">
                Secure Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-primary transition-colors" />
                <input
                  type="password"
                  required
                  className="w-full bg-slate-900/60 border border-slate-700/60 rounded-xl py-3.5 pl-12 pr-4 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-slate-100 placeholder-slate-400 shadow-sm font-sans"
                  placeholder="Create secure password"
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
                  Register Profile
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <p className="mt-10 text-center text-sm text-slate-300">
            Already registered?{' '}
            <Link href="/signin" className="text-primary font-medium hover:underline transition-all hover:text-primary/80">
              Authenticate here
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
