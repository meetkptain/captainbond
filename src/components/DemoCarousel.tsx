'use client';

import { useEffect, useState } from 'react';
import { Icon } from '@/components/Icon';

const SLIDES = [
  {
    id: 'tv-question',
    label: 'La TV pose la carte',
    content: (
      <div className="w-full max-w-md mx-auto">
        <div className="bg-slate-900 border-4 border-slate-700 rounded-2xl p-6 shadow-2xl aspect-video flex flex-col items-center justify-center text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-neon-purple/10 to-transparent" />
          <span className="text-xs font-mono text-neon-purple uppercase tracking-widest mb-3 relative z-10">Captain Bond</span>
          <p className="text-lg md:text-xl font-medium text-white relative z-10 leading-snug">
            “Qui de vous serait le pire choix comme partenaire de survie ?”
          </p>
          <div className="absolute bottom-3 right-3 flex gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
            <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          </div>
        </div>
        <p className="text-center text-slate-400 text-sm mt-4">L’hôte projette la question sur la TV.</p>
      </div>
    ),
  },
  {
    id: 'phone-vote',
    label: 'Chacun vote sur son téléphone',
    content: (
      <div className="w-full max-w-xs mx-auto">
        <div className="bg-slate-900 border border-white/10 rounded-[2rem] p-5 shadow-2xl aspect-[9/16] flex flex-col relative overflow-hidden">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-1 rounded-full bg-white/20" />
          </div>
          <p className="text-sm text-slate-300 text-center mb-4 leading-snug">
            “Qui serait le pire choix comme partenaire de survie ?”
          </p>
          <div className="flex-1 flex flex-col gap-3 justify-center">
            {['Lucie', 'Tom', 'Inès', 'Max'].map((name, i) => (
              <button
                key={name}
                className={`py-3 rounded-xl font-bold text-sm transition-all ${
                  i === 1
                    ? 'bg-gradient-to-r from-neon-purple to-neon-pink text-white shadow-lg scale-105'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10'
                }`}
              >
                {name}
              </button>
            ))}
          </div>
          <p className="text-center text-xs text-slate-500 mt-4">Vote anonyme depuis chaque téléphone</p>
        </div>
        <p className="text-center text-slate-400 text-sm mt-4">Les joueurs deviennent manettes.</p>
      </div>
    ),
  },
  {
    id: 'tv-reveal',
    label: 'La TV révèle le résultat',
    content: (
      <div className="w-full max-w-md mx-auto">
        <div className="bg-slate-900 border-4 border-slate-700 rounded-2xl p-6 shadow-2xl aspect-video flex flex-col items-center justify-center text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-neon-pink/10 to-transparent" />
          <span className="text-xs font-mono text-neon-pink uppercase tracking-widest mb-4 relative z-10">Résultat du tour</span>
          <div className="flex items-end justify-center gap-4 relative z-10">
            <div className="flex flex-col items-center">
              <Icon name="medal" className="w-6 h-6 mb-1 text-slate-300" />
              <div className="w-12 h-16 bg-white/10 rounded-t-lg flex items-center justify-center text-sm font-bold text-slate-300">Lucie</div>
            </div>
            <div className="flex flex-col items-center">
              <Icon name="medal" className="w-8 h-8 mb-1 text-amber-400" />
              <div className="w-14 h-24 bg-gradient-to-t from-neon-purple to-neon-pink rounded-t-lg flex items-center justify-center text-sm font-bold text-white shadow-[0_0_20px_rgba(139,92,246,0.4)]">Tom</div>
            </div>
            <div className="flex flex-col items-center">
              <Icon name="medal" className="w-5 h-5 mb-1 text-amber-700" />
              <div className="w-12 h-12 bg-white/10 rounded-t-lg flex items-center justify-center text-sm font-bold text-slate-300">Max</div>
            </div>
          </div>
        </div>
        <p className="text-center text-slate-400 text-sm mt-4">Rires, justifications, verre à la main.</p>
      </div>
    ),
  },
];

export function DemoCarousel() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActive((prev) => (prev + 1) % SLIDES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="relative bg-white/5 border border-white/10 rounded-3xl p-6 md:p-10 min-h-[340px] md:min-h-[400px] flex items-center justify-center overflow-hidden">
        {SLIDES.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 flex flex-col items-center justify-center p-6 transition-all duration-700 ${
              index === active ? 'opacity-100 translate-x-0 z-10' : 'opacity-0 translate-x-8 z-0 pointer-events-none'
            }`}
          >
            {slide.content}
          </div>
        ))}
      </div>

      <div className="flex justify-center items-center gap-3 mt-6">
        {SLIDES.map((slide, index) => (
          <button
            key={slide.id}
            onClick={() => setActive(index)}
            className={`text-xs font-medium transition-all ${
              index === active
                ? 'text-white bg-white/10 px-3 py-1.5 rounded-full border border-white/10'
                : 'text-slate-500 hover:text-slate-300'
            }`}
            aria-label={`Voir l'étape ${index + 1}`}
          >
            {slide.label}
          </button>
        ))}
      </div>
    </div>
  );
}
