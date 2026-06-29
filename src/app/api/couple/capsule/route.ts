import { NextResponse } from 'next/server';
import { z } from 'zod';
import { withApiHandler } from '@/lib/api/withApiHandler';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { getAuthenticatedCoupleUser } from '@/lib/auth/couple';
import { AppError } from '@/lib/errors';
import { dbRetry } from '@/lib/db/withRetry';
import { Couple } from '@/lib/db/types';
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
    const authUser = await getAuthenticatedCoupleUser(req);
    const { coupleId } = query;

    const { data: couple, error: coupleError } = await dbRetry<Couple>(async () =>
      supabaseAdmin.from('Couple').select('*').eq('id', coupleId).single()
    );
    if (coupleError || !couple || (couple.user1Id !== authUser.id && couple.user2Id !== authUser.id)) {
      throw new AppError('FORBIDDEN', 'Vous ne faites pas partie de ce couple.');
    }

    const capsules = await getCapsules(coupleId);
    return NextResponse.json({ capsules });
  },
});

// POST — Créer et sceller une nouvelle capsule
export const POST = withApiHandler({
  bodySchema: postBodySchema,
  async handler({ req, body }) {
    if (!body) throw new AppError('BAD_REQUEST', 'Corps de requête manquant');
    const authUser = await getAuthenticatedCoupleUser(req);
    const { coupleId, content, daysUntilUnlock } = body;

    const { data: couple, error: coupleError } = await dbRetry<Couple>(async () =>
      supabaseAdmin.from('Couple').select('*').eq('id', coupleId).single()
    );
    if (coupleError || !couple || (couple.user1Id !== authUser.id && couple.user2Id !== authUser.id)) {
      throw new AppError('FORBIDDEN', 'Vous ne faites pas partie de ce couple.');
    }

    const capsule = await sealCapsule(coupleId, authUser.id, content, daysUntilUnlock);
    return NextResponse.json({ success: true, capsule });
  },
});
