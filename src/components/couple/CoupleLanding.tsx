'use client';

import React from 'react';
import { LandingLayout } from '@/components/landing/LandingLayout';
import { LandingButton } from '@/components/landing/LandingButton';
import { Section } from '@/components/landing/Section';
import { FeatureShowcase } from '@/components/landing/FeatureShowcase';
import { CoupleVisualMockup } from '@/components/landing/CoupleVisualMockup';
import { CoupleDemo } from '@/components/couple/demo/CoupleDemo';
import { Icon } from '@/components/Icon';

interface CoupleLandingProps {
  onStartAuth: () => void;
}

export function CoupleLanding({ onStartAuth }: CoupleLandingProps) {
  return (
    <LandingLayout variant="couple">
      {/* Hero */}
      <Section className="pt-10 md:pt-20">
        <div className="text-center space-y-8 max-w-3xl mx-auto">
          <span className="inline-block text-xs font-mono uppercase tracking-widest text-white/50 border border-white/10 px-3 py-1 rounded-full">
            Espace Couple
          </span>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.1]">
            Le rituel de 5 minutes<br />pour se reconnecter
          </h1>
          <p className="text-lg md:text-xl text-white/70 max-w-xl mx-auto leading-relaxed">
            Répondez à l&apos;aveugle à une question par jour. Révélation de votre complicité à 20h00, analysée et guidée par notre Intelligence Relationnelle.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <LandingButton onClick={onStartAuth}>
              Commencer le rituel
            </LandingButton>
            <LandingButton
              variant="secondary"
              onClick={() => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Voir la démo
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
            title="Le Miroir Quotidien"
            description="Une question par jour, posée en même temps à 12h. Vos réponses restent secrètes jusqu'à la synchronisation."
            visual={
              <div className="aspect-video bg-[#0a0f1e] rounded-2xl border border-white/10 flex items-center justify-center">
                <Icon name="sparkles" className="w-20 h-20 text-white/20" />
              </div>
            }
          />
          <FeatureShowcase
            step="02"
            title="Jauge d'Harmonie"
            description="Notre IA analyse la résonance de vos mots pour évaluer la complicité, le soutien mutuel et les points d'alignement."
            visual={
              <div className="aspect-video bg-[#0a0f1e] rounded-2xl border border-white/10 flex items-center justify-center">
                <Icon name="chart" className="w-20 h-20 text-white/20" />
              </div>
            }
            reverse
          />
          <FeatureShowcase
            step="03"
            title="L'Arbre Neural"
            description="Chaque miroir complété fait grandir votre arbre relationnel. Une cartographie poétique et vivante de votre connexion."
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
            Conçu pour tous les couples
          </p>
          <p className="text-white/70">
            Jeune couple, relation longue ou à distance. Déjà plus de 5 000 partenaires connectés au rituel.
          </p>
        </div>
      </Section>
    </LandingLayout>
  );
}
