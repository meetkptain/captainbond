import { NextResponse } from 'next/server';
import { withApiHandler } from '@/lib/api/withApiHandler';
import { requireAdminSession } from '@/lib/auth/admin';
import { generateQuestionsSchema } from '@/lib/schemas/api';
import { generateQuestions } from '@/services/questionService';
import { adminActionLimiter } from '@/lib/rate-limit';

export const runtime = 'edge';

export const POST = withApiHandler({
  bodySchema: generateQuestionsSchema,
  rateLimit: adminActionLimiter,
  async handler({ req, body }) {
    await requireAdminSession(req);
    if (!body) {
      return NextResponse.json({ error: 'Corps de requête manquant', code: 'BAD_REQUEST' }, { status: 400 });
    }
    const questions = await generateQuestions(body);
    return NextResponse.json({ success: true, questions });
  },
});
