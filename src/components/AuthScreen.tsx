import React, { useState } from 'react';
import { Store as StoreIcon, Mail, Lock, ArrowRight, Sparkles, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export default function AuthScreen() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [storeName, setStoreName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (mode === 'signup') {
      if (password.length < 6) {
        setError('La contraseña debe tener al menos 6 caracteres.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Las contraseñas no coinciden.');
        return;
      }
      if (!storeName.trim()) {
        setError('Debes ingresar el nombre de tu tienda.');
        return;
      }
    }

    setSubmitting(true);
    if (mode === 'signup') {
      const { error } = await signUp(email, password, storeName);
      if (error) {
        let msg = error;
        if (msg.includes('User already registered')) msg = 'Ya existe una cuenta con este correo.';
        else if (msg.includes('Password should be at least')) msg = 'La contraseña debe tener al menos 6 caracteres.';
        else if (msg.includes('Invalid email')) msg = 'El correo no es válido.';
        setError(msg);
      }
    } else {
      const { error } = await signIn(email, password);
      if (error) {
        let msg = error;
        if (msg.includes('Invalid login credentials')) msg = 'Correo o contraseña incorrectos.';
        else if (msg.includes('Email not confirmed')) msg = 'Tu correo aún no ha sido confirmado.';
        setError(msg);
      }
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
            <p className="text-xs text-slate-400 mt-0.5">Tu tienda, directa por WhatsApp</p>
          </div>
        </div>

        <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
          <div className="flex bg-slate-950/60 rounded-2xl p-1 border border-slate-800">
            <button onClick={() => { setMode('signup'); setError(null); }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${mode === 'signup' ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}>
              Crear cuenta
            </button>
            <button onClick={() => { setMode('login'); setError(null); }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${mode === 'login' ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}>
              Iniciar sesión
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === 'signup' && (
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Nombre de la tienda</label>
                <div className="relative">
                  <StoreIcon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input type="text" required value={storeName} onChange={e => setStoreName(e.target.value)} placeholder="Mi tienda"
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-3 py-3 text-xs text-white outline-none focus:border-emerald-500 transition-colors" />
                </div>
              </div>
            )}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Correo electrónico</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="tucorreo@email.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-3 py-3 text-xs text-white outline-none focus:border-emerald-500 transition-colors" />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Contraseña</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input type={showPassword ? 'text' : 'password'} required minLength={6} value={password} onChange={e => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres"
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-10 py-3 text-xs text-white outline-none focus:border-emerald-500 transition-colors" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            {mode === 'signup' && (
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Confirmar contraseña</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input type={showConfirm ? 'text' : 'password'} required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Repite tu contraseña"
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-10 py-3 text-xs text-white outline-none focus:border-emerald-500 transition-colors" />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            )}
            {error && <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-3 text-xs text-red-300">{error}</div>}
            <button type="submit" disabled={submitting}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white py-3.5 rounded-2xl text-xs font-black flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50 transition-all active:scale-95 disabled:opacity-50">
              {submitting ? 'Procesando...' : (<>{mode === 'signup' ? 'Crear mi tienda' : 'Iniciar sesión'}<ArrowRight size={16} /></>)}
            </button>
          </form>

          {mode === 'signup' && (
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <p className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1.5"><Sparkles size={12} className="text-emerald-400" /> Todo incluido:</p>
              {[
                'Tienda online con catálogo y carrito',
                'Pedidos directos a tu WhatsApp',
                'Código QR para compartir con clientes',
                'Múltiples métodos de pago',
              ].map((feat, i) => (
                <div key={i} className="flex items-center gap-2 text-[11px] text-slate-300">
                  <CheckCircle2 size={13} className="text-emerald-400 shrink-0" /><span>{feat}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <p className="text-center text-[10px] text-slate-500">Al continuar aceptas nuestros Términos y Política de Privacidad</p>
      </div>
    </div>
  );
}
