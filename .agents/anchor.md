# Session: Medium-like Reading UX, Knowledge Registry

## Goal
Upgrade blog reading experience to Medium quality + document all project knowledge in AGENTS.md.

## Progress
### Done
- **Phase A (CSS)** : pull quote XXL, `.article-hero` 2:1, `.article-toc-link` clean, `.article-ending-question`, selection amber, smooth scroll
- **Phase B (batch)** : 13 articles — section mb-10 → article-block, TOC borders → hover, stats bolded
- **Phase C (manual)** : pillar article paragraphs split, data study CTA gradient → `.article-card-takeaways`, ending questions on both
- **Knowledge Registry** : added 9 new sections to AGENTS.md (blog template, CSS system, OG images, multi-langue, deploy CF, schema, build verification, anchored summary, learning registry)
- **`anchor.md`** : created this file for cross-session memory
- **Build** : 71/71, push main

### In Progress
- (none)

### Blocked
- (none)

## Key Decisions
- AGENTS.md is the single source of truth for project conventions (not multiple `.md` files)
- `.agents/anchor.md` is the session memory file — updated per phase, read at session start
- Blog template documented top-to-bottom to reduce context needed for new articles

## Next Steps
- Vérifier que les slugs FR sont bien mappés dans AGENTS.md quand on crée des articles bilingues
- Ajouter des patterns de "bugs connus" dans Learning Registry au fil des sessions

## Relevant Files
- `AGENTS.md` : now contains all 9 new knowledge sections
- `.agents/anchor.md` : this file
- `src/app/globals.css` : `.article-*` system, selection amber, smooth scroll
- `src/app/(marketing)/blog/*/page.tsx` : 15 EN articles, all conforming to template
