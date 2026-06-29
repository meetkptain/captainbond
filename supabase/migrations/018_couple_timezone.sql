-- 018: Add timezone to Couple table
ALTER TABLE "Couple" ADD COLUMN IF NOT EXISTS "timezone" TEXT NOT NULL DEFAULT 'Europe/Paris';
