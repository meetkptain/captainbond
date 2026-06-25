import { NextResponse } from 'next/server';
import { withApiHandler } from '@/lib/api/withApiHandler';
import { requireHostAuthQuery } from '@/lib/auth/room-host';
import { requirePlayerAuth } from '@/lib/auth/room-player';
import { listQuestionsForDeck } from '@/lib/db/repositories';

export const runtime = 'edge';
export const revalidate = 86400;

export const GET = withApiHandler({
  async handler({ req }) {
    const hostAuth = await requireHostAuthQuery(req);
    const playerAuth = await requirePlayerAuth(req);

    const isAuthorized = !(hostAuth instanceof Response) || !(playerAuth instanceof Response);
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Authentification requise' }, { status: 401 });
    }

    const questions = await listQuestionsForDeck();
    return NextResponse.json(questions);
  },
});
