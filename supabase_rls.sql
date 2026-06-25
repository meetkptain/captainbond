-- 🔒 CAPTAIN BOND - POLITIQUES RLS DURCIES
-- À exécuter dans l'éditeur SQL du Dashboard Supabase avant le lancement public.
-- L'application Next.js utilise SUPABASE_SERVICE_ROLE_KEY côté serveur : elle contourne le RLS.
-- Tout accès direct depuis le navigateur (clé anon) est donc bloqué par défaut.

-- 1. Activer RLS sur toutes les tables applicatives
ALTER TABLE "Room" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Player" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Response" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Score" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Question" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Pack" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Purchase" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "UserPass" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "UserPack" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "UserStats" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "WebhookEvent" ENABLE ROW LEVEL SECURITY;
-- RoomPass n'existe pas dans le schema Prisma ; la logique de pass de salle est gérée par Room.paidByUserId / Room.passExpiresAt.

-- 2. Supprimer les anciennes politiques permissives si elles existent
DROP POLICY IF EXISTS "Permettre la lecture des salons à tous" ON "Room";
DROP POLICY IF EXISTS "Permettre la création de salon" ON "Room";
DROP POLICY IF EXISTS "Permettre la mise à jour aux hôtes" ON "Room";
DROP POLICY IF EXISTS "Permettre la lecture des joueurs" ON "Player";
DROP POLICY IF EXISTS "Permettre l'inscription des joueurs" ON "Player";
DROP POLICY IF EXISTS "Permettre la modification de sa propre fiche" ON "Player";
DROP POLICY IF EXISTS "Permettre la suppression de son propre compte" ON "Player";
DROP POLICY IF EXISTS "Permettre la lecture des réponses" ON "Response";
DROP POLICY IF EXISTS "Permettre l'insertion de ses propres réponses" ON "Response";
DROP POLICY IF EXISTS "Permettre la lecture des scores" ON "Score";

-- 3. Politiques restrictives : refuser tout accès direct
CREATE POLICY "Deny all" ON "Room" FOR ALL USING (false);
CREATE POLICY "Deny all" ON "Player" FOR ALL USING (false);
CREATE POLICY "Deny all" ON "Response" FOR ALL USING (false);
CREATE POLICY "Deny all" ON "Score" FOR ALL USING (false);
CREATE POLICY "Deny all" ON "Question" FOR ALL USING (false);
CREATE POLICY "Deny all" ON "Pack" FOR ALL USING (false);
CREATE POLICY "Deny all" ON "Purchase" FOR ALL USING (false);
CREATE POLICY "Deny all" ON "UserPass" FOR ALL USING (false);
CREATE POLICY "Deny all" ON "UserPack" FOR ALL USING (false);
CREATE POLICY "Deny all" ON "User" FOR ALL USING (false);
CREATE POLICY "Deny all" ON "UserStats" FOR ALL USING (false);
CREATE POLICY "Deny all" ON "WebhookEvent" FOR ALL USING (false);
-- RoomPass : voir note ci-dessus.
