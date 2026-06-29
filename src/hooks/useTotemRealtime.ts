'use client';

import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { OrbeState, FusionState } from '@/lib/db/types';

interface TotemRealtimeData {
  myOrbe: OrbeState;
  fusionState: FusionState;
  streakDays: number;
  lastRitualAt: string | null;
}

interface UseTotemRealtimeOptions {
  coupleId: string | null;
  onUpdate: (data: TotemRealtimeData) => void;
  onBroadcastMessage?: (event: string, payload: any) => void;
}

/**
 * Hook Supabase Realtime : écoute les changements de TotemState en temps réel.
 * Gère également la synchronisation par broadcast des événements tactiles légers.
 */
export function useTotemRealtime({ coupleId, onUpdate, onBroadcastMessage }: UseTotemRealtimeOptions) {
  const onUpdateRef = useRef(onUpdate);
  onUpdateRef.current = onUpdate;
  const onBroadcastRef = useRef(onBroadcastMessage);
  onBroadcastRef.current = onBroadcastMessage;
  const channelRef = useRef<any>(null);

  useEffect(() => {
    if (!coupleId) return;

    const channel = supabase
      .channel(`totem:${coupleId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'TotemState',
          filter: `coupleId=eq.${coupleId}`,
        },
        (payload) => {
          const row = payload.new as Record<string, unknown>;
          onUpdateRef.current({
            myOrbe: (row.stateA || row.stateB) as OrbeState,
            fusionState: row.fusionState as FusionState,
            streakDays: row.streakDays as number,
            lastRitualAt: row.lastRitualAt as string | null,
          });
        }
      )
      // Écoute des événements tactiles en broadcast direct (très faible latence)
      .on('broadcast', { event: 'tactile_sync' }, (payload) => {
        if (onBroadcastRef.current) {
          onBroadcastRef.current(payload.payload.event, payload.payload.data);
        }
      })
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [coupleId]);

  const sendTactileSync = useCallback((event: string, data: any) => {
    if (channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'tactile_sync',
        payload: { event, data },
      });
    }
  }, []);

  return { sendTactileSync };
}
