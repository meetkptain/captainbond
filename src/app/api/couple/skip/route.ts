import { NextResponse } from 'next/server';
import { z } from 'zod';
import { withApiHandler } from '@/lib/api/withApiHandler';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { getAuthenticatedCoupleUser } from '@/lib/auth/couple';
import { AppError } from '@/lib/errors';
import { dbRetry } from '@/lib/db/withRetry';
import { Couple, DailyQuestion } from '@/lib/db/types';

export const runtime = 'edge';

const bodySchema = z.object({
  coupleId: z.string().min(1),
  dailyQuestionId: z.string().min(1),
});

export const POST = withApiHandler({
  bodySchema,
  async handler({ req, body }) {
    if (!body) {
      throw new AppError('BAD_REQUEST', 'Corps de requête manquant');
    }
    const authUser = await getAuthenticatedCoupleUser(req);
    const { coupleId, dailyQuestionId } = body;

    // Verify couple membership
    const { data: couple, error: coupleError } = await dbRetry<Couple>(async () =>
      supabaseAdmin
        .from('Couple')
        .select('*')
        .eq('id', coupleId)
        .single()
    );

    if (coupleError || !couple || (couple.user1Id !== authUser.id && couple.user2Id !== authUser.id)) {
      throw new AppError('FORBIDDEN', 'Vous ne faites pas partie de ce couple.');
    }

    // Fetch the daily question
    const { data: dailyQuestion, error: dqError } = await dbRetry<DailyQuestion>(async () =>
      supabaseAdmin
        .from('DailyQuestion')
        .select('*')
        .eq('id', dailyQuestionId)
        .single()
    );

    if (dqError || !dailyQuestion) {
      throw new AppError('NOT_FOUND', 'Question quotidienne introuvable.');
    }

    if (dailyQuestion.coupleId !== coupleId) {
      throw new AppError('FORBIDDEN', 'Cette question ne correspond pas à votre couple.');
    }

    // Mark as skipped and completed
    const { data: updated, error: updateError } = await dbRetry<DailyQuestion>(async () =>
      supabaseAdmin
        .from('DailyQuestion')
        .update({
          isSkipped: true,
          isAnswered: true,
          isRevealed: true,
          user1Answered: true,
          user2Answered: true,
          revealedAt: new Date().toISOString()
        })
        .eq('id', dailyQuestionId)
        .select()
        .single()
    );

    if (updateError || !updated) {
      throw new AppError('INTERNAL_ERROR', 'Impossible de passer la question.');
    }

    return NextResponse.json({ success: true, dailyQuestion: updated });
  },
});
