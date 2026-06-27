-- ⚡ CAPTAIN BOND - EMPECHER RACE CONDITION DANS DETECTION IMPOSTEUR
-- Tâche 4.7 : RPC pour détection imposteur atomique

CREATE OR REPLACE FUNCTION record_imposteur_detection(
  p_room_id TEXT,
  p_target_player_id TEXT,
  p_source_player_id TEXT,
  p_lie_index INTEGER
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_room_status TEXT;
  v_current_mode TEXT;
  v_round_config JSONB;
  v_detection_phase BOOLEAN;
BEGIN
  -- Verrouiller la room pour éviter les race conditions
  SELECT status, "currentMode", COALESCE("roundConfig", '{}')::JSONB
  INTO v_room_status, v_current_mode, v_round_config
  FROM "Room"
  WHERE id = p_room_id
  FOR UPDATE;

  IF v_room_status IS NULL THEN
    RAISE EXCEPTION 'Salle introuvable';
  END IF;

  IF v_current_mode <> 'IMPOSTEUR' THEN
    RAISE EXCEPTION 'Mode invalide';
  END IF;

  IF v_room_status <> 'PLAYING' THEN
    RAISE EXCEPTION 'La manche n''est pas en cours';
  END IF;

  -- Vérifier la phase de détection dans le roundConfig
  v_detection_phase := (v_round_config->>'detectionPhase')::BOOLEAN;
  IF v_detection_phase IS NOT TRUE THEN
    RAISE EXCEPTION 'La phase de détection n''a pas commencé';
  END IF;

  -- Mettre à jour le roundConfig de manière atomique en utilisant jsonb_set
  IF NOT (v_round_config ? 'detections') THEN
    v_round_config := jsonb_set(v_round_config, '{detections}', '{}'::JSONB);
  END IF;
  
  IF NOT (v_round_config->'detections' ? p_target_player_id) THEN
    v_round_config := jsonb_set(v_round_config, ARRAY['detections', p_target_player_id], '{}'::JSONB);
  END IF;

  v_round_config := jsonb_set(
    v_round_config,
    ARRAY['detections', p_target_player_id, p_source_player_id],
    to_jsonb(p_lie_index)
  );

  UPDATE "Room"
  SET "roundConfig" = v_round_config
  WHERE id = p_room_id;
END;
$$;
