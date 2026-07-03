-- Migration: Couple Killer Features (P1-P5)
-- Audio Sync, Push Notifications, Weekly Recap, Heatmap, Tree Progress

-- 1. Audio fields on DailyQuestion
ALTER TABLE "DailyQuestion" ADD COLUMN "user1AudioUrl" TEXT;
ALTER TABLE "DailyQuestion" ADD COLUMN "user2AudioUrl" TEXT;
ALTER TABLE "DailyQuestion" ADD COLUMN "user1AudioMs" INTEGER;
ALTER TABLE "DailyQuestion" ADD COLUMN "user2AudioMs" INTEGER;
ALTER TABLE "DailyQuestion" ADD COLUMN "audioRevealed" BOOLEAN DEFAULT false;

-- 2. PushSubscription table
CREATE TABLE "PushSubscription" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
  "userId" TEXT NOT NULL,
  "endpoint" TEXT NOT NULL,
  "keys" JSONB NOT NULL,
  "timezone" TEXT NOT NULL DEFAULT 'Europe/Paris',
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "PushSubscription_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "PushSubscription_endpoint_key" ON "PushSubscription"("endpoint");
CREATE INDEX "PushSubscription_userId_idx" ON "PushSubscription"("userId");
ALTER TABLE "PushSubscription" ADD CONSTRAINT "PushSubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE;

-- 3. AudioRecording table
CREATE TABLE "AudioRecording" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
  "coupleId" TEXT NOT NULL,
  "dailyQuestionId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "storagePath" TEXT NOT NULL,
  "durationMs" INTEGER NOT NULL,
  "transcription" TEXT,
  "transcriptionStatus" TEXT NOT NULL DEFAULT 'PENDING',
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "AudioRecording_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "AudioRecording_coupleId_idx" ON "AudioRecording"("coupleId");
CREATE INDEX "AudioRecording_dailyQuestionId_idx" ON "AudioRecording"("dailyQuestionId");
ALTER TABLE "AudioRecording" ADD CONSTRAINT "AudioRecording_coupleId_fkey" FOREIGN KEY ("coupleId") REFERENCES "Couple"("id") ON DELETE CASCADE;
ALTER TABLE "AudioRecording" ADD CONSTRAINT "AudioRecording_dailyQuestionId_fkey" FOREIGN KEY ("dailyQuestionId") REFERENCES "DailyQuestion"("id") ON DELETE CASCADE;
ALTER TABLE "AudioRecording" ADD CONSTRAINT "AudioRecording_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE;

-- 4. WeeklyRecapData table
CREATE TABLE "WeeklyRecapData" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
  "coupleId" TEXT NOT NULL,
  "weekStart" TIMESTAMPTZ NOT NULL,
  "theme" TEXT NOT NULL,
  "summary" TEXT NOT NULL,
  "insight" TEXT NOT NULL,
  "lesson" TEXT NOT NULL,
  "generatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "WeeklyRecapData_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "WeeklyRecapData_coupleId_weekStart_key" ON "WeeklyRecapData"("coupleId", "weekStart");
CREATE INDEX "WeeklyRecapData_coupleId_idx" ON "WeeklyRecapData"("coupleId");
ALTER TABLE "WeeklyRecapData" ADD CONSTRAINT "WeeklyRecapData_coupleId_fkey" FOREIGN KEY ("coupleId") REFERENCES "Couple"("id") ON DELETE CASCADE;

-- 5. CoupleHeatmap table
CREATE TABLE "CoupleHeatmap" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
  "coupleId" TEXT NOT NULL,
  "axis" TEXT NOT NULL,
  "score" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
  "trend" TEXT NOT NULL DEFAULT 'stable',
  "lastAnsweredAt" TIMESTAMPTZ,
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "CoupleHeatmap_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "CoupleHeatmap_coupleId_axis_key" ON "CoupleHeatmap"("coupleId", "axis");
CREATE INDEX "CoupleHeatmap_coupleId_idx" ON "CoupleHeatmap"("coupleId");
ALTER TABLE "CoupleHeatmap" ADD CONSTRAINT "CoupleHeatmap_coupleId_fkey" FOREIGN KEY ("coupleId") REFERENCES "Couple"("id") ON DELETE CASCADE;

-- 6. ThemeAxisMapping table
CREATE TABLE "ThemeAxisMapping" (
  "theme" TEXT NOT NULL,
  "axis" TEXT NOT NULL,
  CONSTRAINT "ThemeAxisMapping_pkey" PRIMARY KEY ("theme")
);
INSERT INTO "ThemeAxisMapping" ("theme", "axis") VALUES
  ('RECONNECTION', 'gratitude'),
  ('COMMUNICATION', 'communication'),
  ('INTIMACY', 'intimite'),
  ('SHARED_PROJECT', 'projets');

-- 7. TreeProgress table
CREATE TABLE "TreeProgress" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
  "coupleId" TEXT NOT NULL,
  "nodeCount" INTEGER NOT NULL,
  "connectionCount" INTEGER NOT NULL,
  "avgSimilarity" DOUBLE PRECISION NOT NULL,
  "dominantTheme" TEXT NOT NULL,
  "strongestLink" JSONB,
  "month" TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "TreeProgress_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "TreeProgress_coupleId_month_key" ON "TreeProgress"("coupleId", "month");
CREATE INDEX "TreeProgress_coupleId_idx" ON "TreeProgress"("coupleId");
ALTER TABLE "TreeProgress" ADD CONSTRAINT "TreeProgress_coupleId_fkey" FOREIGN KEY ("coupleId") REFERENCES "Couple"("id") ON DELETE CASCADE;
