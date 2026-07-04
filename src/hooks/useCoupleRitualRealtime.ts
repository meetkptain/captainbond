'use client';

import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { RitualEvent } from '@/services/coupleRealtimeService';

interface UseCoupleRitualRealtimeOptions {
  coupleId: string | null;
  userId: string | null;
  onEvent?: (event: RitualEvent) => void;
  onPartnerAnswered?: (dailyQuestionId: string) => void;
  onRevealReady?: (dailyQuestionId: string) => void;
  onRevealStarted?: (dailyQuestionId: string) => void;
  onRevealCompleted?: (dailyQuestionId: string) => void;
}

/**
 * Hook Supabase Realtime : écoute les événements rituel du couple en temps réel.
 * Indicateur de réponse du partenaire, synchronisation révélation, etc.
 */
export function useCoupleRitualRealtime({
  coupleId,
  userId,
  onEvent,
  onPartnerAnswered,
  onRevealReady,
  onRevealStarted,
  onRevealCompleted,
}: UseCoupleRitualRealtimeOptions) {
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;
  const onPartnerAnsweredRef = useRef(onPartnerAnswered);
  onPartnerAnsweredRef.current = onPartnerAnswered;
  const onRevealReadyRef = useRef(onRevealReady);
  onRevealReadyRef.current = onRevealReady;
  const onRevealStartedRef = useRef(onRevealStarted);
  onRevealStartedRef.current = onRevealStarted;
  const onRevealCompletedRef = useRef(onRevealCompleted);
  onRevealCompletedRef.current = onRevealCompleted;
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    if (!coupleId || !userId) return;

    const channel = supabase
      .channel(`couple:${coupleId}:ritual`)
      .on('broadcast', { event: '*' }, (payload) => {
        const event = payload.payload as RitualEvent;
        if (!event || event.userId === userId) return; // Ignorer ses propres événements

        onEventRef.current?.(event);

        switch (event.type) {
          case 'PARTNER_ANSWERED':
            onPartnerAnsweredRef.current?.(event.dailyQuestionId);
            break;
          case 'REVEAL_READY':
            onRevealReadyRef.current?.(event.dailyQuestionId);
            break;
          case 'REVEAL_STARTED':
            onRevealStartedRef.current?.(event.dailyQuestionId);
            break;
          case 'REVEAL_COMPLETED':
            onRevealCompletedRef.current?.(event.dailyQuestionId);
            break;
        }
      })
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [coupleId, userId]);

  const broadcast = useCallback((event: RitualEvent) => {
    if (channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: event.type,
        payload: event,
      });
    }
  }, []);

  return { broadcast };
}
