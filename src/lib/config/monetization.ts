// ================================================================
// CAPTAIN BOND — Configuration Centralisée de Monétisation
// ================================================================
// Ce fichier centralise toutes les variables de pricing et de
// comportement du paywall. Modifiez ces valeurs pour l'A/B testing
// ou les promotions saisonnières sans toucher au code UI.
// ================================================================

export const MONETIZATION_CONFIG = {
  // --- Prix ---
  PROFILE_PRICE_CENTS: 499,           // 4.99€ — Dossier Classifié individuel
  COUPLE_PROFILE_PRICE_CENTS: 999,    // 9.99€ — Dossier de Compatibilité ludique (Date Night)
  PASS_24H_PRICE_CENTS: 299,          // 2.99€ — Pass 24h (tous modes + profils)
  CURRENCY: 'eur' as const,

  // --- Entonnoir Freemium ---
  FREE_TEASER_ENABLED: true,          // true = Archétype visible gratuitement, axes floutés
                                       // false = Tout bloqué derrière le paywall

  // --- Jauge de Fiabilité ---
  MIN_QUESTIONS_RELIABILITY: 10,       // Nombre minimum de questions pour un profil "fiable"
  CONFIDENCE_THRESHOLD_PERCENT: 80,    // % minimum de la jauge pour autoriser l'achat

  // --- Stripe ---
  STRIPE_PRODUCT_NAME: 'Dossier Classifié — Captain Bond',
  STRIPE_COUPLE_PRODUCT_NAME: 'Dossier de Compatibilité ludique — Captain Bond',
  STRIPE_PASS_24H_PRODUCT_NAME: 'Pass 24h — Captain Bond',
} as const;

export type MonetizationConfig = typeof MONETIZATION_CONFIG;
