-- Migration : monétisation robuste v2
-- Objectif : ajouter Supabase Auth-ready User, catalogue Pack, abonnements, lifetime, entitlements

-- ============================================================
-- 1. Enums
-- ============================================================

CREATE TYPE "SubscriptionStatus" AS ENUM ('NONE', 'ACTIVE', 'CANCELLED', 'PAST_DUE');
CREATE TYPE "PurchaseStatus" AS ENUM ('PENDING', 'COMPLETED', 'REFUNDED', 'FAILED');
CREATE TYPE "ProductType" AS ENUM (
  'PASS_24H',
  'PASS_WEEKEND',
  'SUBSCRIPTION_ANNUAL',
  'SUBSCRIPTION_MONTHLY',
  'LIFETIME',
  'PROFILE',
  'PROFILE_COUPLE',
  'PACK',
  'CREDIT'
);

-- ============================================================
-- 2. Table Pack : ajout sku, productType, scope, stripeProductId
-- ============================================================

ALTER TABLE "Pack"
  ADD COLUMN "sku" TEXT UNIQUE,
  ADD COLUMN "productType" "ProductType" NOT NULL DEFAULT 'PACK',
  ADD COLUMN "scope" JSONB,
  ADD COLUMN "stripeProductId" TEXT;

-- Index sur sku
CREATE INDEX "Pack_sku_idx" ON "Pack"("sku");

-- ============================================================
-- 3. Table User : ajout subscriptionStatus, stripeSubscriptionId
-- ============================================================

ALTER TABLE "User"
  ADD COLUMN "subscriptionStatus" "SubscriptionStatus" NOT NULL DEFAULT 'NONE',
  ADD COLUMN "stripeSubscriptionId" TEXT;

-- ============================================================
-- 4. Table Purchase : ajout userId, status, refundedAt, metadata, currency, stripeInvoiceId
-- ============================================================

ALTER TABLE "Purchase"
  ADD COLUMN "userId" TEXT,
  ADD COLUMN "status" "PurchaseStatus" NOT NULL DEFAULT 'COMPLETED',
  ADD COLUMN "refundedAt" TIMESTAMPTZ,
  ADD COLUMN "metadata" JSONB,
  ADD COLUMN "currency" TEXT NOT NULL DEFAULT 'eur',
  ADD COLUMN "stripeInvoiceId" TEXT;

-- Index et FK Purchase -> User
CREATE INDEX "Purchase_userId_idx" ON "Purchase"("userId");
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE SET NULL ON UPDATE CASCADE;

-- Index stripePaymentId
CREATE INDEX "Purchase_stripePaymentId_idx" ON "Purchase"("stripePaymentId");

-- ============================================================
-- 5. Table Room : ajout paidByUserId, passExpiresAt
-- ============================================================

ALTER TABLE "Room"
  ADD COLUMN "paidByUserId" TEXT,
  ADD COLUMN "passExpiresAt" TIMESTAMPTZ;

ALTER TABLE "Room" ADD CONSTRAINT "Room_paidByUserId_fkey"
  FOREIGN KEY ("paidByUserId") REFERENCES "User"(id) ON DELETE SET NULL ON UPDATE CASCADE;

-- ============================================================
-- 6. Nouvelle table UserPass (historique des Pass temporaires)
-- ============================================================

