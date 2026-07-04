'use client';

import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface PresentielCoupleCrossSellProps {
  language: 'fr' | 'en';
}

function getCoupleComplicityScore(p1: string, p2: string) {
  const valA = p1.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const valB = p2.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return 75 + ((valA + valB) % 24);
}

export function PresentielCoupleCrossSell({ language }: PresentielCoupleCrossSellProps) {
  const [couples] = useState<string[][]>(() => {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('cb_presentiel_couples');
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {}
      }
    }
    return [];
  });

  if (couples.length > 0) {
    return (
      <div className="w-full flex flex-col gap-3">
        {couples.map((c, idx) => {
          const pA = c[0];
          const pB = c[1];
          const score = getCoupleComplicityScore(pA, pB);
          return (
            <div
              key={idx}
              className="bg-gradient-to-br from-rose-500/10 to-violet-500/10 border border-rose-500/25 p-4.5 rounded-2xl text-center space-y-3 shadow-[0_0_15px_rgba(244,63,94,0.05)] w-full"
            >
              <span className="text-[9px] text-rose-400 font-bold uppercase tracking-wider block">
                {language === 'fr' ? '🔮 Teaser Complicité IRL' : '🔮 IRL Complicity Teaser'}
              </span>
              <h4 className="text-sm font-extrabold text-slate-100 uppercase">
                {pA} & {pB} : <span className="text-rose-400 font-mono">{score}%</span>
              </h4>
              <p className="text-[11px] text-slate-400 leading-relaxed max-w-xs mx-auto">
                {language === 'fr'
                  ? "Votre complicité est vibrante ! Vous voulez analyser votre miroir relationnel quotidien en privé et construire votre Arbre Neural ?"
                  : "Your complicity is vibrant! Want to analyze your daily connection mirror in private and build your Neural Tree?"}
              </p>
              <button
                onClick={() => window.location.href = `/couple?ref=viral_endgame&lang=${language}`}
                className="w-full py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-md shadow-rose-500/15 border-none"
              >
                {language === 'fr'
                  ? "Débloquer notre Espace Couple (7j gratuits) 💖"
                  : "Unlock our Couple Space (7 days free) 💖"}
              </button>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-rose-500/10 to-violet-500/10 border border-rose-500/20 p-5 rounded-2xl w-full text-center space-y-4 shadow-[0_0_15px_rgba(244,63,94,0.05)]">
      <span className="text-[10px] text-rose-400 font-bold uppercase tracking-wider block">
        {language === 'fr' ? 'Extension Couple 💖' : 'Couple Extension 💖'}
      </span>
      <h3 className="text-sm font-black text-slate-200 uppercase">
        {language === 'fr' ? 'Continuer la complicité en Privé ?' : 'Continue complicity in Private?'}
      </h3>
      <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
        {language === 'fr'
          ? "Découvre la complicité de ton propre couple en privé. Rituel quotidien + Analyse IA gratuits pendant 7 jours."
          : "Discover your own couple's chemistry in private. Daily connection ritual + AI analysis free for 7 days."}
      </p>

      <div className="flex flex-row items-center justify-center gap-4 bg-slate-950/40 p-4 rounded-xl border border-slate-800/60 max-w-xs mx-auto">
        <div className="bg-white p-2 rounded-lg inline-block shadow-lg">
          <QRCodeSVG
            value="https://captainbond.com/couple?ref=viral_endgame"
            size={80}
            level="H"
          />
        </div>
        <div className="text-left space-y-1">
          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">
            {language === 'fr' ? 'Scanner pour jouer' : 'Scan to play'}
          </span>
          <span className="text-xs font-mono font-bold text-amber-400">captainbond.com/couple</span>
          <span className="text-[9px] text-slate-500 block leading-tight">
            {language === 'fr' ? 'Code parrainage appliqué' : 'Referral code applied'}
          </span>
        </div>
      </div>
    </div>
  );
}
