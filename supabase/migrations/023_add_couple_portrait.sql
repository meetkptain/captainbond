-- 022: Table de portrait sémantique mensuel du couple

CREATE TABLE IF NOT EXISTS "CouplePortrait" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  "coupleId" TEXT NOT NULL,
  "month" TEXT NOT NULL,
  "partnerAProfile" JSONB,
  "partnerBProfile" JSONB,
  "coupleDynamic" JSONB,
  "alignmentTrend" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE "CouplePortrait"
  ADD CONSTRAINT "CouplePortrait_coupleId_fkey"
  FOREIGN KEY ("coupleId") REFERENCES "Couple"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

CREATE UNIQUE INDEX IF NOT EXISTS "CouplePortrait_coupleId_month_key"
  ON "CouplePortrait"("coupleId", "month");

CREATE INDEX IF NOT EXISTS "CouplePortrait_coupleId_idx"
  ON "CouplePortrait"("coupleId");
