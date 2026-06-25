import { NextResponse } from 'next/server';
import { withApiHandler } from '@/lib/api/withApiHandler';
import { getPacks } from '@/services/packService';

export const runtime = 'edge';

export const GET = withApiHandler({
  async handler() {
    const packs = await getPacks();
    return NextResponse.json(packs);
  },
});
