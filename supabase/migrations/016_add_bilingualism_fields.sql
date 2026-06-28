-- Migration 016: Add language columns to Room and Question tables
ALTER TABLE "Room" ADD COLUMN IF NOT EXISTS "language" VARCHAR(5) DEFAULT 'fr';
ALTER TABLE "Question" ADD COLUMN IF NOT EXISTS "language" VARCHAR(5) DEFAULT 'fr';

-- Index for efficient queries
CREATE INDEX IF NOT EXISTS "Question_language_idx" ON "Question"("language");
CREATE INDEX IF NOT EXISTS "Room_language_idx" ON "Room"("language");
