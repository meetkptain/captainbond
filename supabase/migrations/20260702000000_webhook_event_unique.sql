-- Idempotence et atomicité des webhooks Stripe
BEGIN;

-- Ajoute une colonne unique stable pour l'ID Stripe et la remplit depuis l'id existant
ALTER TABLE "WebhookEvent" ADD COLUMN IF NOT EXISTS "stripeEventId" TEXT;

UPDATE "WebhookEvent" SET "stripeEventId" = id WHERE "stripeEventId" IS NULL;

ALTER TABLE "WebhookEvent" ALTER COLUMN "stripeEventId" SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'webhook_event_stripe_event_id_unique'
  ) THEN
    ALTER TABLE "WebhookEvent"
    ADD CONSTRAINT webhook_event_stripe_event_id_unique
    UNIQUE ("stripeEventId");
  END IF;
END $$;

-- Met à jour fulfill_checkout existant pour rester compatible avec la nouvelle colonne
CREATE OR REPLACE FUNCTION fulfill_checkout(
  p_event_id TEXT,
  p_event_type TEXT,
  p_payload JSONB,
  p_stripe_session_id TEXT,
  p_user_id TEXT,
  p_pack_id TEXT,
  p_room_code TEXT,
  p_player_id TEXT,
  p_product_type TEXT,
  p_duration_hours INT,
  p_metadata JSONB
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_room_id TEXT;
  v_expires_at TIMESTAMPTZ;
  v_existing_purchase_id TEXT;
BEGIN
  -- Verrou advisory par session pour éviter les courses sur le même achat
  PERFORM pg_advisory_xact_lock(hashtextextended('fulfill_checkout_' || p_stripe_session_id, 0));

  -- Idempotence : si l'événement a déjà été traité, on ne fait rien
  PERFORM id FROM "WebhookEvent" WHERE id = p_event_id;
  IF FOUND THEN
    RETURN;
  END IF;

  -- Idempotence achat : si un Purchase est déjà COMPLETED, on enregistre juste l'événement
  SELECT id INTO v_existing_purchase_id
  FROM "Purchase"
  WHERE "stripePaymentId" = p_stripe_session_id AND status = 'COMPLETED';

  IF v_existing_purchase_id IS NULL THEN
    UPDATE "Purchase"
    SET status = 'COMPLETED',
        "stripePaymentId" = p_stripe_session_id,
        metadata = COALESCE(metadata, '{}'::jsonb) || COALESCE(p_metadata, '{}'::jsonb)
    WHERE "stripePaymentId" = p_stripe_session_id
      AND "userId" = p_user_id;

    IF NOT FOUND THEN
      INSERT INTO "Purchase" (id, "userId", "playerId", "packId", amount, currency, status, "stripePaymentId", metadata)
      VALUES (
        gen_random_uuid()::TEXT,
        p_user_id,
        p_player_id,
        p_pack_id,
        (SELECT price FROM "Pack" WHERE id = p_pack_id),
        'eur',
        'COMPLETED',
        p_stripe_session_id,
        p_metadata
      );
    END IF;

    -- Pass temporaire
    IF p_product_type IN ('PASS_24H', 'PASS_WEEKEND') THEN
      v_expires_at := NOW() + (p_duration_hours || ' hours')::INTERVAL;

      INSERT INTO "UserPass" (id, "userId", "packId", "expiresAt", source)
      VALUES (gen_random_uuid()::TEXT, p_user_id, p_pack_id, v_expires_at, 'stripe');

      UPDATE "User" SET "activePassExpiresAt" = v_expires_at WHERE id = p_user_id;

      IF p_room_code IS NOT NULL AND p_room_code <> '' THEN
        SELECT id INTO v_room_id FROM "Room" WHERE code = upper(p_room_code);
        IF v_room_id IS NOT NULL THEN
          UPDATE "Room"
          SET "paidByUserId" = p_user_id, "passExpiresAt" = v_expires_at
          WHERE id = v_room_id;
        END IF;
      END IF;
    END IF;

    -- Profil individuel / couple
    IF p_product_type IN ('PROFILE', 'PROFILE_COUPLE') AND p_player_id IS NOT NULL THEN
      UPDATE "Player" SET "userId" = p_user_id WHERE id = p_player_id;
    END IF;

    -- Pack lifetime / thématique
    IF p_product_type IN ('LIFETIME', 'PACK') THEN
      INSERT INTO "UserPack" (id, "userId", "packId")
      VALUES (gen_random_uuid()::TEXT, p_user_id, p_pack_id)
      ON CONFLICT ("userId", "packId") DO NOTHING;
    END IF;
  END IF;

  -- Enregistrer l'événement comme traité
  INSERT INTO "WebhookEvent" (id, "stripeEventId", type, payload, processedAt)
  VALUES (p_event_id, p_event_id, p_event_type, p_payload, NOW());
END;
$$;

-- Enregistre un événement webhook Stripe de manière atomique et idempotente
CREATE OR REPLACE FUNCTION insert_webhook_event_if_not_exists(
  p_stripe_event_id TEXT,
  p_event_type TEXT,
  p_payload JSONB
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  inserted boolean := false;
BEGIN
  INSERT INTO "WebhookEvent" (id, "stripeEventId", type, payload, processedAt, "createdAt")
  VALUES (p_stripe_event_id, p_stripe_event_id, p_event_type, p_payload, NOW(), NOW())
  ON CONFLICT ("stripeEventId") DO NOTHING
  RETURNING true INTO inserted;
  RETURN COALESCE(inserted, false);
END;
$$;

-- Fulfillment atomique d'un checkout Stripe (sans enregistrement de l'événement,
-- celui-ci étant déjà enregistré par insert_webhook_event_if_not_exists)
CREATE OR REPLACE FUNCTION fulfill_checkout_v2(
  p_event_id TEXT,
  p_event_type TEXT,
  p_payload JSONB,
  p_stripe_session_id TEXT,
  p_user_id TEXT,
  p_email TEXT,
  p_name TEXT,
  p_pack_id TEXT,
  p_room_code TEXT,
  p_player_id TEXT,
  p_product_type TEXT,
  p_duration_hours INT,
  p_metadata JSONB,
  p_subscription_id TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_room_id TEXT;
  v_expires_at TIMESTAMPTZ;
  v_existing_purchase_id TEXT;
BEGIN
  -- Verrou advisory par session pour sérialiser webhook et reconciliation
  -- sur la même checkout session et éviter les doubles effets de bord.
  PERFORM pg_advisory_xact_lock(hashtextextended('fulfill_checkout_v2_' || p_stripe_session_id, 0));

  -- S'assurer que la ligne User existe (création silencieuse depuis le webhook)
  IF p_email IS NOT NULL AND p_email <> '' THEN
    INSERT INTO "User" (id, email, name)
    VALUES (p_user_id, p_email, COALESCE(p_name, ''))
    ON CONFLICT (id) DO NOTHING;
  END IF;

  -- Mise à jour du statut d'abonnement si applicable
  IF p_subscription_id IS NOT NULL AND p_subscription_id <> '' THEN
    UPDATE "User"
    SET "subscriptionStatus" = 'ACTIVE',
        "stripeSubscriptionId" = p_subscription_id
    WHERE id = p_user_id;
  END IF;

  -- Idempotence : achat déjà complété pour cette session
  SELECT id INTO v_existing_purchase_id
  FROM "Purchase"
  WHERE "stripePaymentId" = p_stripe_session_id AND status = 'COMPLETED';

  IF v_existing_purchase_id IS NULL THEN
    UPDATE "Purchase"
    SET status = 'COMPLETED',
        "stripePaymentId" = p_stripe_session_id,
        metadata = COALESCE(metadata, '{}'::jsonb) || COALESCE(p_metadata, '{}'::jsonb)
    WHERE "stripePaymentId" = p_stripe_session_id
      AND "userId" = p_user_id;

    IF NOT FOUND THEN
      INSERT INTO "Purchase" (id, "userId", "playerId", "packId", amount, currency, status, "stripePaymentId", metadata)
      VALUES (
        gen_random_uuid()::TEXT,
        p_user_id,
        p_player_id,
        p_pack_id,
        (SELECT price FROM "Pack" WHERE id = p_pack_id),
        'eur',
        'COMPLETED',
        p_stripe_session_id,
        p_metadata
      );
    END IF;

    -- Pass temporaire
    IF p_product_type IN ('PASS_24H', 'PASS_WEEKEND') THEN
      v_expires_at := NOW() + (p_duration_hours || ' hours')::INTERVAL;

      INSERT INTO "UserPass" (id, "userId", "packId", "expiresAt", source)
      VALUES (gen_random_uuid()::TEXT, p_user_id, p_pack_id, v_expires_at, 'stripe');

      UPDATE "User" SET "activePassExpiresAt" = v_expires_at WHERE id = p_user_id;

      IF p_room_code IS NOT NULL AND p_room_code <> '' THEN
        SELECT id INTO v_room_id FROM "Room" WHERE code = upper(p_room_code);
        IF v_room_id IS NOT NULL THEN
          UPDATE "Room"
          SET "paidByUserId" = p_user_id, "passExpiresAt" = v_expires_at
          WHERE id = v_room_id;
        END IF;
      END IF;
    END IF;

    -- Profil individuel / couple
    IF p_product_type IN ('PROFILE', 'PROFILE_COUPLE') AND p_player_id IS NOT NULL AND p_player_id <> '' THEN
      UPDATE "Player" SET "userId" = p_user_id WHERE id = p_player_id;
    END IF;

    -- Pack lifetime / thématique
    IF p_product_type IN ('LIFETIME', 'PACK') THEN
      INSERT INTO "UserPack" (id, "userId", "packId")
      VALUES (gen_random_uuid()::TEXT, p_user_id, p_pack_id)
      ON CONFLICT ("userId", "packId") DO NOTHING;
    END IF;
  END IF;
END;
$$;

COMMIT;