CREATE TABLE "UserPass" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "packId" TEXT NOT NULL,
  "startedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "expiresAt" TIMESTAMPTZ NOT NULL,
  "source" TEXT NOT NULL DEFAULT 'stripe',
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "UserPass_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "UserPass_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "UserPass_packId_fkey" FOREIGN KEY ("packId") REFERENCES "Pack"(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "UserPass_userId_expiresAt_idx" ON "UserPass"("userId", "expiresAt");

-- ============================================================
-- 7. Nouvelle table UserPack (packs lifetime/thématiques achetés)
-- ============================================================

CREATE TABLE "UserPack" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "packId" TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "UserPack_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "UserPack_userId_packId_key" UNIQUE ("userId", "packId"),
  CONSTRAINT "UserPack_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "UserPack_packId_fkey" FOREIGN KEY ("packId") REFERENCES "Pack"(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "UserPack_userId_idx" ON "UserPack"("userId");

-- ============================================================
-- 8. Migration des données existantes
-- ============================================================

-- Les achats existants ont packId = 'pass-24h' ou 'profile' (magique).
-- On crée des packs correspondants pour ne pas casser les FK.

INSERT INTO "Pack" ("id", "sku", "name", "description", "price", "productType", "scope", "isSubscription", "isPro")
VALUES
  ('pass-24h-legacy', 'PASS_24H_LEGACY', 'Pass 24h (legacy)', 'Pass 24h hérité', 4.99, 'PASS_24H', '{"modes":["DEEP_CONNECTION","DATE_NIGHT"],"features":["profiles"]}', false, false),
  ('profile-legacy', 'PROFILE_LEGACY', 'Dossier Classifié (legacy)', 'Dossier individuel hérité', 1.99, 'PROFILE', '{"features":["profile"]}', false, false)
ON CONFLICT ("id") DO NOTHING;

-- Mettre à jour les achats existants avec packId magique pour pointer vers les packs legacy
UPDATE "Purchase"
SET "packId" = CASE
  WHEN "packId" = 'pass-24h' THEN 'pass-24h-legacy'
  WHEN "packId" = 'profile' THEN 'profile-legacy'
  ELSE "packId"
END;

-- Récupérer userId des joueurs pour les achats existants
UPDATE "Purchase" p
SET "userId" = pl."userId"
FROM "Player" pl
WHERE p."playerId" = pl.id AND p."userId" IS NULL;

-- ============================================================
-- 9. Contraintes finales
-- ============================================================

-- Purchase.packId doit être une vraie FK
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_packId_fkey"
  FOREIGN KEY ("packId") REFERENCES "Pack"(id) ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "Purchase_packId_idx" ON "Purchase"("packId");

-- ============================================================
-- 10. Seed catalogue officiel v2
-- ============================================================

INSERT INTO "Pack" ("id", "sku", "name", "description", "price", "productType", "scope", "isSubscription", "isPro")
VALUES
  ('pack-pass-24h', 'PASS_24H', 'Pass 24h', 'Débloque tous les modes premium et les dossiers pour 24h.', 2.99, 'PASS_24H', '{"modes":["DEEP_CONNECTION","DATE_NIGHT"],"features":["profiles"]}', false, false),
  ('pack-pass-weekend', 'PASS_WEEKEND', 'Pass Week-end', 'Débloque tous les modes premium et les dossiers du vendredi soir au dimanche minuit.', 4.99, 'PASS_WEEKEND', '{"modes":["DEEP_CONNECTION","DATE_NIGHT"],"features":["profiles"]}', false, false),
  ('pack-profile', 'PROFILE', 'Dossier Classifié', 'Rapport individuel complet avec archétype, description et axes comportementaux.', 9.99, 'PROFILE', '{"features":["profile"]}', false, false),
  ('pack-profile-couple', 'PROFILE_COUPLE', 'Dossier Couple', 'Rapport de compatibilité complet pour deux joueurs.', 14.99, 'PROFILE_COUPLE', '{"features":["profile_couple"]}', false, false),
  ('pack-sub-annual', 'SUBSCRIPTION_ANNUAL', 'Captain Bond Premium — Annuel', 'Tous les modes, tous les dossiers, tous les packs pendant 1 an.', 39.99, 'SUBSCRIPTION_ANNUAL', '{"modes":["*"],"features":["profiles","packs","story"]}', true, false),
  ('pack-sub-monthly', 'SUBSCRIPTION_MONTHLY', 'Captain Bond Premium — Mensuel', 'Tous les modes, tous les dossiers, tous les packs pendant 1 mois.', 7.99, 'SUBSCRIPTION_MONTHLY', '{"modes":["*"],"features":["profiles","packs","story"]}', true, false),
  ('pack-lifetime', 'LIFETIME', 'Captain Bond Lifetime', 'Accès à vie à tout le contenu actuel et futur.', 69.99, 'LIFETIME', '{"modes":["*"],"features":["profiles","packs","story"]}', false, false),
  ('pack-date-night-pro', 'PACK_DATE_NIGHT_PRO', 'Pack Date Night Pro', 'Questions profondes et hot pour couples.', 4.99, 'PACK', '{"modes":["DATE_NIGHT"],"features":["questions"]}', false, false),
  ('pack-deep-friends', 'PACK_DEEP_FRIENDS', 'Pack Deep Friends', 'Questions de vulnérabilité pour amis proches.', 3.99, 'PACK', '{"modes":["DEEP_CONNECTION"],"features":["questions"]}', false, false)
ON CONFLICT ("sku") DO UPDATE SET
  "name" = EXCLUDED.name,
  "description" = EXCLUDED.description,
  "price" = EXCLUDED.price,
  "productType" = EXCLUDED.productType,
  "scope" = EXCLUDED.scope,
  "isSubscription" = EXCLUDED.isSubscription;
