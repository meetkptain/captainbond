import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { allPosts, getPost } from '@/content/blog';
import BlogArticle from '@/components/blog/BlogArticle';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://captainbond.com';

// SSG: prerender every slug returned by generateStaticParams at build time.
// Blog is pure static content — override the root layout's edge runtime so
// force-static can actually prerender (edge is incompatible with force-static).
export const runtime = 'nodejs';
export const dynamic = 'force-static';
export const dynamicParams = false;

export function generateStaticParams() {
  return allPosts
    .filter((p) => p.locale === 'fr')
    .map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug, 'fr');
  if (!post) return {};
  const url = `${siteUrl}/fr/blog/${post.slug}`;
  const languages: Record<string, string> = { 'x-default': `${siteUrl}/blog/${post.frSlug ?? post.slug}`, fr: url };
  if (post.frSlug) languages['en'] = `${siteUrl}/blog/${post.frSlug}`;
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: url, languages },
    openGraph: {
      title: post.title,
      description: post.description,
      url,
      siteName: 'Captain Bond',
      images: [{ url: post.ogImage, width: 1200, height: 630, alt: post.title }],
      locale: 'fr_FR',
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
      images: [post.ogImage],
    },
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug, 'fr');
  if (!post) notFound();
  return <BlogArticle post={post} />;
}
