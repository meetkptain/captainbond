'use client';

import { useEffect, useState } from 'react';
import { api, ApiClientError } from '@/lib/api/client';
import type { Pack } from '@/lib/monetization/catalog';
import { PricingComparison } from '@/components/PricingComparison';
import { Icon } from '@/components/Icon';
import { capture, AnalyticsEvents } from '@/lib/analytics';

interface CouplePaywallProps {
  coupleId?: string;
  passExpiresAt?: string | null;
  successUrl?: string;
  cancelUrl?: string;
}

export function CouplePaywall({ coupleId, passExpiresAt, successUrl, cancelUrl }: CouplePaywallProps) {
  const [packs, setPacks] = useState<Pack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingSku, setLoadingSku] = useState<string | null>(null);

  useEffect(() => {
    capture(AnalyticsEvents.PAYWALL_SHOWN, { context: 'couple', coupleId });

    api.get<Pack[]>('/api/packs')
      .then((data) => {
        setPacks(data);
        setLoading(false);
      })
      .catch((err) => {
        const message = err instanceof ApiClientError ? err.message : 'Impossible de charger les offres';
        setError(message);
        setLoading(false);
      });
  }, [coupleId]);

  const handleSelect = async (pack: Pack) => {
    const plan = pack.productType === 'SUBSCRIPTION_ANNUAL' ? 'couple_annual' : 'couple_monthly';
    setLoadingSku(pack.sku);

    try {
      const { sessionUrl } = await api.post<{ sessionId: string; sessionUrl: string }>('/api/checkout/couple-subscription', {
        plan,
        coupleId,
        successUrl: successUrl || '/couple?paid=premium',
        cancelUrl: cancelUrl || '/couple',
      });

      if (sessionUrl) {
        window.location.href = sessionUrl;
      }
    } catch (err) {
      const message = err instanceof ApiClientError ? err.message : 'Erreur lors de la redirection vers le paiement';
      setError(message);
    } finally {
      setLoadingSku(null);
    }
  };

  const formatExpiry = (date: string) => {
    try {
      return new Date(date).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return date;
    }
  };

  const subscriptionPacks = packs.filter(
    (p) => p.productType === 'SUBSCRIPTION_ANNUAL' || p.productType === 'SUBSCRIPTION_MONTHLY'
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-8 h-8 border-2 border-neon-purple border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!loading && subscriptionPacks.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 py-8 text-center">
        <p className="text-white/60">Aucune offre d'abonnement disponible.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-8 space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neon-purple/10 border border-neon-purple/30 text-neon-purple text-xs font-bold uppercase tracking-wider">
          <Icon name="sparkles" className="w-3.5 h-3.5" />
          Premium
        </div>
        <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">
          Passez à Premium
        </h2>
        <p className="text-white/60 max-w-md mx-auto text-sm md:text-base">
          Débloquez tous les rituels, l'arbre relationnel et les dossiers couple. Partagez l'accès avec votre partenaire.
        </p>
        {passExpiresAt && (
          <p className="text-neon-pink text-sm font-medium">
            Votre essai couple expire le {formatExpiry(passExpiresAt)}
          </p>
        )}
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 text-sm flex items-start gap-3">
          <Icon name="alert" className="w-4 h-4 mt-0.5 shrink-0" />
          {error}
        </div>
      )}

      <PricingComparison packs={subscriptionPacks} onSelect={handleSelect} loadingSku={loadingSku} context="couple" />

      <p className="text-center text-xs text-white/40 mt-6">
        Paiement sécurisé par Stripe. Annulation à tout moment.
      </p>
    </div>
  );
}
