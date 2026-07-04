'use client';

import type { Pack } from '@/lib/monetization/catalog';
import { formatPrice } from '@/lib/monetization/catalog';
import { Icon } from '@/components/Icon';

interface PricingComparisonProps {
  packs: Pack[];
  onSelect: (pack: Pack) => void;
  loadingSku?: string | null;
  context?: 'group' | 'couple';
}

const FEATURES = {
  PASS_24H: ['Tous les modes premium', 'Profils complets pour la soirée', 'Valable 24h', 'Idéal pour un apéro'],
  PROFILE: ['Votre profil détaillé', 'Archétype + axes comportementaux', 'Gardez-le / partagez-le', 'Souvenir de la soirée'],
  PROFILE_COUPLE: ['Rapport de compatibilité', 'Deux profils croisés', 'Idéal pour une date', 'Gardez-le à vie'],
  SUBSCRIPTION_MONTHLY: ['Tous les modes', 'Tous les dossiers', 'Tous les packs', 'Sans engagement'],
  SUBSCRIPTION_ANNUAL: ['Tous les modes', 'Tous les dossiers', 'Tous les packs', 'Paiement annuel économique'],
};

function findPack(packs: Pack[], predicate: (p: Pack) => boolean): Pack | undefined {
  return packs.find(predicate);
}

export function PricingComparison({ packs, onSelect, loadingSku, context = 'group' }: PricingComparisonProps) {
  const pass24h = findPack(packs, (p) => p.productType === 'PASS_24H');
  const profile = context === 'couple'
    ? findPack(packs, (p) => p.productType === 'PROFILE_COUPLE')
    : findPack(packs, (p) => p.productType === 'PROFILE');
  const subscription = context === 'couple'
    ? (findPack(packs, (p) => p.productType === 'SUBSCRIPTION_ANNUAL') || findPack(packs, (p) => p.productType === 'SUBSCRIPTION_MONTHLY'))
    : (findPack(packs, (p) => p.productType === 'SUBSCRIPTION_MONTHLY') || findPack(packs, (p) => p.productType === 'SUBSCRIPTION_ANNUAL'));

  const isAnnual = subscription?.productType === 'SUBSCRIPTION_ANNUAL';
  const subscriptionFeatures = isAnnual ? FEATURES.SUBSCRIPTION_ANNUAL : FEATURES.SUBSCRIPTION_MONTHLY;
  const subscriptionLabel = isAnnual ? 'Abonnement annuel' : 'Abonnement mensuel';

  const offers = [
    { pack: pass24h, features: FEATURES.PASS_24H, recommended: false, label: context === 'couple' ? 'Pass Soirée Couple' : 'Pass 24h' },
    { pack: profile, features: context === 'couple' ? FEATURES.PROFILE_COUPLE : FEATURES.PROFILE, recommended: context !== 'couple', label: context === 'couple' ? 'Dossier Couple' : 'Dossier Classifié' },
    { pack: subscription, features: subscriptionFeatures, recommended: context === 'couple', label: subscriptionLabel },
  ].filter((o): o is { pack: Pack; features: string[]; recommended: boolean; label: string } => Boolean(o.pack));

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
      {offers.map(({ pack, features, recommended, label }) => (
        <div
          key={pack.sku}
          className={`relative p-4 rounded-2xl border text-left transition-all ${
            recommended
              ? 'bg-neon-purple/10 border-neon-purple/50 shadow-[0_0_20px_rgba(139,92,246,0.15)]'
              : 'bg-white/5 border-white/10 hover:border-white/20'
          }`}
        >
          {recommended && (
            <span className="absolute -top-3 left-4 px-2 py-0.5 rounded-full bg-neon-purple text-white text-[10px] font-bold uppercase tracking-wider">
              Recommandé
            </span>
          )}
          <div className="flex justify-between items-start gap-3 mb-3">
            <div>
              <p className="font-bold text-white text-sm">{label}</p>
              <p className="text-xs text-slate-400 mt-0.5">{pack.description}</p>
            </div>
            <div className="text-right">
              <span className="font-mono font-bold text-neon-pink whitespace-nowrap">{formatPrice(pack.price)}</span>
            </div>
          </div>
          <ul className="space-y-1.5 mb-4">
            {features.map((f) => (
              <li key={f} className="flex items-start gap-2 text-xs text-slate-300">
                <Icon name="check" className="w-3.5 h-3.5 text-green-400 mt-0.5 shrink-0" />
                {f}
              </li>
            ))}
          </ul>
          <button
            onClick={() => onSelect(pack)}
            disabled={loadingSku === pack.sku}
            className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-50 ${
              recommended
                ? 'cb-btn-primary'
                : 'bg-white/10 text-white hover:bg-white/20 border border-white/10'
            }`}
          >
            {loadingSku === pack.sku ? 'Redirection...' : 'Choisir'}
          </button>
        </div>
      ))}
    </div>
  );
}
