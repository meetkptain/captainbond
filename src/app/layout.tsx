import type { Metadata, Viewport } from "next";
import { Outfit, Geist } from "next/font/google";
import Script from 'next/script';
import { LanguageProvider } from '@/lib/i18n';
import { ScrollToTop } from '@/components/ui/ScrollToTop';
import { MobileCta } from '@/components/ui/MobileCta';
import { headers } from 'next/headers';
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  adjustFontFallback: true,
});

export const metadata: Metadata = {
  title: 'Captain Bond — The DJ of Your Party',
  description: 'Turn your TV into a party game board. Icebreaker, Spicy, Deep Connection, Imposteur, Date Night.',
  alternates: {
    languages: {
      'x-default': '/',
      'en': '/',
      'fr': '/fr',
    },
  },
  openGraph: {
    type: 'website',
    siteName: 'Captain Bond',
  },
  twitter: {
    card: 'summary_large_image',
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const lang = headersList.get('x-lang') || 'fr';

  return (
    <html
      lang={lang}
      className={cn("h-full", "antialiased", outfit.variable, "font-sans", geist.variable)}
    >
      <body className="min-h-[100dvh] flex flex-col bg-slate-950 text-slate-200 selection:bg-neon-purple/30">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-neon-purple focus:text-white focus:rounded-lg focus:text-sm focus:font-bold"
        >
          {lang === 'fr' ? 'Aller au contenu' : 'Skip to content'}
        </a>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'Captain Bond',
              url: 'https://captainbond.com',
              logo: 'https://captainbond.com/og/home-en.webp',
              sameAs: [
                'https://github.com/meetkptain/captainbond-couple-data-study',
              ],
              description: lang === 'fr'
                ? "Jeux d'ambiance sur écran géant, rituels couple et team building interactif."
                : 'Party games on your TV, daily couple rituals, and interactive team building.',
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'Captain Bond',
              url: 'https://captainbond.com',
              description: 'Interactive party games, couple rituals & team building.',
              potentialAction: {
                '@type': 'SearchAction',
                target: {
                  '@type': 'EntryPoint',
                  urlTemplate: 'https://captainbond.com/search?q={search_term_string}',
                },
                'query-input': 'required name=search_term_string',
              },
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'BreadcrumbList',
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: lang === 'fr' ? 'Accueil' : 'Home', item: 'https://captainbond.com' },
                { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://captainbond.com/blog' },
              ],
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Product',
              name: 'Captain Bond',
              description: lang === 'fr'
                ? "Jeux d'ambiance sur écran géant, rituels couple et team building interactif."
                : 'Interactive party games, couple rituals & team building.',
              url: 'https://captainbond.com',
              brand: { '@type': 'Brand', name: 'Captain Bond' },
              offers: [
                { '@type': 'Offer', name: 'Party Free', price: '0', priceCurrency: 'EUR' },
                { '@type': 'Offer', name: 'Party Pass 24h', price: '2.99', priceCurrency: 'EUR' },
                { '@type': 'Offer', name: 'Party Monthly', price: '7.99', priceCurrency: 'EUR' },
                { '@type': 'Offer', name: 'Couple Monthly', price: '4.99', priceCurrency: 'EUR' },
                { '@type': 'Offer', name: 'Pro Bar', price: '99', priceCurrency: 'EUR' },
                { '@type': 'Offer', name: 'Pro Corporate', price: '299', priceCurrency: 'EUR' },
              ],
            }),
          }}
        />
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID || 'G-XXXXXXXXXX'}`}
          strategy="afterInteractive"
        />
        <Script id="ga4-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${process.env.NEXT_PUBLIC_GA_ID || 'G-XXXXXXXXXX'}');
          `}
        </Script>
        <LanguageProvider initialLang={lang as 'fr' | 'en'}>
          {children}
          <ScrollToTop />
          <MobileCta />
        </LanguageProvider>
      </body>
    </html>
  );
}
