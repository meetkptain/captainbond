import { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://captainbond.com';

export const metadata: Metadata = {
  title: 'Interactive Team Building & Corporate Events | Captain Bond',
  description: 'Boost team morale with a modern interactive icebreaker. No app to install, playable in-person or hybrid. Giant-screen games for your next seminar.',
  alternates: {
    canonical: `${siteUrl}/corporate`,
    languages: {
      'fr-FR': `${siteUrl}/fr/corporate`,
      'en-US': `${siteUrl}/corporate`,
    },
  },
  openGraph: {
    title: 'Interactive Team Building & Corporate Events | Captain Bond',
    description: 'Boost team morale with a modern interactive icebreaker. No app to install, playable in-person or hybrid.',
    url: `${siteUrl}/corporate`,
    siteName: 'Captain Bond',
    images: [
      {
        url: `${siteUrl}/og/corporate.webp`,
        width: 1200,
        height: 630,
        alt: 'Captain Bond Team Building',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Interactive Team Building & Corporate Events | Captain Bond',
    description: 'Boost team morale with a modern interactive icebreaker. No app to install, playable in-person or hybrid.',
    images: [`${siteUrl}/og/corporate.webp`],
  },
};

export default function CorporateLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
