import { NextResponse } from 'next/server';
import { z } from 'zod';
import { withApiHandler } from '@/lib/api/withApiHandler';
import { createCouple, getCoupleByUsers } from '@/lib/db/repositories/coupleRepository';
import { getAuthenticatedCoupleUser } from '@/lib/auth/couple';
import { AppError } from '@/lib/errors';

export const runtime = 'edge';

const bodySchema = z.object({
  partnerId: z.string().min(1),
});

export const POST = withApiHandler({
  bodySchema,
  async handler({ req, body }) {
    if (!body) {
      throw new AppError('BAD_REQUEST', 'Corps de requête manquant');
    }
    const authUser = await getAuthenticatedCoupleUser(req);
    const { partnerId } = body;

    if (authUser.id === partnerId) {
      throw new AppError('BAD_REQUEST', 'Vous ne pouvez pas vous coupler avec vous-même.');
    }

    // Check if couple already exists
    const existing = await getCoupleByUsers(authUser.id, partnerId);
    if (existing) {
      return NextResponse.json({ success: true, couple: existing });
    }

    // Create the couple!
    const couple = await createCouple(authUser.id, partnerId);
    return NextResponse.json({ success: true, couple });
  },
});
