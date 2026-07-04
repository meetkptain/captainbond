import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { updateHeatmapForCouple } from '@/services/heatmapService';
import { withCronHandler } from '@/lib/api/withCronHandler';

export const runtime = 'edge';

export const GET = withCronHandler({
  lockKey: 'heatmap-cron',
  handler: async () => {
    const { data: couples, error } = await supabaseAdmin
      .from('DailyQuestion')
      .select('coupleId')
      .eq('isRevealed', true);

    if (error) throw error;

    const uniqueCoupleIds = [...new Set((couples ?? []).map((c) => c.coupleId))];
    let updated = 0;
    const errors: string[] = [];

    for (const coupleId of uniqueCoupleIds) {
      try {
        await updateHeatmapForCouple(coupleId);
        updated++;
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        errors.push(`${coupleId}: ${message}`);
      }
    }

    return NextResponse.json({ success: true, updated, errors, total: uniqueCoupleIds.length });
  },
});
