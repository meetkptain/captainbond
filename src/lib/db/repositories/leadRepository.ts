import { supabaseAdmin } from '@/lib/supabase-admin';
import { dbRetry } from '@/lib/db/withRetry';
import { logger } from '@/lib/logger';

export type LeadSource =
  | 'corporate'
  | 'onboarding'
  | 'qvt'
  | 'bar_kit'
  | 'b2b_landing';

export type LeadStatus = 'NEW' | 'CONTACTED' | 'WON' | 'LOST';

export interface LeadInput {
  source: LeadSource;
  name: string;
  email: string;
  company: string;
  participants?: number;
  estimatedPrice?: number;
  formula?: string;
  notes?: string;
  status?: LeadStatus;
}

export async function createOrUpdateLead(input: LeadInput): Promise<void> {
  const { error } = await dbRetry<null>(async () =>
    supabaseAdmin.from('Lead').upsert(
      {
        source: input.source,
        name: input.name,
        email: input.email.toLowerCase().trim(),
        company: input.company,
        participants: input.participants ?? null,
        estimatedPrice: input.estimatedPrice ?? null,
        formula: input.formula ?? null,
        notes: input.notes ?? null,
        status: input.status ?? 'NEW',
      },
      {
        onConflict: 'email,source',
      },
    ),
  );

  if (error) {
    logger.error('Failed to upsert lead', { input }, error);
    throw new Error('Impossible de sauvegarder le lead');
  }
}

export async function getLeadsBySource(source: LeadSource): Promise<unknown[]> {
  const { data, error } = await dbRetry<unknown[]>(async () =>
    supabaseAdmin.from('Lead').select('*').eq('source', source).order('createdAt', { ascending: false }),
  );

  if (error) {
    logger.error('Failed to fetch leads', { source }, error);
    return [];
  }

  return data ?? [];
}
