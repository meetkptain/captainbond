import { supabaseAdmin } from '@/lib/supabase-admin';
import { logger } from '@/lib/logger';

export type ProductType =
  | 'PASS_24H'
  | 'PASS_WEEKEND'
  | 'SUBSCRIPTION_ANNUAL'
  | 'SUBSCRIPTION_MONTHLY'
  | 'BAR_MONTHLY'
  | 'LIFETIME'
  | 'PROFILE'
  | 'PROFILE_COUPLE'
  | 'PACK'
  | 'CREDIT';

export interface PackScope {
  modes?: string[];
  features?: string[];
}

export interface Pack {
  id: string;
  sku: string;
  name: string;
  description: string;
  price: number;
  stripePriceId: string | null;
  stripeProductId: string | null;
  productType: ProductType;
  scope: PackScope | null;
  isSubscription: boolean;
  isPro: boolean;
}

// Catalogue fallback si la base est vide (utile en dev / avant seed)
export const CATALOG_FALLBACK: Pack[] = [
  {
    id: 'pack-pass-24h',
    sku: 'PASS_24H',
    name: 'Pass 24h',
    description: 'Accès complet à tous les modes et profils pour la soirée.',
    price: 2.99,
    stripePriceId: null,
    stripeProductId: null,
    productType: 'PASS_24H',
    scope: { modes: ['DEEP_CONNECTION', 'DATE_NIGHT'], features: ['profiles'] },
    isSubscription: false,
    isPro: false,
  },
  {
    id: 'pack-pass-weekend',
    sku: 'PASS_WEEKEND',
    name: 'Pass Week-end',
    description: 'Tous les modes et profils du vendredi soir au dimanche minuit.',
    price: 4.99,
    stripePriceId: null,
    stripeProductId: null,
    productType: 'PASS_WEEKEND',
    scope: { modes: ['DEEP_CONNECTION', 'DATE_NIGHT'], features: ['profiles'] },
    isSubscription: false,
    isPro: false,
  },
  {
    id: 'pack-profile',
    sku: 'PROFILE',
    name: 'Dossier Classifié',
    description: 'Votre rapport individuel à garder ou partager après la soirée.',
    price: 4.99,
    stripePriceId: null,
    stripeProductId: null,
    productType: 'PROFILE',
    scope: { features: ['profile'] },
    isSubscription: false,
    isPro: false,
  },
  {
    id: 'pack-profile-couple',
    sku: 'PROFILE_COUPLE',
    name: 'Dossier Couple',
    description: 'Le rapport de compatibilité de votre soirée en tête-à-tête.',
    price: 4.99,
    stripePriceId: null,
    stripeProductId: null,
    productType: 'PROFILE_COUPLE',
    scope: { features: ['profile_couple'] },
    isSubscription: false,
    isPro: false,
  },
  {
    id: 'pack-sub-annual',
    sku: 'SUBSCRIPTION_ANNUAL',
    name: 'Captain Bond Premium — Annuel',
    description: 'Tous les modes, dossiers et packs pendant 1 an.',
    price: 39.99,
    stripePriceId: null,
    stripeProductId: null,
    productType: 'SUBSCRIPTION_ANNUAL',
    scope: { modes: ['*'], features: ['profiles', 'packs', 'story'] },
    isSubscription: true,
    isPro: false,
  },
  {
    id: 'pack-sub-monthly',
    sku: 'SUBSCRIPTION_MONTHLY',
    name: 'Captain Bond Premium — Mensuel',
    description: 'Tous les modes, dossiers et packs pendant 1 mois.',
    price: 7.99,
    stripePriceId: null,
    stripeProductId: null,
    productType: 'SUBSCRIPTION_MONTHLY',
    scope: { modes: ['*'], features: ['profiles', 'packs', 'story'] },
    isSubscription: true,
    isPro: false,
  },
  {
    id: 'pack-lifetime',
    sku: 'LIFETIME',
    name: 'Captain Bond Lifetime',
    description: 'Accès à vie à tout le contenu actuel et futur.',
    price: 69.99,
    stripePriceId: null,
    stripeProductId: null,
    productType: 'LIFETIME',
    scope: { modes: ['*'], features: ['profiles', 'packs', 'story'] },
    isSubscription: false,
    isPro: false,
  },
  {
    id: 'pack-b2b-event',
    sku: 'B2B_EVENT',
    name: 'Captain Bond Pro — Événement',
    description: 'Une session team-building personnalisée, questions filtrées et dashboard facilitateur.',
    price: 299.00,
    stripePriceId: null,
    stripeProductId: null,
    productType: 'PACK',
    scope: { modes: ['*'], features: ['profiles', 'b2b_dashboard'] },
    isSubscription: false,
    isPro: true,
  },
  {
    id: 'pack-bar-monthly',
    sku: 'BAR_MONTHLY',
    name: 'Captain Bond Pro — Bar (99€/mois)',
    description: 'Abonnement mensuel pour bars, pubs et restaurants : jeu sur écran géant, kit de com et DJ vocal IA inclus.',
    price: 99.00,
    stripePriceId: null,
    stripeProductId: null,
    productType: 'BAR_MONTHLY',
    scope: { features: ['b2b_dashboard', 'tv_mode', 'bar_kit'] },
    isSubscription: true,
    isPro: true,
  },
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function normalizePack(row: unknown): Pack {
  if (!isRecord(row)) {
    throw new Error('Invalid pack row: expected an object');
  }
  return {
    id: String(row.id),
    sku: String(row.sku),
    name: String(row.name),
    description: String(row.description),
    price: Number(row.price),
    stripePriceId: row.stripePriceId ? String(row.stripePriceId) : null,
    stripeProductId: row.stripeProductId ? String(row.stripeProductId) : null,
    productType: String(row.productType) as ProductType,
    scope: (row.scope as PackScope) ?? null,
    isSubscription: Boolean(row.isSubscription ?? false),
    isPro: Boolean(row.isPro ?? false),
  };
}

export async function listPacks(): Promise<Pack[]> {
  const { data, error } = await supabaseAdmin.from('Pack').select('*').order('price', { ascending: true });
  if (error) {
    logger.error('Error fetching packs from DB', {}, error);
    return CATALOG_FALLBACK;
  }
  if (!data || data.length === 0) {
    return CATALOG_FALLBACK;
  }
  return data.map(normalizePack);
}

export async function getPackBySku(sku: string): Promise<Pack | null> {
  const { data, error } = await supabaseAdmin.from('Pack').select('*').eq('sku', sku).maybeSingle();
  if (error) {
    logger.error('Error fetching pack by SKU', { sku }, error);
    return CATALOG_FALLBACK.find((p) => p.sku === sku) ?? null;
  }
  if (!data) {
    return CATALOG_FALLBACK.find((p) => p.sku === sku) ?? null;
  }
  return normalizePack(data);
}

export async function getPackById(id: string): Promise<Pack | null> {
  const { data, error } = await supabaseAdmin.from('Pack').select('*').eq('id', id).maybeSingle();
  if (error || !data) return null;
  return normalizePack(data);
}

export function formatPrice(euros: number): string {
  return `${euros.toFixed(2).replace('.', ',')}€`;
}

export function toCents(euros: number): number {
  return Math.round(euros * 100);
}
