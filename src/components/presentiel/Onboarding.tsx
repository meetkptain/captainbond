'use client';

import { useState } from 'react';
import { Icon, type IconName } from '@/components/Icon';

interface OnboardingProps {
  onComplete: () => void;
}

const SLIDES: { icon: IconName; title: string; description: string }[] = [
  {
    icon: 'smartphone',
    title: 'Un seul téléphone',
    description: 'Pas besoin de synchroniser plusieurs manettes. Captain Bond se joue en faisant tourner ce téléphone de main en main.'
  },
  {
    icon: 'message',
    title: 'Le bâton de parole',
    description: 'Quand le téléphone affiche votre prénom, c\'est à vous de parler. Lisez la question et répondez sincèrement à haute voix.'
  },
  {
    icon: 'hourglass',
    title: 'Savourez l\'échange',
    description: 'Le sablier est là pour guider, pas pour stresser. Si une discussion s\'engage, appuyez sur Pause et profitez du moment.'
  }
];

export function Onboarding({ onComplete }: OnboardingProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    if (currentSlide < SLIDES.length - 1) {
      setCurrentSlide(prev => prev + 1);
    } else {
      localStorage.setItem('cb_presentiel_onboarding_viewed', 'true');
      onComplete();
    }
  };

  const activeSlide = SLIDES[currentSlide];

  return (
    <div className="flex flex-col items-center justify-between gap-8 p-6 max-w-md mx-auto min-h-[480px] text-slate-100 bg-slate-900/60 backdrop-blur-md rounded-3xl border border-slate-700/50 shadow-2xl text-center">
      {/* Slide Indicators */}
      <div className="flex gap-1.5 mt-2">
        {SLIDES.map((_, idx) => (
          <div
            key={idx}
            className={`h-1.5 rounded-full transition-all duration-350 ${
              idx === currentSlide ? 'w-8 bg-amber-400' : 'w-2 bg-slate-700'
            }`}
          />
        ))}
      </div>

      {/* Slide Content */}
      <div className="flex flex-col items-center gap-4 px-4 flex-1 justify-center animate-[fadeIn_0.3s_ease-out]">
        <div className="flex justify-center mb-2">
          <Icon name={activeSlide.icon} className="w-16 h-16 text-amber-400" />
        </div>
        <h3 className="text-2xl font-bold text-slate-200">
          {activeSlide.title}
        </h3>
        <p className="text-sm text-slate-400 leading-relaxed max-w-xs">
          {activeSlide.description}
        </p>
      </div>

      {/* Action Button */}
      <button
        onClick={handleNext}
        className="w-full py-4 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-bold text-lg rounded-2xl transition-all cursor-pointer shadow-lg shadow-amber-500/10 flex items-center justify-center gap-2"
      >
        {currentSlide === SLIDES.length - 1 ? 'C&apos;est compris !' : 'Suivant'}
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
      </button>
    </div>
  );
}
