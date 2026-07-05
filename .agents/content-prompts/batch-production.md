# Batch Production — Planifier la Semaine

Systeme de production hebdomadaire pour generer 7+ posts sans s'epuiser.

## Le Principe

```
DIMANCHE (3h) : TOUT produire d'un coup
→ Lundi a Dimanche = posts programmés
→ Toi = repondre aux commentaires 10min/jour
```

## Template Prompt

```
Tu planifies ma semaine de contenu Captain Bond.

ICP de la semaine : {{Party / Couple / mix}}
Theme de la semaine : {{idee directrice}}
Evenements speciaux : {{trend, saison, actu}}

Genere 7 contenus avec pour chacun :
1. Type (identity / game / humor / tactical / emotional / mirror / ritual / insight / ugc / carousel)
2. Hook exact (phrase d'accroche, 0-3 secondes)
3. Structure (scenes, duree)
4. Son propose
5. CTA
6. Hashtags

Format de sortie :

## Lundi — TikTok Party — Humor
Hook : "..." 
Structure : scene 1 (0-3s) → scene 2 (3-12s) → scene 3 (12-15s)
Son : trending X
CTA : "..."
Hashtags : ...

## Mardi — Instagram Couple — Carousel
Hook : "..."
Slides : 8 slides
Contenu : ...
CTA : "..."

...
```

## Rythme hebdomadaire type

```markdown
| Jour | Plateforme | Type | ICP | Cible | Couleur |
|------|-----------|------|-----|-------|---------|
| Lundi | TikTok | Barnum neutre | Nouveau Couple | Les deux | Ambré |
| Mardi | TikTok | Barnum genre | Nouveau Couple | Elle | Rose |
| Mercredi | TikTok | Barnum humoristique | Nouveau Couple | Les deux | Ambré |
| Jeudi | TikTok | Barnum genre | Nouveau Couple | Lui | Bleu |
| Vendredi | TikTok | Barnum systémique | Nouveau Couple | Les deux | Ambré |
| Samedi | TikTok | Réactions / UGC | Tous | Les deux | Variable |
| Dimanche | TikTok | Question libre | Tous | Les deux | Variable |
```

### Rythme alterné (quand plusieurs ICPs)

```markdown
| Semaine | ICP principal |
|---------|---------------|
| Semaine 1 | Nouveau Couple (Barnum + genre + systémique) |
| Semaine 2 | Couple Colocataire (Barnum + genre) |
| Semaine 3 | Parents (Barnum + genre) |
| Semaine 4 | Nouveau Couple (variantes, réactions) |
```

## Checklist du Dimanche

- [ ] Scroller TikTok 15min → reperer 2 sons/trends de la semaine
- [ ] Choisir 7 concepts (liste ci-dessus)
- [ ] Tourner la matiere brute (15 min x 4 concepts = 1h)
- [ ] Monter les 7 videos (render_video.py ou CapCut)
- [ ] Ecrire les 7 descriptions + hashtags
- [ ] Programmer dans Buffer/Later (ou publier manuellement)
- [ ] Verifier les liens en bio

## Checklist quotidienne (10 min)

- [ ] Repondre aux nouveaux commentaires
- [ ] 3-5 interactions (liker/commenter des comptes similaires)
- [ ] Check les stats du post precedent
- [ ] Sauvegarder les trends du jour pour dimanche prochain

## Outils recommandes

| Outil | Usage | Prix |
|-------|-------|------|
| Buffer | Programmer les posts | Gratuit (3 comptes) |
| Later | Programmer + scheduler | Gratuit (1 compte) |
| CapCut | Montage video | Gratuit |
| render_video.py | Texte sur gradient automatique | Custom |
| Pixabay | BGM libres de droits | Gratuit |
| Uppbeat | BGM libres de droits | Gratuit |

## Notes

- La regularite bat le volume : 4 posts/semaine CONSTANTS > 7 posts irreguliers
- Si une semaine est chargee : 3 posts/semaine (Lun/Mer/Ven) suffisent
- Toujours garder 1-2 posts d'avance pour les imprévus
- Analyser 1x/mois : quels hooks, formats, ICP performent le mieux
- Ajuster le ratio Party/Couple selon les donnees du mois precedent
