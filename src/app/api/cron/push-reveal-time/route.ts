import { NextResponse } from 'next/server';
import { AppError } from '@/lib/errors';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { acquireCronLock, releaseCronLock } from '@/lib/cron/lock';
import { sendPushToCouple } from '@/services/pushNotificationService';
import { createLogger } from '@/lib/logger';

export const runtime = 'edge';

const logger = createLogger({ route: 'push-reveal-time' });

export async function GET(req: Request): Promise<Response> {
  const authHeader = req.headers.get('Authorization');
  const expected = `Bearer ${process.env.CRON_SECRET}`;

  if (!process.env.CRON_SECRET || authHeader !== expected) {
    throw new AppError('UNAUTHORIZED', 'Accès réservé au scheduler.');
  }

  const lockAcquired = await acquireCronLock('push-reveal-time');
  if (!lockAcquired) {
    return NextResponse.json({ success: true, reason: 'already_running', sent: 0 });
  }

  try {
    // Récupérer les questions analysées mais pas encore révélées aujourd'hui
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const { data: questions, error } = await supabaseAdmin
      .from('DailyQuestion')
      .select('coupleId, id')
      .eq('analysisStatus', 'COMPUTED')
      .eq('isRevealed', false)
      .gte('releasedAt', today.toISOString())
      .lt('releasedAt', tomorrow.toISOString());

    if (error) {
      throw new AppError('INTERNAL_ERROR', 'Failed to fetch questions for reveal');
    }

    let sent = 0;
    const errors: string[] = [];

    for (const q of questions ?? []) {
      try {
        const result = await sendPushToCouple(q.coupleId, {
          title: "🌙 C'est l'heure de révéler",
          body: 'Découvrez les réponses de votre partenaire.',
          data: { dailyQuestionId: q.id, type: 'reveal_time' },
        });
        sent += result.sent;
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        errors.push(`${q.coupleId}: ${message}`);
      }
    }

    return NextResponse.json({
      success: true,
      sent,
      errors,
      total: questions?.length ?? 0,
    });
  } finally {
    await releaseCronLock('push-reveal-time');
  }
}
