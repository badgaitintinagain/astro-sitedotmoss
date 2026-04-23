"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Terminal, ShieldCheck, AlertCircle } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        window.location.href = '/admin';
      } else {
        setError(data.error || 'AUTH_FAILURE');
      }
    } catch (error) {
      setError('SYSTEM_CONNECTION_ERROR');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.42)_0%,rgba(240,232,220,0.22)_34%,rgba(199,217,211,0.28)_100%)] backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-sm bg-white/90 border border-stone-200 shadow-[0_30px_80px_rgba(82,62,42,0.22)] overflow-hidden font-mono text-stone-800 backdrop-blur-2xl"
          >
            {/* Technical Border Accents */}
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-accent-primary/50 to-transparent"></div>
            <div className="absolute top-0 left-0 w-1 h-8 bg-accent-primary/40"></div>
            <div className="absolute top-0 right-0 w-1 h-8 bg-accent-primary/40"></div>

          <div className="p-5 border-b border-stone-200 bg-[linear-gradient(135deg,rgba(255,255,255,0.88)_0%,rgba(245,237,226,0.72)_100%)] flex justify-between items-center">
                <div className="flex items-center gap-3">
              <div className="w-8 h-8 border border-stone-200 flex items-center justify-center bg-white/80 shadow-inner">
                        <Terminal size={14} className="text-accent-primary" />
                    </div>
                    <div>
                <div className="text-[9px] font-bold text-stone-500 uppercase tracking-widest">AUTH_GATEWAY</div>
                <h2 className="text-xs font-bold text-stone-800 uppercase">TERMINAL_ACCESS</h2>
                    </div>
                </div>
            <button onClick={onClose} className="p-1.5 text-stone-500 hover:text-stone-800 transition-colors border border-transparent hover:border-stone-200">
                    <X size={16} />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div className="space-y-1.5">
                    <label className="block text-[8px] font-bold text-stone-600 uppercase tracking-tighter">IDENTIFIER::EMAIL</label>
                    <input 
                        type="email" 
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/75 border border-stone-200 px-3 py-2 text-xs text-stone-800 focus:outline-none focus:border-accent-primary/40 transition-all placeholder:text-stone-400"
                        placeholder="ADMIN@SITEDOTMOSS.COM"
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="block text-[8px] font-bold text-stone-600 uppercase tracking-tighter">ACCESS_KEY::SECURE</label>
                    <input 
                        type="password" 
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/75 border border-stone-200 px-3 py-2 text-xs text-stone-800 focus:outline-none focus:border-accent-primary/40 transition-all placeholder:text-stone-400"
                        placeholder="••••••••"
                    />
                </div>

                {error && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-red-500/5 border border-red-500/20 text-red-500 text-[9px] font-bold uppercase animate-shake">
                        <AlertCircle size={12} />
                        {error}
                    </div>
                )}

                <button 
                    type="submit"
                    disabled={loading}
                  className="w-full bg-accent-primary/10 hover:bg-accent-primary/20 border border-accent-primary/30 py-2.5 text-accent-primary text-[10px] font-bold uppercase transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <div className="w-3 h-3 border border-accent-primary/40 border-t-accent-primary rounded-full animate-spin"></div>
                    ) : (
                        <><ShieldCheck size={14} /> INITIATE_SESSION</>
                    )}
                </button>
                
                <div className="pt-2 flex justify-center opacity-20">
                   <div className="flex gap-1.5">
                     {[...Array(5)].map((_, i) => <div key={i} className="w-1 h-1 bg-stone-500"></div>)}
                   </div>
                </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
