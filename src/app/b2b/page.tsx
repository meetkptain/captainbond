import { Metadata } from 'next';
import B2BLandingClient from '@/components/b2b/B2BLandingClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://captainbond.com';

export const metadata: Metadata = {
  title: 'Captain Bond Pro — Bars, Cafés & Team Building',
  description: 'Transform your spaces into real connections. Interactive giant-screen games for bars, cafés, and corporate team building.',
  alternates: {
    canonical: `${siteUrl}/b2b`,
  },
  openGraph: {
    title: 'Captain Bond Pro — Bars, Cafés & Team Building',
    description: 'Interactive giant-screen games for bars, cafés, and corporate team building.',
    url: `${siteUrl}/b2b`,
    siteName: 'Captain Bond',
    images: [
      {
        url: `${siteUrl}/og/b2b.webp`,
        width: 1200,
        height: 630,
        alt: 'Captain Bond Pro',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Captain Bond Pro — Bars, Cafés & Team Building',
    description: 'Interactive giant-screen games for bars, cafés, and corporate team building.',
    images: [`${siteUrl}/og/b2b.webp`],
  },
};

export default function B2BLandingPage() {
  return <B2BLandingClient />;
}
