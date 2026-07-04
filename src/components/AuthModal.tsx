'use client';

import { useState } from 'react';
import { Icon } from '@/components/Icon';
import { signInWithOtp } from '@/lib/supabase-auth';
import { supabase } from '@/lib/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthenticated?: (email: string) => void;
}

const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
  </svg>
);

const AppleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C3.79 16.3 3.12 9.4 6.7 9.17c1.78.11 2.76 1.12 3.73 1.12 1 0 2.22-1.22 4.41-1.02 1.83.17 3.2 1 3.96 2.4-3.72 2.21-3.12 7.02.72 8.61zM14.97 6.4c1.1-1.4 1.05-2.76.92-3.4 0 0-1.12.06-2.3 1.25-1.09 1.1-1.12 2.5-.96 3.3.1.1 1.22-.05 2.34-1.15z" />
  </svg>
);

export function AuthModal({ isOpen, onClose, onAuthenticated }: AuthModalProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await signInWithOtp(email);
    setLoading(false);

    if (result.success) {
      setSent(true);
      onAuthenticated?.(email);
    } else {
      setError(result.error || 'Erreur lors de l\'envoi du lien');
    }
  };

  const handleOAuthLogin = async (provider: 'google' | 'apple') => {
    setLoading(true);
    setError(null);
    try {
      const nextParam = typeof window !== 'undefined' ? encodeURIComponent(window.location.pathname) : '/';
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${nextParam}`,
        },
      });
      if (error) {
        setError(error.message);
        setLoading(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="glass-panel p-8 w-full max-w-md border-neon-purple/20 shadow-[0_0_50px_rgba(139,92,246,0.15)] relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 className="text-2xl font-black text-white mb-2">Sauvegarder mes achats</h2>
        <p className="text-slate-400 text-sm mb-6 leading-relaxed">
          Connectez-vous pour retrouver vos Pass, Dossiers et abonnements sur tous vos appareils.
        </p>

        {sent ? (
          <div className="text-center py-4">
            <div className="flex justify-center mb-4">
              <Icon name="mail" className="w-14 h-14 text-white/80" />
            </div>
            <p className="text-green-400 font-bold mb-2 text-lg">Lien magique envoyé !</p>
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
              Cliquez sur le lien dans l&apos;email <strong className="text-slate-200">{email}</strong> pour valider votre compte.
            </p>
            <button onClick={onClose} className="cb-btn-secondary w-full py-3.5">
              Fermer
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Social Logins */}
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={() => handleOAuthLogin('google')}
                disabled={loading}
                className="w-full py-3.5 px-4 bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm rounded-xl transition-all cursor-pointer shadow-md flex items-center justify-center gap-2.5 active:scale-[0.98]"
              >
                <GoogleIcon />
                <span>Continuer avec Google</span>
              </button>

              <button
                type="button"
                onClick={() => handleOAuthLogin('apple')}
                disabled={loading}
                className="w-full py-3.5 px-4 bg-slate-950 hover:bg-black text-white border border-slate-800 font-bold text-sm rounded-xl transition-all cursor-pointer shadow-md flex items-center justify-center gap-2.5 active:scale-[0.98]"
              >
                <AppleIcon />
                <span>Continuer avec Apple</span>
              </button>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="h-px bg-slate-800 flex-1"></div>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono">ou par email</span>
              <div className="h-px bg-slate-800 flex-1"></div>
            </div>

            {/* Email Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-slate-400 text-xs font-mono uppercase mb-2">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vous@exemple.com"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-slate-600 focus:outline-none focus:border-neon-purple focus:ring-1 focus:ring-neon-purple/30 text-sm"
                  disabled={loading}
                />
              </div>

              {error && (
                <p className="text-red-400 text-sm font-medium text-center bg-red-400/10 border border-red-400/20 rounded-xl p-2.5">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="cb-btn-primary w-full py-4 text-base font-bold shadow-[0_0_20px_rgba(139,92,246,0.2)]"
              >
                {loading ? 'Envoi en cours...' : 'Recevoir mon lien magique'}
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full text-slate-500 text-xs hover:text-white transition-colors py-1.5"
              >
                Plus tard
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
