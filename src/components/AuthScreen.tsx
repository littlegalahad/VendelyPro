import React, { useState } from 'react';
import { Store as StoreIcon, Mail, Lock, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export default function AuthScreen() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [storeName, setStoreName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    if (mode === 'signup') {
      const { error } = await signUp(email, password, storeName || 'My Store');
      if (error) setError(error);
    } else {
      const { error } = await signIn(email, password);
      if (error) setError(error);
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950/40 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-sm space-y-5">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-xl shadow-emerald-950/50">
            <StoreIcon size={32} className="text-slate-950" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">Vendely Pro</h1>
            <p className="text-xs text-slate-400 mt-0.5">Your store, direct to WhatsApp</p>
          </div>
        </div>
        <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
          <div className="flex bg-slate-950/60 rounded-2xl p-1 border border-slate-800">
            <button onClick={() => { setMode('signup'); setError(null); }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${mode === 'signup' ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}>
              Create Account
            </button>
            <button onClick={() => { setMode('login'); setError(null); }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${mode === 'login' ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}>
              Sign In
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === 'signup' && (
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Store Name</label>
                <div className="relative">
                  <StoreIcon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input type="text" required value={storeName} onChange={e => setStoreName(e.target.value)} placeholder="Your store name"
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-3 py-3 text-xs text-white outline-none focus:border-emerald-500 transition-colors" />
                </div>
              </div>
            )}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-3 py-3 text-xs text-white outline-none focus:border-emerald-500 transition-colors" />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 6 characters"
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-3 py-3 text-xs text-white outline-none focus:border-emerald-500 transition-colors" />
              </div>
            </div>
            {error && <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-3 text-xs text-red-300">{error}</div>}
            <button type="submit" disabled={submitting}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white py-3.5 rounded-2xl text-xs font-black flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50 transition-all active:scale-95 disabled:opacity-50">
              {submitting ? 'Processing...' : (<>{mode === 'signup' ? 'Create My Store' : 'Sign In'}<ArrowRight size={16} /></>)}
            </button>
          </form>
          {mode === 'signup' && (
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <p className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1.5"><Sparkles size={12} className="text-emerald-400" /> Everything included:</p>
              {[
                'Online store with catalog and cart',
                'Direct orders to your WhatsApp',
                'QR code to share with customers',
                'Multiple payment methods',
              ].map((feat, i) => (
                <div key={i} className="flex items-center gap-2 text-[11px] text-slate-300">
                  <CheckCircle2 size={13} className="text-emerald-400 shrink-0" /><span>{feat}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <p className="text-center text-[10px] text-slate-500">By continuing you agree to our Terms and Privacy Policy</p>
      </div>
    </div>
  );
}
