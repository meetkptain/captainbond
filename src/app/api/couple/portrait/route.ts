import { NextResponse } from 'next/server';
import { z } from 'zod';
import { withApiHandler } from '@/lib/api/withApiHandler';
import { AppError } from '@/lib/errors';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { createLogger } from '@/lib/logger';
import { dbRetry } from '@/lib/db/withRetry';

import { getAuthenticatedCoupleUser } from '@/lib/auth/couple';
import { Couple, DailyQuestion, CouplePortrait } from '@/lib/db/types';

export const runtime = 'edge';

const querySchema = z.object({
  coupleId: z.string().optional(),
  userId: z.string().optional(),
  list: z.string().optional(),
});

export const GET = withApiHandler({
  querySchema,
  async handler({ req, query }) {
    const logger = createLogger({ route: '/api/couple/portrait' });
    const authUser = await getAuthenticatedCoupleUser(req);
    const { coupleId, list } = query;

    if (list === 'true') {
      const { data: couples, error: coupleError } = await dbRetry<Couple[]>(async () =>
        supabaseAdmin
          .from('Couple')
          .select('*')
          .or(`user1Id.eq.${authUser.id},user2Id.eq.${authUser.id}`)
      );
      if (coupleError) {
        logger.error('Échec du chargement des couples', { userId: authUser.id }, coupleError);
        throw new AppError('INTERNAL_ERROR', 'Impossible de charger la liste des couples.');
      }
      return NextResponse.json(couples || []);
    }

    if (!coupleId) {
      throw new AppError('BAD_REQUEST', 'coupleId est requis.');
    }

    // 1. Fetch the Couple
    const { data: couple, error: coupleError } = await dbRetry<Couple>(async () =>
      supabaseAdmin
        .from('Couple')
        .select('*')
        .eq('id', coupleId)
        .single()
    );

    if (coupleError || !couple) {
      throw new AppError('COUPLE_NOT_FOUND', 'Couple introuvable.');
    }

    if (couple.user1Id !== authUser.id && couple.user2Id !== authUser.id) {
      throw new AppError('FORBIDDEN', 'Vous ne faites pas partie de ce couple.');
    }

    // 2. Fetch all DailyQuestions for this couple, ordered by releasedAt DESC
    const { data: dailyQuestions, error: dqError } = await dbRetry<DailyQuestion[]>(async () =>
      supabaseAdmin
        .from('DailyQuestion')
        .select('*')
        .eq('coupleId', coupleId)
        .order('releasedAt', { ascending: false })
    );

    if (dqError) {
      logger.error('Échec du chargement des questions quotidiennes', { coupleId }, dqError);
      throw new AppError('INTERNAL_ERROR', 'Impossible de charger les questions quotidiennes.');
    }

    const questions = dailyQuestions ?? [];

    // 3. Check if any questions are ready to reveal (COMPUTED + current hour >= 20)
    const now = new Date();
    const currentHour = now.getUTCHours();
    // Adjust for Paris timezone (UTC+1 in winter, UTC+2 in summer)
    // Use a conservative approach: check if local hour could be >= 20
    const parisOffset = getParisUtcOffset(now);
    const parisHour = (currentHour + parisOffset) % 24;

    const questionsToReveal = questions.filter(
      (q: { analysisStatus: string; isRevealed: boolean }) =>
        q.analysisStatus === 'COMPUTED' && !q.isRevealed && parisHour >= 20
    );

    if (questionsToReveal.length > 0) {
      const idsToReveal = questionsToReveal.map((q: { id: string }) => q.id);

      const { error: revealError } = await dbRetry<DailyQuestion>(async () =>
        supabaseAdmin
          .from('DailyQuestion')
          .update({
            isRevealed: true,
            analysisStatus: 'REVEALED',
            revealedAt: now.toISOString(),
          })
          .in('id', idsToReveal)
      );

      if (revealError) {
        logger.warn('Échec de la révélation automatique', { idsToReveal }, revealError);
      } else {
        // Update local data to reflect reveal
        for (const q of questions) {
          if (idsToReveal.includes(q.id)) {
            q.isRevealed = true;
            q.analysisStatus = 'REVEALED';
            q.revealedAt = now.toISOString();
          }
        }
        logger.info('Questions révélées automatiquement', { count: idsToReveal.length });
      }
    }

    // 4. Fetch CouplePortraits ordered by month DESC
    const { data: portraits, error: portraitError } = await dbRetry<CouplePortrait[]>(async () =>
      supabaseAdmin
        .from('CouplePortrait')
        .select('*')
        .eq('coupleId', coupleId)
        .order('month', { ascending: false })
    );

    if (portraitError) {
      logger.warn('Échec du chargement des portraits', {coupleId}, portraitError);
    }

    // 5. Return aggregated data
    return NextResponse.json({
      couple,
      dailyQuestions: questions,
      portraits: portraits ?? [],
    });
  },
});


/**
 * Returns the UTC offset for Paris timezone (handles CET/CEST).
 * CET = UTC+1 (last Sunday of October → last Sunday of March)
 * CEST = UTC+2 (last Sunday of March → last Sunday of October)
 */
function getParisUtcOffset(date: Date): number {
  const year = date.getUTCFullYear();

  // Last Sunday of March (start of CEST)
  const marchLast = new Date(Date.UTC(year, 2, 31));
  marchLast.setUTCDate(31 - marchLast.getUTCDay());
  marchLast.setUTCHours(1, 0, 0, 0); // transition at 01:00 UTC

  // Last Sunday of October (end of CEST)
  const octoberLast = new Date(Date.UTC(year, 9, 31));
  octoberLast.setUTCDate(31 - octoberLast.getUTCDay());
  octoberLast.setUTCHours(1, 0, 0, 0); // transition at 01:00 UTC

  if (date.getTime() >= marchLast.getTime() && date.getTime() < octoberLast.getTime()) {
    return 2; // CEST (summer)
  }
  return 1; // CET (winter)
}
