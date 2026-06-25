import { NextResponse } from 'next/server';
import { z } from 'zod';
import { withApiHandler } from '@/lib/api/withApiHandler';
import { getQuestionById } from '@/lib/db/repositories';

export const runtime = 'edge';

const getQuestionQuerySchema = z.object({
  id: z.string().uuid(),
});

export const GET = withApiHandler({
  querySchema: getQuestionQuerySchema,
  async handler({ query }) {
    const question = await getQuestionById(query.id);
    if (!question) {
      return NextResponse.json({ error: 'Question introuvable' }, { status: 404 });
    }
    return NextResponse.json({ question });
  },
});
