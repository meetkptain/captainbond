import { NextResponse } from 'next/server';
import { z } from 'zod';
import { withApiHandler } from '@/lib/api/withApiHandler';
import { uuidSchema, roomCodeSchema } from '@/lib/schemas/api';
import { recordVote } from '@/services/gamePlayService';
import { getAuthenticatedPlayer } from '@/lib/auth/player-session';
import { playerActionIpLimiter } from '@/lib/rate-limit';

export const runtime = 'edge';

const voteSchema = z.object({
  roomCode: roomCodeSchema,
  questionId: uuidSchema,
  answer: z.union([z.string(), z.number(), z.boolean()]).transform(String),
});

export const POST = withApiHandler({
  bodySchema: voteSchema,
  rateLimit: playerActionIpLimiter,
  async handler({ req, body }) {
    if (!body) {
      return NextResponse.json({ error: 'Corps de requête manquant', code: 'BAD_REQUEST' }, { status: 400 });
    }
    const { playerId } = await getAuthenticatedPlayer(req);

    const result = await recordVote(playerId, body.roomCode, body.questionId, body.answer);
    return NextResponse.json({ success: true, ...result });
  },
});
