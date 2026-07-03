-- Ajout de la valeur BAR_MONTHLY à l'énumération ProductType
ALTER TYPE "ProductType" ADD VALUE IF NOT EXISTS 'BAR_MONTHLY';

-- Mise à jour des prix B2C et B2B
UPDATE "Pack" SET price = 4.99 WHERE sku = 'PROFILE_COUPLE';
UPDATE "Pack" SET price = 299.00 WHERE sku = 'B2B_EVENT';

-- Création du pack abonnement Bar
INSERT INTO "Pack" (
  id,
  sku,
  name,
  description,
  price,
  "stripePriceId",
  "stripeProductId",
  "productType",
  scope,
  "isSubscription",
  "isPro",
  "createdAt"
) VALUES (
  'pack-bar-monthly',
  'BAR_MONTHLY',
  'Captain Bond Pro — Bar (99€/mois)',
  'Abonnement mensuel pour bars, pubs et restaurants : jeu sur écran géant, kit de com et DJ vocal IA inclus.',
  99.00,
  NULL,
  NULL,
  'BAR_MONTHLY',
  '{"features":["b2b_dashboard","tv_mode","bar_kit"]}',
  TRUE,
  TRUE,
  NOW()
)
ON CONFLICT (sku) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  "productType" = EXCLUDED."productType",
  scope = EXCLUDED.scope,
  "isSubscription" = EXCLUDED."isSubscription",
  "isPro" = EXCLUDED."isPro";
