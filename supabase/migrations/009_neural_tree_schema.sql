-- 🧠 Phase 3 — Neural Tree & Couple Distanciel Tables

-- CreateTable
CREATE TABLE IF NOT EXISTS "Couple" (
    "id" TEXT NOT NULL,
    "user1Id" TEXT NOT NULL,
    "user2Id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Couple_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Tree" (
    "id" TEXT NOT NULL,
    "coupleId" TEXT,
    "roomId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tree_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "TreeNode" (
    "id" TEXT NOT NULL,
    "treeId" TEXT NOT NULL,
    "questionId" TEXT,
    "customText" TEXT,
    "intensity" INTEGER NOT NULL DEFAULT 1,
    "category" TEXT NOT NULL DEFAULT 'GENERAL',
    "answeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "answeredBy" TEXT[] DEFAULT '{}',
    "embedding" vector(768),

    CONSTRAINT "TreeNode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "TreeConnection" (
    "id" TEXT NOT NULL,
    "treeId" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "resonance" DOUBLE PRECISION NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'SIMILARITY',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TreeConnection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "DJProfile" (
    "id" TEXT NOT NULL,
    "coupleId" TEXT,
    "roomId" TEXT,
    "mood" TEXT NOT NULL DEFAULT 'CHILL',
    "intensityTarget" INTEGER NOT NULL DEFAULT 1,
    "interactionHistory" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DJProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "DJQuestion" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "feedback" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DJQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "DailyQuestion" (
    "id" TEXT NOT NULL,
    "coupleId" TEXT NOT NULL,
    "questionId" TEXT,
    "customText" TEXT,
    "releasedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isAnswered" BOOLEAN NOT NULL DEFAULT false,
    "user1Answer" TEXT,
    "user2Answer" TEXT,
    "revealedAt" TIMESTAMP(3),

    CONSTRAINT "DailyQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateIndexes
CREATE UNIQUE INDEX IF NOT EXISTS "Couple_user1Id_user2Id_key" ON "Couple"("user1Id", "user2Id");
CREATE INDEX IF NOT EXISTS "Couple_user1Id_idx" ON "Couple"("user1Id");
CREATE INDEX IF NOT EXISTS "Couple_user2Id_idx" ON "Couple"("user2Id");

CREATE INDEX IF NOT EXISTS "Tree_coupleId_idx" ON "Tree"("coupleId");
CREATE INDEX IF NOT EXISTS "Tree_roomId_idx" ON "Tree"("roomId");

CREATE INDEX IF NOT EXISTS "TreeNode_treeId_idx" ON "TreeNode"("treeId");
CREATE INDEX IF NOT EXISTS "TreeNode_questionId_idx" ON "TreeNode"("questionId");

CREATE UNIQUE INDEX IF NOT EXISTS "TreeConnection_sourceId_targetId_key" ON "TreeConnection"("sourceId", "targetId");
CREATE INDEX IF NOT EXISTS "TreeConnection_treeId_idx" ON "TreeConnection"("treeId");
CREATE INDEX IF NOT EXISTS "TreeConnection_sourceId_idx" ON "TreeConnection"("sourceId");
CREATE INDEX IF NOT EXISTS "TreeConnection_targetId_idx" ON "TreeConnection"("targetId");

CREATE UNIQUE INDEX IF NOT EXISTS "DJProfile_coupleId_key" ON "DJProfile"("coupleId");
CREATE UNIQUE INDEX IF NOT EXISTS "DJProfile_roomId_key" ON "DJProfile"("roomId");
CREATE INDEX IF NOT EXISTS "DJProfile_coupleId_idx" ON "DJProfile"("coupleId");
CREATE INDEX IF NOT EXISTS "DJProfile_roomId_idx" ON "DJProfile"("roomId");

CREATE INDEX IF NOT EXISTS "DJQuestion_profileId_idx" ON "DJQuestion"("profileId");

CREATE INDEX IF NOT EXISTS "DailyQuestion_coupleId_idx" ON "DailyQuestion"("coupleId");
CREATE INDEX IF NOT EXISTS "DailyQuestion_questionId_idx" ON "DailyQuestion"("questionId");

-- AddForeignKeys
ALTER TABLE "Couple" ADD CONSTRAINT "Couple_user1Id_fkey" FOREIGN KEY ("user1Id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Couple" ADD CONSTRAINT "Couple_user2Id_fkey" FOREIGN KEY ("user2Id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Tree" ADD CONSTRAINT "Tree_coupleId_fkey" FOREIGN KEY ("coupleId") REFERENCES "Couple"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Tree" ADD CONSTRAINT "Tree_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "TreeNode" ADD CONSTRAINT "TreeNode_treeId_fkey" FOREIGN KEY ("treeId") REFERENCES "Tree"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TreeNode" ADD CONSTRAINT "TreeNode_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "TreeConnection" ADD CONSTRAINT "TreeConnection_treeId_fkey" FOREIGN KEY ("treeId") REFERENCES "Tree"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TreeConnection" ADD CONSTRAINT "TreeConnection_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "TreeNode"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TreeConnection" ADD CONSTRAINT "TreeConnection_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "TreeNode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "DJProfile" ADD CONSTRAINT "DJProfile_coupleId_fkey" FOREIGN KEY ("coupleId") REFERENCES "Couple"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DJProfile" ADD CONSTRAINT "DJProfile_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "DJQuestion" ADD CONSTRAINT "DJQuestion_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "DJProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "DailyQuestion" ADD CONSTRAINT "DailyQuestion_coupleId_fkey" FOREIGN KEY ("coupleId") REFERENCES "Couple"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DailyQuestion" ADD CONSTRAINT "DailyQuestion_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- 🧠 RPC function for vector similarity matching on TreeNodes (Neural Tree)
CREATE OR REPLACE FUNCTION match_tree_nodes(
  query_tree_id TEXT,
  query_embedding vector(768),
  match_threshold FLOAT,
  match_count INT
)
RETURNS TABLE (
  id TEXT,
  resonance FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    "TreeNode".id,
    (1 - ("TreeNode".embedding <=> query_embedding))::FLOAT AS resonance
  FROM "TreeNode"
  WHERE "TreeNode"."treeId" = query_tree_id
    AND "TreeNode".embedding IS NOT NULL
    AND (1 - ("TreeNode".embedding <=> query_embedding)) >= match_threshold
  ORDER BY "TreeNode".embedding <=> query_embedding ASC
  LIMIT match_count;
END;
$$;
