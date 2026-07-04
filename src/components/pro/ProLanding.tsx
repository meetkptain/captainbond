'use client';

import { useEffect, useState } from 'react';
import { LandingLayout } from '@/components/landing/LandingLayout';
import { Section } from '@/components/landing/Section';
import { Icon } from '@/components/Icon';

type TabId = 'bars' | 'teamBuilding' | 'onboarding';

const content = {
  fr: {
    heroTitle: "Captain Bond Pro",
    heroDesc: "Transformez vos espaces en lieux de vraies connexions. Team building, animation de bars ou onboarding — une solution interactive pour chaque besoin.",
    tabs: [
      { id: 'bars' as TabId, label: 'Bars & Cafés', icon: 'wine' as const },
      { id: 'teamBuilding' as TabId, label: 'Team Building', icon: 'users' as const },
      { id: 'onboarding' as TabId, label: 'Onboarding & QVT', icon: 'sprout' as const },
    ],
    bars: {
      title: "Remplissez vos tables les soirs de semaine",
      desc: "Un jeu de quiz interactif autonome sur écran géant (TV). Les clients scannent l'écran du bar et jouent depuis leur téléphone. Ambiance électrique garantie.",
      features: [
        "Logo du bar affiché sur les exports vidéos des clients",
        "Pas d'application à installer pour les joueurs",
        "Modes Icebreaker, Spicy, Imposteur",
        "Animation autonome — le bar tourne tout seul",
      ],
      cta: "Demander un devis",
      price: "99€/mois",
    },
    teamBuilding: {
      title: "Team Building interactif en 30 secondes",
      desc: "Brisez la glace, encouragez la parole et connectez vos collaborateurs avec une animation interactive sur écran géant. Zéro logistique.",
      features: [
        "Pas d'application à installer, jouable en présentiel ou hybride",
        "Questions personnalisables selon votre secteur",
        "Rapports de cohésion détaillés",
        "Adapté aux séminaires de 10 à 200 personnes",
      ],
      cta: "Réserver mon Team Building",
      price: "299€ HT",
    },
    onboarding: {
      title: "Intégration & QVT par le jeu",
      desc: "Générez un deck de questions personnalisé via l'IA à partir de votre livret d'accueil. Mesurez et améliorez le climat social.",
      features: [
        "Deck personnalisé via IA Gemini à partir de vos documents",
        "Questions sur l'histoire de l'entreprise, les valeurs, l'équipe",
        "Rapports de cohésion pour le Codir",
        "Suivi longitudinal de la QVT",
      ],
      cta: "Découvrir les solutions",
      price: "Sur devis",
    },
  },
  en: {
    heroTitle: "Captain Bond Pro",
    heroDesc: "Transform your spaces into real connections. Team building, bar entertainment, or onboarding — one interactive solution for every need.",
    tabs: [
      { id: 'bars' as TabId, label: 'Bars & Pubs', icon: 'wine' as const },
      { id: 'teamBuilding' as TabId, label: 'Team Building', icon: 'users' as const },
      { id: 'onboarding' as TabId, label: 'Onboarding & QVT', icon: 'sprout' as const },
    ],
    bars: {
      title: "Fill your tables on slow weeknights",
      desc: "An autonomous interactive giant-screen quiz game for pubs, bars & cafés. Customers scan the bar's screen and play from their phones. Electric atmosphere guaranteed.",
      features: [
        "Bar logo displayed on customer video exports",
        "No app installation required for players",
        "Icebreaker, Spicy, Imposter modes",
        "Fully autonomous — runs itself night after night",
      ],
      cta: "Request a Quote",
      price: "$99/month",
    },
    teamBuilding: {
      title: "Interactive Team Building in 30 seconds",
      desc: "Boost team morale with a modern interactive icebreaker. No app to install, playable in-person or hybrid. Giant-screen games for your next seminar.",
      features: [
        "No app to install, playable in-person or hybrid",
        "Customizable questions for your industry",
        "Detailed cohesion reports",
        "Suitable for 10 to 200 participants",
      ],
      cta: "Book Team Building",
      price: "$299",
    },
    onboarding: {
      title: "Onboarding & Workplace Wellbeing",
      desc: "Generate a custom question deck via AI from your welcome booklet. Measure and improve social climate with data-driven insights.",
      features: [
        "Custom AI-generated deck from your company documents",
        "Questions about company history, values, team",
        "Cohesion reports for leadership",
        "Longitudinal QVT tracking",
      ],
      cta: "Explore Solutions",
      price: "Custom Quote",
    },
  }
};

export default function ProLanding({ defaultLang = 'en' }: { defaultLang?: 'fr' | 'en' }) {
  const [lang, setLang] = useState<'fr' | 'en'>(defaultLang);
  const [activeTab, setActiveTab] = useState<TabId>('bars');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isFr = window.location.pathname.startsWith('/fr');
      setLang(isFr ? 'fr' : 'en');
      const hash = window.location.hash.replace('#', '') as TabId;
      if (hash && ['bars', 'teamBuilding', 'onboarding'].includes(hash)) {
        setActiveTab(hash);
      }
    }
  }, []);

  const t = content[lang];
  const activeContent = t[activeTab];

  return (
    <LandingLayout variant="corporate">
      <Section className="pt-16 md:pt-24">
        <div className="text-center space-y-8 max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.1]">
            {t.heroTitle}
          </h1>
          <p className="text-lg md:text-xl text-white/70 max-w-xl mx-auto leading-relaxed">
            {t.heroDesc}
          </p>
        </div>
      </Section>

      <Section compact>
        <div className="flex flex-wrap justify-center gap-2 border-b border-white/10 pb-4">
          {t.tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-white/10 text-white border border-white/20'
                  : 'text-white/50 hover:text-white/80 border border-transparent'
              }`}
            >
              <Icon name={tab.icon} className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="max-w-4xl mx-auto mt-12 space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-2xl md:text-3xl font-bold text-white">
              {activeContent.title}
            </h2>
            <p className="text-white/70 max-w-2xl mx-auto leading-relaxed">
              {activeContent.desc}
            </p>
          </div>

          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
            {activeContent.features.map((feature, i) => (
              <li key={i} className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/10">
                <span className="text-green-400 mt-0.5">✓</span>
                <span className="text-sm text-white/70">{feature}</span>
              </li>
            ))}
          </ul>

          <div className="text-center space-y-4">
            <p className="text-2xl font-bold text-white">{activeContent.price}</p>
            <a
              href={`mailto:hello@captainbond.com?subject=${encodeURIComponent(activeTab === 'bars' ? 'Bar entertainment' : activeTab === 'teamBuilding' ? 'Team Building' : 'Onboarding')}`}
              className="inline-block px-8 py-4 rounded-2xl bg-white text-slate-900 font-bold hover:bg-white/90 transition-colors"
            >
              {activeContent.cta}
            </a>
          </div>
        </div>
      </Section>
    </LandingLayout>
  );
}
