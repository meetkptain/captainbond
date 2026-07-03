import { supabaseAdmin } from '@/lib/supabase-admin';
import { getPackBySku } from '@/lib/monetization/catalog';
import { invalidateUserEntitlements } from '@/lib/monetization/entitlements';
import { dbRetry } from '@/lib/db/withRetry';
import { logger } from '@/lib/logger';
import { AppError } from '@/lib/errors';

const TRIAL_DAYS = 7;

export async function grantCoupleTrial(userId: string): Promise<void> {
  const pack = await getPackBySku('SUBSCRIPTION_ANNUAL');
  if (!pack) {
    logger.error('Annual subscription pack not found, cannot grant couple trial', { userId });
    throw new AppError('INTERNAL_ERROR', 'Pack annuel introuvable', { details: { userId } });
  }
  if (!pack.isSubscription) {
    logger.error('Annual subscription pack is not a subscription', { userId, sku: pack.sku });
    throw new AppError('INTERNAL_ERROR', "Le pack annuel n'est pas un abonnement", {
      details: { userId, sku: pack.sku },
    });
  }

  const expiresAt = new Date(Date.now() + TRIAL_DAYS * 24 * 60 * 60 * 1000).toISOString();

  // One trial per user: any existing couple_trial row (even expired) blocks a new one.
  const { data: existingPass, error: selectError } = await dbRetry<{
    id: string;
  } | null>(async () =>
    supabaseAdmin
      .from('UserPass')
      .select('id')
      .eq('userId', userId)
      .eq('source', 'couple_trial')
      .maybeSingle()
  );
  if (selectError) {
    logger.error('Failed to query existing couple trial UserPass', { userId }, selectError);
    throw new AppError('INTERNAL_ERROR', "Erreur lors de la vérification du pass d'essai", {
      cause: selectError,
      details: { userId },
    });
  }
  if (existingPass) {
    logger.info('Couple trial already granted to user, skipping', { userId, passId: existingPass.id });
    return;
  }

  // Atomic insert: duplicate concurrent inserts are ignored thanks to the unique index.
  const { error: insertError } = await dbRetry<null>(async () =>
    supabaseAdmin.from('UserPass').upsert(
      {
        userId,
        packId: pack.id,
        expiresAt,
        source: 'couple_trial',
      },
      { onConflict: 'userId,source', ignoreDuplicates: true }
    )
  );
  if (insertError) {
    logger.error('Failed to insert couple trial UserPass', { userId, packId: pack.id }, insertError);
    throw new AppError('INTERNAL_ERROR', "Erreur lors de la création du pass d'essai", {
      cause: insertError,
      details: { userId, packId: pack.id },
    });
  }

  // Atomic update: only bump activePassExpiresAt when null or lower than the new expiry.
  const { error: updateError } = await dbRetry<null>(async () =>
    supabaseAdmin
      .from('User')
      .update({ activePassExpiresAt: expiresAt })
      .eq('id', userId)
      .or(`activePassExpiresAt.is.null,activePassExpiresAt.lt.${expiresAt}`)
  );
  if (updateError) {
    logger.error('Failed to update user activePassExpiresAt for couple trial', { userId }, updateError);
    throw new AppError('INTERNAL_ERROR', "Erreur lors de l'activation du pass d'essai", {
      cause: updateError,
      details: { userId },
    });
  }

  await invalidateUserEntitlements(userId);

  logger.info('Granted couple trial to user', { userId, packId: pack.id, expiresAt });
}
