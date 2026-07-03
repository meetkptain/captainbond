import { createOrUpdateLead, LeadInput } from '@/lib/db/repositories/leadRepository';
import { logger } from '@/lib/logger';

export type LeadCreateInput = LeadInput;

export async function createLead(input: LeadCreateInput): Promise<void> {
  await createOrUpdateLead({
    source: input.source,
    name: input.name,
    email: input.email,
    company: input.company,
    participants: input.participants,
    estimatedPrice: input.estimatedPrice,
    formula: input.formula,
    notes: input.notes,
    status: input.status ?? 'NEW',
  });

  logger.info('Lead created/updated', {
    source: input.source,
    email: input.email,
    company: input.company,
  });
}
