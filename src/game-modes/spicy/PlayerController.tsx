'use client';
import React, { useMemo } from 'react';
import type { GameModePlayerControllerProps } from '../types';

export function SpicyPlayerController({ question, hasSubmitted, onSubmitAnswer }: GameModePlayerControllerProps) {
  
  // Petit parseur intelligent pour extraire les options si la question est un Dilemme
  // Ex: "Tu préfères [avoir des ailes] ou [respirer sous l'eau] ?"
  const options = useMemo(() => {
    if (!question?.text) return { a: 'Pour', b: 'Contre' };
    
    // Essayer de trouver " ou " dans le texte pour splitter
    const lowerText = question.text.toLowerCase();
    if (lowerText.includes(' ou ')) {
      const parts = question.text.split(/ ou /i);
      if (parts.length === 2) {
        // Nettoyer un peu (enlever "Tu préfères", les "?")
        let optA = parts[0].replace(/tu préfères /i, '').replace(/tu preferes /i, '').trim();
        let optB = parts[1].replace(/\?/g, '').trim();
        // Capitalize first letter
        optA = optA.charAt(0).toUpperCase() + optA.slice(1);
        optB = optB.charAt(0).toUpperCase() + optB.slice(1);
        return { a: optA, b: optB };
      }
    }
    return { a: 'Pour', b: 'Contre' };
  }, [question]);

  if (hasSubmitted) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center animate-in zoom-in duration-500">
        <div className="w-20 h-20 bg-neon-pink/20 text-neon-pink rounded-full flex items-center justify-center text-4xl mb-4 shadow-[0_0_30px_rgba(236,72,153,0.3)]">
          ⚖️
        </div>
        <h2 className="text-2xl font-bold">Votre choix est verrouillé.</h2>
        <p className="text-slate-400 mt-2">Préparez-vous à défendre votre opinion.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-sm px-4 pb-8 h-[60vh] justify-center">
      <div className="text-center mb-8">
        <span className="text-neon-pink font-mono text-xs uppercase tracking-widest font-bold">Dilemme Spicy</span>
        <h3 className="text-xl font-medium mt-2 leading-snug">
          Dans quel camp êtes-vous ?
        </h3>
      </div>

      <div className="flex flex-col gap-4 flex-1">
        {/* BOUTON A (Bleu/Violet) */}
        <button
          onClick={() => onSubmitAnswer('A')}
          className="flex-1 w-full relative overflow-hidden group bg-gradient-to-br from-indigo-900 to-indigo-600 p-6 rounded-3xl flex flex-col items-center justify-center active:scale-95 transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)]"
        >
          <span className="text-4xl mb-2">🔵</span>
          <span className="text-xl font-bold text-white text-center leading-tight">{options.a}</span>
        </button>

        <div className="flex items-center justify-center -my-6 z-10 pointer-events-none">
          <div className="bg-slate-950 w-12 h-12 rounded-full border-4 border-slate-900 flex items-center justify-center font-black text-slate-500">
            VS
          </div>
        </div>

        {/* BOUTON B (Rose/Rouge) */}
        <button
          onClick={() => onSubmitAnswer('B')}
          className="flex-1 w-full relative overflow-hidden group bg-gradient-to-br from-rose-900 to-rose-600 p-6 rounded-3xl flex flex-col items-center justify-center active:scale-95 transition-all shadow-[0_0_20px_rgba(225,29,72,0.3)]"
        >
          <span className="text-4xl mb-2">🔴</span>
          <span className="text-xl font-bold text-white text-center leading-tight">{options.b}</span>
        </button>
      </div>
    </div>
  );
}
