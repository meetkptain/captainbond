import { NextResponse } from 'next/server';
import { z } from 'zod';
import { withApiHandler } from '@/lib/api/withApiHandler';
import { AppError } from '@/lib/errors';
import { getAuthenticatedUser } from '@/lib/auth/user';
import { requireCoupleMembership } from '@/lib/auth/coupleMembership';
import { listAnsweredQuestionsForCouple } from '@/lib/db/repositories/dailyQuestionRepository';
import { getCoupleById } from '@/lib/db/repositories/coupleRepository';
import { getUserEntitlements } from '@/lib/monetization/entitlements';

export const runtime = 'edge';

const archiveQuerySchema = z.object({
  coupleId: z.string().min(1),
});

const FREE_ARCHIVE_DAYS = 14;

function isWithinFreeWindow(createdAt: string | null | undefined): boolean {
  if (!createdAt) return false;
  const created = new Date(createdAt).getTime();
  const now = Date.now();
  return now - created <= FREE_ARCHIVE_DAYS * 24 * 60 * 60 * 1000;
}

export const GET = withApiHandler({
  querySchema: archiveQuerySchema,
  async handler({ req, query }) {
    const authUser = await getAuthenticatedUser(req);
    const { coupleId } = query;
    await requireCoupleMembership(coupleId, authUser.id);

    const [couple, entitlements] = await Promise.all([
      getCoupleById(coupleId),
      getUserEntitlements(authUser.id),
    ]);

    if (!couple) {
      throw new AppError('NOT_FOUND', 'Couple introuvable');
    }

    const premiumActive = entitlements?.hasActivePass || entitlements?.hasActiveSubscription || false;
    const freeWindowActive = isWithinFreeWindow(couple.createdAt);

    if (!freeWindowActive && !premiumActive) {
      throw new AppError('ARCHIVE_LOCKED', 'Archive réservée aux couples premium après les 14 premiers jours', { status: 403 });
    }

    const questions = await listAnsweredQuestionsForCouple(coupleId);
    return NextResponse.json({ questions, freeWindowActive, premiumActive });
  },
});
