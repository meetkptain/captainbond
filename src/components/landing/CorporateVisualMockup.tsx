'use client';

import React from 'react';

export function CorporateVisualMockup() {
  return (
    <div className="relative w-full aspect-[16/10] md:aspect-[16/8] bg-[#0a0f1e] rounded-3xl border border-white/10 p-6 md:p-10 overflow-hidden">
      {/* Main presentation screen */}
      <div className="absolute inset-4 md:inset-8 bg-[#020617] rounded-2xl border border-white/10 flex">
        {/* Sidebar */}
        <div className="hidden md:flex w-48 border-r border-white/5 flex-col p-4 gap-3">
          <div className="text-[10px] font-mono uppercase tracking-wider text-white/40">Participants</div>
          <div className="space-y-2">
            {['Équipe A', 'Équipe B', 'Équipe C'].map((team, i) => (
              <div key={team} className="flex items-center gap-2 text-xs text-white/70">
                <div className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-cyan-400' : i === 1 ? 'bg-violet-400' : 'bg-amber-400'}`} />
                {team}
              </div>
            ))}
          </div>
          <div className="mt-auto">
            <div className="text-[10px] font-mono uppercase tracking-wider text-white/40 mb-2">Score</div>
            <div className="h-24 flex items-end gap-2">
              <div className="w-1/3 bg-white/10 rounded-t h-[60%]" />
              <div className="w-1/3 bg-white/10 rounded-t h-[85%]" />
              <div className="w-1/3 bg-white/10 rounded-t h-[45%]" />
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col p-4 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <span className="text-[10px] font-mono uppercase tracking-wider text-white/40">
              Séminaire Acme Corp
            </span>
            <span className="text-[10px] font-mono uppercase tracking-wider text-white/40">
              Round 3 / 8
            </span>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center text-center gap-4">
            <div className="text-lg md:text-2xl font-black text-white leading-tight max-w-lg">
              Quelle qualité votre équipe devrait cultiver davantage ?
            </div>
            <div className="flex flex-wrap justify-center gap-2 md:gap-3 mt-2">
              {['Écoute', 'Créativité', 'Franc-parler'].map((answer) => (
                <div
                  key={answer}
                  className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs md:text-sm text-white/80"
                >
                  {answer}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Floating phone */}
      <div className="absolute -bottom-2 -right-2 md:bottom-6 md:right-6 w-16 md:w-24 bg-[#0f1525] rounded-[1.25rem] border border-white/10 p-1.5 shadow-xl rotate-6">
        <div className="w-full aspect-[9/19] bg-[#020617] rounded-[0.875rem] overflow-hidden flex flex-col p-2">
          <div className="text-[8px] font-mono text-white/40 uppercase mb-2">Votre vote</div>
          <div className="space-y-1.5">
            <div className="h-5 bg-white/10 rounded-md" />
            <div className="h-5 bg-white/5 rounded-md" />
            <div className="h-5 bg-white/5 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
}
