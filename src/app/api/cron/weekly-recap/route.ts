import { NextResponse } from 'next/server';
import { AppError } from '@/lib/errors';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { acquireCronLock, releaseCronLock } from '@/lib/cron/lock';
import { generateWeeklyRecap } from '@/services/weeklyRecapService';
import { createLogger } from '@/lib/logger';

export const runtime = 'edge';

const logger = createLogger({ route: 'weekly-recap' });

function getMonday(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().split('T')[0];
}

export async function GET(req: Request): Promise<Response> {
  const authHeader = req.headers.get('Authorization');
  const expected = `Bearer ${process.env.CRON_SECRET}`;

  if (!process.env.CRON_SECRET || authHeader !== expected) {
    throw new AppError('UNAUTHORIZED', 'Accès réservé au scheduler.');
  }

  const lockAcquired = await acquireCronLock('weekly-recap');
  if (!lockAcquired) {
    return NextResponse.json({ success: true, reason: 'already_running', generated: 0 });
  }

  try {
    // Lundi dernier (semaine à résumer)
    const now = new Date();
    const lastMonday = new Date(now);
    lastMonday.setDate(lastMonday.getDate() - 7);
    const weekStart = getMonday(lastMonday);

    // Récupérer tous les couples actifs ayant au moins 1 rituel révélé cette semaine-là
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
  } finally {
    await releaseCronLock('weekly-recap');
  }
}
