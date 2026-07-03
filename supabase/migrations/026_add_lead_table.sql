-- Création de la table Lead pour le CRM interne B2B/Bar
CREATE TABLE IF NOT EXISTS "Lead" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  source TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT NOT NULL,
  participants INT,
  "estimatedPrice" DOUBLE PRECISION,
  formula TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'NEW',
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS "idx_lead_email_source" ON "Lead" (email, source);
CREATE INDEX IF NOT EXISTS "idx_lead_source_status" ON "Lead" (source, status);
CREATE INDEX IF NOT EXISTS "idx_lead_email" ON "Lead" (email);
CREATE INDEX IF NOT EXISTS "idx_lead_created_at" ON "Lead" ("createdAt");
