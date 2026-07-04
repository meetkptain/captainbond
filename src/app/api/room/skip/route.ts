import { NextResponse } from 'next/server';
import { withApiHandler } from '@/lib/api/withApiHandler';
import { skipQuestion } from '@/services/roomLifecycleService';
import { checkoutLimiter } from '@/lib/rate-limit';
import { getAuthenticatedPlayer } from '@/lib/auth/player-session';
import { captureServer, AnalyticsEvents } from '@/lib/analytics';
import { roomCodeSchema } from '@/lib/schemas/api';
import { z } from 'zod';

export const runtime = 'edge';

const skipSchema = z.object({
  roomCode: roomCodeSchema,
});

export const POST = withApiHandler({
  bodySchema: skipSchema,
  rateLimit: checkoutLimiter,
  async handler({ req, body }) {
    if (!body) {
      return NextResponse.json({ error: 'Corps de requête manquant', code: 'BAD_REQUEST' }, { status: 400 });
    }
    const { playerId } = await getAuthenticatedPlayer(req);
    const result = await skipQuestion(body.roomCode, playerId);

    // Track the safe word usage
    try {
      await captureServer(AnalyticsEvents.SAFE_WORD_TRIGGERED, {
        distinct_id: playerId,
        room_code: body.roomCode,
        new_question_id: result.question?.id || 'unknown',
      });
    } catch (e) {
      console.error('Failed to log safe word telemetry event:', e);
    }

    return NextResponse.json(result);
  },
});
