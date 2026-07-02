import { NextResponse } from 'next/server';
import { z } from 'zod';
import { withApiHandler } from '@/lib/api/withApiHandler';
import { getAuthenticatedUser } from '@/lib/auth/user';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { AppError } from '@/lib/errors';
import { getTotem, updatePartnerOrbe, computeFusion } from '@/services/totemService';

export const runtime = 'edge';

// --- GET: Récupère l'état du Totem du couple ---

const getQuerySchema = z.object({
  coupleId: z.string(),
});

export const GET = withApiHandler({
  querySchema: getQuerySchema,
  async handler({ req, query }) {
    const authUser = await getAuthenticatedUser(req);

    // Vérifier l'appartenance au couple
    const { data: couple } = await supabaseAdmin
      .from('Couple')
      .select('*')
      .eq('id', query.coupleId)
      .single();

    if (!couple || (couple.user1Id !== authUser.id && couple.user2Id !== authUser.id)) {
      throw new AppError('FORBIDDEN', 'Vous ne faites pas partie de ce couple.');
    }

    const totem = await getTotem(query.coupleId);

    // Masquer l'Orbe de l'autre partenaire (asymétrie)
    const isPartnerA = authUser.id === couple.user1Id;
    return NextResponse.json({
      myOrbe: isPartnerA ? totem.stateA : totem.stateB,
      fusionState: totem.fusionState,
      streakDays: totem.streakDays,
      lastRitualAt: totem.lastRitualAt,
    });
  },
});

// --- PATCH: Met à jour l'Orbe du partenaire connecté ---

const patchBodySchema = z.object({
  coupleId: z.string(),
  orbeUpdate: z.object({
    hue: z.number().min(0).max(360).optional(),
    saturation: z.number().min(0).max(100).optional(),
    lightness: z.number().min(0).max(100).optional(),
    energy: z.number().min(0).max(1).optional(),
    attachmentStyle: z.enum(['secure', 'anxious', 'avoidant', 'disorganized']).optional(),
    particleDensity: z.number().min(0).max(1).optional(),
    pulseRate: z.number().min(0).max(5).optional(),
  }),
});

export const PATCH = withApiHandler({
  bodySchema: patchBodySchema,
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

    await updatePartnerOrbe(
      body.coupleId,
      authUser.id,
      couple.user1Id,
      body.orbeUpdate
    );

    // Recalculer la fusion après chaque mise à jour d'Orbe
    const fused = await computeFusion(body.coupleId);

    const isPartnerA = authUser.id === couple.user1Id;
    return NextResponse.json({
      myOrbe: isPartnerA ? fused.stateA : fused.stateB,
      fusionState: fused.fusionState,
    });
  },
});
