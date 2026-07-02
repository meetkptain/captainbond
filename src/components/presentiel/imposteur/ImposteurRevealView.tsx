'use client';

import { Player } from '../TalkingStick';
import { DeckQuestion, getImposteurQuestion } from '@/lib/presentiel/deck';
import { ImposteurScreen } from './ImposteurScreen';

interface ImposteurRevealViewProps {
  players: Player[];
  currentQuestion: DeckQuestion;
  imposteurIndex: number | null;
  checkedVoters: Record<string, boolean>;
  toggleCheckedVoter: (playerId: string, checked: boolean) => void;
  spectatorVotes: Record<string, number>;
  handleImposteurNext: () => void;
}

export function ImposteurRevealView({
  players,
  currentQuestion,
  imposteurIndex,
  checkedVoters,
  toggleCheckedVoter,
  spectatorVotes,
  handleImposteurNext,
}: ImposteurRevealViewProps) {
  const imposteurPlayer = players[imposteurIndex!];
  const correctVotersCount = Object.values(checkedVoters).filter(Boolean).length;
  const imposteurFound = correctVotersCount > 0;

  return (
    <ImposteurScreen>
      <div className="flex flex-col items-center gap-5 mt-2 w-full z-10 animate-[fadeIn_0.25s_ease-out]">

        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] text-rose-400 font-bold uppercase tracking-widest font-mono">Fin de la manche</span>
          <h2 className="text-2xl font-black text-white tracking-tight uppercase">Révélation !</h2>
        </div>

        <div className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl p-5 flex flex-col items-center gap-3.5 relative overflow-hidden shadow-inner">
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[repeating-linear-gradient(45deg,#ef4444,#ef4444_10px,#000_10px,#000_20px)]"></div>

          <span className="text-5xl animate-[pulse_1.5s_infinite]">🎭</span>
          <div>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-0.5">L&apos;Imposteur était...</span>
            <span className="text-xl font-black text-rose-400 uppercase tracking-tight">
              {imposteurPlayer.name}
            </span>
          </div>

          <div className="bg-slate-900/80 border border-slate-800/80 px-4 py-2 rounded-xl text-[11px] text-slate-400 max-w-xs leading-relaxed">
            La question secrète de l&apos;Imposteur était : <br />
            <strong className="text-amber-300 font-medium block mt-1 italic">&ldquo;{getImposteurQuestion(currentQuestion.text)}&rdquo;</strong>
          </div>
        </div>

        <div className="w-full text-left bg-slate-900/40 border border-slate-800/60 p-4 rounded-2xl">
          <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block mb-2 text-center">Qui l&apos;avait démasqué ?</span>
          <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
            {players.map(p => {
              if (p.id === imposteurPlayer.id) return null;
              const isChecked = !!checkedVoters[p.id];
              return (
                <label key={p.id} className="flex items-center justify-between p-2 hover:bg-white/5 rounded-xl cursor-pointer transition-all">
                  <span className="text-sm font-medium text-slate-200">{p.name}</span>
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) => toggleCheckedVoter(p.id, e.target.checked)}
                    className="w-5 h-5 rounded border-slate-700 bg-slate-950 text-emerald-500 focus:ring-emerald-500/40 cursor-pointer"
                  />
                </label>
              );
            })}
          </div>
        </div>

        <div className="w-full bg-slate-950/40 border border-slate-900 p-3.5 rounded-xl text-left text-xs font-mono">
          <span className="text-slate-500 font-bold block mb-1 uppercase tracking-wider text-[9px]">Calcul des Points :</span>
          {imposteurFound ? (
            <p className="text-emerald-400">
              Civils corrects : +1 pt chacun.<br />
              Imposteur démasqué : 0 pt.
            </p>
          ) : (
            <p className="text-rose-400">
              Personne n&apos;a trouvé l&apos;Imposteur.<br />
              {imposteurPlayer.name} gagne : +2 pts de bluff !
            </p>
          )}
        </div>

        {Object.keys(spectatorVotes).length > 0 && (
          <div className="w-full bg-slate-950/30 border border-slate-900/50 p-3 rounded-xl text-left text-[11px] font-mono mt-1">
            <span className="text-slate-500 font-bold block mb-1 uppercase tracking-wider text-[9px]">Votes du Public (Spectateurs) :</span>
            <div className="space-y-1">
              {players.map(p => {
                const count = spectatorVotes[p.id] || 0;
                if (count === 0) return null;
                return (
                  <div key={p.id} className="flex justify-between items-center text-slate-300">
                    <span>{p.name} :</span>
                    <span className="text-blue-400 font-bold">{count} {count > 1 ? 'votes' : 'vote'}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>

      <button
        onClick={handleImposteurNext}
        className="w-full py-4 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-bold text-lg rounded-2xl transition-all cursor-pointer shadow-lg shadow-rose-500/15 flex items-center justify-center gap-2 z-10"
      >
        Manche suivante
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </ImposteurScreen>
  );
}
