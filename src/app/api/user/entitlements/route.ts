import { NextResponse } from 'next/server';
import { withApiHandler } from '@/lib/api/withApiHandler';
import { getAuthenticatedUser } from '@/lib/auth/user';
import { getUserEntitlements } from '@/lib/monetization/entitlements';

export const runtime = 'edge';

export const GET = withApiHandler({
  async handler({ req }) {
    const authUser = await getAuthenticatedUser(req);
    const entitlements = await getUserEntitlements(authUser.id);
    return NextResponse.json({
      hasActivePass: entitlements?.hasActivePass ?? false,
      passExpiresAt: entitlements?.passExpiresAt ?? null,
      hasActiveSubscription: entitlements?.hasActiveSubscription ?? false,
    });
  },
});
