-- Add TotemState model
CREATE TABLE IF NOT EXISTS "TotemState" (
    "id" TEXT NOT NULL,
    "coupleId" TEXT NOT NULL,
    "stateA" JSONB NOT NULL DEFAULT '{"hue":220,"saturation":70,"lightness":50,"energy":0.5,"attachmentStyle":"secure","particleDensity":0.5,"pulseRate":1.0}',
    "stateB" JSONB NOT NULL DEFAULT '{"hue":280,"saturation":70,"lightness":50,"energy":0.5,"attachmentStyle":"secure","particleDensity":0.5,"pulseRate":1.0}',
    "fusionState" JSONB NOT NULL DEFAULT '{"harmonyRate":0.5,"tensionLevel":0.0,"fusionTexture":"silk","faultLineVisible":false,"syncScore":0.0,"evolutionStage":1}',
    "lastRitualAt" TIMESTAMP(3),
    "streakDays" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TotemState_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "TotemState_coupleId_key" UNIQUE ("coupleId"),
    CONSTRAINT "TotemState_coupleId_fkey" FOREIGN KEY ("coupleId") REFERENCES "Couple"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "TotemState_coupleId_idx" ON "TotemState"("coupleId");

-- TimeCapsule FK to User
ALTER TABLE "TimeCapsule" ADD CONSTRAINT "TimeCapsule_senderId_fkey"
    FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- TimeCapsule composite index
CREATE INDEX "TimeCapsule_coupleId_isUnlocked_unlocksAt_idx" ON "TimeCapsule"("coupleId", "isUnlocked", "unlocksAt");

-- TreeConnection unique per tree
ALTER TABLE "TreeConnection" DROP CONSTRAINT IF EXISTS "TreeConnection_sourceId_targetId_key";
ALTER TABLE "TreeConnection" ADD CONSTRAINT "TreeConnection_treeId_sourceId_targetId_key"
    UNIQUE ("treeId", "sourceId", "targetId");

-- DailyQuestion composite index
CREATE INDEX "DailyQuestion_coupleId_analysisStatus_isRevealed_idx" ON "DailyQuestion"("coupleId", "analysisStatus", "isRevealed");
