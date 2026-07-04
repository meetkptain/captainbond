-- Activer RLS sur toutes les tables créées après la migration 001
-- Ces tables n'avaient pas de RLS, ce qui les exposait à un accès direct via clé anon.

ALTER TABLE "AudioRecording" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Couple" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CoupleHeatmap" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CoupleInvite" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CouplePortrait" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CoupleThemeCycle" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CronLock" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "DailyQuestion" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "DJProfile" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "DJQuestion" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Lead" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PushSubscription" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ThemeAxisMapping" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TimeCapsule" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TotemState" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Tree" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TreeNode" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TreeConnection" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TreeProgress" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "WeeklyRecapData" ENABLE ROW LEVEL SECURITY;

-- Deny all policies pour toutes ces tables (même pattern que migration 001)
CREATE POLICY "Deny all" ON "AudioRecording" FOR ALL USING (false);
CREATE POLICY "Deny all" ON "Couple" FOR ALL USING (false);
CREATE POLICY "Deny all" ON "CoupleHeatmap" FOR ALL USING (false);
CREATE POLICY "Deny all" ON "CoupleInvite" FOR ALL USING (false);
CREATE POLICY "Deny all" ON "CouplePortrait" FOR ALL USING (false);
CREATE POLICY "Deny all" ON "CoupleThemeCycle" FOR ALL USING (false);
CREATE POLICY "Deny all" ON "CronLock" FOR ALL USING (false);
CREATE POLICY "Deny all" ON "DailyQuestion" FOR ALL USING (false);
CREATE POLICY "Deny all" ON "DJProfile" FOR ALL USING (false);
CREATE POLICY "Deny all" ON "DJQuestion" FOR ALL USING (false);
CREATE POLICY "Deny all" ON "Lead" FOR ALL USING (false);
CREATE POLICY "Deny all" ON "PushSubscription" FOR ALL USING (false);
CREATE POLICY "Deny all" ON "ThemeAxisMapping" FOR ALL USING (false);
CREATE POLICY "Deny all" ON "TimeCapsule" FOR ALL USING (false);
CREATE POLICY "Deny all" ON "TotemState" FOR ALL USING (false);
CREATE POLICY "Deny all" ON "Tree" FOR ALL USING (false);
CREATE POLICY "Deny all" ON "TreeNode" FOR ALL USING (false);
CREATE POLICY "Deny all" ON "TreeConnection" FOR ALL USING (false);
CREATE POLICY "Deny all" ON "TreeProgress" FOR ALL USING (false);
CREATE POLICY "Deny all" ON "WeeklyRecapData" FOR ALL USING (false);
