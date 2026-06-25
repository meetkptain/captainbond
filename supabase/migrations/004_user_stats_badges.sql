-- Ajout des champs de meta-progression à UserStats
ALTER TABLE "UserStats"
  ADD COLUMN IF NOT EXISTS "badges" JSONB NOT NULL DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS "archetypesUnlocked" JSONB NOT NULL DEFAULT '[]';
