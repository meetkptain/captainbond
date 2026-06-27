import { NextResponse } from 'next/server';
import { withApiHandler } from '@/lib/api/withApiHandler';
import { playerActionIpLimiter } from '@/lib/rate-limit';
import { getAuthenticatedPlayer } from '@/lib/auth/player-session';
import { getRoomByCode } from '@/lib/db/repositories';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { AppError } from '@/lib/errors';
import { z } from 'zod';

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
    if (!body) {
      return NextResponse.json({ error: 'Corps de requête manquant', code: 'BAD_REQUEST' }, { status: 400 });
    }
    const { playerId } = await getAuthenticatedPlayer(req, { playerId: body.playerId, roomCode: body.roomCode });
    const room = await getRoomByCode(body.roomCode);
    if (!room) throw new AppError('NOT_FOUND', 'Salle introuvable');
    if (playerId === body.targetPlayerId) throw new AppError('BAD_REQUEST', 'Vous ne pouvez pas voter pour vous-même');

    const { error } = await supabaseAdmin.rpc('record_imposteur_detection', {
      p_room_id: room.id,
      p_target_player_id: body.targetPlayerId,
      p_source_player_id: playerId,
      p_lie_index: body.lieIndex,
    });

    if (error) {
      const message = error.message || '';
      if (message.includes('Salle introuvable')) {
        throw new AppError('NOT_FOUND', 'Salle introuvable');
      }
      if (message.includes('Mode invalide') || message.includes('pas en cours') || message.includes('détection')) {
        throw new AppError('BAD_REQUEST', message);
      }
      throw new AppError('INTERNAL_ERROR', 'Impossible d\'enregistrer la détection', { cause: error });
    }

    return NextResponse.json({ success: true });
  },
});

