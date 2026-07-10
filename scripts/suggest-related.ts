// Suggest related articles for a given slug (same hub, other posts).
// Usage: npm run blog:related -- <slug>
import { allPosts } from '../src/content/blog';

const slug = process.argv[2];
if (!slug) {
  console.error('Usage: npm run blog:related -- <slug>');
  process.exit(1);
}

const post = allPosts.find((p) => p.slug === slug);
if (!post) {
  console.error(`Slug "${slug}" not found in content layer.`);
  process.exit(1);
}

const same = allPosts
  .filter((p) => p.hub === post.hub && p.slug !== slug)
  .slice(0, 3);

console.log(`Suggested related for ${post.locale}/${slug} (hub: ${post.hub}):`);
if (same.length === 0) console.log('  (none in same hub yet)');
same.forEach((p) => console.log(`  - ${p.locale}/${p.slug} : ${p.title}`));
