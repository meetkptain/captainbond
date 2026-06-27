'use client';

import type { Player } from './TalkingStick';

interface ThemeChoiceStageProps {
  currentPlayer: Player;
  questions?: { text: string; tags?: string[] }[];
  currentQuestionIndex?: number;
  onKeepCurrentQuestion: () => void;
  onSelectQuestion: (selectedIndex: number) => void;
}

function getQuestionTheme(q: { text: string; tags?: string[] }): string {
  const text = q.text.toLowerCase();
  if (text.includes('rupture') || text.includes('rateau') || text.includes('râteau') || text.includes('ex ')) {
    return '💔 Amours & Ruptures';
  }
  if (text.includes('mensonge') || text.includes('menti') || text.includes('bluff') || text.includes('tromp')) {
    return '🤫 Mensonges & Secrets';
  }
  if (
    text.includes('soirée') ||
    text.includes('fête') ||
    text.includes('alcool') ||
    text.includes('boire') ||
    text.includes('party')
  ) {
    return '🎉 Anecdotes de Soirée';
  }
  if (
    text.includes('boulot') ||
    text.includes('travail') ||
    text.includes('école') ||
    text.includes('classe') ||
    text.includes('prof') ||
    text.includes('collègue')
  ) {
    return '🎒 École & Travail';
  }
  if (text.includes('honte') || text.includes('pire') || text.includes('gênant') || text.includes('ridicule')) {
    return '😬 Moments Gênants';
  }
  if (q.tags?.includes('positive') || q.tags?.includes('compliment')) {
    return '✨ Compliments & Positif';
  }
  if (
    q.tags?.includes('date_safe') ||
    text.includes('couple') ||
    text.includes('rencontre') ||
    text.includes('amour')
  ) {
    return '👩‍❤️‍👨 Romance & Couple';
  }
  if (text.length > 80) {
    return '💬 Confidences Profondes';
  }
  return '🎲 Chill & Anecdotes';
}

export function ThemeChoiceStage({
  currentPlayer,
  questions,
  currentQuestionIndex,
  onKeepCurrentQuestion,
  onSelectQuestion,
}: ThemeChoiceStageProps) {
  const hasChoices = questions && questions.length > (currentQuestionIndex ?? 0) + 1;
  const qA = hasChoices ? questions![currentQuestionIndex!] : null;
  const qB = hasChoices ? questions![currentQuestionIndex! + 1] : null;

  const themeA = qA ? getQuestionTheme(qA) : '🎲 Thème A';
  let themeB = qB ? getQuestionTheme(qB) : '🎲 Thème B';

  if (themeA === themeB) {
    themeB = themeB + ' (Alternative)';
  }

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
          onClick={() => onSelectQuestion((currentQuestionIndex ?? 0) + 1)}
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
