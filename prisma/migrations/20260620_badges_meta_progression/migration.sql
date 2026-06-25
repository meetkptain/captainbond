-- Migration : meta-progression (badges & archetypes)
-- Objectif : stocker les badges débloqués et les archétypes découverts dans UserStats.

ALTER TABLE "UserStats"
  ADD COLUMN IF NOT EXISTS "badges" JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS "archetypesUnlocked" JSONB NOT NULL DEFAULT '[]'::jsonb;
