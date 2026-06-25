'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api, ApiClientError } from '@/lib/api/client';
import { Icon } from '@/components/Icon';

function LoginCard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiErrorMsg, setApiErrorMsg] = useState<string | null>(null);

  const errorParam = searchParams.get('error');
  const urlErrorMsg = errorParam === 'invalid'
    ? 'Votre session a expiré ou est invalide. Veuillez vous reconnecter.'
    : errorParam === 'config'
    ? "Erreur serveur: La variable ADMIN_PASSWORD n'est pas configurée."
    : null;

  const errorMsg = apiErrorMsg || urlErrorMsg;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;

    setLoading(true);
    setApiErrorMsg(null);

    try {
      await api.post('/api/admin/login', { password });
      // Redirect to dashboard on success
      router.push('/admin');
    } catch (err) {
      console.error(err);
      setApiErrorMsg(err instanceof ApiClientError ? err.message : "Impossible de contacter le serveur d'authentification.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <Icon name="key" style={styles.emoji} />
        <h1 style={styles.title}>KOZÉ</h1>
        <p style={styles.subtitle}>Espace d&apos;Administration</p>
      </div>

      {errorMsg && <div style={styles.errorBox}>{errorMsg}</div>}

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.inputGroup}>
          <label htmlFor="password" style={styles.label}>
            Mot de passe admin
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••••••"
            required
            style={styles.input}
          />
        </div>

        <button type="submit" disabled={loading} style={styles.btnSubmit}>
          {loading ? 'Connexion en cours...' : 'Se connecter'}
        </button>
      </form>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div style={styles.container}>
      <Suspense fallback={<div style={{ color: '#ffffff' }}>Chargement...</div>}>
        <LoginCard />
      </Suspense>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #091a11 0%, #030805 100%)',
    fontFamily: 'Inter, sans-serif',
    padding: '1rem',
  },
  card: {
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.10)',
    borderRadius: '24px',
    padding: '3rem 2rem',
    width: '100%',
    maxWidth: '420px',
    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4)',
    backdropFilter: 'blur(12px)',
    textAlign: 'center',
  },
  header: {
    marginBottom: '2rem',
  },
  emoji: {
    fontSize: '2.5rem',
    display: 'block',
    marginBottom: '0.75rem',
  },
  title: {
    fontFamily: "'Poppins', sans-serif",
    fontSize: '2rem',
    fontWeight: 800,
    color: '#ffffff',
    margin: 0,
    letterSpacing: '0.05em',
  },
  subtitle: {
    fontSize: '0.95rem',
    color: '#a1a1aa',
    margin: '0.25rem 0 0 0',
  },
  errorBox: {
    background: 'rgba(239, 68, 68, 0.15)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    color: '#ef4444',
    borderRadius: '12px',
    padding: '0.75rem 1rem',
    fontSize: '0.85rem',
    textAlign: 'left',
    lineHeight: '1.25rem',
    marginBottom: '1.5rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
    textAlign: 'left',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  label: {
    fontSize: '0.85rem',
    color: '#a1a1aa',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.02em',
  },
  input: {
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    borderRadius: '10px',
    padding: '0.75rem 1rem',
    color: '#ffffff',
    fontSize: '1rem',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  btnSubmit: {
    background: 'linear-gradient(135deg, #22c55e 0%, #15803d 100%)',
    color: '#ffffff',
    border: 'none',
    borderRadius: '10px',
    padding: '0.85rem 1rem',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'opacity 0.2s',
    boxShadow: '0 4px 15px rgba(34, 197, 94, 0.25)',
  },
};
