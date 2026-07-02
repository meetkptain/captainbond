-- 025: Couple feature — constraints, indexes, and integrity fixes
-- Adds missing CHECK constraints, FKs, composite indexes, and an updatedAt trigger.

-- 1. Ensure Tree is owned by exactly one of couple or room
ALTER TABLE "Tree"
  DROP CONSTRAINT IF EXISTS "Tree_couple_or_room_check",
  ADD CONSTRAINT "Tree_couple_or_room_check"
    CHECK (("coupleId" IS NULL) != ("roomId" IS NULL));

-- 2. Ensure DJProfile is owned by exactly one of couple or room
ALTER TABLE "DJProfile"
  DROP CONSTRAINT IF EXISTS "DJProfile_couple_or_room_check",
  ADD CONSTRAINT "DJProfile_couple_or_room_check"
    CHECK (("coupleId" IS NULL) != ("roomId" IS NULL));

-- 3. Ensure DailyQuestion has at least a bank question or custom text
ALTER TABLE "DailyQuestion"
  DROP CONSTRAINT IF EXISTS "DailyQuestion_question_or_text_check",
  ADD CONSTRAINT "DailyQuestion_question_or_text_check"
    CHECK ("questionId" IS NOT NULL OR "customText" IS NOT NULL);

-- 4. Foreign key from TimeCapsule.senderId to User
ALTER TABLE "TimeCapsule"
  DROP CONSTRAINT IF EXISTS "TimeCapsule_senderId_fkey",
  ADD CONSTRAINT "TimeCapsule_senderId_fkey"
    FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 5. Make TreeConnection unique per tree, not globally per node pair
ALTER TABLE "TreeConnection"
  DROP CONSTRAINT IF EXISTS "TreeConnection_sourceId_targetId_key",
  ADD CONSTRAINT "TreeConnection_treeId_sourceId_targetId_key"
    UNIQUE ("treeId", "sourceId", "targetId");

-- 6. Composite index for revealDueQuestions
CREATE INDEX IF NOT EXISTS "DailyQuestion_coupleId_analysisStatus_isRevealed_idx"
  ON "DailyQuestion" ("coupleId", "analysisStatus", "isRevealed");

-- 7. Composite index for unlockDueCapsules
CREATE INDEX IF NOT EXISTS "TimeCapsule_coupleId_isUnlocked_unlocksAt_idx"
  ON "TimeCapsule" ("coupleId", "isUnlocked", "unlocksAt");

-- 8. Auto-update updatedAt on TotemState
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_totem_state_updated_at ON "TotemState";
CREATE TRIGGER update_totem_state_updated_at
  BEFORE UPDATE ON "TotemState"
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
