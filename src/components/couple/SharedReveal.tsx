'use client';

import { useState, useEffect, useCallback } from 'react';
import { useCoupleRitualRealtime } from '@/hooks/useCoupleRitualRealtime';
import { Icon } from '@/components/Icon';

interface SharedRevealProps {
  coupleId: string;
  userId: string;
  user1Id: string;
  dailyQuestionId: string;
  partnerName: string;
  myName: string;
  onReveal: () => void;
}

/**
 * Mode de révélation synchronisé.
 * Les 2 partenaires doivent être en ligne pour lancer le countdown 3-2-1.
 * Si un seul est en ligne, fallback sur reveal classique.
 */
export function SharedReveal({
  coupleId,
  userId,
  user1Id,
  dailyQuestionId,
  partnerName,
  myName,
  onReveal,
}: SharedRevealProps) {
  const [partnerReady, setPartnerReady] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);

  const { broadcast } = useCoupleRitualRealtime({
    coupleId,
    userId,
    onPartnerAnswered: () => {},
    onRevealStarted: (dqId: string) => {
      if (dqId === dailyQuestionId) setPartnerReady(true);
    },
    onRevealCompleted: (dqId: string) => {
      if (dqId === dailyQuestionId) {
        setRevealed(true);
        onReveal();
      }
    },
  } as any);

  const handleStartReveal = useCallback(() => {
    broadcast({
      type: 'REVEAL_STARTED',
      userId,
      dailyQuestionId,
    });
    setPartnerReady(true);
  }, [broadcast, userId, dailyQuestionId]);

  // Countdown logic
  useEffect(() => {
    if (!partnerReady || countdown === null) return;

    if (countdown === 0) {
      setRevealed(true);
      broadcast({
        type: 'REVEAL_COMPLETED',
        userId,
        dailyQuestionId,
      });
      onReveal();
      return;
    }

    const timer = setTimeout(() => {
      setCountdown((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, partnerReady, broadcast, userId, dailyQuestionId, onReveal]);

  // Auto-start countdown when partner is ready
  useEffect(() => {
    if (partnerReady && countdown === null) {
      setCountdown(3);
    }
  }, [partnerReady, countdown]);

  if (revealed) {
    return null; // Le parent gère l'affichage post-révélation
  }

  if (countdown !== null) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem',
        gap: '1.5rem',
      }}>
        <div style={{
          fontSize: '5rem',
          fontWeight: 800,
          background: 'linear-gradient(135deg, #f59e0b 0%, #fb7185 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          animation: 'countdownPulse 1s ease-in-out',
        }}>
          {countdown === 0 ? '!' : countdown}
        </div>
        <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
          {countdown > 0 ? 'Préparez-vous...' : 'Révélation !'}
        </p>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '1rem',
      padding: '2rem',
    }}>
      <p style={{ color: '#cbd5e1', fontSize: '0.875rem', textAlign: 'center' }}>
        {partnerReady
          ? `${partnerName} est prêt !`
          : `Invitez ${partnerName} à être en ligne pour une révélation synchronisée.`
        }
      </p>

      {!partnerReady && (
        <button
          onClick={handleStartReveal}
          style={{
            background: 'linear-gradient(135deg, #f59e0b 0%, #fb7185 100%)',
            border: 'transparent',
            color: 'white',
            fontWeight: 600,
            padding: '0.75rem 1.5rem',
            borderRadius: '0.75rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <Icon name="sparkles" className="w-4 h-4" />
          Révéler ensemble
        </button>
      )}

      {partnerReady && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          color: '#34d399',
          fontSize: '0.8125rem',
        }}>
          <span style={{
            width: '0.5rem',
            height: '0.5rem',
            borderRadius: '50%',
            background: '#34d399',
            animation: 'pulse 1s infinite',
          }} />
          {partnerName} est prêt ! Lancement du countdown...
        </div>
      )}
    </div>
  );
}
