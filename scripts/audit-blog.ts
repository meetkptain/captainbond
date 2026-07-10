// SEO/structure auditor for the blog — covers BOTH the content layer
// (src/content/blog) AND the legacy page.tsx articles (src/content/legacy).
// Run `npm run blog:audit`. Exits 1 on any hard error.
import fs from 'fs';
import path from 'path';
import { allPosts } from '../src/content/blog';
import { legacyPosts } from '../src/content/legacy';

let errors = 0;
let warnings = 0;
let geoOk = 0;
let geoMissing = 0;
const err = (m: string) => {
  errors++;
  console.error('  \u274c ' + m);
};
const warn = (m: string) => {
  warnings++;
  console.warn('  \u26a0\ufe0f  ' + m);
};

// Combined slug set for frSlug parity + related checks (content layer only
// is valid for `related`, since legacy bodies reference old routes).
const allSlugs = new Set([
  ...allPosts.map((p) => `${p.locale}/${p.slug}`),
  ...legacyPosts.map((p) => `${p.locale}/${p.slug}`),
]);

// ── Content-layer posts (full structural audit) ──
for (const p of allPosts) {
  const where = `${p.locale}/${p.slug}`;
  if (!p.title || p.title.length < 10) err(`${where}: title missing/short`);
  if (!p.description || p.description.length < 50) warn(`${where}: description short (<50)`);

  if (!p.ogImage) err(`${where}: ogImage missing`);
  else {
    const og = path.resolve('public', p.ogImage.replace(/^\//, ''));
    if (!fs.existsSync(og)) err(`${where}: OG file missing -> ${p.ogImage}`);
  }

  if (!p.faq || p.faq.length < 3) err(`${where}: faq < 3`);
  else p.faq.forEach((f, i) => {
    if (!f.q || !f.a) err(`${where}: faq[${i}] incomplete`);
    else if (/TODO/i.test(f.a) || f.a.length < 40) warn(`${where}: faq[${i}] answer TODO/short (<40) — AI-citation gap`);
  });

  if (!p.sections || p.sections.length < 3) err(`${where}: sections < 3`);
  const prose = (p.sections || []).reduce((n, s) => {
    const pw = s.p ? s.p.split(/\s+/).length : 0;
    const lw = (s.list || []).reduce((m, l) => m + String(l).split(/\s+/).length, 0);
    const qw = s.quote ? s.quote.split(/\s+/).length : 0;
    return n + pw + lw + qw;
  }, 0);
  if (prose < 1000) warn(`${where}: thin content (${prose} words < 1000) — SEO weak`);
  const tk = p.takeaways || [];
  const tkBAD = tk.length < 3 || tk.some((t) => !t || t.startsWith('TODO') || t.length < 5);
  if (tkBAD) warn(`${where}: takeaways missing/TODO (<3 or placeholder)`);

  if (!p.related || p.related.length === 0) {
    const sameHub = allPosts
      .filter((x) => x.hub === p.hub && x.slug !== p.slug)
      .slice(0, 3)
      .map((x) => `${x.locale}/${x.slug}`);
    warn(`${where}: no related links` + (sameHub.length ? ` (suggest: ${sameHub.join(', ')})` : ''));
  } else {
    p.related.forEach((r, i) => {
      const exists = allSlugs.has(`${p.locale}/${r.slug}`);
      if (!exists) warn(`${where}: related[${i}] "${r.slug}" not a known route (content or legacy)`);
    });
  }

  if (p.frSlug) {
    const counterpart = allSlugs.has(`${p.locale === 'en' ? 'fr' : 'en'}/${p.frSlug}`);
    if (!counterpart) err(`${where}: frSlug "${p.frSlug}" has no counterpart post`);
  } else {
    warn(`${where}: no frSlug (multilingual symmetry incomplete)`);
  }

  // ── GEO (Generative Engine Optimization) — content layer only ──
  // geoBlock = the paragraph tuned for AI-citation / answer engines.
  if (!p.geoBlock || p.geoBlock.length < 40 || /TODO/i.test(p.geoBlock)) {
    geoMissing++;
    warn(`${where}: geoBlock missing/short/TODO (<40) — GEO / AI-citation gap`);
  } else {
    geoOk++;
  }
  if (p.faq) {
    p.faq.forEach((f, i) => {
      if (!f.a || f.a.length < 40)
        warn(`${where}: faq[${i}] answer short (<40) — weak GEO snippet`);
    });
  }
}

// ── Legacy posts (metadata-only audit: OG + frSlug parity) ──
for (const p of legacyPosts) {
  const where = `${p.locale}/${p.slug} [legacy]`;
  if (!p.title || p.title.length < 10) err(`${where}: title missing/short`);
  if (!p.description || p.description.length < 50) warn(`${where}: description short (<50)`);

  if (!p.ogImage) warn(`${where}: ogImage missing`);
  else {
    const og = path.resolve('public', p.ogImage.replace(/^\//, ''));
    if (!fs.existsSync(og)) warn(`${where}: OG file missing -> ${p.ogImage}`);
  }

  if (p.frSlug) {
    const counterpart = allSlugs.has(`${p.locale === 'en' ? 'fr' : 'en'}/${p.frSlug}`);
    if (!counterpart) err(`${where}: frSlug "${p.frSlug}" has no counterpart post`);
  } else {
    err(`${where}: no frSlug (multilingual symmetry incomplete)`);
  }
}

console.log(
  `\nAudit: ${allPosts.length} content + ${legacyPosts.length} legacy = ${allPosts.length + legacyPosts.length} posts | ${errors} errors | ${warnings} warnings`,
);
console.log(
  `GEO: ${geoOk}/${allPosts.length} content posts have a geoBlock (${geoMissing} missing).`,
);
process.exit(errors > 0 ? 1 : 0);
