'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { LandingLayout } from '@/components/landing/LandingLayout';
import { Section } from '@/components/landing/Section';
import { Icon } from '@/components/Icon';

const content = {
  fr: {
    heroTitle: <>No app. Zero install.<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500">Just play.</span></>,
    heroDesc: "Party games on your TV. Daily couple rituals. Interactive team building. One QR code, zero friction.",
    partyTitle: "Soirée</br>Party",
    partyDesc: "La TV devient le plateau, vos smartphones les manettes. Icebreaker, Spicy, Deep : l'ambiance que vous voulez.",
    partyCTA: "Lancer une soirée",
    coupleTitle: "Couple</br>Espace Duo",
    coupleDesc: "Le rituel quotidien de 5 minutes pour se reconnecter. Questions, jauge d'harmonie, arbre relationnel.",
    coupleCTA: "Découvrir l'espace couple",
    proTitle: "Pro</br>Team Building",
    proDesc: "Animation interactive pour séminaires, team building, bars et cafés. Zéro logistique, impact maximum.",
    proCTA: "Explorer les solutions Pro",
  },
  en: {
    heroTitle: <>No app. Zero install.<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500">Just play.</span></>,
    heroDesc: "Party games on your TV. Daily couple rituals. Interactive team building. One QR code, zero friction.",
    partyTitle: "Party</br>Game",
    partyDesc: "Your TV is the board, your phones are the controllers. Icebreaker, Spicy, Deep — pick the vibe.",
    partyCTA: "Start a Party",
    coupleTitle: "Couple</br>Space",
    coupleDesc: "The 5-minute daily ritual to reconnect. Questions, harmony gauge, relationship tree.",
    coupleCTA: "Discover Couple Space",
    proTitle: "Pro</br>Team Building",
    proDesc: "Interactive games for seminars, team building, bars & cafés. Zero setup, maximum impact.",
    proCTA: "Explore Pro Solutions",
  }
};

export default function BrandHub({ defaultLang = 'en' }: { defaultLang?: 'fr' | 'en' }) {
  const [lang, setLang] = useState<'fr' | 'en'>(defaultLang);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isFr = window.location.pathname.startsWith('/fr');
      setLang(isFr ? 'fr' : 'en');
    }
  }, []);

  const t = content[lang];

  return (
    <LandingLayout variant="default">
      <Section className="pt-16 md:pt-24">
        <div className="text-center space-y-8 max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.1]">
            {t.heroTitle}
          </h1>
          <p className="text-lg md:text-xl text-white/70 max-w-xl mx-auto leading-relaxed">
            {t.heroDesc}
          </p>
          <div className="flex flex-wrap justify-center gap-4 md:gap-6 text-xs text-slate-400">
            <span className="flex items-center gap-1">📱 No app to install</span>
            <span className="flex items-center gap-1">🎮 50,000+ questions</span>
            <span className="flex items-center gap-1">👥 10,000+ players</span>
            <span className="flex items-center gap-1">🔒 100% private</span>
          </div>
        </div>
      </Section>

      <Section compact>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <Link
            href={lang === 'fr' ? '/fr/soiree' : '/party'}
            className="animate-fade-in-up delay-1 group block p-6 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-pink-500/50 hover:bg-white/[0.04] transition-all"
          >
            <div className="p-3 rounded-xl bg-pink-500/10 w-fit mb-4">
              <Icon name="gamepad" className="w-6 h-6 text-pink-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">
              {lang === 'fr' ? 'Soirée' : 'Party'}
              <br />
              {lang === 'fr' ? 'Party' : 'Game'}
            </h2>
            <p className="text-sm text-white/60 leading-relaxed mb-4">
              {t.partyDesc}
            </p>
            <span className="text-sm font-semibold text-pink-400 group-hover:text-pink-300 transition-colors">
              {t.partyCTA} →
            </span>
          </Link>

          <Link
            href={lang === 'fr' ? '/fr/couple' : '/couple'}
            className="animate-fade-in-up delay-2 group block p-6 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-purple-500/50 hover:bg-white/[0.04] transition-all"
          >
            <div className="p-3 rounded-xl bg-purple-500/10 w-fit mb-4">
              <Icon name="heart" className="w-6 h-6 text-purple-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">
              {lang === 'fr' ? 'Couple' : 'Couple'}
              <br />
              {lang === 'fr' ? 'Espace Duo' : 'Space'}
            </h2>
            <p className="text-sm text-white/60 leading-relaxed mb-4">
              {t.coupleDesc}
            </p>
            <span className="text-sm font-semibold text-purple-400 group-hover:text-purple-300 transition-colors">
              {t.coupleCTA} →
            </span>
          </Link>

          <Link
            href={lang === 'fr' ? '/fr/pro' : '/pro'}
            className="animate-fade-in-up delay-3 group block p-6 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-indigo-500/50 hover:bg-white/[0.04] transition-all"
          >
            <div className="p-3 rounded-xl bg-indigo-500/10 w-fit mb-4">
              <Icon name="briefcase" className="w-6 h-6 text-indigo-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">
              {lang === 'fr' ? 'Pro' : 'Pro'}
              <br />
              {lang === 'fr' ? 'Team Building' : 'Team Building'}
            </h2>
            <p className="text-sm text-white/60 leading-relaxed mb-4">
              {t.proDesc}
            </p>
            <span className="text-sm font-semibold text-indigo-400 group-hover:text-indigo-300 transition-colors">
              {t.proCTA} →
            </span>
          </Link>
        </div>
      </Section>
    </LandingLayout>
  );
}
