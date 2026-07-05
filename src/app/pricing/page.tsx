import { Metadata } from 'next';
import Link from 'next/link';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://captainbond.com';

export const metadata: Metadata = {
  title: 'Pricing — Captain Bond | Free, Pass & Subscription Plans',
  description: 'Start free with 3 cards. Unlock unlimited party games with Pass 24h (2.99€), Monthly (7.99€), or Lifetime (69.99€). Pro plans from 99€/month.',
  alternates: {
    canonical: `${siteUrl}/pricing`,
    languages: {
      'x-default': `${siteUrl}/pricing`,
      'en': `${siteUrl}/pricing`,
      'fr': `${siteUrl}/fr/tarifs`,
    },
  },
  openGraph: {
    title: 'Captain Bond — Pricing',
    description: 'Start free. Unlock unlimited. 3 ways to play.',
    url: `${siteUrl}/pricing`,
    siteName: 'Captain Bond',
    images: [{ url: `${siteUrl}/og/pricing-en.webp`, width: 1200, height: 630, alt: 'Captain Bond Pricing' }],
    locale: 'en_US',
    type: 'website',
  },
  twitter: { card: 'summary_large_image', title: 'Captain Bond — Pricing', description: 'Start free. Unlock unlimited. 3 ways to play.', images: [`${siteUrl}/og/pricing-en.webp`] },
};

const plans = [
  {
    id: 'party',
    icon: '🎉',
    color: 'pink',
    name: 'Party',
    desc: 'Game nights with friends. TV board, phone controllers.',
    tiers: [
      { name: 'Free', price: '0', period: 'forever', features: ['3 free cards per mode', '5 game modes', '2-50+ players'], cta: 'Start Playing', href: '/party' },
      { name: 'Pass 24h', price: '2.99', period: '24h', features: ['All modes unlimited', 'Profiles & dossiers', 'One night access'], cta: 'Get Pass', href: '/party' },
      { name: 'Monthly', price: '7.99', period: '/month', features: ['All modes unlimited', 'All profiles & packs', 'Cancel anytime'], cta: 'Subscribe', href: '/party' },
      { name: 'Lifetime', price: '69.99', period: 'once', features: ['All current + future content', 'All profiles & packs', '🎉 Limited Launch offer'], cta: 'Get Lifetime', href: '/party', badge: '🎉 Limited Launch' },
    ],
  },
  {
    id: 'couple',
    icon: '💕',
    color: 'purple',
    name: 'Couple',
    desc: 'Daily rituals, harmony gauge, deep connection.',
    tiers: [
      { name: 'Free', price: '0', period: 'forever', features: ['3 free sessions', 'Daily Mirror mode', 'Basic harmony gauge'], cta: 'Start Free', href: '/couple' },
      { name: 'Monthly', price: '4.99', period: '/month', features: ['Unlimited sessions', 'Full harmony gauge', 'Neural Tree', 'Weekly recaps'], cta: 'Subscribe', href: '/couple' },
      { name: 'Annual', price: '39.99', period: '/year', features: ['Everything in Monthly', 'Save 33% vs monthly', 'Premium insights'], cta: 'Subscribe Annual', href: '/couple', badge: 'Save 33%' },
    ],
  },
  {
    id: 'pro',
    icon: '🏢',
    color: 'emerald',
    name: 'Pro',
    desc: 'Bars, corporate events, team building.',
    tiers: [
      { name: 'Demo', price: '0', period: 'free', features: ['Guided demo call', 'See TV mode live', 'Ask your questions'], cta: 'Book Demo', href: '/pro' },
      { name: 'Bar Monthly', price: '99', period: '/month', features: ['TV game mode', 'AI Voice DJ', 'Bar kit (coasters + posters)', 'Dashboard'], cta: 'Start Free Trial', href: '/b2b/bars-cafes' },
      { name: 'Corporate Event', price: '299', period: '/event', features: ['500+ participants', 'Custom question decks', 'Cohesion report', 'Facilitator dashboard'], cta: 'Book Event', href: '/corporate' },
    ],
  },
];

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'Is Captain Bond really free?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. You get 3 free cards per game mode in Party and 3 free sessions in Couple. No credit card required. Free cards are enough for most groups.' } },
    { '@type': 'Question', name: 'Can I cancel my subscription?', acceptedAnswer: { '@type': 'Answer', text: 'Yes, anytime. Your access continues until the end of the billing period. No questions asked.' } },
    { '@type': 'Question', name: 'What is the Lifetime plan?', acceptedAnswer: { '@type': 'Answer', text: 'One payment of 69.99€ gives you access to all current and future content forever. No recurring fees.' } },
    { '@type': 'Question', name: 'Do you offer team or educational discounts?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Contact us for team subscriptions and educational rates.' } },
    { '@type': 'Question', name: 'How does billing work?', acceptedAnswer: { '@type': 'Answer', text: 'Secure payment via Stripe. We accept Visa, Mastercard, and Apple Pay. Your data is never stored on our servers.' } },
  ],
};

