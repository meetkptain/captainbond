-- Migration : ajout du consentement RGPD sur Player
-- Objectif : tracer côté serveur l'acceptation des conditions avant participation.

ALTER TABLE "Player"
  ADD COLUMN "consentGivenAt" TIMESTAMPTZ;
