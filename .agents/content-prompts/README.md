# Captain Bond Content Prompts

Systeme de prompts pour generer du contenu social a la volee.

## Utilisation

```markdown
Charge .agents/content-prompts/tiktok-party/game-showcase.md
Genere un contenu pour @captainbond (TikTok Party).

Variables :
- Hook : {{...}}
- Concept : {{...}}
- CTA : {{...}}
```

## Arborescence

```
tiktok-party/           ← Compte @captainbond (Party, Social Host)
├── icp-context.md      ← Psychographie complete du Social Host
├── identity.md         ← Contenu "c'est tellement moi"
├── game-showcase.md    ← Demo jeu / "j'en ai besoin"
├── humor-sketch.md     ← Humour / tag des potes
├── tactical-tips.md    ← Check-liste / sauvegarde
└── emotional-connection.md ← Emoi / coeur

instagram-couple/       ← Compte @captainbond.couple (Couple)
├── icp-context.md      ← Psychographie complete du Couple
├── mirror-content.md   ← "C'est nous"
├── ritual-demo.md      ← Rituel a faire ce soir
├── deep-insight.md     ← Perel / Gottman / psycho
├── testimonial-ugc.md  ← Temoignages vrais
└── carousel-educational.md ← Carrousel 5-10 slides

batch-production.md     ← Planifier la semaine
```

## Comment generer

1. Choisir le type de contenu (ex: `tiktok-party/humor-sketch.md`)
2. Charger le fichier avec `@.agents/content-prompts/...`
3. Remplir les variables (hook, concept, CTA)
4. Le prompt genere : script → description → hashtags → son
