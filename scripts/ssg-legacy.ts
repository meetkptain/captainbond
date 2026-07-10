// Inject SSG config into the legacy blog `page.tsx` articles so they are
// prerendered at build time (the root layout forces `edge`, which is
// incompatible with `force-static`; we override per-route to `nodejs`).
//
// Idempotent: skips files that already declare `force-static`.
// Run once: `npm run blog:ssg`
import fs from 'fs';
import path from 'path';

const ROOTS = ['src/app/(marketing)/blog', 'src/app/fr/blog'];
const EXPORTS = `\n// SSG: prerender this static article at build time (override root edge runtime).\nexport const runtime = 'nodejs';\nexport const dynamic = 'force-static';\n`;

let count = 0;
for (const dir of ROOTS) {
  if (!fs.existsSync(dir)) continue;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    if (entry.name === '[slug]') continue;
    const file = path.join(dir, entry.name, 'page.tsx');
    if (!fs.existsSync(file)) continue;
    let src = fs.readFileSync(file, 'utf8');
    if (src.includes("dynamic = 'force-static'") || src.includes('dynamic="force-static"')) {
      continue;
    }
    src += EXPORTS;
    fs.writeFileSync(file, src);
    count++;
    console.log(`  ✅ ${file}`);
  }
}
console.log(`\nSSG injected into ${count} legacy article pages.`);
