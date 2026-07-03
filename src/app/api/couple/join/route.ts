import { NextResponse } from 'next/server';
import { z } from 'zod';
import { withApiHandler } from '@/lib/api/withApiHandler';
import { createCouple, getCoupleByUsers } from '@/lib/db/repositories/coupleRepository';
import { getAuthenticatedUser } from '@/lib/auth/user';
import { verifyInviteToken } from '@/lib/couple/invite';
import { grantCoupleTrial } from '@/services/coupleTrialService';
import { AppError } from '@/lib/errors';

export const runtime = 'edge';

const bodySchema = z.object({
  partnerId: z.string().min(1).optional(),
  inviteToken: z.string().min(1).optional(),
});

export const POST = withApiHandler({
  bodySchema,
  async handler({ req, body }) {
    if (!body) {
      throw new AppError('BAD_REQUEST', 'Corps de requête manquant');
    }
    const authUser = await getAuthenticatedUser(req);
    const { inviteToken } = body;
    let { partnerId } = body;

    if (inviteToken) {
      const verified = await verifyInviteToken(inviteToken);
      partnerId = verified.partnerId;
    }

    if (!partnerId) {
      throw new AppError('BAD_REQUEST', 'partnerId ou inviteToken requis');
    }

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

    // Grant 7-day trial to both partners
    await Promise.all([grantCoupleTrial(authUser.id), grantCoupleTrial(partnerId)]);

    return NextResponse.json({ success: true, couple });
  },
});
