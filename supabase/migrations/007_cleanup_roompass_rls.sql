-- 🔧 Nettoyage RLS : RoomPass n'existe pas dans le schema Prisma.
-- Cette migration rend l'application des politiques RLS idempotente et sans erreur
-- si la table RoomPass n'a pas été créée.

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'RoomPass') THEN
    ALTER TABLE "RoomPass" ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Deny all" ON "RoomPass";
    CREATE POLICY "Deny all" ON "RoomPass" FOR ALL USING (false);
  END IF;
END
$$;
