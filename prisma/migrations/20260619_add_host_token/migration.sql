-- Migration : ajout du hostToken signé pour authentifier l'hôte
-- Objectif : remplacer l'utilisation de hostId comme secret par un token dédié.

ALTER TABLE "Room"
  ADD COLUMN "hostToken" TEXT;

-- Générer des tokens temporaires pour les rooms existantes
-- Note : ces tokens devront être regénérés via une migration de données ou un script admin.
UPDATE "Room"
SET "hostToken" = 'legacy-' || "id";

-- Rendre la colonne non nullable après remplissage
ALTER TABLE "Room"
  ALTER COLUMN "hostToken" SET NOT NULL;

CREATE UNIQUE INDEX "Room_hostToken_key" ON "Room"("hostToken");
