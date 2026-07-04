'use client';

import type { GameModePlayerControllerProps } from '../types';
import { useTranslation } from '@/lib/i18n';

export function MissionImpossiblePlayerController({ question, hasSubmitted, onSubmitAnswer }: GameModePlayerControllerProps) {
  const { language } = useTranslation();
  const options = question?.options || [];

  if (hasSubmitted) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center animate-in zoom-in duration-500 max-w-sm mx-auto">
        <div className="w-20 h-20 bg-amber-500/10 text-amber-400 rounded-full flex items-center justify-center text-4xl mb-4 shadow-[0_0_30px_rgba(245,158,11,0.2)]">
          📡
        </div>
        <h2 className="text-2xl font-black text-slate-200">
          {language === 'fr' ? 'Liaison Établie' : 'Transmission Complete'}
        </h2>
        <p className="text-slate-400 mt-2 text-sm leading-relaxed">
          {language === 'fr'
            ? 'Votre vote tactique a été enregistré. En attente du reste de la cellule...'
            : 'Your tactical vote has been recorded. Waiting for the rest of the unit...'}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-sm px-4 pb-8">
      <div className="text-center mb-2">
        <span className="text-amber-500 font-mono text-xs uppercase tracking-widest font-bold">
          {language === 'fr' ? 'Quiz Coopératif' : 'Cooperative Quiz'}
        </span>
        <h3 className="text-xl font-bold mt-2 leading-snug text-slate-200">
          {language === 'fr' ? 'Quelle est la bonne réponse ?' : 'What is the correct answer?'}
        </h3>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {options.map((opt, i) => (
          <button
            key={i}
            onClick={() => onSubmitAnswer(opt)}
            className="w-full relative overflow-hidden group bg-white/5 border border-white/10 p-4.5 rounded-2xl flex items-center gap-4 active:scale-[0.98] transition-all hover:bg-white/[0.08] hover:border-amber-500/30 text-left border-solid cursor-pointer"
          >
            <span className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-slate-300 font-mono font-bold text-sm shrink-0 group-hover:bg-amber-500/20 group-hover:border-amber-500/40 group-hover:text-amber-400 transition-colors">
              {String.fromCharCode(65 + i)}
            </span>
            <span className="text-base font-bold text-slate-200 leading-normal">{opt}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
