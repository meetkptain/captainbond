-- Single-use invite tokens for couple linking.
-- Stores a hash of the signed token; the token itself is only present in the
-- invite URL shared by the inviter. Marked used on first successful join.
CREATE TABLE IF NOT EXISTS "CoupleInvite" (
  id        TEXT PRIMARY KEY,
  "inviterId" TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  "tokenHash" TEXT NOT NULL UNIQUE,
  "expiresAt" TIMESTAMPTZ NOT NULL,
  "usedAt"  TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "idx_couple_invite_token_hash"
ON "CoupleInvite" ("tokenHash");