import { NextResponse } from 'next/server';
import { AppError } from '@/lib/errors';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { acquireCronLock, releaseCronLock } from '@/lib/cron/lock';
import { computeTreeProgress } from '@/services/treeProgressService';
import { createLogger } from '@/lib/logger';

export const runtime = 'edge';

const logger = createLogger({ route: 'tree-progress-cron' });

export async function GET(req: Request): Promise<Response> {
  const authHeader = req.headers.get('Authorization');
  const expected = `Bearer ${process.env.CRON_SECRET}`;

  if (!process.env.CRON_SECRET || authHeader !== expected) {
    throw new AppError('UNAUTHORIZED', 'Accès réservé au scheduler.');
  }

  const lockAcquired = await acquireCronLock('tree-progress-cron');
  if (!lockAcquired) {
    return NextResponse.json({ success: true, reason: 'already_running', updated: 0 });
  }

  try {
    // Récupérer tous les couples ayant un arbre
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
  } finally {
    await releaseCronLock('tree-progress-cron');
  }
}
