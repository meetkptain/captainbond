import { NextResponse } from 'next/server';
import { z } from 'zod';
import { withApiHandler } from '@/lib/api/withApiHandler';
import { updateDJQuestionFeedback } from '@/services/dj-ia/djEngine';

export const runtime = 'edge';

const djFeedbackSchema = z.object({
  questionId: z.string().cuid(),
  status: z.enum(['ACCEPTED', 'REJECTED']),
  feedback: z.string().optional(),
});

export const POST = withApiHandler({
  bodySchema: djFeedbackSchema,
  async handler({ body }) {
    if (!body) {
      return NextResponse.json({ error: 'Corps de requête manquant', code: 'BAD_REQUEST' }, { status: 400 });
    }
    await updateDJQuestionFeedback(body.questionId, body.status, body.feedback);
    return NextResponse.json({ success: true });
  },
});
