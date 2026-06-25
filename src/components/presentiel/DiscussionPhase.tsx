'use client';

interface DiscussionPhaseProps {
  onResume: () => void;
  topic?: string;
  scores?: Record<string, number>;
  players?: Array<{ id: string; name: string }>;
}

export function DiscussionPhase({ onResume, topic, scores, players }: DiscussionPhaseProps) {
  return (
    <div className="flex flex-col items-center justify-between gap-8 p-8 max-w-md mx-auto min-h-[480px] text-slate-100 bg-slate-900/60 backdrop-blur-md rounded-3xl border border-slate-700/50 shadow-2xl text-center">
      <div className="flex flex-col items-center gap-6 mt-6 w-full">
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-3xl animate-pulse">
          🌿
        </div>

        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-emerald-300 to-green-400 bg-clip-text text-transparent">
            Moment d&apos;intégration
          </h2>
          <p className="text-sm text-slate-400">
            Prenez le temps d&apos;échanger librement sur ce qui vient d&apos;être partagé.
          </p>
        </div>

        {topic && (
          <div className="bg-slate-800/40 border border-slate-700/30 px-5 py-4 rounded-2xl w-full">
            <span className="text-xs text-slate-500 block mb-1">Fil conducteur</span>
            <p className="text-sm font-medium text-slate-300">
              {topic}
            </p>
          </div>
        )}

        {scores && players && Object.keys(scores).length > 0 && (
          <div className="bg-slate-850/40 border border-slate-800/60 px-5 py-4 rounded-2xl w-full text-left">
            <span className="text-xs text-slate-500 block mb-2 text-center uppercase tracking-wider font-bold">
              Scoreboard
            </span>
            <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
              {players
                .map(p => ({ ...p, score: scores[p.id] || 0 }))
                .sort((a, b) => b.score - a.score)
                .map(player => (
                  <div key={player.id} className="flex justify-between items-center text-sm">
                    <span className="text-slate-300 font-medium">{player.name}</span>
                    <span className="text-amber-400 font-mono font-bold bg-amber-400/10 px-2.5 py-0.5 rounded-md min-w-[28px] text-center text-xs">
                      {player.score} {player.score > 1 ? 'pts' : 'pt'}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      <div className="w-full flex flex-col gap-4">
        <div className="h-px bg-slate-800 w-full"></div>
        
        <button
          onClick={onResume}
          className="w-full py-4 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-slate-950 font-bold text-lg rounded-2xl transition-all cursor-pointer shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-2"
        >
          Reprendre le jeu
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
      </div>
    </div>
  );
}

