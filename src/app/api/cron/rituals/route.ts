import { NextResponse } from 'next/server';
import { AppError } from '@/lib/errors';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { dbRetry } from '@/lib/db/withRetry';
import { generateRitualForCouple, isRitualDay } from '@/services/ritualService';
import { Couple } from '@/lib/db/types';
import { withCronHandler } from '@/lib/api/withCronHandler';

export const runtime = 'edge';

export const GET = withCronHandler({
  lockKey: 'generate-rituals',
  handler: async () => {
    const { data: couples, error } = await dbRetry<Couple[]>(async () =>
      supabaseAdmin.from('Couple').select('*')
    );

    if (error) {
      throw new AppError('INTERNAL_ERROR', 'Impossible de charger les couples.');
    }

    const coupleList = couples ?? [];
    const now = new Date();
    let generated = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const couple of coupleList) {
      if (!isRitualDay(now, couple.timezone || 'Europe/Paris')) {
        skipped++;
        continue;
      }

      try {
        await generateRitualForCouple(couple, now);
        generated++;
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        errors.push(`${couple.id}: ${message}`);
      }
    }

    return NextResponse.json({
      success: true,
      generated,
      skipped,
      errors,
      total: coupleList.length,
    });
  },
});
