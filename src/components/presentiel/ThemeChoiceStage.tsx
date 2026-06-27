'use client';

import { getQuestionTheme } from '@/lib/presentiel/theme';
import type { ThemedQuestion } from '@/lib/presentiel/theme';
import type { Player } from './TalkingStick';

interface ThemeChoiceStageProps {
  currentPlayer: Player;
  questions?: ThemedQuestion[];
  currentQuestionIndex?: number;
  onKeepCurrentQuestion: () => void;
  onSelectQuestion: (selectedIndex: number) => void;
}

export function ThemeChoiceStage({
  currentPlayer,
  questions,
  currentQuestionIndex,
  onKeepCurrentQuestion,
  onSelectQuestion,
}: ThemeChoiceStageProps) {
  const indexA = currentQuestionIndex ?? 0;
  const indexB = indexA + 1;
  const hasChoices = questions && questions.length > indexB;

  const qA = hasChoices ? questions[indexA] : null;
  const qB = hasChoices ? questions[indexB] : null;

  const themeA = qA ? getQuestionTheme(qA) : '🎲 Thème A';
  const rawThemeB = qB ? getQuestionTheme(qB) : '🎲 Thème B';
  const themeB = rawThemeB === themeA ? `${rawThemeB} (Alternative)` : rawThemeB;

  return (
    <div className="flex flex-col items-center justify-between gap-6 p-6 bg-slate-900/40 border border-slate-800/80 rounded-3xl backdrop-blur-md max-w-md mx-auto shadow-xl w-full text-center animate-[fadeIn_0.25s_ease-out]">
      <div className="flex flex-col gap-2 mt-2">
        <span className="text-[10px] text-amber-500 font-bold uppercase tracking-widest font-mono">
          👑 Choix de Thématique
        </span>
        <h3 className="text-xl font-black text-white tracking-tight uppercase">
          {currentPlayer.name}, choisis le thème
        </h3>
        <p className="text-slate-400 text-xs leading-relaxed px-2 mt-1">
          Sélectionne l&apos;ambiance de la question qui sera posée à toute la table.
        </p>
      </div>

      <div className="w-full space-y-3 my-4">
        <button
          onClick={onKeepCurrentQuestion}
          className="w-full py-4 px-5 bg-slate-950/60 hover:bg-amber-500 hover:text-slate-950 border border-slate-800 hover:border-amber-400 rounded-2xl text-left font-bold transition-all text-slate-200 cursor-pointer shadow-md flex justify-between items-center group active:scale-[0.98]"
        >
          <div className="flex flex-col text-left">
            <span className="text-[9px] text-slate-500 group-hover:text-slate-950 font-bold uppercase font-mono mb-0.5">
              Option A
            </span>
            <span className="text-base font-extrabold">{themeA}</span>
          </div>
          <span className="text-xl group-hover:translate-x-1 transition-transform">➔</span>
        </button>

        <button
          disabled={!hasChoices}
          onClick={() => onSelectQuestion(indexB)}
          className="w-full py-4 px-5 bg-slate-950/60 hover:bg-amber-500 hover:text-slate-950 border border-slate-800 hover:border-amber-400 rounded-2xl text-left font-bold transition-all text-slate-200 cursor-pointer shadow-md flex justify-between items-center group active:scale-[0.98]"
        >
          <div className="flex flex-col text-left">
            <span className="text-[9px] text-slate-500 group-hover:text-slate-950 font-bold uppercase font-mono mb-0.5">
              Option B
            </span>
            <span className="text-base font-extrabold">{themeB}</span>
          </div>
          <span className="text-xl group-hover:translate-x-1 transition-transform">➔</span>
        </button>
      </div>

      <div className="text-[10px] text-slate-500 italic">
        Le thème choisi s&apos;appliquera à tous les joueurs de ce tour.
      </div>
    </div>
  );
}
