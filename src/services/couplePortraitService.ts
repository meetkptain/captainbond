import { Couple, CouplePortrait, DailyQuestion, TotemState } from '@/lib/db/types';
import { AppError } from '@/lib/errors';
import { createLogger, Logger } from '@/lib/logger';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { dbRetry, withRetry } from '@/lib/db/withRetry';
import { Entitlements, getUserEntitlements } from '@/lib/monetization/entitlements';
import { getTotem } from '@/services/totemService';
import { getCoupleById, listCouplesForUser } from '@/lib/db/repositories/coupleRepository';
import { listDailyQuestions } from '@/lib/db/repositories/dailyQuestionRepository';
import { listPortraits } from '@/lib/db/repositories/couplePortraitRepository';

export async function listCouplesForPortraitUser(userId: string): Promise<Couple[]> {
  return withRetry(() => listCouplesForUser(userId));
}

export interface CouplePortraitData {
  couple: Couple;
  dailyQuestions: DailyQuestion[];
  portraits: CouplePortrait[];
  entitlements: Entitlements | null;
  totemState: TotemState | null;
}

export async function getCouplePortraitData(
  coupleId: string,
  userId: string,
  requestTimezone?: string
): Promise<CouplePortraitData> {
  const logger = createLogger({ service: 'couplePortraitService', coupleId });

  const couple = await withRetry(() => getCoupleById(coupleId));
  if (!couple) {
    throw new AppError('COUPLE_NOT_FOUND', 'Couple introuvable.');
  }
  if (couple.user1Id !== userId && couple.user2Id !== userId) {
    throw new AppError('FORBIDDEN', 'Vous ne faites pas partie de ce couple.');
  }

  const dailyQuestions = await withRetry(() => listDailyQuestions(coupleId));
  const revealedQuestions = await revealComputedDailyQuestions(
    dailyQuestions,
    couple,
    requestTimezone,
    logger
  );

  const revealedIds = new Set(revealedQuestions.map((q) => q.id));
  const nowIso = new Date().toISOString();
  const updatedQuestions = dailyQuestions.map((q) =>
    revealedIds.has(q.id)
      ? { ...q, isRevealed: true, analysisStatus: 'REVEALED' as const, revealedAt: nowIso }
      : q
  );

  let portraits: CouplePortrait[] = [];
  try {
    portraits = await withRetry(() => listPortraits(coupleId));
  } catch (e) {
    logger.warn('Échec du chargement des portraits', { coupleId }, e);
  }

  const entitlements = await getUserEntitlements(userId);

  let totemState: TotemState | null = null;
  try {
    totemState = await withRetry(() => getTotem(coupleId));
  } catch (e) {
    logger.warn('Failed to load TotemState', { coupleId }, e);
  }

  return {
    couple,
    dailyQuestions: updatedQuestions,
    portraits,
    entitlements,
    totemState,
  };
}

async function revealComputedDailyQuestions(
  questions: DailyQuestion[],
  couple: Couple,
  requestTimezone?: string,
  logger?: Logger
): Promise<DailyQuestion[]> {
  const localHour = getLocalHour(couple.timezone, requestTimezone);
  if (localHour < 20) return [];

  const idsToReveal = questions
    .filter((q) => q.analysisStatus === 'COMPUTED' && !q.isRevealed)
    .map((q) => q.id);

  if (idsToReveal.length === 0) return [];

  const nowIso = new Date().toISOString();

  try {
    const { data: updated, error: revealError } = await dbRetry<DailyQuestion[]>(async () =>
      supabaseAdmin
        .from('DailyQuestion')
        .update({
          isRevealed: true,
          analysisStatus: 'REVEALED',
          revealedAt: nowIso,
        })
        .in('id', idsToReveal)
        .select()
    );

    if (revealError) {
      logger?.warn('Échec de la révélation automatique', { idsToReveal }, revealError);
      return [];
    }

    logger?.info('Questions révélées automatiquement', { count: idsToReveal.length });
    return updated ?? [];
  } catch (e) {
    logger?.warn('Échec de la révélation automatique', { idsToReveal }, e);
    return [];
  }
}

function getLocalHour(coupleTimezone?: string | null, requestTimezone?: string): number {
  const now = new Date();

  try {
    const targetTimezone =
      coupleTimezone ||
      (requestTimezone && Intl.supportedValuesOf('timeZone').includes(requestTimezone)
        ? requestTimezone
        : 'Europe/Paris');

    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: targetTimezone,
      hour: 'numeric',
      hour12: false,
    });
    return parseInt(formatter.format(now), 10);
  } catch {
    const currentHour = now.getUTCHours();
    const parisOffset = getParisUtcOffset(now);
    return (currentHour + parisOffset) % 24;
  }
}

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
