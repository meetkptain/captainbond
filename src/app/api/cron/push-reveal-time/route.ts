import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { sendPushToCouple } from '@/services/pushNotificationService';
import { withCronHandler } from '@/lib/api/withCronHandler';

export const runtime = 'edge';

export const GET = withCronHandler({
  lockKey: 'push-reveal-time',
  handler: async () => {
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

    if (error) throw error;

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
  },
});
