-- Unique trial grant per user. Partial index so it only blocks duplicate
-- `couple_trial` rows; other sources (e.g. `stripe` for PASS_24H) can still
-- have multiple rows per user.
CREATE UNIQUE INDEX IF NOT EXISTS "unique_userpass_user_source_trial"
ON "UserPass" ("userId", source)
WHERE source = 'couple_trial';
