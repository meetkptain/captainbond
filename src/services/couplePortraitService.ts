import { Couple, CouplePortrait, DailyQuestion, TimeCapsule, TotemState } from '@/lib/db/types';
import { AppError } from '@/lib/errors';
import { createLogger, Logger } from '@/lib/logger';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { dbRetry, withRetry } from '@/lib/db/withRetry';
import { Entitlements, getUserEntitlements } from '@/lib/monetization/entitlements';
import { getLocalHour, PARIS_TZ } from '@/lib/time';
import { getTotem } from '@/services/totemService';
import { getCoupleById, listCouplesForUser } from '@/lib/db/repositories/coupleRepository';
import { listDailyQuestions } from '@/lib/db/repositories/dailyQuestionRepository';
import { listPortraits } from '@/lib/db/repositories/couplePortraitRepository';
import { listTimeCapsules } from '@/lib/db/repositories/timeCapsuleRepository';

export async function listCouplesForPortraitUser(userId: string): Promise<Couple[]> {
  return withRetry(() => listCouplesForUser(userId));
}

export interface CouplePortraitData {
  couple: Couple;
  dailyQuestions: DailyQuestion[];
  portraits: CouplePortrait[];
  entitlements: Entitlements | null;
  totemState: TotemState | null;
  timeCapsules: TimeCapsule[];
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

  let timeCapsules: TimeCapsule[] = [];
  try {
    timeCapsules = await withRetry(() => listTimeCapsules(coupleId));
  } catch (e) {
    logger.warn('Failed to load TimeCapsules', { coupleId }, e);
  }

  return {
    couple,
    dailyQuestions: updatedQuestions,
    portraits,
    entitlements,
    totemState,
    timeCapsules,
  };
}

async function revealComputedDailyQuestions(
  questions: DailyQuestion[],
  couple: Couple,
  requestTimezone?: string,
  logger?: Logger
): Promise<DailyQuestion[]> {
  const timezone =
    couple.timezone ||
    (requestTimezone && Intl.supportedValuesOf('timeZone').includes(requestTimezone)
      ? requestTimezone
      : PARIS_TZ);
  const localHour = getLocalHour(new Date(), timezone);
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