export default function PricingPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <main className="max-w-6xl mx-auto px-4 py-16 md:py-24">
        <div className="text-center space-y-4 mb-16">
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight">
            One platform.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-emerald-400">Three ways to play.</span>
          </h1>
          <p className="text-lg text-white/60 max-w-xl mx-auto">
            Start free. No credit card. When you&apos;re ready to unlock more, pick the plan that fits your vibe.
          </p>
        </div>

        <div className="space-y-20">
          {plans.map((plan) => (
            <section key={plan.id}>
              <div className="text-center mb-10">
                <span className="text-3xl">{plan.icon}</span>
                <h2 className="text-2xl font-bold text-white mt-2">{plan.name}</h2>
                <p className="text-white/50">{plan.desc}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {plan.tiers.map((tier) => (
                  <div
                    key={tier.name}
                    className={`relative p-6 rounded-2xl border transition-all hover:scale-[1.02] ${
                      tier.badge
                        ? 'border-neon-purple bg-white/[0.04]'
                        : 'border-white/10 bg-white/[0.02] hover:border-white/20'
                    }`}
                  >
                    {tier.badge && (
                      <span className="absolute -top-3 left-4 px-3 py-1 rounded-full bg-neon-purple text-xs font-bold text-white">
                        {tier.badge}
                      </span>
                    )}
                    <h3 className="text-lg font-semibold text-white">{tier.name}</h3>
                    <p className="mt-2">
                      <span className="text-3xl font-black text-white">{tier.price === '0' ? 'Free' : `${tier.price}€`}</span>
                      {tier.price !== '0' && <span className="text-sm text-slate-400 ml-0.5">{tier.period}</span>}
                    </p>
                    <ul className="mt-4 space-y-2">
                      {tier.features.map((f) => (
                        <li key={f} className="text-sm text-slate-400 flex items-center gap-2">
                          <span className="text-emerald-400">✓</span> {f}
                        </li>
                      ))}
                    </ul>
                    <Link
                      href={tier.href}
                      className={`mt-6 block text-center py-2.5 rounded-lg font-semibold text-sm transition-all active:scale-95 ${
                        tier.badge
                          ? 'bg-neon-purple text-white hover:bg-neon-purple/90'
                          : 'border border-white/10 text-white hover:bg-white/5'
                      }`}
                    >
                      {tier.cta}
                    </Link>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        <section className="mt-24 text-center space-y-6">
          <h2 className="text-2xl md:text-3xl font-bold text-white">Still not sure?</h2>
          <p className="text-white/60 max-w-md mx-auto">Try Party mode free right now. No account, no credit card, no app.</p>
          <Link
            href="/party"
            className="inline-flex items-center gap-2 bg-neon-purple text-white font-bold px-8 py-3 rounded-xl hover:bg-neon-purple/90 transition-all active:scale-95"
          >
            Start Free
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </section>
      </main>
    </>
  );
}
