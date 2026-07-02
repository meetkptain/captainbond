import { NextResponse } from 'next/server';
import { z } from 'zod';
import { withApiHandler } from '@/lib/api/withApiHandler';
import { coupleProtocolLimiter } from '@/lib/rate-limit';
import { getAuthenticatedUser } from '@/lib/auth/user';
import {
  processCoupleProtocol,
  type ProtocolStep,
} from '@/services/coupleProtocolService';

export const runtime = 'edge';

const bodySchema = z.object({
  coupleId: z.string().min(1),
  dailyQuestionId: z.string().min(1),
  step: z.enum(['COMPRENDRE', 'QUESTIONNER', 'AGIR', 'questions', 'action']),
});

export const POST = withApiHandler({
  bodySchema,
  rateLimit: coupleProtocolLimiter,
  async handler({ req, body }) {
    if (!body) {
      return NextResponse.json(
        { error: 'Corps de requête manquant', code: 'BAD_REQUEST' },
        { status: 400 }
      );
    }

    const authUser = await getAuthenticatedUser(req);
    const { coupleId, dailyQuestionId, step } = body;

    let normalizedStep = step.toUpperCase();
    if (normalizedStep === 'QUESTIONS') normalizedStep = 'QUESTIONNER';
    if (normalizedStep === 'ACTION') normalizedStep = 'AGIR';

    const result = await processCoupleProtocol({
      userId: authUser.id,
      coupleId,
      dailyQuestionId,
      step: normalizedStep as ProtocolStep,
    });

    return NextResponse.json(result);
  },
});
