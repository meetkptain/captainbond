'use client';

import React, { useState, useEffect } from 'react';
import { LandingLayout } from '@/components/landing/LandingLayout';
import { LandingButton } from '@/components/landing/LandingButton';
import { Section } from '@/components/landing/Section';
import { FeatureShowcase } from '@/components/landing/FeatureShowcase';
import { CoupleVisualMockup } from '@/components/landing/CoupleVisualMockup';
import { CoupleDemo } from '@/components/couple/demo/CoupleDemo';
import { Icon } from '@/components/Icon';

interface CoupleLandingProps {
  onStartAuth: () => void;
  defaultLang?: 'fr' | 'en';
}

const content = {
  fr: {
    category: "Espace Couple",
    heroTitle: <>Le rituel de 5 minutes<br />pour se reconnecter</>,
    heroDesc: "Répondez à l'aveugle à une question par jour. Révélation de votre complicité à 20h00, analysée et guidée par notre Intelligence Relationnelle.",
    startBtn: "Commencer le rituel",
    demoBtn: "Voir la démo",
    step1Title: "Le Miroir Quotidien",
    step1Desc: "Une question par jour, posée en même temps à 12h. Vos réponses restent secrètes jusqu'à la synchronisation.",
    step2Title: "Jauge d'Harmonie",
    step2Desc: "Notre IA analyse la résonance de vos mots pour évaluer la complicité, le soutien mutuel et les points d'alignement.",
    step3Title: "L'Arbre Neural",
    step3Desc: "Chaque miroir complété fait grandir votre arbre relationnel. Une cartographie poétique et vivante de votre connexion.",
    socialProofCategory: "Conçu pour tous les couples",
  },
  en: {
    category: "Couple Space",
    heroTitle: <>The 5-minute daily ritual<br />to reconnect</>,
    heroDesc: "Answer one question a day blindly. Complicity revealed at 8:00 PM, analyzed and guided by our Relational Intelligence AI.",
    startBtn: "Start the Ritual",
    demoBtn: "Watch Demo",
    step1Title: "The Daily Mirror",
    step1Desc: "One question a day, asked simultaneously at 12 PM. Your answers stay private until synchronization.",
    step2Title: "Harmony Gauge",
    step2Desc: "Our AI analyzes word resonance to assess complicity, mutual support, and alignment points.",
    step3Title: "The Neural Tree",
    step3Desc: "Each completed mirror grows your relationship tree. A poetic and live mapping of your connection.",
    socialProofCategory: "Designed for all couples",
  }
};

export function CoupleLanding({ onStartAuth, defaultLang = 'en' }: CoupleLandingProps) {
  const [lang, setLang] = useState<'fr' | 'en'>(defaultLang);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isFr = window.location.pathname.startsWith('/fr');
      setLang(isFr ? 'fr' : 'en');
    }
  }, []);

  const t = content[lang];

  return (
    <LandingLayout variant="couple">
      {/* Hero */}
      <Section className="pt-10 md:pt-20">
        <div className="text-center space-y-8 max-w-3xl mx-auto">
          <span className="inline-block text-xs font-mono uppercase tracking-widest text-white/50 border border-white/10 px-3 py-1 rounded-full">
            {t.category}
          </span>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.1]">
            {t.heroTitle}
          </h1>
          <p className="text-lg md:text-xl text-white/70 max-w-xl mx-auto leading-relaxed">
            {t.heroDesc}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <LandingButton onClick={onStartAuth}>
              {t.startBtn}
            </LandingButton>
            <LandingButton
              variant="secondary"
              onClick={() => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })}
            >
              {t.demoBtn}
            </LandingButton>
          </div>
        </div>
      </Section>

      {/* Visual Proof */}
      <Section compact>
        <CoupleVisualMockup />
      </Section>

      {/* How it works */}
      <Section>
        <div className="space-y-24 md:space-y-32">
          <FeatureShowcase
            step="01"
            title={t.step1Title}
            description={t.step1Desc}
            visual={
              <div className="aspect-video bg-[#0a0f1e] rounded-2xl border border-white/10 flex items-center justify-center">
                <Icon name="sparkles" className="w-20 h-20 text-white/20" />
              </div>
            }
          />
          <FeatureShowcase
            step="02"
            title={t.step2Title}
            description={t.step2Desc}
            visual={
              <div className="aspect-video bg-[#0a0f1e] rounded-2xl border border-white/10 flex items-center justify-center">
                <Icon name="chart" className="w-20 h-20 text-white/20" />
              </div>
            }
            reverse
          />
          <FeatureShowcase
            step="03"
            title={t.step3Title}
            description={t.step3Desc}
            visual={
              <div className="aspect-video bg-[#0a0f1e] rounded-2xl border border-white/10 flex items-center justify-center">
                <Icon name="tree" className="w-20 h-20 text-white/20" />
              </div>
            }
          />
        </div>
      </Section>

      {/* Demo */}
      <Section id="demo" compact className="bg-white/[0.02]">
        <div className="max-w-3xl mx-auto">
          <CoupleDemo />
        </div>
      </Section>

      {/* Social Proof */}
      <Section compact>
        <div className="text-center max-w-xl mx-auto space-y-4">
          <p className="text-xs font-mono uppercase tracking-widest text-white/40">
            {t.socialProofCategory}
          </p>
        </div>
      </Section>
    </LandingLayout>
  );
}
