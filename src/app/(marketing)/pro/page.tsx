import { Metadata } from 'next';
import ProLanding from '@/components/pro/ProLanding';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://captainbond.com';

export const metadata: Metadata = {
  title: 'Captain Bond Pro — Team Building, Bars & Onboarding',
  description: 'Interactive giant-screen games for bars, cafés, corporate team building and employee onboarding. One platform for every professional need.',
  alternates: {
    canonical: `${siteUrl}/pro`,
    languages: {
      'x-default': `${siteUrl}/pro`,
      'en': `${siteUrl}/pro`,
      'fr': `${siteUrl}/fr/pro`,
    },
  },
  openGraph: {
    title: 'Captain Bond Pro — Team Building, Bars & Onboarding',
    description: 'Interactive giant-screen games for bars, cafés, corporate team building and employee onboarding.',
    url: `${siteUrl}/pro`,
    siteName: 'Captain Bond',
    images: [
      {
        url: `${siteUrl}/og/pro-en.webp`,
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
    title: 'Captain Bond Pro — Team Building, Bars & Onboarding',
    description: 'Interactive giant-screen games for bars, cafés, corporate team building and employee onboarding.',
    images: [`${siteUrl}/og/pro-en.webp`],
  },
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'What is Captain Bond Pro?', acceptedAnswer: { '@type': 'Answer', text: 'Captain Bond Pro is an interactive entertainment platform for bars, cafés, corporate team building and employee onboarding. Giant-screen games with AI voice DJ — zero logistics.' } },
    { '@type': 'Question', name: 'How much does it cost?', acceptedAnswer: { '@type': 'Answer', text: 'Bars and cafés subscribe at 99€/month. Corporate events start at 299€ HT per session. Custom quotes available for recurring needs.' } },
    { '@type': 'Question', name: 'What equipment do I need?', acceptedAnswer: { '@type': 'Answer', text: 'A TV or projector with a browser, plus one smartphone to host. Players join from their own phones — no app to install.' } },
    { '@type': 'Question', name: 'How many participants can play?', acceptedAnswer: { '@type': 'Answer', text: 'From 10 to 500+ participants. Works in-person, hybrid, and fully remote setups.' } },
    { '@type': 'Question', name: 'Is there a demo available?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. You can book a 15-minute demo or request a free physical demo kit with coasters and posters for your bar.' } },
  ],
};

export default function ProPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <section className="max-w-3xl mx-auto px-4 pt-8">
        <p className="text-slate-200 leading-relaxed text-center text-lg">
          <strong>Captain Bond Pro</strong> is an interactive entertainment solution for bars, cafés, corporate team building and employee onboarding. Giant-screen games with AI voice DJ — zero logistics, maximum engagement.
        </p>
      </section>
      <ProLanding defaultLang="en" />
    </>
  );
}
