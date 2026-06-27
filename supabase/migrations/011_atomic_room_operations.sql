-- ⚡ CAPTAIN BOND - OPERATIONS DE ROOM ATOMIQUES
-- Tâche 4.5 : Inscription atomique dans une room

CREATE OR REPLACE FUNCTION join_room(
  p_room_code TEXT,
  p_player_name TEXT,
  p_player_id TEXT,
  p_max_players INTEGER,
  p_consent_given_at TIMESTAMPTZ
)
RETURNS TABLE (
  player_id TEXT,
  room_id TEXT,
  room_code TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_room_id TEXT;
  v_room_status TEXT;
  v_non_host_count INTEGER;
  v_name_exists BOOLEAN;
BEGIN
  -- Récupérer la room et verrouiller la ligne pour éviter les accès concurrents
  SELECT id, status INTO v_room_id, v_room_status
  FROM "Room"
  WHERE code = upper(p_room_code)
  FOR UPDATE;

  IF v_room_id IS NULL THEN
    RAISE EXCEPTION 'Salle introuvable';
  END IF;

  -- Vérifier le statut de la room
  IF v_room_status <> 'WAITING' THEN
    RAISE EXCEPTION 'La partie n''est pas en attente';
  END IF;

  -- Vérifier si le nom est déjà pris dans cette room
  SELECT EXISTS(
    SELECT 1 FROM "Player"
    WHERE "roomId" = v_room_id AND lower(name) = lower(p_player_name)
  ) INTO v_name_exists;

  IF v_name_exists THEN
    RAISE EXCEPTION 'Ce nom est déjà pris';
  END IF;

  -- Vérifier la limite maxPlayers si spécifiée
  IF p_max_players IS NOT NULL AND p_max_players > 0 THEN
    SELECT COUNT(*) INTO v_non_host_count
    FROM "Player"
    WHERE "roomId" = v_room_id AND "isHost" = FALSE;

    IF v_non_host_count >= p_max_players THEN
      RAISE EXCEPTION 'Cette table est complète';
    END IF;
  END IF;

  -- Insérer le joueur
  INSERT INTO "Player" (
    id,
    name,
    "isHost",
    "isReady",
    "socketId",
    "roomId",
    "consentGivenAt",
    "createdAt"
  )
  VALUES (
    p_player_id,
    p_player_name,
    FALSE,
    FALSE,
    '',
    v_room_id,
    p_consent_given_at,
    NOW()
  );

  RETURN QUERY SELECT p_player_id, v_room_id, p_room_code;
END;
$$;
