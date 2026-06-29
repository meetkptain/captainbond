-- 017: Totem States — Stocke l'état visuel des Orbes individuels et de la Sphère de Fusion
-- Chaque couple a un unique TotemState qui évolue en temps réel.

CREATE TABLE IF NOT EXISTS "TotemState" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::TEXT,
  "coupleId" TEXT NOT NULL,
  "stateA" JSONB NOT NULL DEFAULT '{
    "hue": 220,
    "saturation": 70,
    "lightness": 50,
    "energy": 0.5,
    "attachmentStyle": "secure",
    "particleDensity": 0.5,
    "pulseRate": 1.0
  }'::JSONB,
  "stateB" JSONB NOT NULL DEFAULT '{
    "hue": 280,
    "saturation": 70,
    "lightness": 50,
    "energy": 0.5,
    "attachmentStyle": "secure",
    "particleDensity": 0.5,
    "pulseRate": 1.0
  }'::JSONB,
  "fusionState" JSONB NOT NULL DEFAULT '{
    "harmonyRate": 0.5,
    "tensionLevel": 0.0,
    "fusionTexture": "silk",
    "faultLineVisible": false,
    "syncScore": 0.0,
    "evolutionStage": 1
  }'::JSONB,
  "lastRitualAt" TIMESTAMP(3),
  "streakDays" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "TotemState_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "TotemState_coupleId_fkey" FOREIGN KEY ("coupleId") REFERENCES "Couple"("id") ON DELETE CASCADE,
  CONSTRAINT "TotemState_coupleId_unique" UNIQUE ("coupleId")
);

-- Index pour lookup rapide par couple
CREATE INDEX IF NOT EXISTS "TotemState_coupleId_idx" ON "TotemState" ("coupleId");

-- RLS: Seuls les membres du couple peuvent lire/écrire leur TotemState
ALTER TABLE "TotemState" ENABLE ROW LEVEL SECURITY;

-- Politique lecture: membres du couple uniquement
CREATE POLICY "totem_select_couple_members" ON "TotemState"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM "Couple" c
      WHERE c."id" = "TotemState"."coupleId"
        AND (c."user1Id" = auth.uid()::TEXT OR c."user2Id" = auth.uid()::TEXT)
    )
  );

-- Politique mise à jour: membres du couple uniquement
CREATE POLICY "totem_update_couple_members" ON "TotemState"
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM "Couple" c
      WHERE c."id" = "TotemState"."coupleId"
        AND (c."user1Id" = auth.uid()::TEXT OR c."user2Id" = auth.uid()::TEXT)
    )
  );

-- Enable Realtime pour la synchronisation des Orbes entre les deux téléphones
ALTER PUBLICATION supabase_realtime ADD TABLE "TotemState";
