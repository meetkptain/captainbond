import { NextResponse } from 'next/server';
import { z } from 'zod';
import { withApiHandler } from '@/lib/api/withApiHandler';
import { requireHostAuthQuery } from '@/lib/auth/room-host';
import { getAuthenticatedPlayer } from '@/lib/auth/player-session';
import { getRoomById } from '@/lib/db/repositories';
import { listQuestionsForDeck } from '@/lib/db/repositories/roomQuestionRepository';

export const runtime = 'edge';
export const revalidate = 86400;

// Host auth is passed as optional query params; when absent the route falls
// back to the player session cookie. Params are therefore optional but, when
// present, must be non-empty strings.
const deckQuerySchema = z.object({
  roomCode: z.string().min(1).optional(),
  hostId: z.string().min(1).optional(),
  hostToken: z.string().min(1).optional(),
});

export const GET = withApiHandler({
  querySchema: deckQuerySchema,
  async handler({ req }) {
    const hostAuth = await requireHostAuthQuery(req);
    if (!(hostAuth instanceof Response)) {
      const questions = await listQuestionsForDeck(hostAuth.room.language || 'fr');
      return NextResponse.json(questions);
    }

    const playerAuth = await getAuthenticatedPlayer(req);
    const room = await getRoomById(playerAuth.roomId);
    const questions = await listQuestionsForDeck(room?.language || 'fr');
    return NextResponse.json(questions);
  },
});
