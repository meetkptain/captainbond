import { NextResponse } from 'next/server';
import { z } from 'zod';
import { withApiHandler } from '@/lib/api/withApiHandler';
import { AppError } from '@/lib/errors';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { getAuthenticatedCoupleUser } from '@/lib/auth/couple';
import { dbRetry } from '@/lib/db/withRetry';
import { generateMonthlyReport } from '@/services/resonanceReportService';
import { Couple } from '@/lib/db/types';

export const runtime = 'edge';

const querySchema = z.object({
  coupleId: z.string().min(1),
  month: z
    .string()
    .regex(/^\d{4}-\d{2}$/)
    .optional(),
});

export const GET = withApiHandler({
  querySchema,
  async handler({ req, query }) {
    const authUser = await getAuthenticatedCoupleUser(req);
    const { coupleId } = query;

    // Default month = mois courant au format YYYY-MM
    const now = new Date();
    const month =
      query.month ??
      `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;

    // Vérification membership couple
    const { data: couple, error: coupleError } = await dbRetry<Couple>(async () =>
      supabaseAdmin.from('Couple').select('id, user1Id, user2Id').eq('id', coupleId).single()
    );

    if (coupleError || !couple) {
      throw new AppError('COUPLE_NOT_FOUND', 'Couple introuvable.');
    }

    if (couple.user1Id !== authUser.id && couple.user2Id !== authUser.id) {
      throw new AppError('FORBIDDEN', 'Vous ne faites pas partie de ce couple.');
    }

    const report = await generateMonthlyReport(coupleId, month);

    return NextResponse.json({ report });
  },
});
