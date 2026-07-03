import { NextResponse } from 'next/server';
import { withApiHandler } from '@/lib/api/withApiHandler';
import { listPacks } from '@/lib/monetization/catalog';

export const runtime = 'edge';

export const GET = withApiHandler({
  async handler() {
    const packs = await listPacks();
    return NextResponse.json(packs);
  },
});
