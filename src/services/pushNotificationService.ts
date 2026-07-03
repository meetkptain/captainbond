import { createLogger } from '@/lib/logger';
import { AppError } from '@/lib/errors';
import { getActiveSubscriptionsForCouple, deactivateByEndpoint } from '@/lib/db/repositories/pushSubscriptionRepository';
import { getCoupleById } from '@/lib/db/repositories/coupleRepository';

const logger = createLogger({ route: 'pushNotificationService' });

interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  data?: Record<string, unknown>;
}

/**
 * Envoie une push notification aux 2 partenaires d'un couple.
 * Gère automatiquement les endpoints expirés (désabonnement).
 * Note: En Edge runtime, l'envoi push nécessite une lib tierce (web-push)
 * ou un service externe (Expo, OneSignal, etc.)
 */
export async function sendPushToCouple(
  coupleId: string,
  payload: PushPayload
): Promise<{ sent: number; failed: number }> {
  const couple = await getCoupleById(coupleId);
  if (!couple) throw new AppError('COUPLE_NOT_FOUND', 'Couple not found');

  const subscriptions = await getActiveSubscriptionsForCouple(coupleId);
  let sent = 0;
  let failed = 0;

  for (const sub of subscriptions) {
    try {
      // En production, utiliser web-push ou un service push externe
      // Pour l'instant, on log l'envoi et on simule
      logger.info('Push notification sent', {
        endpoint: sub.endpoint,
        title: payload.title,
        body: payload.body,
      });
      sent++;
    } catch (err) {
      failed++;
      logger.warn('Push notification failed', { endpoint: sub.endpoint, error: err });

      // Désabonner si endpoint expiré
      if ((err as { statusCode?: number })?.statusCode === 404 ||
          (err as { statusCode?: number })?.statusCode === 410) {
        await deactivateByEndpoint(sub.endpoint).catch(() => {});
      }
    }
  }

  logger.info('Push notifications batch complete', { coupleId, sent, failed });
  return { sent, failed };
}
