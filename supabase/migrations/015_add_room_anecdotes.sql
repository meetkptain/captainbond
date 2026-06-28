-- Add customAnecdotes column to Room table
ALTER TABLE "Room" ADD COLUMN IF NOT EXISTS "customAnecdotes" JSONB DEFAULT '[]'::jsonb;
