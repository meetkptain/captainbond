'use client';

import { useState } from 'react';
import { Icon, type IconName } from '@/components/Icon';

interface Slide {
  icon: IconName;
  title: string;
  description: string;
}

interface OnboardingModalProps {
  slides: Slide[];
  onComplete: () => void;
  storageKey?: string;
}

export function OnboardingModal({ slides, onComplete, storageKey }: OnboardingModalProps) {
  const [current, setCurrent] = useState(0);

  const handleNext = () => {
    if (current < slides.length - 1) {
      setCurrent(current + 1);
    } else {
      if (storageKey && typeof window !== 'undefined') {
        sessionStorage.setItem(storageKey, 'true');
      }
      onComplete();
    }
  };

  const slide = slides[current];

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-6">
      <div className="w-full max-w-sm glass-panel p-8 text-center">
        <div className="flex justify-center mb-6 animate-in zoom-in duration-300">
          <Icon name={slide.icon} className="w-16 h-16 text-white/80" />
        </div>
        <h2 className="text-2xl font-black text-white mb-4">{slide.title}</h2>
        <p className="text-slate-300 text-sm leading-relaxed mb-8">{slide.description}</p>

        <div className="flex justify-center gap-2 mb-8">
          {slides.map((_, idx) => (
            <div
              key={idx}
              className={`h-1.5 rounded-full transition-all ${
                idx === current ? 'w-6 bg-neon-purple' : 'w-1.5 bg-white/20'
              }`}
            />
          ))}
        </div>

        <button onClick={handleNext} className="cb-btn-primary w-full py-4">
          {current < slides.length - 1 ? 'Suivant' : "C'est parti"}
        </button>
      </div>
    </div>
  );
}
