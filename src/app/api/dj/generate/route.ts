import { NextResponse } from 'next/server';
import { z } from 'zod';
import { withApiHandler } from '@/lib/api/withApiHandler';
import { generateDJQuestion } from '@/services/dj-ia/djEngine';

export const runtime = 'edge';

const generateDJQuestionSchema = z.object({
  profileId: z.string().cuid(),
});

export const POST = withApiHandler({
  bodySchema: generateDJQuestionSchema,
  async handler({ body }) {
    const questionText = await generateDJQuestion(body.profileId);
    return NextResponse.json({ success: true, question: questionText });
  },
});
