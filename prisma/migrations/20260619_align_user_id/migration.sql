-- Align User.id with Supabase Auth (no default uuid)
ALTER TABLE "User" ALTER COLUMN "id" DROP DEFAULT;
