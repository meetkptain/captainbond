import { NextResponse } from 'next/server';
import { z } from 'zod';
import { withApiHandler } from '@/lib/api/withApiHandler';
import { getAuthenticatedUser } from '@/lib/auth/user';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { AppError } from '@/lib/errors';
import { completeRitual } from '@/services/totemService';

export const runtime = 'edge';

// --- POST: Déclenche la fusion après complétion du rituel par les deux partenaires ---

const fuseBodySchema = z.object({
  coupleId: z.string(),
});

export const POST = withApiHandler({
  bodySchema: fuseBodySchema,
  async handler({ req, body }) {
    if (!body) throw new AppError('BAD_REQUEST', 'Corps requis.');

    const authUser = await getAuthenticatedUser(req);

    const { data: couple } = await supabaseAdmin
      .from('Couple')
      .select('*')
      .eq('id', body.coupleId)
      .single();

    if (!couple || (couple.user1Id !== authUser.id && couple.user2Id !== authUser.id)) {
      throw new AppError('FORBIDDEN', 'Vous ne faites pas partie de ce couple.');
    }

    // Compléter le rituel (streak + évolution)
    const result = await completeRitual(body.coupleId);

    return NextResponse.json({
      fusionState: result.fusionState,
      streakDays: result.streakDays,
      lastRitualAt: result.lastRitualAt,
      evolutionStage: result.fusionState.evolutionStage,
    });
  },
});
