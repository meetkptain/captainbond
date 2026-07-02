import { NextResponse } from 'next/server';
import { z } from 'zod';
import { withApiHandler } from '@/lib/api/withApiHandler';
import { requireCoupleMembership } from '@/lib/auth/coupleMembership';
import { getAuthenticatedUser } from '@/lib/auth/user';
import { generateMonthlyReport } from '@/services/resonanceReportService';

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
    const authUser = await getAuthenticatedUser(req);
    const { coupleId } = query;

    // Default month = mois courant au format YYYY-MM
    const now = new Date();
    const month =
      query.month ??
      `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;

    // Vérification membership couple
    await requireCoupleMembership(coupleId, authUser.id);

    const report = await generateMonthlyReport(coupleId, month);

    return NextResponse.json({ report });
  },
});
