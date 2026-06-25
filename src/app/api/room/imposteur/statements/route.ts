import { NextResponse } from 'next/server';
import { withApiHandler } from '@/lib/api/withApiHandler';
import { playerActionIpLimiter } from '@/lib/rate-limit';
import { getAuthenticatedPlayer } from '@/lib/auth/player-session';
import { getRoomByCode, getPlayersInRoom } from '@/lib/db/repositories';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { safeJsonParse } from '@/lib/json';
import { AppError } from '@/lib/errors';
import { z } from 'zod';

const querySchema = z.object({
  roomCode: z.string().min(4).max(4),
  playerId: z.string().uuid(),
});

export const runtime = 'edge';

export const GET = withApiHandler({
  querySchema,
  rateLimit: playerActionIpLimiter,
  async handler({ req, query }) {
    const { playerId } = await getAuthenticatedPlayer(req, { playerId: query.playerId, roomCode: query.roomCode });
    const room = await getRoomByCode(query.roomCode);
    if (!room) throw new AppError('NOT_FOUND', 'Salle introuvable');
    if (room.currentMode !== 'IMPOSTEUR') throw new AppError('BAD_REQUEST', 'Mode invalide');

    const [{ data: responses, error }, players] = await Promise.all([
      supabaseAdmin
        .from('Response')
        .select('playerId, answer')
        .eq('roomId', room.id)
        .eq('questionId', room.currentQuestionId ?? ''),
      getPlayersInRoom(room.id),
    ]);

    if (error) throw new AppError('INTERNAL_ERROR', 'Impossible de charger les réponses', { cause: error });

    interface PublicStatement {
      playerId: string;
      name: string;
      statements: string[];
    }

    const playerMap = new Map(players.map((p) => [p.id, p.name]));
    const result: PublicStatement[] = [];
    for (const r of responses || []) {
      if (r.playerId === playerId) continue;
      const parsed = safeJsonParse<{ text: string; isLie: boolean }[]>(r.answer as string, []);
      if (!Array.isArray(parsed) || parsed.length !== 3) continue;
      result.push({
        playerId: r.playerId,
        name: playerMap.get(r.playerId) || 'Inconnu',
        statements: parsed.map((s) => s.text),
      });
    }

    return NextResponse.json({ statements: result });
  },
});
