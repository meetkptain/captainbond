# Semaine Type — Template

## Structure immuable

```
LUNDI    💙 LUI    8s  Barnum (scène Lui du stage en cours)
MARDI    💕 ELLE   8s  Barnum (scène Elle du stage en cours)
MERCREDI 🧡 LES 2  8s  Barnum systémique ou mixte
JEUDI    💙 LUI    8s  Barnum (scène Lui du stage en cours)
VENDREDI 💕 ELLE   8s  Barnum (scène Elle du stage en cours)
SAMEDI   🧡 LES 2  8s  Meilleurs commentaires de la semaine
DIMANCHE 🧡 LES 2  8s  Question libre / UGC
```

## Couleurs

| Cible | Hex | Dégradé |
|-------|-----|---------|
| 💕 Elle | #be185d | #be185d → #1c1917 |
| 💙 Lui | #1e3a5f | #1e3a5f → #0f172a |
| 🧡 Les deux | #92400e | #92400e → #1c1917 |

## Format vidéo (8s)

```
0-1.5s : SCÈNE (indice temporel + lieu)
1.5-3s  : ACTION (ce qui se passe)
3-5s    : DIALOGUE INTÉRIEUR (le vrai besoin)
5-6.5s  : CONFIRMATION + DIRECTION
6.5-8s  : BRAND CARD (CAPTAIN BOND + tagline)
```

## Template spec.json

```json
{
  "project": { "title": "stageX-cible-descriptif" },
  "output": { "width": 1080, "height": 1920, "fps": 30, "video_bitrate": "4M" },
  "style": { "background_color": "#COULEUR", "text_color": "#ffffff" },
  "scenes": [
    { "duration_sec": 1.5, "text": "SCENE", "gradient": ["#COULEUR", "#1c1917"] },
    { "duration_sec": 1.5, "text": "ACTION", "gradient": ["#1c1917", "#1c1917"] },
    { "duration_sec": 2.0, "text": "DIALOGUE INTERIEUR", "subtitle": "DIRECTION", "gradient": ["#1c1917", "#COULEUR"] },
    { "duration_sec": 1.5, "text": "CONFIRMATION", "subtitle": "3 questions gratuites → captainbond.com", "gradient": ["#COULEUR", "#1c1917"] },
    { "duration_sec": 1.5, "text": "CAPTAIN BOND", "subtitle": "des questions qui connectent", "gradient": ["#COULEUR", "#1c1917"] }
  ],
  "description": "SCENE + ACTION + DIALOGUE INTERIEUR\n\n→ CTA_COMMENTAIRE\n→ CTA_TAG\n\n3 questions gratuites → captainbond.com\n\n#HASHTAGS"
}
```

## Descriptions — Structure fixe

```
{SCÈNE RÉÉCRITE EN PHRASE}

→ {CTA COMMENTAIRE}
→ {CTA TAG}

3 questions gratuites → captainbond.com

#{hashtag1} #{hashtag2} #{hashtag3}
```

### CTA par cible

| Cible | CTA commentaire | CTA tag |
|-------|----------------|---------|
| 💕 Elle | "Toi aussi ? Dis-le en commentaire" | "Tag celle qui comprend" |
| 💙 Lui | "Ça te parle ? Dis-le en commentaire" | "Tag un pote qui vit ça" |
| 🧡 Les deux | "Vous aussi ? Dites en commentaire" | "Tag ton/ta partenaire" |

### Hashtags par cible

| Cible | Hashtags |
|-------|----------|
| 💕 Elle | #couple #femme #securité |
| 💙 Lui | #couple #homme #confiance |
| 🧡 Les deux | #couple #amour #relation |
