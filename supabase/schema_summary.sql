-- Database Schema Summary (Generated automatically for AI context optimization)

CREATE TABLE Couple (
  "id" TEXT NOT NULL,
  "user1Id" TEXT NOT NULL,
  "user2Id" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Couple_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Couple_user1Id_fkey" FOREIGN KEY ("user1Id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "Couple_user2Id_fkey" FOREIGN KEY ("user2Id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "timezone" TEXT NOT NULL DEFAULT 'Europe/Paris',
  UNIQUE INDEX "Couple_user1Id_user2Id_key" ("user1Id", "user2Id"),
  INDEX "Couple_user1Id_idx" ("user1Id"),
  INDEX "Couple_user2Id_idx" ("user2Id")
);

CREATE TABLE CouplePortrait (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  "coupleId" TEXT NOT NULL,
  "month" TEXT NOT NULL,
  "partnerAProfile" JSONB,
  "partnerBProfile" JSONB,
  "coupleDynamic" JSONB,
  "alignmentTrend" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "CouplePortrait_coupleId_fkey" FOREIGN KEY ("coupleId") REFERENCES "Couple"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  UNIQUE INDEX "CouplePortrait_coupleId_month_key" ("coupleId", "month"),
  INDEX "CouplePortrait_coupleId_idx" ("coupleId")
);

CREATE TABLE CoupleThemeCycle (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  "coupleId" TEXT NOT NULL UNIQUE,
  "currentTheme" TEXT NOT NULL,
  "weekNumber" INTEGER NOT NULL DEFAULT 1,
  "startedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  INDEX "CoupleThemeCycle_coupleId_idx" ("coupleId")
);

CREATE TABLE CronLock (
  "id" TEXT NOT NULL PRIMARY KEY,
  "lockedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "lockedBy" TEXT,
  INDEX "CronLock_lockedAt_idx" ("lockedAt")
);

CREATE TABLE DJProfile (
  "id" TEXT NOT NULL,
  "coupleId" TEXT,
  "roomId" TEXT,
  "mood" TEXT NOT NULL DEFAULT 'CHILL',
  "intensityTarget" INTEGER NOT NULL DEFAULT 1,
  "interactionHistory" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "DJProfile_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "DJProfile_coupleId_fkey" FOREIGN KEY ("coupleId") REFERENCES "Couple"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "DJProfile_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  UNIQUE INDEX "DJProfile_coupleId_key" ("coupleId"),
  UNIQUE INDEX "DJProfile_roomId_key" ("roomId"),
  INDEX "DJProfile_coupleId_idx" ("coupleId"),
  INDEX "DJProfile_roomId_idx" ("roomId")
);

CREATE TABLE DJQuestion (
  "id" TEXT NOT NULL,
  "profileId" TEXT NOT NULL,
  "text" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "feedback" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "DJQuestion_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "DJQuestion_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "DJProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX "DJQuestion_profileId_idx" ("profileId")
);

CREATE TABLE DailyQuestion (
  "id" TEXT NOT NULL,
  "coupleId" TEXT NOT NULL,
  "questionId" TEXT,
  "customText" TEXT,
  "releasedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "isAnswered" BOOLEAN NOT NULL DEFAULT false,
  "user1Answer" TEXT,
  "user2Answer" TEXT,
  "revealedAt" TIMESTAMP(3),
  CONSTRAINT "DailyQuestion_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "DailyQuestion_coupleId_fkey" FOREIGN KEY ("coupleId") REFERENCES "Couple"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "DailyQuestion_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  "protocolOpened" BOOLEAN NOT NULL DEFAULT false,
  "user1Mood" JSONB,
  "user2Mood" JSONB,
  "isSkipped" BOOLEAN NOT NULL DEFAULT false,
  "isSafeZoneActive" BOOLEAN NOT NULL DEFAULT false,
  "theme" TEXT,
  "intensity" INTEGER DEFAULT 1,
  "ritualAction" TEXT,
  "therapistGuide" TEXT,
  INDEX "DailyQuestion_coupleId_idx" ("coupleId"),
  INDEX "DailyQuestion_questionId_idx" ("questionId"),
  UNIQUE INDEX "DailyQuestion_coupleId_releasedAt_key" ("coupleId", "releasedAt"),
  INDEX "DailyQuestion_coupleId_analysisStatus_isRevealed_idx" ("coupleId", "analysisStatus", "isRevealed")
);

CREATE TABLE Player (
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  INDEX "Player_createdAt_idx" ("createdAt")
);

CREATE TABLE Question (
  "correctAnswer" TEXT,
  "options" TEXT[] DEFAULT '{}',
  "explanation" TEXT,
  "category" TEXT NOT NULL DEFAULT 'GENERAL',
  "difficulty" INTEGER NOT NULL DEFAULT 1,
  "language" VARCHAR(5) DEFAULT 'fr',
  "theme" TEXT,
  "suggestedAction" TEXT,
  "therapistGuide" TEXT,
  INDEX "Question_category_idx" ("category"),
  INDEX "Question_language_idx" ("language")
);

CREATE TABLE Room (
  "customAnecdotes" JSONB DEFAULT '[]'::jsonb,
  "language" VARCHAR(5) DEFAULT 'fr',
  INDEX "Room_language_idx" ("language")
);

CREATE TABLE Score (
  CONSTRAINT "Score_roomId_playerId_key" UNIQUE ("roomId", "playerId")
);

CREATE TABLE TimeCapsule (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::TEXT,
  "coupleId" TEXT NOT NULL,
  "senderId" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "unlocksAt" TIMESTAMP(3) NOT NULL,
  "isUnlocked" BOOLEAN NOT NULL DEFAULT false,
  CONSTRAINT "TimeCapsule_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "TimeCapsule_coupleId_fkey" FOREIGN KEY ("coupleId") REFERENCES "Couple"("id") ON DELETE CASCADE,
  INDEX "TimeCapsule_coupleId_isUnlocked_unlocksAt_idx" ("coupleId", "isUnlocked", "unlocksAt")
);

CREATE TABLE TotemState (
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
  CONSTRAINT "TotemState_coupleId_unique" UNIQUE ("coupleId"),
  INDEX "TotemState_coupleId_idx" ("coupleId")
);

CREATE TABLE Tree (
  "id" TEXT NOT NULL,
  "coupleId" TEXT,
  "roomId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Tree_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Tree_coupleId_fkey" FOREIGN KEY ("coupleId") REFERENCES "Couple"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "Tree_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX "Tree_coupleId_idx" ("coupleId"),
  INDEX "Tree_roomId_idx" ("roomId")
);

CREATE TABLE TreeConnection (
  "id" TEXT NOT NULL,
  "treeId" TEXT NOT NULL,
  "sourceId" TEXT NOT NULL,
  "targetId" TEXT NOT NULL,
  "resonance" DOUBLE PRECISION NOT NULL,
  "type" TEXT NOT NULL DEFAULT 'SIMILARITY',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "TreeConnection_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "TreeConnection_treeId_fkey" FOREIGN KEY ("treeId") REFERENCES "Tree"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "TreeConnection_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "TreeNode"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "TreeConnection_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "TreeNode"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  UNIQUE INDEX "TreeConnection_sourceId_targetId_key" ("sourceId", "targetId"),
  INDEX "TreeConnection_treeId_idx" ("treeId"),
  INDEX "TreeConnection_sourceId_idx" ("sourceId"),
  INDEX "TreeConnection_targetId_idx" ("targetId")
);

CREATE TABLE TreeNode (
  "id" TEXT NOT NULL,
  "treeId" TEXT NOT NULL,
  "questionId" TEXT,
  "customText" TEXT,
  "intensity" INTEGER NOT NULL DEFAULT 1,
  "category" TEXT NOT NULL DEFAULT 'GENERAL',
  "answeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "answeredBy" TEXT[] DEFAULT '{}',
  "embedding" vector(768),
  CONSTRAINT "TreeNode_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "TreeNode_treeId_fkey" FOREIGN KEY ("treeId") REFERENCES "Tree"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "TreeNode_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  INDEX "TreeNode_treeId_idx" ("treeId"),
  INDEX "TreeNode_questionId_idx" ("questionId")
);

CREATE TABLE UserStats (
  "currentStreak" INTEGER NOT NULL DEFAULT 0,
  "gamesPlayedToday" INTEGER NOT NULL DEFAULT 0,
  "lastPlayedAt" TIMESTAMPTZ,
  "badges" JSONB NOT NULL DEFAULT '[]',
  "archetypesUnlocked" JSONB NOT NULL DEFAULT '[]'
);

