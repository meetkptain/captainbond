// Enrich content-layer posts mechanically + report what still needs a human/agent.
//  - Auto-fills empty `related: []` with up to 3 same-hub posts (internal linking).
//  - Reports geoBlock/faq/section TODOs that need real copy.
// Run: npm run blog:enrich
import fs from 'fs';
import path from 'path';
import { allPosts } from '../src/content/blog';

const dir = path.resolve('src/content/blog');
let filled = 0;
const todos: string[] = [];

for (const p of allPosts) {
  const file = path.join(dir, `${p.slug}.ts`);
  if (!fs.existsSync(file)) continue;
  let src = fs.readFileSync(file, 'utf8');

  // 1) Auto-fill related from same hub
  if (!p.related || p.related.length === 0) {
    const same = allPosts.filter((x) => x.hub === p.hub && x.slug !== p.slug).slice(0, 3);
    if (same.length) {
      const arr = same
        .map(
          (x) =>
            `    { slug: ${JSON.stringify(x.slug)}, title: ${JSON.stringify(x.title)}, description: ${JSON.stringify(
              (x.description || '').slice(0, 120),
            )} }`,
        )
        .join(',\n');
      src = src.replace(/related:\s*\[\s*\],?/, `related: [\n${arr}\n  ],`);
      fs.writeFileSync(file, src);
      filled++;
      console.log(`  ✅ ${p.locale}/${p.slug}: related filled (${same.length})`);
    }
  }

  // 2) Report copy TODOs (agent fills these)
  if (!p.geoBlock || p.geoBlock.startsWith('TODO')) todos.push(`${p.locale}/${p.slug}: geoBlock TODO`);
  if (p.faq?.some((f) => !f.a || f.a.startsWith('TODO') || f.a.length < 40))
    todos.push(`${p.locale}/${p.slug}: faq answers need real copy (>=40c)`);
  if (p.sections?.some((s) => !s.p || s.p.startsWith('TODO')))
    todos.push(`${p.locale}/${p.slug}: section bodies empty (${p.sections.filter((s) => !s.p || s.p.startsWith('TODO')).length})`);
}

console.log(`\nEnriched ${filled} posts with internal links.`);
if (todos.length) {
  console.log(`\n${todos.length} copy TODOs (fill for full GEO quality):`);
  todos.forEach((t) => console.log('  • ' + t));
  console.log('\nTip: read .agents/blog-report.md for the full scoreboard, then fill TODOs.');
} else {
  console.log('No copy TODOs — all posts GEO-complete.');
}
