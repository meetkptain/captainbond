// ================================================================
// CAPTAIN BOND — Configuration Centralisée de Monétisation
// ================================================================

export const MONETIZATION_CONFIG = {
  PROFILE_PRICE_CENTS: 499,
  COUPLE_PROFILE_PRICE_CENTS: 499,
  COUPLE_MONTHLY_PRICE_CENTS: 499,
  PASS_24H_PRICE_CENTS: 299,
  PASS_WEEKEND_PRICE_CENTS: 499,
  SUBSCRIPTION_MONTHLY_PRICE_CENTS: 799,
  SUBSCRIPTION_ANNUAL_PRICE_CENTS: 3999,
  CURRENCY: 'eur' as const,

  FREE_TEASER_ENABLED: true,
  MIN_QUESTIONS_RELIABILITY: 10,
  CONFIDENCE_THRESHOLD_PERCENT: 80,

  STRIPE_PRODUCT_NAME: 'Dossier Classifié — Captain Bond',
  STRIPE_COUPLE_PRODUCT_NAME: 'Dossier de Compatibilité ludique — Captain Bond',
  STRIPE_PASS_24H_PRODUCT_NAME: 'Pass 24h — Captain Bond',
} as const;

export type MonetizationConfig = typeof MONETIZATION_CONFIG;

export const REVENUECAT_PRODUCT_MAPPING: Record<
  string,
  { packId: string; productType: string; durationHours: number }
> = {
  'com.meetkptain.captainbond.pass24h': {
    packId: 'pack-pass-24h',
    productType: 'PASS_24H',
    durationHours: 24,
  },
  'com.meetkptain.captainbond.dossierflirt': {
    packId: 'pack-profile',
    productType: 'PROFILE',
    durationHours: 24 * 365,
  },
  'com.meetkptain.captainbond.dossiercouple': {
    packId: 'pack-profile-couple',
    productType: 'PROFILE_COUPLE',
    durationHours: 24 * 365,
  },
  'com.meetkptain.captainbond.subcouple': {
    packId: 'pack-sub-monthly',
    productType: 'SUBSCRIPTION_MONTHLY',
    durationHours: 24 * 30,
  },
  'com.meetkptain.captainbond.couplemonthly': {
    packId: 'pack-couple-monthly',
    productType: 'SUBSCRIPTION_MONTHLY',
    durationHours: 24 * 30,
  },
} as const;

export const COUPLE_FALLBACK_QUESTIONS = [
  'Quel est le plus grand point commun inattendu entre vous deux ?',
  'Quelle petite attention du quotidien chez ton partenaire te touche le plus ?',
  'Quelle habitude de l\'autre as-tu fini par adopter avec le temps ?',
  'Si votre couple était un genre de film ou une chanson, lequel serait-ce et pourquoi ?',
  'Quel voyage ou projet aimeriez-vous réaliser ensemble dans les 12 prochains mois ?',
] as const;
