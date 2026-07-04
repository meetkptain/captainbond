import { MetadataRoute } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://captainbond.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: 'CCBot',
        disallow: '/',
      },
      {
        userAgent: ['GPTBot', 'ChatGPT-User', 'PerplexityBot', 'ClaudeBot', 'anthropic-ai', 'Google-Extended', 'Bingbot', 'Applebot'],
        allow: '/blog/',
        disallow: ['/admin/', '/api/', '/room/', '/join/', '/vault/'],
      },
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/', '/room/', '/join/', '/vault/'],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
