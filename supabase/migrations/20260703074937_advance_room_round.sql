-- P0.2 — Atomic room round advancement with optimistic locking.
-- Prevents double-increment race condition when host double-clicks or
-- network retries cause concurrent startNextRound calls.
-- Uses FOR UPDATE lock + expected_round + expected_status to guarantee
-- only one request succeeds.

CREATE OR REPLACE FUNCTION advance_room_round(
  p_room_code TEXT,
  p_expected_round INT,
  p_expected_status TEXT,
  p_question_id TEXT,
  p_round_config JSONB DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_room_id TEXT;
  v_new_round INT;
  v_new_status TEXT;
BEGIN
  SELECT id INTO v_room_id
  FROM "Room"
  WHERE code = upper(p_room_code)
    AND round = p_expected_round
    AND status = p_expected_status
  FOR UPDATE;

  IF v_room_id IS NULL THEN
    RAISE EXCEPTION 'Race condition: room round already advanced (expected round=%, status=%)',
      p_expected_round, p_expected_status;
  END IF;

  UPDATE "Room"
  SET
    round = round + 1,
    status = 'PLAYING',
    "currentQuestionId" = p_question_id,
    "roundConfig" = COALESCE(p_round_config, "roundConfig")
  WHERE id = v_room_id
  RETURNING round, status INTO v_new_round, v_new_status;

  RETURN jsonb_build_object(
    'id', v_room_id,
    'round', v_new_round,
    'status', v_new_status
  );
END;
$$;
