'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface PartnerIndicatorProps {
  coupleId: string;
  userId: string;
  partnerName: string;
}

/**
 * Indicateur temps réel de l'état de réponse du partenaire.
 * S'affiche quand l'utilisateur a répondu mais que le partenaire n'a pas encore répondu.
 */
export function PartnerIndicator({ coupleId, userId, partnerName }: PartnerIndicatorProps) {
  const [partnerAnswered, setPartnerAnswered] = useState(false);

  useEffect(() => {
    if (!coupleId || !userId) return;

    const channel = supabase
      .channel(`couple:${coupleId}:ritual`)
      .on('broadcast', { event: 'PARTNER_ANSWERED' }, (payload) => {
        const event = payload.payload as { userId: string };
        if (event.userId !== userId) {
          setPartnerAnswered(true);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [coupleId, userId]);

  if (partnerAnswered) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.5rem 1rem',
        borderRadius: '0.75rem',
        background: 'rgba(52, 211, 153, 0.08)',
        border: '1px solid rgba(52, 211, 153, 0.2)',
        fontSize: '0.8125rem',
        color: '#34d399',
        fontWeight: 500,
      }}>
        <span style={{
          width: '0.5rem',
          height: '0.5rem',
          borderRadius: '50%',
          background: '#34d399',
          animation: 'pulse 2s infinite',
        }} />
        {partnerName} a répondu
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.5rem 1rem',
      borderRadius: '0.75rem',
      background: 'rgba(255, 255, 255, 0.03)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      fontSize: '0.8125rem',
      color: '#94a3b8',
    }}>
      <span style={{
        width: '0.5rem',
        height: '0.5rem',
        borderRadius: '50%',
        background: '#64748b',
        animation: 'pulse 2s infinite',
      }} />
      En attente de {partnerName}...
    </div>
  );
}
