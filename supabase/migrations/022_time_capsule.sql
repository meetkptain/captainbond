-- 021: Time Capsule Table for couple connection history
CREATE TABLE IF NOT EXISTS "TimeCapsule" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::TEXT,
  "coupleId" TEXT NOT NULL,
  "senderId" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "unlocksAt" TIMESTAMP(3) NOT NULL,
  "isUnlocked" BOOLEAN NOT NULL DEFAULT false,
  CONSTRAINT "TimeCapsule_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "TimeCapsule_coupleId_fkey" FOREIGN KEY ("coupleId") REFERENCES "Couple"("id") ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE "TimeCapsule" ENABLE ROW LEVEL SECURITY;

-- Select policy
CREATE POLICY "capsule_select_couple_members" ON "TimeCapsule"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM "Couple" c
      WHERE c."id" = "TimeCapsule"."coupleId"
        AND (c."user1Id" = auth.uid()::TEXT OR c."user2Id" = auth.uid()::TEXT)
    )
  );

-- Insert policy
CREATE POLICY "capsule_insert_couple_members" ON "TimeCapsule"
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM "Couple" c
      WHERE c."id" = "TimeCapsule"."coupleId"
        AND (c."user1Id" = auth.uid()::TEXT OR c."user2Id" = auth.uid()::TEXT)
    )
  );

-- Update policy (unlocked toggle)
CREATE POLICY "capsule_update_couple_members" ON "TimeCapsule"
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM "Couple" c
      WHERE c."id" = "TimeCapsule"."coupleId"
        AND (c."user1Id" = auth.uid()::TEXT OR c."user2Id" = auth.uid()::TEXT)
    )
  );
