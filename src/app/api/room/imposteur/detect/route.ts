import { NextResponse } from 'next/server';
import { withApiHandler } from '@/lib/api/withApiHandler';
import { playerActionIpLimiter } from '@/lib/rate-limit';
import { getAuthenticatedPlayer } from '@/lib/auth/player-session';
import { getRoomByCode } from '@/lib/db/repositories';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { AppError } from '@/lib/errors';
import { z } from 'zod';
import { safeJsonParseRecord } from '@/lib/json';

const detectSchema = z.object({
  roomCode: z.string().min(4).max(4),
  playerId: z.string().uuid(),
  targetPlayerId: z.string().uuid(),
  lieIndex: z.number().int().min(0).max(2),
});

export const runtime = 'edge';

export const POST = withApiHandler({
  bodySchema: detectSchema,
  rateLimit: playerActionIpLimiter,
  async handler({ req, body }) {
    const { playerId } = await getAuthenticatedPlayer(req, { playerId: body.playerId, roomCode: body.roomCode });
    const room = await getRoomByCode(body.roomCode);
    if (!room) throw new AppError('NOT_FOUND', 'Salle introuvable');
    if (room.currentMode !== 'IMPOSTEUR') throw new AppError('BAD_REQUEST', 'Mode invalide');
    if (room.status !== 'PLAYING') throw new AppError('BAD_REQUEST', 'La manche n\'est pas en cours');
    if (playerId === body.targetPlayerId) throw new AppError('BAD_REQUEST', 'Vous ne pouvez pas voter pour vous-même');

    interface ImposteurRoundConfig {
      mode?: string;
      detectionPhase?: boolean;
      detections?: Record<string, Record<string, number>>;
    }
    const rawConfig = typeof room.roundConfig === 'string' ? room.roundConfig : JSON.stringify(room.roundConfig ?? {});
    const roundConfig = (safeJsonParseRecord(rawConfig) || {}) as ImposteurRoundConfig;

    if (roundConfig.detectionPhase !== true) {
      throw new AppError('BAD_REQUEST', 'La phase de détection n\'a pas commencé');
    }

    const detections: Record<string, Record<string, number>> = roundConfig.detections || {};
    if (!detections[body.targetPlayerId]) {
      detections[body.targetPlayerId] = {};
    }
    detections[body.targetPlayerId][playerId] = body.lieIndex;

    const { error } = await supabaseAdmin
      .from('Room')
      .update({ roundConfig: { ...roundConfig, detections } })
      .eq('id', room.id);

    if (error) throw new AppError('INTERNAL_ERROR', 'Impossible d\'enregistrer la détection', { cause: error });

    return NextResponse.json({ success: true });
  },
});
