'use client';

import React, { useEffect, useState } from 'react';

const SEQUENCE = [
  { id: 'question', duration: 2500 },
  { id: 'vote', duration: 2500 },
  { id: 'reveal', duration: 3000 },
];

export function HeroDemo() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    let index = 0;
    const run = () => {
      const timer = setTimeout(() => {
        index = (index + 1) % SEQUENCE.length;
        setStep(index);
        run();
      }, SEQUENCE[index].duration);
      return timer;
    };
    const timer = run();
    return () => clearTimeout(timer);
  }, []);

  const current = SEQUENCE[step].id;

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="relative flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
        {/* Phone 1 */}
        <div className={`hidden md:flex flex-col items-center transition-all duration-700 ${current === 'vote' ? 'opacity-100 translate-y-0' : 'opacity-40 translate-y-4'}`}>
          <div className="w-36 bg-slate-900 border border-white/10 rounded-[1.5rem] p-3 shadow-2xl">
            <div className="flex justify-center mb-2">
              <div className="w-10 h-1 rounded-full bg-white/20" />
            </div>
            <p className="text-[10px] text-slate-400 text-center mb-2 leading-tight">
              Qui serait le pire choix comme partenaire de survie ?
            </p>
            <div className="space-y-1.5">
              {['Lucie', 'Tom', 'Inès'].map((name, i) => (
                <div
                  key={name}
                  className={`py-1.5 px-2 rounded-lg text-[10px] font-bold text-center transition-all ${
                    current === 'vote' && i === 1
                      ? 'bg-gradient-to-r from-neon-purple to-neon-pink text-white shadow-md'
                      : 'bg-white/5 text-slate-300'
                  }`}
                >
                  {name}
                </div>
              ))}
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-2 font-mono">Téléphone de Lucie</p>
        </div>

        {/* TV */}
        <div className="relative w-full max-w-md">
          <div className="bg-slate-900 border-4 border-slate-700 rounded-2xl p-6 md:p-8 shadow-[0_0_60px_rgba(139,92,246,0.15)] aspect-video flex flex-col items-center justify-center text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-neon-purple/10 to-transparent" />
            {current === 'question' && (
              <div className="relative z-10 animate-in fade-in zoom-in duration-500">
                <span className="text-xs font-mono text-neon-purple uppercase tracking-widest mb-3 block">Captain Bond</span>
                <p className="text-lg md:text-2xl font-medium text-white leading-snug">
                  “Qui de vous serait le pire choix comme partenaire de survie ?”
                </p>
              </div>
            )}
            {current === 'vote' && (
              <div className="relative z-10 animate-in fade-in duration-500">
                <span className="text-xs font-mono text-neon-pink uppercase tracking-widest mb-3 block">En attente des votes</span>
                <div className="flex justify-center gap-2">
                  {['Lucie', 'Tom', 'Inès'].map((name) => (
                    <span key={name} className="px-2 py-1 rounded-full bg-white/10 text-xs text-slate-300 animate-pulse">
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {current === 'reveal' && (
              <div className="relative z-10 animate-in fade-in zoom-in duration-500">
                <span className="text-xs font-mono text-green-400 uppercase tracking-widest mb-2 block">Résultat</span>
                <p className="text-3xl md:text-4xl font-black text-white mb-1">Tom</p>
                <p className="text-sm text-slate-400">3 votes · Gagnant du tour</p>
              </div>
            )}
          </div>
          <div className="mt-3 text-center">
            <span className="text-xs text-slate-500 font-mono">La TV de la soirée</span>
          </div>
        </div>

        {/* Phone 2 */}
        <div className={`hidden md:flex flex-col items-center transition-all duration-700 ${current === 'vote' ? 'opacity-100 translate-y-0' : 'opacity-40 translate-y-4'}`}>
          <div className="w-36 bg-slate-900 border border-white/10 rounded-[1.5rem] p-3 shadow-2xl">
            <div className="flex justify-center mb-2">
              <div className="w-10 h-1 rounded-full bg-white/20" />
            </div>
            <p className="text-[10px] text-slate-400 text-center mb-2 leading-tight">
              Qui serait le pire choix comme partenaire de survie ?
            </p>
            <div className="space-y-1.5">
              {['Lucie', 'Tom', 'Inès'].map((name, i) => (
                <div
                  key={name}
                  className={`py-1.5 px-2 rounded-lg text-[10px] font-bold text-center transition-all ${
                    current === 'vote' && i === 1
                      ? 'bg-gradient-to-r from-neon-purple to-neon-pink text-white shadow-md'
                      : 'bg-white/5 text-slate-300'
                  }`}
                >
                  {name}
                </div>
              ))}
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-2 font-mono">Téléphone de Max</p>
        </div>
      </div>

      {/* Stepper */}
      <div className="flex justify-center items-center gap-4 mt-8">
        {['La TV pose la carte', 'Les joueurs votent', 'La TV révèle'].map((label, index) => (
          <button
            key={label}
            onClick={() => setStep(index)}
            className={`text-xs font-medium transition-all ${
              index === step
                ? 'text-white bg-white/10 px-3 py-1.5 rounded-full border border-white/10'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
