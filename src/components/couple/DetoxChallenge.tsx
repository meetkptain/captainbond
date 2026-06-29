'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { api } from '@/lib/api/client';

interface DetoxChallengeProps {
  coupleId: string;
}

type Phase = 'idle' | 'active' | 'interrupted' | 'completed';

interface StoredSession {
  startedAt: string;
  durationMinutes: number;
}

const DURATION_OPTIONS = [
  { label: '30 min', value: 30 },
  { label: '1 heure', value: 60 },
  { label: '2 heures', value: 120 },
];

function formatCountdown(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function DetoxChallenge({ coupleId }: DetoxChallengeProps) {
  const [phase, setPhase] = useState<Phase>('idle');
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [duration, setDuration] = useState<number>(60);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const phaseRef = useRef<Phase>('idle');

  const storageKey = `detox_${coupleId}`;

  // Keep phaseRef in sync so visibilitychange handler has fresh value
  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  // Restore persisted session on mount
  useEffect(() => {
    const stored = localStorage.getItem(storageKey);
    if (!stored) return;
    try {
      const session: StoredSession = JSON.parse(stored);
      const elapsed = Math.floor((Date.now() - new Date(session.startedAt).getTime()) / 1000);
      const totalSeconds = session.durationMinutes * 60;
      const remaining = totalSeconds - elapsed;
      if (remaining > 0) {
        setDuration(session.durationMinutes);
        setTimeLeft(remaining);
        setPhase('active');
      } else {
        // Session expired while app was closed — complete silently
        localStorage.removeItem(storageKey);
        handleComplete();
      }
    } catch {
      localStorage.removeItem(storageKey);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Countdown ticker
  useEffect(() => {
    if (phase !== 'active') {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          handleComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // Visibility change → INTERRUPT
  useEffect(() => {
    const handler = () => {
      if (document.hidden && phaseRef.current === 'active') {
        handleInterrupt();
      }
    };
    document.addEventListener('visibilitychange', handler);
    return () => document.removeEventListener('visibilitychange', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleComplete = useCallback(async () => {
    setPhase('completed');
    localStorage.removeItem(storageKey);
    try {
      await api.post('/api/couple/detox', { coupleId, action: 'COMPLETE' });
    } catch {
      // Fire-and-forget — UI already updated
    }
  }, [coupleId, storageKey]);

  const handleInterrupt = useCallback(async () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setPhase('interrupted');
    localStorage.removeItem(storageKey);
    try {
      await api.post('/api/couple/detox', { coupleId, action: 'INTERRUPT' });
    } catch {
      // silent
    }
  }, [coupleId, storageKey]);

  const handleStart = async () => {
    setError(null);
    setLoading(true);
    try {
      await api.post('/api/couple/detox', {
        coupleId,
        action: 'START',
        durationMinutes: duration,
      });
      const session: StoredSession = {
        startedAt: new Date().toISOString(),
        durationMinutes: duration,
      };
      localStorage.setItem(storageKey, JSON.stringify(session));
      setTimeLeft(duration * 60);
      setPhase('active');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur réseau');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    localStorage.removeItem(storageKey);
    setPhase('idle');
    setError(null);
    setTimeLeft(0);
  };

  // ─── Derived styles ───────────────────────────────────────────────────────

  const containerStyle: React.CSSProperties = {
    background:
      phase === 'active'
        ? 'linear-gradient(135deg, rgba(16,185,129,0.12) 0%, rgba(5,150,105,0.08) 100%)'
        : phase === 'interrupted'
        ? 'linear-gradient(135deg, rgba(239,68,68,0.12) 0%, rgba(185,28,28,0.08) 100%)'
        : phase === 'completed'
        ? 'linear-gradient(135deg, rgba(16,185,129,0.18) 0%, rgba(52,211,153,0.1) 100%)'
        : 'linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(139,92,246,0.05) 100%)',
    border:
      phase === 'active'
        ? '1px solid rgba(52,211,153,0.25)'
        : phase === 'interrupted'
        ? '1px solid rgba(239,68,68,0.25)'
        : phase === 'completed'
        ? '1px solid rgba(52,211,153,0.35)'
        : '1px solid rgba(99,102,241,0.15)',
    borderRadius: '1rem',
    padding: '1.25rem',
    backdropFilter: 'blur(12px)',
    transition: 'all 0.4s ease',
  };

  const iconStyle: React.CSSProperties = {
    fontSize: '2rem',
    display: 'block',
    textAlign: 'center',
    marginBottom: '0.5rem',
    filter:
      phase === 'interrupted'
        ? 'drop-shadow(0 0 8px rgba(239,68,68,0.6))'
        : 'drop-shadow(0 0 8px rgba(52,211,153,0.5))',
    transition: 'filter 0.3s ease',
  };

  const timerStyle: React.CSSProperties = {
    fontFamily: 'monospace',
    fontSize: '2.5rem',
    fontWeight: 700,
    color: phase === 'interrupted' ? '#f87171' : '#34d399',
    textAlign: 'center',
    letterSpacing: '0.08em',
    textShadow:
      phase === 'interrupted'
        ? '0 0 20px rgba(248,113,113,0.4)'
        : '0 0 20px rgba(52,211,153,0.4)',
    transition: 'color 0.3s ease, text-shadow 0.3s ease',
  };

  const phaseIcon =
    phase === 'interrupted' ? '💔' : phase === 'completed' ? '🌿' : '📵';

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
        <div
          style={{
            width: '2.5rem',
            height: '2.5rem',
            borderRadius: '50%',
            background:
              phase === 'interrupted'
                ? 'rgba(239,68,68,0.15)'
                : 'rgba(52,211,153,0.15)',
            border:
              phase === 'interrupted'
                ? '1px solid rgba(239,68,68,0.3)'
                : '1px solid rgba(52,211,153,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.1rem',
            flexShrink: 0,
            transition: 'all 0.3s ease',
          }}
        >
          {phaseIcon}
        </div>
        <div>
          <div
            style={{
              fontSize: '0.7rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: '#94a3b8',
            }}
          >
            Défi Digital
          </div>
          <div
            style={{
              fontSize: '0.95rem',
              fontWeight: 700,
              color: '#f1f5f9',
            }}
          >
            Dîner Sans Écran
          </div>
        </div>
      </div>

      {/* Phase: IDLE */}
      {phase === 'idle' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <p
            style={{
              fontSize: '0.85rem',
              color: '#cbd5e1',
              textAlign: 'center',
              lineHeight: 1.5,
              margin: 0,
            }}
          >
            Posez vos téléphones et connectez-vous vraiment
          </p>

          {/* Duration selector */}
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
            {DURATION_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setDuration(opt.value)}
                style={{
                  padding: '0.4rem 0.9rem',
                  borderRadius: '2rem',
                  border: duration === opt.value ? '1px solid #34d399' : '1px solid rgba(255,255,255,0.1)',
                  background: duration === opt.value ? 'rgba(52,211,153,0.15)' : 'rgba(255,255,255,0.04)',
                  color: duration === opt.value ? '#34d399' : '#94a3b8',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {error && (
            <p style={{ color: '#f87171', fontSize: '0.78rem', textAlign: 'center', margin: 0 }}>
              {error}
            </p>
          )}

          <button
            onClick={handleStart}
            disabled={loading}
            style={{
              padding: '0.7rem 1.5rem',
              borderRadius: '0.75rem',
              border: 'none',
              background: loading
                ? 'rgba(52,211,153,0.3)'
                : 'linear-gradient(135deg, #10b981, #059669)',
              color: '#fff',
              fontSize: '0.9rem',
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: loading ? 'none' : '0 4px 15px rgba(16,185,129,0.35)',
            }}
          >
            {loading ? 'Démarrage…' : '🌿 Lancer le défi'}
          </button>
        </div>
      )}

      {/* Phase: ACTIVE */}
      {phase === 'active' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
          <span style={iconStyle}>📵</span>
          <div style={timerStyle}>{formatCountdown(timeLeft)}</div>
          <p
            style={{
              fontSize: '0.82rem',
              color: '#94a3b8',
              textAlign: 'center',
              margin: 0,
              lineHeight: 1.5,
            }}
          >
            Ne touchez pas votre écran…
            <br />
            <span style={{ color: '#475569', fontSize: '0.75rem' }}>
              Changer d&apos;onglet interrompra le défi
            </span>
          </p>
          <button
            onClick={handleInterrupt}
            style={{
              padding: '0.5rem 1.2rem',
              borderRadius: '0.6rem',
              border: '1px solid rgba(239,68,68,0.3)',
              background: 'rgba(239,68,68,0.08)',
              color: '#f87171',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            Abandonner
          </button>
        </div>
      )}

      {/* Phase: INTERRUPTED */}
      {phase === 'interrupted' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'center' }}>
          <span style={{ ...iconStyle, fontSize: '2.5rem' }}>💔</span>
          <p
            style={{
              fontSize: '0.9rem',
              color: '#fca5a5',
              fontWeight: 600,
              textAlign: 'center',
              margin: 0,
            }}
          >
            Aïe ! Le Totem a perdu de la vitalité
          </p>
          <p style={{ fontSize: '0.78rem', color: '#64748b', textAlign: 'center', margin: 0 }}>
            −15% d&apos;énergie au Totem
          </p>
          <button
            onClick={handleReset}
            style={{
              padding: '0.5rem 1.2rem',
              borderRadius: '0.6rem',
              border: '1px solid rgba(99,102,241,0.3)',
              background: 'rgba(99,102,241,0.08)',
              color: '#a5b4fc',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            Réessayer
          </button>
        </div>
      )}

      {/* Phase: COMPLETED */}
      {phase === 'completed' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'center' }}>
          <span style={{ ...iconStyle, fontSize: '2.5rem' }}>🌿</span>
          <p
            style={{
              fontSize: '0.95rem',
              color: '#6ee7b7',
              fontWeight: 700,
              textAlign: 'center',
              margin: 0,
            }}
          >
            🌿 Bravo ! Totem rechargé +20% d&apos;énergie
          </p>
          <p style={{ fontSize: '0.78rem', color: '#64748b', textAlign: 'center', margin: 0 }}>
            Rituel accompli — votre lien est plus fort
          </p>
          <button
            onClick={handleReset}
            style={{
              padding: '0.5rem 1.2rem',
              borderRadius: '0.6rem',
              border: '1px solid rgba(52,211,153,0.3)',
              background: 'rgba(52,211,153,0.08)',
              color: '#34d399',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            Nouveau défi
          </button>
        </div>
      )}
    </div>
  );
}
