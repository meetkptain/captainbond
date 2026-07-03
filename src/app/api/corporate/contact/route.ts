import { NextResponse } from 'next/server';
import { z } from 'zod';
import { withApiHandler } from '@/lib/api/withApiHandler';
import { createLead } from '@/services/leadService';
import { logger } from '@/lib/logger';

export const runtime = 'edge';

const b2bContactSchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  company: z.string().min(1, 'L\'entreprise est requise'),
  email: z.string().email('Email invalide'),
  participants: z.coerce.number().min(1, 'Minimum 1 participant').optional(),
  date: z.string().optional(),
  notes: z.string().optional(),
  estimatedPrice: z.number().optional(),
  formula: z.enum(['self-service', 'facilitator', 'enterprise', 'custom', 'BAR_KIT_REQUEST', 'ONBOARDING_PACK', 'QVT_PACK']).optional(),
  type: z.enum(['BAR', 'CORPORATE']).optional(),
  source: z.enum(['corporate', 'onboarding', 'qvt', 'bar_kit', 'b2b_landing']).optional(),
});

export const POST = withApiHandler({
  bodySchema: b2bContactSchema,
  async handler({ body }) {
    if (!body) {
      return NextResponse.json({ error: 'Corps de requête manquant', code: 'BAD_REQUEST' }, { status: 400 });
    }

    const source = body.source ?? inferSource(body.formula, body.type);

    await createLead({
      source,
      name: body.name,
      email: body.email,
      company: body.company,
      participants: body.participants,
      estimatedPrice: body.estimatedPrice,
      formula: body.formula,
      notes: body.notes ? `${body.notes}${body.date ? ` — Date estimée : ${body.date}` : ''}` : body.date,
    });

    logger.info('B2B Lead received and stored', {
      source,
      name: body.name,
      company: body.company,
      email: body.email,
      participants: body.participants,
      estimatedPrice: body.estimatedPrice,
      formula: body.formula,
    });

    return NextResponse.json({ success: true });
  },
});

function inferSource(
  formula: string | undefined,
  type: string | undefined,
): 'corporate' | 'bar_kit' | 'b2b_landing' | 'onboarding' | 'qvt' {
  if (formula === 'BAR_KIT_REQUEST' || type === 'BAR') return 'bar_kit';
  if (formula === 'ONBOARDING_PACK') return 'onboarding';
  if (formula === 'QVT_PACK') return 'qvt';
  if (type === 'CORPORATE') return 'b2b_landing';
  return 'corporate';
}
