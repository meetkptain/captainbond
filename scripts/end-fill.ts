import fs from 'fs';
import path from 'path';
import { allPosts } from '../src/content/blog';
const DIR = path.resolve(process.cwd(), 'src/content/blog');
const END: Record<string, string> = {
  'en|couple': 'Which question will you ask each other first?',
  'fr|couple': 'Quelle question vous poserez-vous en premier ?',
  'en|party': 'Ready to host a night your friends will still talk about?',
  'fr|party': 'Prêt à animer une soirée dont vos amis se souviendront ?',
  'en|bar': 'What will you try first to bring people through the door?',
  'fr|bar': 'Par quoi commencerez-vous pour remplir votre bar en semaine ?',
};
let n = 0;
for (const p of allPosts) {
  const file = p.slug === 'questions-pour-couple' && p.locale === 'en' ? 'questions-pour-couple-en.ts' : `${p.slug}.ts`;
  const fp = path.join(DIR, file);
  if (!fs.existsSync(fp)) continue;
  let src = fs.readFileSync(fp, 'utf8');
  const re = /endingQuestion:\s*'TODO[^']*',/;
  if (!re.test(src)) continue;
  const txt = END[`${p.locale}|${p.hub}`] ?? 'What will you try first?';
  src = src.replace(re, `endingQuestion: ${JSON.stringify(txt)},`);
  fs.writeFileSync(fp, src);
  n++;
}
console.log(`✅ endingQuestion filled: ${n}`);
