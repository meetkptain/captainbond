import { NextResponse } from 'next/server';
import { z } from 'zod';
import { withApiHandler } from '@/lib/api/withApiHandler';
import { getQuestionById } from '@/lib/db/repositories';
import { requireAdminSession } from '@/lib/auth/admin';
import { getPlayerSessionFromCookie } from '@/lib/auth/player-session';
import { getAuthenticatedCoupleUser } from '@/lib/auth/couple';
import { AppError } from '@/lib/errors';

export const runtime = 'edge';

const getQuestionQuerySchema = z.object({
  id: z.string().uuid(),
});

export const GET = withApiHandler({
  querySchema: getQuestionQuerySchema,
  async handler({ req, query }) {
    let isAdmin = false;
    try {
      await requireAdminSession(req);
      isAdmin = true;
    } catch {
      // not an admin
    }

    if (!isAdmin) {
      let isAuthenticatedVal = false;
      
      const playerSession = await getPlayerSessionFromCookie(req);
      if (playerSession) {
        isAuthenticatedVal = true;
      } else {
        try {
          const coupleUser = await getAuthenticatedCoupleUser(req);
          if (coupleUser) {
            isAuthenticatedVal = true;
          }
        } catch {
          // not a couple user
        }
      }

      if (!isAuthenticatedVal) {
        throw new AppError('UNAUTHORIZED', 'Session non autorisée');
      }
    }

    const question = await getQuestionById(query.id);
    if (!question) {
      return NextResponse.json({ error: 'Question introuvable' }, { status: 404 });
    }

    if (!isAdmin) {
      const safeQuestion = { ...question } as Partial<typeof question>;
      delete safeQuestion.correctAnswer;
      delete safeQuestion.explanation;
      delete safeQuestion.metadata;
      return NextResponse.json({ question: safeQuestion });
    }

    return NextResponse.json({ question });
  },
});
