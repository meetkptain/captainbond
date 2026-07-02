'use client';

import { Player } from '../TalkingStick';
import { DeckQuestion, getImposteurQuestion } from '@/lib/presentiel/deck';
import { ImposteurScreen } from './ImposteurScreen';

interface ImposteurSetupViewProps {
  players: Player[];
  currentQuestion: DeckQuestion;
  imposteurIndex: number | null;
  setupPlayerIndex: number;
  isHolding: boolean;
  setIsHolding: (value: boolean) => void;
  advanceSetup: () => void;
}

export function ImposteurSetupView({
  players,
  currentQuestion,
  imposteurIndex,
  setupPlayerIndex,
  isHolding,
  setIsHolding,
  advanceSetup,
}: ImposteurSetupViewProps) {
  const activeSetupPlayer = players[setupPlayerIndex];
  const isLastSetupPlayer = setupPlayerIndex === players.length - 1;
  const isPlayerImposteur = setupPlayerIndex === imposteurIndex;

  const startHold = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsHolding(true);
  };

  const endHold = () => {
    setIsHolding(false);
  };

  return (
    <ImposteurScreen stripeColor="#d4af37">
      <div className="flex flex-col gap-4 mt-6 z-10 w-full">
        <span className="text-5xl animate-bounce">🕵️</span>
        <h2 className="text-2xl font-black text-amber-400 uppercase tracking-tight">Révélation Secrète</h2>
        <div className="h-px bg-slate-800 w-24 mx-auto my-1"></div>
        <p className="text-slate-400 text-xs leading-relaxed px-4">
          Passez l&apos;appareil. Maintenez le bouton enfoncé pour lire votre rôle en secret, relâchez pour le cacher.
        </p>
      </div>

      <div className="my-4 flex flex-col gap-2 z-10">
        <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">Joueur actif</span>
        <div className="text-4xl font-extrabold text-slate-200 tracking-tight uppercase">
          {activeSetupPlayer.name}
        </div>
      </div>

      <div className="w-full min-h-[180px] z-10 flex items-center justify-center">
        {isHolding ? (
          <div className="w-full animate-[fadeIn_0.2s_ease-out]">
            {isPlayerImposteur ? (
              <div className="bg-amber-500/10 border border-amber-500/30 p-5 rounded-2xl flex flex-col gap-2 shadow-inner">
                <span className="text-xl">⚠️</span>
                <h4 className="text-base font-black text-amber-400 tracking-wide">TU ES L&apos;IMPOSTEUR !</h4>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Ta question secrète est légèrement différente. Mens ou oriente tes réponses pour ne pas te faire démasquer !
                </p>
                <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-xs font-semibold italic text-amber-100 leading-relaxed shadow-sm">
                  &quot;{getImposteurQuestion(currentQuestion.text)}&quot;
                </div>
              </div>
            ) : (
              <div className="bg-emerald-500/10 border border-emerald-500/30 p-5 rounded-2xl flex flex-col gap-2 shadow-inner">
                <span className="text-xl">🟢</span>
                <h4 className="text-base font-black text-emerald-400 tracking-wide">TU ES CIVIL</h4>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Réponds sincèrement à la question ci-dessous. Sois attentif pour déceler les réponses suspectes.
                </p>
                <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-xs font-semibold italic text-emerald-100 leading-relaxed shadow-sm">
                  &quot;{currentQuestion.text}&quot;
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="w-full py-8 border-2 border-dashed border-slate-800/40 rounded-2xl flex flex-col gap-2 items-center justify-center text-slate-500 text-sm font-medium">
            <span>👁️</span>
            <span>Maintenez le bouton ci-dessous pour voir</span>
          </div>
        )}
      </div>

      <div className="w-full flex flex-col gap-3 z-10">
        <button
          onMouseDown={startHold}
          onMouseUp={endHold}
          onMouseLeave={endHold}
          onTouchStart={startHold}
          onTouchEnd={endHold}
          className="w-full py-4 bg-amber-500 hover:bg-amber-600 active:scale-[0.98] text-slate-950 font-extrabold text-base rounded-2xl transition-all cursor-pointer shadow-lg shadow-amber-500/10 select-none"
        >
          {isHolding ? '🔓 CARTE RÉVÉLÉE' : '🔒 MAINTENIR POUR LIRE'}
        </button>

        <button
          onClick={advanceSetup}
          disabled={isHolding}
          className="w-full py-3 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-200 font-bold text-sm rounded-xl transition-all cursor-pointer border border-slate-700 shadow-sm"
        >
          {isLastSetupPlayer ? 'Commencer la partie →' : `Passer à ${players[setupPlayerIndex + 1].name} >`}
        </button>
      </div>
    </ImposteurScreen>
  );
}
