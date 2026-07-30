import React, { useState } from 'react';
import { Store as StoreIcon, Mail, Lock, ArrowRight, Sparkles, CheckCircle2, Eye, EyeOff, Loader2, AlertCircle, ArrowLeft, ShoppingBag, MessageCircle, QrCode, Palette } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export default function AuthScreen() {
  const { signIn, signUp, signInWithGoogle, resetPassword } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [storeName, setStoreName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);

    if (mode === 'signup') {
      if (password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres.'); return; }
      if (password !== confirmPassword) { setError('Las contraseñas no coinciden.'); return; }
      if (!storeName.trim()) { setError('Debes ingresar el nombre de tu tienda.'); return; }
    }

    setSubmitting(true);
    if (mode === 'signup') {
      const { error } = await signUp(email, password, storeName);
      if (error) {
        let msg = error;
        if (msg.includes('User already registered')) msg = 'Ya existe una cuenta con este correo.';
        else if (msg.includes('Password should be at least')) msg = 'La contraseña debe tener al menos 6 caracteres.';
        else if (msg.includes('Invalid email')) msg = 'El correo no es válido.';
        else if (msg.includes('Failed to fetch') || msg.includes('fetch')) msg = 'Error de conexión. Verifica tu internet e intenta de nuevo.';
        setError(msg);
      } else {
        setInfo('¡Cuenta creada! Ya puedes iniciar sesión.');
        setMode('login');
        setPassword('');
        setConfirmPassword('');
        setStoreName('');
      }
    } else if (mode === 'login') {
      const { error } = await signIn(email, password);
      if (error) {
        let msg = error;
        if (msg.includes('Invalid login credentials')) msg = 'Correo o contraseña incorrectos.';
        else if (msg.includes('Email not confirmed')) msg = 'Tu correo aún no ha sido confirmado. Revisa tu bandeja de entrada.';
        else if (msg.includes('Failed to fetch') || msg.includes('fetch')) msg = 'Error de conexión. Verifica tu internet e intenta de nuevo.';
        setError(msg);
      }
    } else if (mode === 'forgot') {
      if (!email.trim()) { setError('Ingresa tu correo.'); setSubmitting(false); return; }
      const { error } = await resetPassword(email);
      if (error) setError(error);
      else setInfo('Te enviamos un enlace para restablecer tu contraseña. Revisa tu correo.');
    }
    setSubmitting(false);
  };

  const handleGoogle = async () => {
    setError(null);
    setSubmitting(true);
    const { error } = await signInWithGoogle();
    if (error) setError(error);
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A1628] via-[#0F1D33] to-[#0A1628]/60 flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#1E6FFF]/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#0052CC]/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-sm space-y-5 relative z-10">
        {/* Hero / Portada */}
        <div className="text-center space-y-4 pt-4">
          <div className="w-20 h-20 mx-auto rounded-3xl overflow-hidden flex items-center justify-center shadow-2xl ring-4 ring-[#1E6FFF]/20 bg-white/5">
            <img src="/image copy.png" alt="Vendely Pro" className="w-full h-full object-contain p-1" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">Vendely Pro</h1>
            <p className="text-sm text-slate-400 mt-1">Tu tienda, directa por WhatsApp</p>
          </div>
          <div className="flex items-center justify-center gap-4 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
            <span className="flex items-center gap-1"><MessageCircle size={11} className="text-[#3B82F6]" /> Pedidos</span>
            <span className="flex items-center gap-1"><QrCode size={11} className="text-[#3B82F6]" /> QR</span>
            <span className="flex items-center gap-1"><Palette size={11} className="text-[#3B82F6]" /> Diseño</span>
          </div>
        </div>

        <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
          {mode !== 'forgot' && (
            <div className="flex bg-slate-950/60 rounded-2xl p-1 border border-slate-800">
              <button onClick={() => { setMode('signup'); setError(null); setInfo(null); }}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${mode === 'signup' ? 'bg-gradient-to-r from-[#1E6FFF] to-[#0052CC] text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}>
                Crear cuenta
              </button>
              <button onClick={() => { setMode('login'); setError(null); setInfo(null); }}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${mode === 'login' ? 'bg-gradient-to-r from-[#1E6FFF] to-[#0052CC] text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}>
                Iniciar sesión
              </button>
            </div>
          )}

          {mode === 'forgot' && (
            <div className="flex items-center gap-2 mb-1">
              <button onClick={() => { setMode('login'); setError(null); setInfo(null); }}
                className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg transition-colors">
                <ArrowLeft size={18} />
              </button>
              <h2 className="text-sm font-bold text-white">Recuperar contraseña</h2>
            </div>
          )}

          {mode !== 'forgot' && (
            <>
              <button onClick={handleGoogle} disabled={submitting}
                className="w-full bg-white hover:bg-slate-100 text-slate-800 py-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2.5 shadow-md transition-all active:scale-95 disabled:opacity-50">
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continuar con Google
              </button>
              <div className="flex items-center gap-3 py-1">
                <div className="flex-1 h-px bg-slate-800" />
                <span className="text-[10px] text-slate-500 font-bold uppercase">o</span>
                <div className="flex-1 h-px bg-slate-800" />
              </div>
            </>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === 'signup' && (
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Nombre de la tienda</label>
                <div className="relative">
                  <StoreIcon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input type="text" required value={storeName} onChange={e => setStoreName(e.target.value)} placeholder="Mi tienda"
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-3 py-3 text-xs text-white outline-none focus:border-[#1E6FFF] transition-colors" />
                </div>
              </div>
            )}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Correo electrónico</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="tucorreo@email.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-3 py-3 text-xs text-white outline-none focus:border-[#1E6FFF] transition-colors" />
              </div>
            </div>
            {mode !== 'forgot' && (
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Contraseña</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input type={showPassword ? 'text' : 'password'} required minLength={6} value={password} onChange={e => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres"
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-10 py-3 text-xs text-white outline-none focus:border-[#1E6FFF] transition-colors" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            )}
            {mode === 'signup' && (
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Confirmar contraseña</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input type={showConfirm ? 'text' : 'password'} required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Repite tu contraseña"
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-10 py-3 text-xs text-white outline-none focus:border-[#1E6FFF] transition-colors" />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            )}
            {mode === 'login' && (
              <div className="text-right">
                <button type="button" onClick={() => { setMode('forgot'); setError(null); setInfo(null); }}
                  className="text-[10px] text-[#3B82F6] hover:text-[#5B9BFF] font-bold transition-colors">
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
            )}
            {error && <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-3 text-xs text-red-300 flex items-start gap-2"><AlertCircle size={15} className="shrink-0 mt-0.5" /><span>{error}</span></div>}
            {info && <div className="bg-[#1E6FFF]/10 border border-[#1E6FFF]/30 rounded-2xl p-3 text-xs text-[#5B9BFF] flex items-start gap-2"><CheckCircle2 size={15} className="shrink-0 mt-0.5" /><span>{info}</span></div>}
            <button type="submit" disabled={submitting}
              className="w-full bg-gradient-to-r from-[#1E6FFF] to-[#0052CC] hover:from-[#2E7FFF] hover:to-[#1060DD] text-white py-3.5 rounded-2xl text-xs font-black flex items-center justify-center gap-2 shadow-lg shadow-[#1E6FFF]/30 transition-all active:scale-95 disabled:opacity-50">
              {submitting ? <Loader2 size={16} className="animate-spin" /> : (<>{mode === 'signup' ? 'Crear mi tienda' : mode === 'forgot' ? 'Enviar enlace' : 'Iniciar sesión'}<ArrowRight size={16} /></>)}
            </button>
          </form>

          {mode === 'signup' && (
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <p className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1.5"><Sparkles size={12} className="text-[#3B82F6]" /> Todo incluido:</p>
              {[
                'Tienda online con catálogo y carrito',
                'Pedidos directos a tu WhatsApp',
                'Código QR para compartir con clientes',
                'Múltiples métodos de pago',
              ].map((feat, i) => (
                <div key={i} className="flex items-center gap-2 text-[11px] text-slate-300">
                  <CheckCircle2 size={13} className="text-[#3B82F6] shrink-0" /><span>{feat}</span>
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
