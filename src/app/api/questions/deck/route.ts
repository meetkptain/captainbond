import { NextResponse } from 'next/server';
import { withApiHandler } from '@/lib/api/withApiHandler';
import { requireHostAuthQuery } from '@/lib/auth/room-host';
import { getAuthenticatedPlayer } from '@/lib/auth/player-session';
import { getRoomById } from '@/lib/db/repositories';
import { listQuestionsForDeck } from '@/lib/db/repositories/roomQuestionRepository';

export const runtime = 'edge';
export const revalidate = 86400;

export const GET = withApiHandler({
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
