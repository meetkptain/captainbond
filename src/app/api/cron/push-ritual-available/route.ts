import { NextResponse } from 'next/server';
import { AppError } from '@/lib/errors';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { acquireCronLock, releaseCronLock } from '@/lib/cron/lock';
import { sendPushToCouple } from '@/services/pushNotificationService';
import { createLogger } from '@/lib/logger';

export const runtime = 'edge';

const logger = createLogger({ route: 'push-ritual-available' });

export async function GET(req: Request): Promise<Response> {
  const authHeader = req.headers.get('Authorization');
  const expected = `Bearer ${process.env.CRON_SECRET}`;

  if (!process.env.CRON_SECRET || authHeader !== expected) {
    throw new AppError('UNAUTHORIZED', 'Accès réservé au scheduler.');
  }

  const lockAcquired = await acquireCronLock('push-ritual-available');
  if (!lockAcquired) {
    return NextResponse.json({ success: true, reason: 'already_running', sent: 0 });
  }

  try {
    // Récupérer les couples qui ont un rituel créé aujourd'hui
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const { data: rituals, error } = await supabaseAdmin
      .from('DailyQuestion')
      .select('coupleId, id')
      .gte('releasedAt', today.toISOString())
      .lt('releasedAt', tomorrow.toISOString())
      .eq('isSkipped', false);

    if (error) {
      throw new AppError('INTERNAL_ERROR', 'Failed to fetch rituals');
    }

    let sent = 0;
    const errors: string[] = [];

    for (const ritual of rituals ?? []) {
      try {
        const result = await sendPushToCouple(ritual.coupleId, {
          title: '🌅 Votre question du jour',
          body: 'Prenez 5 minutes pour répondre ensemble.',
          data: { dailyQuestionId: ritual.id, type: 'ritual_available' },
        });
        sent += result.sent;
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        errors.push(`${ritual.coupleId}: ${message}`);
      }
    }

    return NextResponse.json({
      success: true,
      sent,
      errors,
      total: rituals?.length ?? 0,
    });
  } finally {
    await releaseCronLock('push-ritual-available');
  }
}
