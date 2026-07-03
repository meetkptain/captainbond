import { supabaseAdmin } from '@/lib/supabase-admin';
import { createLogger } from '@/lib/logger';

const logger = createLogger({ route: 'coupleRealtimeService' });

export type RitualEventType =
  | 'PARTNER_ANSWERED'
  | 'PARTNER_MOOD_SET'
  | 'PARTNER_AUDIO_UPLOADED'
  | 'REVEAL_READY'
  | 'REVEAL_STARTED'
  | 'REVEAL_COMPLETED'
  | 'PLAY_AUDIO';

export interface RitualEvent {
  type: RitualEventType;
  userId: string;
  dailyQuestionId: string;
  data?: Record<string, unknown>;
}

/**
 * Diffuse un événement rituel en temps réel aux 2 partenaires du couple.
 * Utilise Supabase Realtime broadcast (latence très faible).
 */
export function broadcastRitualEvent(coupleId: string, event: RitualEvent): void {
  try {
    const channel = supabaseAdmin.channel(`couple:${coupleId}:ritual`);
    channel.send({
      type: 'broadcast',
      event: event.type,
      payload: event,
    });
  } catch (err) {
    logger.warn('Broadcast failed', { coupleId, eventType: event.type, error: err });
  }
}
