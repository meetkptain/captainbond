import { NextResponse } from 'next/server';
import { z } from 'zod';
import { withApiHandler } from '@/lib/api/withApiHandler';
import { AppError } from '@/lib/errors';
import { getAuthenticatedUser } from '@/lib/auth/user';
import { upsertPushSubscription } from '@/lib/db/repositories/pushSubscriptionRepository';

export const runtime = 'edge';

const bodySchema = z.object({
  endpoint: z.string().min(1),
  keys: z.object({
    p256dh: z.string().min(1),
    auth: z.string().min(1),
  }),
  timezone: z.string().min(1),
});

export const POST = withApiHandler({
  bodySchema,
  async handler({ req, body }) {
    if (!body) {
      throw new AppError('BAD_REQUEST', 'Corps de requête manquant');
    }
    const authUser = await getAuthenticatedUser(req);

    await upsertPushSubscription(
      authUser.id,
      body.endpoint,
      body.keys,
      body.timezone
    );

    return NextResponse.json({ success: true });
  },
});
