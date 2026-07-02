import { NextResponse } from 'next/server';
import { z } from 'zod';
import { withApiHandler } from '@/lib/api/withApiHandler';
import { AppError } from '@/lib/errors';
import { handleCoupleDetox } from '@/services/coupleDetoxService';

export const runtime = 'edge';

const bodySchema = z.object({
  coupleId: z.string().min(1),
  action: z.enum(['START', 'INTERRUPT', 'COMPLETE']),
  durationMinutes: z.number().int().min(5).max(180).optional(),
});

export const POST = withApiHandler({
  bodySchema,
  async handler({ req, body }) {
    if (!body) {
      throw new AppError('BAD_REQUEST', 'Corps de requête manquant');
    }
    const { coupleId, action, durationMinutes } = body;
    const updated = await handleCoupleDetox(req, { coupleId, action, durationMinutes });
    return NextResponse.json({ success: true, totem: updated });
  },
});
