-- Database Schema Summary (Generated automatically for AI context optimization)

CREATE TABLE Couple (
  "id" TEXT NOT NULL,,
  "user1Id" TEXT NOT NULL,,
  "user2Id" TEXT NOT NULL,,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,,
  "updatedAt" TIMESTAMP(3) NOT NULL,,
  CONSTRAINT "Couple_pkey" PRIMARY KEY ("id")
);

CREATE TABLE DJProfile (
  "id" TEXT NOT NULL,,
  "coupleId" TEXT,,
  "roomId" TEXT,,
  "mood" TEXT NOT NULL DEFAULT 'CHILL',,
  "intensityTarget" INTEGER NOT NULL DEFAULT 1,,
  "interactionHistory" JSONB,,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,,
  "updatedAt" TIMESTAMP(3) NOT NULL,,
  CONSTRAINT "DJProfile_pkey" PRIMARY KEY ("id")
);

CREATE TABLE DJQuestion (
  "id" TEXT NOT NULL,,
  "profileId" TEXT NOT NULL,,
  "text" TEXT NOT NULL,,
  "status" TEXT NOT NULL DEFAULT 'PENDING',,
  "feedback" TEXT,,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,,
  CONSTRAINT "DJQuestion_pkey" PRIMARY KEY ("id")
);

CREATE TABLE DailyQuestion (
  "id" TEXT NOT NULL,,
  "coupleId" TEXT NOT NULL,,
  "questionId" TEXT,,
  "customText" TEXT,,
  "releasedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,,
  "isAnswered" BOOLEAN NOT NULL DEFAULT false,,
  "user1Answer" TEXT,,
  "user2Answer" TEXT,,
  "revealedAt" TIMESTAMP(3),,
  CONSTRAINT "DailyQuestion_pkey" PRIMARY KEY ("id")
);

CREATE TABLE TimeCapsule (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::TEXT,,
  "coupleId" TEXT NOT NULL,,
  "senderId" TEXT NOT NULL,,
  "content" TEXT NOT NULL,,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,,
  "unlocksAt" TIMESTAMP(3) NOT NULL,,
  "isUnlocked" BOOLEAN NOT NULL DEFAULT false,,
  CONSTRAINT "TimeCapsule_pkey" PRIMARY KEY ("id"),,
  CONSTRAINT "TimeCapsule_coupleId_fkey" FOREIGN KEY ("coupleId") REFERENCES "Couple"("id") ON DELETE CASCADE
);

CREATE TABLE TotemState (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::TEXT,,
  "coupleId" TEXT NOT NULL,,
  "stateA" JSONB NOT NULL DEFAULT '{,
  "hue": 220,,
  "saturation": 70,,
  "lightness": 50,,
  "energy": 0.5,,
  "attachmentStyle": "secure",,
  "particleDensity": 0.5,,
  "pulseRate": 1.0,
  }'::JSONB,,
  "stateB" JSONB NOT NULL DEFAULT '{,
  "hue": 280,,
  "saturation": 70,,
  "lightness": 50,,
  "energy": 0.5,,
  "attachmentStyle": "secure",,
  "particleDensity": 0.5,,
  "pulseRate": 1.0,
  }'::JSONB,,
  "fusionState" JSONB NOT NULL DEFAULT '{,
  "harmonyRate": 0.5,,
  "tensionLevel": 0.0,,
  "fusionTexture": "silk",,
  "faultLineVisible": false,,
  "syncScore": 0.0,,
  "evolutionStage": 1,
  }'::JSONB,,
  "lastRitualAt" TIMESTAMP(3),,
  "streakDays" INTEGER NOT NULL DEFAULT 0,,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,,
  CONSTRAINT "TotemState_pkey" PRIMARY KEY ("id"),,
  CONSTRAINT "TotemState_coupleId_fkey" FOREIGN KEY ("coupleId") REFERENCES "Couple"("id") ON DELETE CASCADE,,
  CONSTRAINT "TotemState_coupleId_unique" UNIQUE ("coupleId")
);

CREATE TABLE Tree (
  "id" TEXT NOT NULL,,
  "coupleId" TEXT,,
  "roomId" TEXT,,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,,
  "updatedAt" TIMESTAMP(3) NOT NULL,,
  CONSTRAINT "Tree_pkey" PRIMARY KEY ("id")
);

CREATE TABLE TreeConnection (
  "id" TEXT NOT NULL,,
  "treeId" TEXT NOT NULL,,
  "sourceId" TEXT NOT NULL,,
  "targetId" TEXT NOT NULL,,
  "resonance" DOUBLE PRECISION NOT NULL,,
  "type" TEXT NOT NULL DEFAULT 'SIMILARITY',,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,,
  CONSTRAINT "TreeConnection_pkey" PRIMARY KEY ("id")
);

CREATE TABLE TreeNode (
  "id" TEXT NOT NULL,,
  "treeId" TEXT NOT NULL,,
  "questionId" TEXT,,
  "customText" TEXT,,
  "intensity" INTEGER NOT NULL DEFAULT 1,,
  "category" TEXT NOT NULL DEFAULT 'GENERAL',,
  "answeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,,
  "answeredBy" TEXT[] DEFAULT '{}',,
  "embedding" vector(768),,
  CONSTRAINT "TreeNode_pkey" PRIMARY KEY ("id")
);

