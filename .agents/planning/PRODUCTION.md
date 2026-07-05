# SOP Production Batch — 28 vidéos en 4h

## Prérequis

```
source .venv/bin/activate
mkdir -p outputs/video-studio/batch-{mois}
```

## Étape 1 — Sélection des scènes (30 min)

1. Ouvrir BANQUE.md
2. Choisir 28 scènes non-rendues du stage en cours
   - 8 × Lui
   - 8 × Elle
   - 8 × Les deux
   - 4 × réactions/récupération
3. Vérifier que chaque scène a un spec.json prêt

## Étape 2 — Vérification des specs (15 min)

Pour chaque spec.json :
```
- title unique et descriptif
- couleur correspond à la cible (rose/bleu/ambré)
- 5 scènes dans le format Barnum
- description complète avec CTA + hashtags
```

## Étape 3 — Render batch (30 min)

```bash
# Toutes les specs du dossier
for f in specs/scenes-profondes/stageX-*.json; do
  python3 scripts/render_video.py "$f"
done

# Copier vers le dossier du mois
cp outputs/video-studio/final/s*.mp4 outputs/video-studio/batch-septembre/
```

## Étape 4 — Vérification qualité (15 min)

Pour chaque vidéo :
```
- ✅ Durée entre 6-9s
- ✅ Poids < 1MB
- ✅ Texte centré, lisible
- ✅ Brand card finale présente
- ✅ Description copiable
```

## Étape 5 — Descriptions (30 min)

Chaque spec.json contient déjà la description.
À copier-coller depuis le fichier vers Buffer/TikTok.

## Étape 6 — Programmation (30 min)

Buffer (gratuit, 3 comptes) ou publication manuelle :
```
Lun 08:00 / Mar 08:00 / Mer 08:00 / Jeu 08:00
Ven 17:00 / Sam 10:00 / Dim 10:00
```

## Checklist complète

```
[ ] 28 scènes sélectionnées
[ ] 28 spec.json vérifiés (couleurs, textes, descriptions)
[ ] 28 vidéos rendues
[ ] 28 descriptions copiées
[ ] 28 posts programmés
[ ] 1 mois d'avance en banque

Temps total : ~4h
```

## Gestion des imprévus

| Problème | Solution |
|----------|----------|
| 1 spec.json manquant | Copier depuis SEMAINE_TYPE.md, remplacer les variables |
| Render en échec | Vérifier les caractères spéciaux dans le texte (éviter ', ", \ sans échappement) |
| Vidéo trop longue (>10s) | Réduire duration_sec dans chaque scène |
| Pas de son (BGM manquant) | Peut être ajouté après avec FFmpeg, ou poster sans (le format fonctionne sans) |
