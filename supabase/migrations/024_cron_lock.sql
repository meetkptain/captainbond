CREATE TABLE IF NOT EXISTS "CronLock" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "lockedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "lockedBy" TEXT
);

CREATE INDEX IF NOT EXISTS "CronLock_lockedAt_idx" ON "CronLock"("lockedAt");
