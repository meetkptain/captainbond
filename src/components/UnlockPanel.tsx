'use client';

import { useEffect, useState } from 'react';
import { api, ApiClientError } from '@/lib/api/client';
import type { Pack } from '@/lib/monetization/catalog';
import { PricingComparison } from './PricingComparison';
import { Icon } from '@/components/Icon';
import { capture, AnalyticsEvents } from '@/lib/analytics';
import { isNativeApp, purchaseNativeProduct, triggerHaptic } from '@/lib/native/bridge';
import { useTranslation } from '@/lib/i18n';

interface UnlockPanelProps {
  roomCode: string;
  playerId: string;
  packs: Pack[];
  freeQuestionsUsed?: number;
  freeQuestionsLimit?: number;
  onCheckoutStart?: () => void;
  onCheckoutError?: (message: string) => void;
  successUrl?: string;
  cancelUrl?: string;
  context?: 'group' | 'couple';
}

export function UnlockPanel({ roomCode, playerId, packs, freeQuestionsUsed, freeQuestionsLimit, onCheckoutStart, onCheckoutError, successUrl, cancelUrl, context = 'group' }: UnlockPanelProps) {
  const { t } = useTranslation();
  const [loadingSku, setLoadingSku] = useState<string | null>(null);

  useEffect(() => {
    capture(AnalyticsEvents.PAYWALL_SHOWN, { room_code: roomCode, player_id: playerId });
  }, [roomCode, playerId]);

  const handleCheckout = async (pack: Pack) => {
    setLoadingSku(pack.sku);
    onCheckoutStart?.();
    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      capture(AnalyticsEvents.CHECKOUT_INITIATED, {
        room_code: roomCode,
        sku: pack.sku,
        price_cents: Math.round(pack.price * 100),
      });

      if (roomCode === 'DEMO12') {
        setTimeout(() => {
          triggerHaptic('heavy');
          window.location.href = successUrl || `${origin}/room/${roomCode}/player?paid=pass`;
        }, 1000);
        return;
      }

      if (isNativeApp()) {
        let packageId = 'com.meetkptain.captainbond.pass24h';
        if (pack.sku === 'pack-unlimited') {
          packageId = 'com.meetkptain.captainbond.illimite';
        }
        const result = await purchaseNativeProduct(packageId);
        if (result) {
          triggerHaptic('heavy');
          window.location.href = successUrl || `${origin}/room/${roomCode}/player?paid=pass`;
        } else {
          onCheckoutError?.('Achat annulé ou rejeté par le store.');
        }
        return;
      }

      const data = await api.post<{ sessionUrl?: string; error?: string }>('/api/checkout', {
        sku: pack.sku,
        roomCode,
        successUrl: successUrl || `${origin}/room/${roomCode}/player?paid=pass`,
        cancelUrl: cancelUrl || `${origin}/room/${roomCode}/player`,
      });
      if (data.sessionUrl) {
        window.location.href = data.sessionUrl;
      } else {
        onCheckoutError?.(data.error || 'Impossible de lancer le paiement');
      }
    } catch (e) {
      onCheckoutError?.(e instanceof ApiClientError ? e.message : 'Erreur de paiement');
    } finally {
      setLoadingSku(null);
    }
  };

  if (packs.length === 0) {
    return (
      <p className="text-slate-400 text-sm">{t('no_offers_available')}</p>
    );
  }

  const limit = freeQuestionsLimit ?? 3;
  const used = Math.min(freeQuestionsUsed ?? 0, limit);
  const remaining = Math.max(0, limit - used);

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-4">
      <div className="text-center space-y-2">
        <p className="text-sm text-slate-300 font-medium">
          <strong className="text-white">{t('free_cards_used', { used, limit })}</strong>
          {remaining > 0 && (
            <span className="block text-xs text-slate-400 mt-1">
              {remaining === 1
                ? t('free_cards_remaining_one')
                : t('free_cards_remaining_many', { remaining })}
            </span>
          )}
          {remaining === 0 && (
            <span className="block text-xs text-amber-400 mt-1">
              {t('free_cards_empty')}
            </span>
          )}
        </p>
        <div
          className="w-full max-w-xs mx-auto h-2 bg-white/10 rounded-full overflow-hidden"
          aria-label={t('free_cards_gauge_label', { used, limit })}
          role="img"
        >
          <div
            className="h-full bg-neon-purple transition-all duration-500"
            style={{ width: `${(used / limit) * 100}%` }}
          />
        </div>
      </div>
      <PricingComparison packs={packs} onSelect={handleCheckout} loadingSku={loadingSku} context={context} />
      <p className="text-xs text-slate-500 text-center flex items-center justify-center gap-1">
        <Icon name="check" className="w-3 h-3" /> {t('secure_payment_guarantee')}
      </p>
    </div>
  );
}
