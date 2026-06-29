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

const FALLBACK_QUESTIONS = [
  "Quel est le plus grand point commun inattendu entre vous deux ?",
  "Quelle petite attention du quotidien chez ton partenaire te touche le plus ?",
  "Quelle habitude de l'autre as-tu fini par adopter avec le temps ?",
  "Si votre couple était un genre de film ou une chanson, lequel serait-ce et pourquoi ?",
  "Quel voyage ou projet aimeriez-vous réaliser ensemble dans les 12 prochains mois ?"
];

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

    // Verify it belongs to the couple and has not been answered by either partner yet
    if (dailyQuestion.coupleId !== coupleId) {
      throw new AppError('FORBIDDEN', 'Cette question ne correspond pas à votre couple.');
    }

    if (dailyQuestion.user1Answered || dailyQuestion.user2Answered || dailyQuestion.isAnswered) {
      throw new AppError('BAD_REQUEST', 'Impossible de passer une question déjà commencée ou répondue.');
    }

    // Select a random question from the database
    const { data: dbQuestions } = await dbRetry<any[]>(async () =>
      supabaseAdmin
        .from('Question')
        .select('id, text')
        .contains('audiences', ['couple'])
        .limit(30)
    );

    let newQuestionText = '';
    let newQuestionId: string | null = null;

    if (dbQuestions && dbQuestions.length > 0) {
      // Avoid choosing the same question if possible
      const filtered = dbQuestions.filter(q => q.id !== dailyQuestion.questionId);
      const chosen = filtered.length > 0
        ? filtered[Math.floor(Math.random() * filtered.length)]
        : dbQuestions[0];
      newQuestionText = chosen.text;
      newQuestionId = chosen.id;
    } else {
      // Pick from fallback array
      newQuestionText = FALLBACK_QUESTIONS[Math.floor(Math.random() * FALLBACK_QUESTIONS.length)];
    }

    // Update DailyQuestion table
    const { data: updated, error: updateError } = await dbRetry<DailyQuestion>(async () =>
      supabaseAdmin
        .from('DailyQuestion')
        .update({
          questionId: newQuestionId,
          customText: newQuestionText,
          releasedAt: new Date().toISOString() // Refresh release time
        })
        .eq('id', dailyQuestionId)
        .select()
        .single()
    );

    if (updateError || !updated) {
      throw new AppError('INTERNAL_ERROR', 'Impossible de remplacer la question.');
    }

    return NextResponse.json({ success: true, dailyQuestion: updated });
  },
});
