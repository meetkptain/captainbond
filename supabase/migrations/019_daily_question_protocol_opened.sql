-- 019: Add protocolOpened to DailyQuestion table
ALTER TABLE "DailyQuestion" ADD COLUMN IF NOT EXISTS "protocolOpened" BOOLEAN NOT NULL DEFAULT false;
