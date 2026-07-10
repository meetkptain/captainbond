# Blog Workflow — create / enrich / audit (AI-agent friendly)

All blog content lives in `src/content/blog/*.ts` as **pure data** (`BlogPost`).
The `BlogArticle` renderer derives SEO + GEO + structure automatically — authors
(agents or humans) never touch JSX. This makes the blog trivially evolvable.

## The 3-command loop

```bash
# 1) CREATE a paired EN/FR article (scaffold with TODOs)
npm run blog:new -- --en "How to Host a Game Night" \
                     --fr "Comment organiser une soirée jeux" \
                     --slug how-to-host-game-night \
                     --frslug organiser-soiree-jeux \
                     --hub party          # party | couple | bar

# 2) ENRICH SEO + GEO (generic, idempotent, hub/localized templates)
#    Auto-fills: related (internal links), geoBlock (AI-citation),
#    faq (3 Q&A >=40c), endingQuestion. Never overwrites real copy.
npm run blog:enrich

# 3) BUILD + AUDIT (sync index, generate OG images, run audit)
npm run blog:build
```

After step 3 you want: `Audit: 34 content … | 0 errors | 0 warnings` and `GEO: 34/34`.

## Other commands

| Command | What it does |
|---|---|
| `npm run blog:audit` | SEO + GEO audit only (no write) |
| `npm run blog:report` | Scoreboard markdown in `.agents/blog-report.md` |
| `npm run blog:geo` / `blog:fix` | aliases of `blog:enrich` |
| `npm run blog:migrate` | migrate one legacy `page.tsx` → content layer |
| `npm run blog:related` | suggest internal-link candidates |

## What an agent fills vs what is automated

- **Automated by `blog:enrich`** (safe, template-based, localized): `related`,
  `geoBlock`, `faq` (when empty/all-TODO), `endingQuestion`.
- **Must be written by a human/agent** (real copy): `description`,
  `sections[].p`, `takeaways`. The audit flags these as TODOs.
- **Never touch**: `slug`, `frSlug`, `ogImage`, `published` (preserved from
  legacy on migrate; set on create). Dates drive `lastmod` in the sitemap.

## Robustness notes

- `blog:enrich` reads files **directly from disk**, so a freshly created
  article is enriched immediately — no `sync` needed first.
- The audit is **TODO-aware**: a `geoBlock: 'TODO…'` is counted as a GEO gap,
  so nothing ships silently incomplete.
- CI guard: `.github/workflows/blog-audit.yml` runs `blog:build` on push.
- To add a new hub, extend the `GEO` / `FAQ` / `ENDING` maps in
  `scripts/blog-enrich.ts` (one block per hub × locale).
