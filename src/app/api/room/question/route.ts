import { NextResponse } from 'next/server';
import { z } from 'zod';
import { withApiHandler } from '@/lib/api/withApiHandler';
import { uuidSchema } from '@/lib/schemas/api';
import { getActiveQuestionForPlayer } from '@/services/roomGameService';
import { getAuthenticatedPlayer } from '@/lib/auth/player-session';

export const runtime = 'edge';

const questionQuerySchema = z.object({
  roomId: uuidSchema,
});

export const GET = withApiHandler({
  querySchema: questionQuerySchema,
  async handler({ req, query }) {
    const { playerId } = await getAuthenticatedPlayer(req);

    const question = await getActiveQuestionForPlayer(query.roomId, playerId);
    return NextResponse.json({
      success: true,
      question: {
        id: question.id,
        text: question.text,
        options: question.options || [],
        category: question.category,
        difficulty: question.difficulty,
      },
    });
  },
});
