import { NextResponse } from 'next/server';
import { withApiHandler } from '@/lib/api/withApiHandler';
import { skipQuestion } from '@/services/roomGameService';
import { checkoutLimiter } from '@/lib/rate-limit';
import { requirePlayerSessionFor } from '@/lib/auth/player-session';
import { captureServer, AnalyticsEvents } from '@/lib/analytics';
import { z } from 'zod';

export const runtime = 'edge';

const skipSchema = z.object({
  playerId: z.string().min(1, 'ID joueur requis'),
  roomCode: z.string().min(1, 'Code salle requis'),
});

export const POST = withApiHandler({
  bodySchema: skipSchema,
  rateLimit: checkoutLimiter,
  async handler({ req, body }) {
    if (!body) {
      return NextResponse.json({ error: 'Corps de requête manquant', code: 'BAD_REQUEST' }, { status: 400 });
    }
    await requirePlayerSessionFor(req, body.playerId, body.roomCode);
    const result = await skipQuestion(body.roomCode, body.playerId);

    // Track the safe word usage
    try {
      await captureServer(AnalyticsEvents.SAFE_WORD_TRIGGERED, {
        distinct_id: body.playerId,
        room_code: body.roomCode,
        new_question_id: result.question?.id || 'unknown',
      });
    } catch (e) {
      console.error('Failed to log safe word telemetry event:', e);
    }

    return NextResponse.json(result);
  },
});
