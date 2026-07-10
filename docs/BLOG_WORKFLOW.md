# Blog Workflow — create / enrich / audit (AI-agent friendly)

All blog content lives in `src/content/blog/*.ts` as **pure data** (`BlogPost`).
The `BlogArticle` renderer derives SEO + GEO + structure automatically — authors
(agents or humans) never touch JSX. This makes the blog trivially evolvable.

## The fastest agent loop (2 steps)

```bash
# 1) CREATE a paired EN/FR article.
#    blog:new ALSO auto-fills SEO/GEO (related, geoBlock, faq, endingQuestion)
#    from hub templates — so the agent only writes the real body afterward.
npm run blog:new -- --en "How to Host a Game Night" \
                     --fr "Comment organiser une soirée jeux" \
                     --slug how-to-host-game-night \
                     --frslug organiser-soiree-jeux \
                     --hub party          # party | couple | bar

# 2) AGENT writes the real copy: description, sections[].p, takeaways
#    (everything else is already filled by step 1).
#    Then BUILD + AUDIT (sync index, generate OG images, run audit):
npm run blog:build
```

Goal after step 2: `Audit: … | 0 errors | 0 warnings` and `GEO: 34/34`.

## Other commands

| Command | What it does |
|---|---|
| `npm run blog:enrich` (`blog:geo` / `blog:fix`) | Re-run SEO/GEO fill on ALL posts (idempotent). Use for bulk/legacy fixes. |
| `npm run blog:audit` | SEO + GEO + takeaways audit only (no write) |
| `npm run blog:report` | Scoreboard markdown in `.agents/blog-report.md` |
| `npm run blog:migrate` | migrate one legacy `page.tsx` → content layer |
| `npm run blog:related` | suggest internal-link candidates |

## What an agent fills vs what is automated

- **Automated by `blog:new` (+ `blog:enrich`)**: `related`, `geoBlock`,
  `faq` (when empty/all-TODO), `endingQuestion`. Template-based, localized,
  idempotent — never overwrites real copy.
- **Must be written by a human/agent** (real copy): `description`,
  `sections[].p`, `takeaways`. The audit flags these as TODOs.
- **Never touch**: `slug`, `frSlug`, `ogImage`, `published` (preserved from
  legacy on migrate; set on create). Dates drive `lastmod` in the sitemap.

## Robustness notes

- `blog:new` calls `blog:enrich` automatically, so a new article is SEO/GEO
  ready the moment it is created — the agent only authors the body.
- The audit is **TODO-aware**: it flags `geoBlock: 'TODO…'`, `takeaways` with
  `TODO` placeholders, and short `description` — so nothing ships silently
  incomplete.
- CI guard: `.github/workflows/blog-audit.yml` runs `blog:build` on push.
- To add a new hub, extend the `GEO` / `FAQ` / `ENDING` maps in
  `scripts/blog-enrich.ts` (one block per hub × locale).
