'use client';
import React from 'react';
import type { GameModeTVViewProps } from '../types';

export default function DateNightTVView(_props: GameModeTVViewProps) {
  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-1000">
      <div className="w-4 h-4 rounded-full bg-neon-pink/50 animate-pulse mb-8 blur-[2px]" />
      <h2 className="text-3xl font-light italic text-white/50 tracking-widest leading-relaxed">
        La technologie s&apos;efface.
        <br/><br/>
        <span className="text-lg">Posez le téléphone du Captain au milieu de la table.<br/>Regardez-vous dans les yeux.</span>
      </h2>
    </div>
  );
}
