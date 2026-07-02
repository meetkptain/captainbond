-- Migration : ajout des champs pour les rituels couple thématiques

-- Champs sur Question (le modèle source des questions de rituel)
ALTER TABLE "Question"
  ADD COLUMN IF NOT EXISTS "theme" TEXT,
  ADD COLUMN IF NOT EXISTS "suggestedAction" TEXT,
  ADD COLUMN IF NOT EXISTS "therapistGuide" TEXT;

-- Champs sur DailyQuestion (le rituel généré pour un couple)
ALTER TABLE "DailyQuestion"
  ADD COLUMN IF NOT EXISTS "theme" TEXT,
  ADD COLUMN IF NOT EXISTS "intensity" INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS "ritualAction" TEXT,
  ADD COLUMN IF NOT EXISTS "therapistGuide" TEXT;

-- Table de suivi du cycle thématique par couple
CREATE TABLE IF NOT EXISTS "CoupleThemeCycle" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  "coupleId" TEXT NOT NULL UNIQUE,
  "currentTheme" TEXT NOT NULL,
  "weekNumber" INTEGER NOT NULL DEFAULT 1,
  "startedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "CoupleThemeCycle_coupleId_idx" ON "CoupleThemeCycle"("coupleId");

-- Empêche la création accidentelle de plusieurs rituels pour le même couple le même jour
CREATE UNIQUE INDEX IF NOT EXISTS "DailyQuestion_coupleId_releasedAt_key" ON "DailyQuestion"("coupleId", "releasedAt");
