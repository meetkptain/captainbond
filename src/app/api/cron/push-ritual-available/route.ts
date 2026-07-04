import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { sendPushToCouple } from '@/services/pushNotificationService';
import { withCronHandler } from '@/lib/api/withCronHandler';

export const runtime = 'edge';

export const GET = withCronHandler({
  lockKey: 'push-ritual-available',
  handler: async () => {
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

    if (error) throw error;

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
  },
});
