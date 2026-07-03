import { NextResponse } from 'next/server';
import { z } from 'zod';
import { withApiHandler } from '@/lib/api/withApiHandler';
import { getAuthenticatedUser } from '@/lib/auth/user';
import { requireCoupleMembership } from '@/lib/auth/coupleMembership';
import { listAnsweredQuestionsForCouple } from '@/lib/db/repositories/dailyQuestionRepository';

export const runtime = 'edge';

const archiveQuerySchema = z.object({
  coupleId: z.string().min(1),
});

export const GET = withApiHandler({
  querySchema: archiveQuerySchema,
  async handler({ req, query }) {
    const authUser = await getAuthenticatedUser(req);
    const { coupleId } = query;
    await requireCoupleMembership(coupleId, authUser.id);
    const questions = await listAnsweredQuestionsForCouple(coupleId);
    return NextResponse.json({ questions });
  },
});
