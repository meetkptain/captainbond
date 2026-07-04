import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { generateWeeklyRecap } from '@/services/weeklyRecapService';
import { withCronHandler } from '@/lib/api/withCronHandler';

export const runtime = 'edge';

function getMonday(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().split('T')[0];
}

export const GET = withCronHandler({
  lockKey: 'weekly-recap',
  handler: async () => {
    const now = new Date();
    const lastMonday = new Date(now);
    lastMonday.setDate(lastMonday.getDate() - 7);
    const weekStart = getMonday(lastMonday);

    const { data: couples, error } = await supabaseAdmin
      .from('DailyQuestion')
      .select('coupleId')
      .eq('isRevealed', true)
      .gte('createdAt', weekStart + 'T00:00:00Z')
      .lte('createdAt', weekStart + 'T23:59:59Z');

    if (error) throw error;

    const uniqueCoupleIds = [...new Set((couples ?? []).map((c) => c.coupleId))];
    let generated = 0;
    const errors: string[] = [];

    for (const coupleId of uniqueCoupleIds) {
      try {
        await generateWeeklyRecap(coupleId, weekStart);
        generated++;
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        errors.push(`${coupleId}: ${message}`);
      }
    }

    return NextResponse.json({ success: true, generated, errors, total: uniqueCoupleIds.length });
  },
});
