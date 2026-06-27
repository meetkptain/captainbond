-- ⚡ CAPTAIN BOND - REVEAL SCORES ATOMIQUES
-- Tâche 4.6 : Contrainte unique sur Score et RPC d'upsert des scores de reveal

ALTER TABLE "Score" ADD CONSTRAINT "Score_roomId_playerId_key" UNIQUE ("roomId", "playerId");

CREATE OR REPLACE FUNCTION upsert_reveal_scores(
  p_room_id TEXT,
  p_response_updates JSONB,
  p_score_upserts JSONB
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_item JSONB;
BEGIN
  -- 1. Mettre à jour isCorrect dans la table Response
  IF p_response_updates IS NOT NULL AND jsonb_array_length(p_response_updates) > 0 THEN
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_response_updates) LOOP
      UPDATE "Response"
      SET "isCorrect" = (v_item->>'is_correct')::BOOLEAN
      WHERE id = v_item->>'response_id' AND "roomId" = p_room_id;
    END LOOP;
  END IF;

  -- 2. Upsert dans la table Score en accumulant les points
  IF p_score_upserts IS NOT NULL AND jsonb_array_length(p_score_upserts) > 0 THEN
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_score_upserts) LOOP
      INSERT INTO "Score" (id, "roomId", "playerId", points, "updatedAt")
      VALUES (
        gen_random_uuid()::TEXT,
        p_room_id,
        v_item->>'player_id',
        (v_item->>'points_to_add')::INTEGER,
        NOW()
      )
      ON CONFLICT ("roomId", "playerId") DO UPDATE
      SET points = "Score".points + (v_item->>'points_to_add')::INTEGER,
          "updatedAt" = NOW();
    END LOOP;
  END IF;
END;
$$;
