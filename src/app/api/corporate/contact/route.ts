import { NextResponse } from 'next/server';
import { z } from 'zod';
import { withApiHandler } from '@/lib/api/withApiHandler';
import { logger } from '@/lib/logger';

export const runtime = 'edge';

const b2bContactSchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  company: z.string().min(1, 'L\'entreprise est requise'),
  email: z.string().email('Email invalide'),
  participants: z.coerce.number().min(5, 'Minimum 5 participants'),
  date: z.string().min(1, 'La date est requise'),
  notes: z.string().optional(),
  estimatedPrice: z.number().optional(),
  formula: z.enum(['self-service', 'facilitator', 'enterprise', 'custom']).optional(),
});

export const POST = withApiHandler({
  bodySchema: b2bContactSchema,
  async handler({ body }) {
    logger.info('B2B Lead received', {
      name: body.name,
      company: body.company,
      email: body.email,
      participants: body.participants,
      date: body.date,
      notes: body.notes,
      estimatedPrice: body.estimatedPrice,
      formula: body.formula,
    });

    // In a future phase, this can send an email via Resend or save to a lead table.
    // For now, it logs successfully to the centralized logging system.
    return NextResponse.json({ success: true });
  },
});
