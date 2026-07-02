import { NextResponse } from 'next/server';
import { z } from 'zod';
import { withApiHandler } from '@/lib/api/withApiHandler';
import { getAuthenticatedUser } from '@/lib/auth/user';
import { AppError } from '@/lib/errors';
import { requireCoupleMembership } from '@/lib/auth/coupleMembership';
import { getCapsules, sealCapsule } from '@/services/timeCapsuleService';

export const runtime = 'edge';

const getQuerySchema = z.object({
  coupleId: z.string().min(1),
});

const postBodySchema = z.object({
  coupleId: z.string().min(1),
  content: z.string().min(1).max(2000),
  daysUntilUnlock: z.number().int().min(1).max(365),
});

// GET — Liste toutes les capsules du couple (débloque automatiquement les échues)
export const GET = withApiHandler({
  querySchema: getQuerySchema,
  async handler({ req, query }) {
    const authUser = await getAuthenticatedUser(req);
    const { coupleId } = query;

    await requireCoupleMembership(coupleId, authUser.id);

    const capsules = await getCapsules(coupleId);
    return NextResponse.json({ capsules });
  },
});

// POST — Créer et sceller une nouvelle capsule
export const POST = withApiHandler({
  bodySchema: postBodySchema,
  async handler({ req, body }) {
    if (!body) throw new AppError('BAD_REQUEST', 'Corps de requête manquant');
    const authUser = await getAuthenticatedUser(req);
    const { coupleId, content, daysUntilUnlock } = body;

    await requireCoupleMembership(coupleId, authUser.id);

    const capsule = await sealCapsule(coupleId, authUser.id, content, daysUntilUnlock);
    return NextResponse.json({ success: true, capsule });
  },
});
