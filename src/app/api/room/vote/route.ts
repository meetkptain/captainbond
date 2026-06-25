import { NextResponse } from 'next/server';
import { z } from 'zod';
import { withApiHandler } from '@/lib/api/withApiHandler';
import { uuidSchema, roomCodeSchema } from '@/lib/schemas/api';
import { recordVote } from '@/services/roomGameService';
import { getAuthenticatedPlayer } from '@/lib/auth/player-session';
import { playerActionIpLimiter } from '@/lib/rate-limit';

export const runtime = 'edge';

const voteSchema = z.object({
  playerId: uuidSchema,
  roomCode: roomCodeSchema,
  questionId: uuidSchema,
  answer: z.union([z.string(), z.number(), z.boolean()]).transform(String),
});

export const POST = withApiHandler({
  bodySchema: voteSchema,
  rateLimit: playerActionIpLimiter,
  async handler({ req, body }) {
    const { playerId } = await getAuthenticatedPlayer(req, {
      playerId: body.playerId,
      roomCode: body.roomCode,
    });

    const result = await recordVote(playerId, body.roomCode, body.questionId, body.answer);
    return NextResponse.json({ success: true, ...result });
  },
});
