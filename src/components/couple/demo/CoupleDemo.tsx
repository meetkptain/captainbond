'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ResonanceCircle } from '@/components/couple/ResonanceCircle';
import { useTypewriter } from '@/hooks/useTypewriter';
import { LandingButton } from '@/components/landing/LandingButton';

type DemoState = 'input' | 'analyzing' | 'revealed';

const ANALYSIS_STEPS = [
  'Analyse des réponses...',
  'Calcul de la résonance...',
  'Génération du profil...',
];

const PARTNER_RESPONSE =
  "Notre pique-nique sous l'orage où on a fini trempés mais tellement complices.";

const INSIGHT_TEXT =
  "Une résonance émotionnelle exceptionnelle (89%). Vous partagez un ancrage commun basé sur l'aventure partagée et l'acceptation joyeuse des imprévus.";

export function CoupleDemo() {
  const [demoState, setDemoState] = useState<DemoState>('input');
  const [demoAnswer, setDemoAnswer] = useState('');
  const [analysisStep, setAnalysisStep] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (e: MediaQueryListEvent) => setReduceMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const {
    displayedText: partnerText,
    isDone: partnerDone,
    skip: skipPartner,
  } = useTypewriter({
    text: PARTNER_RESPONSE,
    enabled: demoState === 'revealed',
    speed: 35,
    reduceMotion,
  });

  const {
    displayedText: insightText,
    isDone: insightDone,
    skip: skipInsight,
  } = useTypewriter({
    text: INSIGHT_TEXT,
    enabled: demoState === 'revealed' && partnerDone,
    speed: 20,
    reduceMotion,
  });

  useEffect(() => {
    if (demoState !== 'analyzing') return;

    let step = analysisStep;

    const interval = setInterval(() => {
      step += 1;
      setAnalysisStep(step);

      if (step >= ANALYSIS_STEPS.length - 1) {
        clearInterval(interval);
        setTimeout(() => {
          setDemoState('revealed');
        }, reduceMotion ? 100 : 800);
      }
    }, reduceMotion ? 100 : 900);

    return () => clearInterval(interval);
  }, [demoState, reduceMotion, analysisStep]);

  const handleStartAnalysis = useCallback(() => {
    if (!demoAnswer.trim()) return;
    setAnalysisStep(0);
    setDemoState('analyzing');
  }, [demoAnswer]);

  const handleReset = useCallback(() => {
    setDemoState('input');
    setDemoAnswer('');
    setAnalysisStep(0);
  }, []);

  return (
    <div className="w-full rounded-3xl border border-white/10 bg-white/[0.02] p-6 md:p-10 space-y-8">
      <div className="text-center space-y-2">
        <span className="text-xs font-mono uppercase tracking-widest text-white/50">
          Démo Interactive
        </span>
        <h3 className="text-xl md:text-2xl font-black text-white tracking-tight">
          Vivez une Révélation en direct
        </h3>
        <p className="text-sm text-white/60 max-w-md mx-auto">
          Entrez une réponse fictive pour simuler le miroir relationnel de ce soir.
        </p>
      </div>

      {demoState === 'input' && (
        <div className="space-y-4 max-w-xl mx-auto">
          <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
            <p className="text-xs font-mono text-white/50 uppercase mb-2">Question du jour</p>
            <p className="text-base font-bold text-white">
              Quel est le souvenir à deux qui vous fait encore sourire aujourd&apos;hui ?
            </p>
          </div>
          <textarea
            value={demoAnswer}
            onChange={(e) => setDemoAnswer(e.target.value)}
            placeholder="Écrivez votre réponse..."
            rows={3}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-white/30 transition-colors text-sm resize-y"
          />
          <LandingButton
            onClick={handleStartAnalysis}
            disabled={!demoAnswer.trim()}
            className="w-full"
          >
            Simuler la Synchronisation
          </LandingButton>
        </div>
      )}

      {demoState === 'analyzing' && (
        <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
          <div className="w-10 h-10 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          <div className="space-y-1">
            <p className="text-xs font-mono text-white/70 font-bold uppercase tracking-widest">
              {ANALYSIS_STEPS[analysisStep]}
            </p>
            <p className="text-xs text-white/40">
              L&apos;IA Captain Bond croise vos mots avec ceux de votre partenaire...
            </p>
          </div>
        </div>
      )}

      {demoState === 'revealed' && (
        <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
          <div className="flex justify-center">
            <ResonanceCircle
              resonanceScore={0.89}
              partnerAName="Vous"
              partnerBName="Partenaire"
              isRevealed={true}
              isAnimating={true}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-1">
              <p className="text-[10px] font-mono text-white/50 uppercase">Votre réponse</p>
              <p className="text-sm text-white/80 italic">&ldquo;{demoAnswer}&rdquo;</p>
            </div>
            <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-1">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-mono text-white/50 uppercase">Réponse partenaire</p>
                {!partnerDone && (
                  <button
                    onClick={skipPartner}
                    className="text-[10px] text-white/40 hover:text-white transition-colors cursor-pointer bg-transparent border-none"
                  >
                    Afficher
                  </button>
                )}
              </div>
              <p className="text-sm text-white/80 italic min-h-[1.25rem]">
                &ldquo;{partnerText}{!partnerDone && <span className="animate-pulse">|</span>}&rdquo;
              </p>
            </div>
          </div>

          <div className="p-4 bg-white/5 border border-white/10 rounded-2xl text-center space-y-2">
            <div className="flex items-center justify-center gap-2">
              <p className="text-xs font-mono text-white/50 uppercase font-bold">Analyse de Résonance IA</p>
              {!insightDone && partnerDone && (
                <button
                  onClick={skipInsight}
                  className="text-[10px] text-white/40 hover:text-white transition-colors cursor-pointer bg-transparent border-none"
                >
                  Afficher
                </button>
              )}
            </div>
            <p className="text-sm text-white/80 italic leading-relaxed min-h-[1.25rem]">
              &ldquo;{insightText}{!insightDone && partnerDone && <span className="animate-pulse">|</span>}&rdquo;
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <LandingButton className="flex-1">Rejoindre le rituel</LandingButton>
            <LandingButton variant="secondary" onClick={handleReset}>
              Recommencer
            </LandingButton>
          </div>
        </div>
      )}
    </div>
  );
}
