import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { computeTreeProgress } from '@/services/treeProgressService';
import { withCronHandler } from '@/lib/api/withCronHandler';

export const runtime = 'edge';

export const GET = withCronHandler({
  lockKey: 'tree-progress-cron',
  handler: async () => {
    const { data: trees, error } = await supabaseAdmin
      .from('Tree')
      .select('coupleId')
      .is('roomId', null);

    if (error) throw error;

    const uniqueCoupleIds = [...new Set((trees ?? []).map((t) => t.coupleId))];
    let updated = 0;
    const errors: string[] = [];

    for (const coupleId of uniqueCoupleIds) {
      try {
        await computeTreeProgress(coupleId);
        updated++;
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        errors.push(`${coupleId}: ${message}`);
      }
    }

    return NextResponse.json({ success: true, updated, errors, total: uniqueCoupleIds.length });
  },
});
