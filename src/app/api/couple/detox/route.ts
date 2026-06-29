import { NextResponse } from 'next/server';
import { z } from 'zod';
import { withApiHandler } from '@/lib/api/withApiHandler';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { getAuthenticatedCoupleUser } from '@/lib/auth/couple';
import { AppError } from '@/lib/errors';
import { dbRetry } from '@/lib/db/withRetry';
import { Couple } from '@/lib/db/types';

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
    const authUser = await getAuthenticatedCoupleUser(req);
    const { coupleId, action, durationMinutes } = body;

    // Verify couple membership
    const { data: couple, error: coupleError } = await dbRetry<Couple>(async () =>
      supabaseAdmin
        .from('Couple')
        .select('*')
        .eq('id', coupleId)
        .single()
    );

    if (coupleError || !couple || (couple.user1Id !== authUser.id && couple.user2Id !== authUser.id)) {
      throw new AppError('FORBIDDEN', 'Vous ne faites pas partie de ce couple.');
    }

    // Read current TotemState
    const { data: totemRow, error: totemError } = await dbRetry<{ fusionState: Record<string, unknown> | null }>(async () =>
      supabaseAdmin
        .from('TotemState')
        .select('*')
        .eq('coupleId', coupleId)
        .single()
    );

    if (totemError || !totemRow) {
      throw new AppError('NOT_FOUND', 'TotemState introuvable pour ce couple.');
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fusionState: Record<string, any> = { ...((totemRow.fusionState ?? {}) as Record<string, any>) };

    if (action === 'START') {
      fusionState.detoxSession = {
        startedAt: new Date().toISOString(),
        durationMinutes: durationMinutes ?? 60,
        interrupted: false,
      };
    } else if (action === 'INTERRUPT') {
      if (fusionState.detoxSession) {
        fusionState.detoxSession.interrupted = true;
      }
      fusionState.energy = Math.max(0.1, (fusionState.energy ?? 1.0) - 0.15);
    } else if (action === 'COMPLETE') {
      delete fusionState.detoxSession;
      fusionState.energy = Math.min(1.0, (fusionState.energy ?? 1.0) + 0.2);
      fusionState.totalRitualsCompleted = (fusionState.totalRitualsCompleted ?? 0) + 1;
    }

    // Update TotemState
    const { data: updated, error: updateError } = await dbRetry(async () =>
      supabaseAdmin
        .from('TotemState')
        .update({ fusionState })
        .eq('coupleId', coupleId)
        .select()
        .single()
    );

    if (updateError || !updated) {
      throw new AppError('INTERNAL_ERROR', 'Impossible de mettre à jour le Totem.');
    }

    return NextResponse.json({ success: true, totem: updated });
  },
});
