import React, { useState } from 'react';
import { Store as StoreIcon, Mail, Lock, ArrowRight, Eye, EyeOff, Loader2, AlertCircle, ArrowLeft, CheckCircle2 } from 'lucide-react';
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
    <div className="min-h-screen flex flex-col items-center px-4 py-8 font-sans relative overflow-hidden"
      style={{ background: 'linear-gradient(to bottom, #ffffff 0%, #ffffff 20%, #387bc0 100%)' }}>
      {/* Ambient background blobs */}
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden opacity-10">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-[#075ea1] blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-0 w-[50%] h-[50%] bg-[#075ea1] blur-[120px] rounded-full" />
      </div>

      <div className="w-full max-w-md space-y-6 relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Logo */}
        <div className="flex flex-col items-center mb-2">
          <img src="/ChatGPT_Image_30_jul_2026,_12_24_41_p.m. copy copy.png" alt="VendelyPro" className="w-48 h-auto mb-3 object-contain" />
          <p className="text-lg font-medium tracking-tight text-center text-[#075ea1]">
            Tu tienda pro, directa por WhatsApp
          </p>
        </div>

        {/* Glass card */}
        <div className="rounded-3xl p-8 md:p-10 shadow-xl"
          style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.4)', boxShadow: '0 8px 32px 0 rgba(56,123,192,0.1)' }}>
          <h1 className="text-2xl font-semibold text-center text-[#0b1c30] mb-8">
            {mode === 'signup' ? 'Empieza hoy' : mode === 'forgot' ? 'Recuperar contraseña' : 'Bienvenido de nuevo'}
          </h1>

          {mode !== 'forgot' && (
            <>
              <button onClick={handleGoogle} disabled={submitting}
                className="w-full flex items-center justify-center gap-3 bg-white py-3.5 px-6 rounded-xl border border-[#c1c7d2]/50 font-medium text-sm text-[#0b1c30] transition-all hover:bg-[#f8f9ff] hover:-translate-y-0.5 hover:shadow-lg mb-8 disabled:opacity-50">
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continuar con Google
              </button>
              <div className="flex items-center gap-4 mb-8">
                <div className="h-px bg-[#c1c7d2]/30 flex-1" />
                <span className="text-[10px] uppercase tracking-widest font-bold text-[#414750]">o {mode === 'signup' ? 'regístrate con email' : 'inicia sesión'}</span>
                <div className="h-px bg-[#c1c7d2]/30 flex-1" />
              </div>
            </>
          )}

          {mode === 'forgot' && (
            <button onClick={() => { setMode('login'); setError(null); setInfo(null); }}
              className="flex items-center gap-2 mb-4 text-sm font-medium text-[#414750] hover:text-[#075ea1] transition-colors">
              <ArrowLeft size={18} /> Volver
            </button>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === 'signup' && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#414750] ml-1">Nombre de la tienda</label>
                <div className="relative rounded-xl transition-all focus-within:shadow-[0_0_0_3px_rgba(56,123,192,0.2)]">
                  <StoreIcon size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#717782]" />
                  <input type="text" required value={storeName} onChange={e => setStoreName(e.target.value)} placeholder="Ej. Mi Boutique Pro"
                    className="w-full bg-[#eff4ff] border-none py-4 pl-12 pr-4 rounded-xl text-[#0b1c30] placeholder:text-[#717782]/60 outline-none" />
                </div>
              </div>
            )}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#414750] ml-1">Correo electrónico</label>
              <div className="relative rounded-xl transition-all focus-within:shadow-[0_0_0_3px_rgba(56,123,192,0.2)]">
                <Mail size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#717782]" />
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="hola@ejemplo.com"
                  className="w-full bg-[#eff4ff] border-none py-4 pl-12 pr-4 rounded-xl text-[#0b1c30] placeholder:text-[#717782]/60 outline-none" />
              </div>
            </div>
            {mode !== 'forgot' && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#414750] ml-1">Contraseña</label>
                <div className="relative rounded-xl transition-all focus-within:shadow-[0_0_0_3px_rgba(56,123,192,0.2)]">
                  <Lock size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#717782]" />
                  <input type={showPassword ? 'text' : 'password'} required minLength={6} value={password} onChange={e => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres"
                    className="w-full bg-[#eff4ff] border-none py-4 pl-12 pr-12 rounded-xl text-[#0b1c30] placeholder:text-[#717782]/60 outline-none" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#717782] hover:text-[#075ea1] transition-colors">
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
            )}
            {mode === 'signup' && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#414750] ml-1">Confirmar contraseña</label>
                <div className="relative rounded-xl transition-all focus-within:shadow-[0_0_0_3px_rgba(56,123,192,0.2)]">
                  <Lock size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#717782]" />
                  <input type={showConfirm ? 'text' : 'password'} required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Repite tu contraseña"
                    className="w-full bg-[#eff4ff] border-none py-4 pl-12 pr-12 rounded-xl text-[#0b1c30] placeholder:text-[#717782]/60 outline-none" />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#717782] hover:text-[#075ea1] transition-colors">
                    {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
            )}
            {mode === 'login' && (
              <div className="text-right">
                <button type="button" onClick={() => { setMode('forgot'); setError(null); setInfo(null); }}
                  className="text-xs font-bold text-[#075ea1] hover:underline transition-colors">
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
            )}
            {error && <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700 flex items-start gap-2"><AlertCircle size={16} className="shrink-0 mt-0.5" /><span>{error}</span></div>}
            {info && <div className="bg-[#d2e4ff]/40 border border-[#387bc0]/30 rounded-xl p-3 text-sm text-[#075ea1] flex items-start gap-2"><CheckCircle2 size={16} className="shrink-0 mt-0.5" /><span>{info}</span></div>}
            <button type="submit" disabled={submitting}
              className="w-full bg-[#075ea1] text-white py-4 px-6 rounded-xl font-semibold text-base flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 hover:shadow-lg active:scale-95 disabled:opacity-50 mt-2">
              {submitting ? <Loader2 size={18} className="animate-spin" /> : (<>{mode === 'signup' ? 'Crear mi tienda' : mode === 'forgot' ? 'Enviar enlace' : 'Iniciar sesión'}<ArrowRight size={18} /></>)}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-[#414750]">
              {mode === 'signup' ? '¿Ya tienes una cuenta?' : '¿No tienes una cuenta?'}
              <button onClick={() => { setMode(mode === 'signup' ? 'login' : 'signup'); setError(null); setInfo(null); }}
                className="text-[#075ea1] font-bold hover:underline ml-1">
                {mode === 'signup' ? 'Iniciar sesión' : 'Crear cuenta'}
              </button>
            </p>
          </div>
        </div>

        <div className="flex justify-center gap-6 text-xs text-[#414750]/70 font-medium">
          <button className="hover:text-[#075ea1] transition-colors">Privacidad</button>
          <button className="hover:text-[#075ea1] transition-colors">Términos</button>
          <button className="hover:text-[#075ea1] transition-colors">Soporte</button>
        </div>
      </div>
    </div>
  );
}
