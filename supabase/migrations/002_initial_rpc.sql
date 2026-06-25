-- ⚡ CAPTAIN BOND - FONCTIONS RPC POUR TRANSACTIONS ATOMIQUES
-- À exécuter dans l'éditeur SQL de Supabase.

-- 1. Vote atomique avec vérification du statut de la room et anti-double vote
CREATE OR REPLACE FUNCTION record_vote(
  p_player_id TEXT,
  p_room_code TEXT,
  p_question_id TEXT,
  p_answer TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_room_id TEXT;
  v_player_id TEXT;
  v_existing_id TEXT;
  v_response_id TEXT;
BEGIN
  -- Verrouiller la room en mode PLAYING pour éviter les races avec reveal/end
  SELECT id INTO v_room_id
  FROM "Room"
  WHERE code = upper(p_room_code) AND status = 'PLAYING'
  FOR UPDATE;

  IF v_room_id IS NULL THEN
    RAISE EXCEPTION 'Salle introuvable ou partie non en cours';
  END IF;

  -- Vérifier que le joueur est inscrit dans cette salle
  SELECT id INTO v_player_id
  FROM "Player"
  WHERE id = p_player_id AND "roomId" = v_room_id;

  IF v_player_id IS NULL THEN
    RAISE EXCEPTION 'Joueur non inscrit dans cette salle';
  END IF;

  -- Anti-double vote
  SELECT id INTO v_existing_id
  FROM "Response"
  WHERE "playerId" = p_player_id AND "questionId" = p_question_id;

  IF v_existing_id IS NOT NULL THEN
    RAISE EXCEPTION 'Vous avez déjà voté pour cette question';
  END IF;

  v_response_id := gen_random_uuid()::TEXT;

  INSERT INTO "Response" (id, "playerId", "roomId", "questionId", answer, timestamp)
  VALUES (
    v_response_id,
    p_player_id,
    v_room_id,
    p_question_id,
    p_answer,
    NOW()
  );

  RETURN jsonb_build_object('responseId', v_response_id);
END;
$$;

-- 2. Finalisation atomique d'un achat Stripe (idempotente côté DB)
-- Le webhook Stripe et l'insertion dans WebhookEvent sont réalisés dans la MÊME
-- transaction. Si le fulfillment échoue, l'événement n'est pas marqué comme traité.
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
    -- Mettre à jour / insérer le Purchase
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

  -- Enregistrer l'événement comme traité (même si l'achat était déjà complété)
  INSERT INTO "WebhookEvent" (id, type, payload, processedAt)
  VALUES (p_event_id, p_event_type, p_payload, NOW());
END;
$$;
