-- 🔧 Fix schema Prisma vs code
-- Ajoute les colonnes manquantes à Question et Player utilisées par les services et l'admin dashboard.

-- Question : champs critiques pour le CRUD admin, le mode Imposteur, et les révélations
ALTER TABLE "Question"
  ADD COLUMN IF NOT EXISTS "correctAnswer" TEXT,
  ADD COLUMN IF NOT EXISTS "options" TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS "explanation" TEXT,
  ADD COLUMN IF NOT EXISTS "category" TEXT NOT NULL DEFAULT 'GENERAL',
  ADD COLUMN IF NOT EXISTS "difficulty" INTEGER NOT NULL DEFAULT 1;

CREATE INDEX IF NOT EXISTS "Question_category_idx" ON "Question"("category");

-- Player : createdAt requis par adminService.getAdminStats()
ALTER TABLE "Player"
  ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW();

CREATE INDEX IF NOT EXISTS "Player_createdAt_idx" ON "Player"("createdAt");

-- Backfill : s'assurer que les questions existantes ont une catégorie et une difficulté valides
UPDATE "Question" SET "category" = 'GENERAL' WHERE "category" IS NULL OR "category" = '';
UPDATE "Question" SET "difficulty" = 1 WHERE "difficulty" IS NULL OR "difficulty" < 1;
