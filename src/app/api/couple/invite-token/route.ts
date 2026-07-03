import { NextResponse } from 'next/server';
import { z } from 'zod';
import { withApiHandler } from '@/lib/api/withApiHandler';
import { getAuthenticatedUser } from '@/lib/auth/user';
import { createInviteToken } from '@/lib/couple/invite';

export const runtime = 'edge';

const bodySchema = z.object({});

export const POST = withApiHandler({
  bodySchema,
  async handler({ req }) {
    const authUser = await getAuthenticatedUser(req);
    const token = await createInviteToken(authUser.id);
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    if (!siteUrl) {
      throw new Error('NEXT_PUBLIC_SITE_URL is not configured');
    }
    const url = `${siteUrl}/couple?inviteToken=${encodeURIComponent(token)}`;

    return NextResponse.json({ token, url });
  },
});
