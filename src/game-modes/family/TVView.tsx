'use client';

import React, { useMemo } from 'react';
import type { GameModeTVViewProps } from '../types';
import { getDiscussionPrompt } from '../prompts';

export default function FamilyTVView({ question, responses, gameState, timerDisplay, isUntimed }: GameModeTVViewProps) {
  const { podium, totalVotes } = useMemo(() => {
    let total = 0;
    const voteCounts: Record<string, number> = {};
    const votersMap: Record<string, string[]> = {};

    responses.forEach((p) => {
      voteCounts[p.playerId] = 0;
      votersMap[p.playerId] = [];
    });

    responses.forEach((r) => {
      if (r.answer && r.answer !== '__SKIP__') {
        total++;
        const targetId = r.answer as string;
        if (voteCounts[targetId] !== undefined) {
          voteCounts[targetId]++;
          votersMap[targetId].push(r.name);
        }
      }
    });

    const sortedPodium = Object.keys(voteCounts)
      .map((id) => {
        const player = responses.find((p) => p.playerId === id);
        return {
          id,
          name: player?.name || 'Inconnu',
          votes: voteCounts[id],
          voters: votersMap[id],
        };
      })
      .sort((a, b) => a.votes - b.votes);

    return { podium: sortedPodium, totalVotes: total };
  }, [responses, gameState]);

  if (gameState === 'VOTING') {
    return (
      <div className="flex flex-col items-center w-full max-w-4xl text-center">
        <span className="text-green-400 font-mono tracking-widest font-bold uppercase mb-4">Mode Family</span>
        <h2 className="text-4xl md:text-6xl font-black leading-tight text-white mb-12">
          {question?.text || "Chargement..."}
        </h2>

        <div className="flex items-center gap-6 mt-8">
          <div className="glass-panel px-8 py-4 text-2xl font-bold flex items-center gap-4">
            <span>📥</span>
            <span>{totalVotes} / {responses.length} Votes</span>
          </div>

          {!isUntimed && (
            <div className="w-24 h-24 flex items-center justify-center shrink-0">
              {timerDisplay}
            </div>
          )}
        </div>
        <p className="text-slate-400 mt-6 italic">Votez pour la personne qui correspond le mieux. Le moins voté gagne.</p>
      </div>
    );
  }

  const minVotes = podium[0]?.votes || 0;
  const winner = podium.find((p) => p.votes === minVotes);

  if (gameState === 'DISCUSSION') {
    const prompt = getDiscussionPrompt('FAMILY', {
      winnerName: winner?.name,
      questionText: question?.text as string,
    });
    return (
      <div className="flex flex-col items-center w-full max-w-4xl text-center animate-in zoom-in duration-500">
        <span className="text-green-400 font-mono tracking-widest font-bold uppercase mb-4">Rituel familial</span>
        <h2 className="text-4xl md:text-6xl font-black leading-tight text-white mb-6">
          {prompt.title}
        </h2>
        <p className="text-xl text-slate-300 mb-2">{prompt.subtitle}</p>
        <p className="text-lg text-green-400 font-medium mt-4">{prompt.action}</p>
        <div className="mt-8 text-6xl">🫶</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full max-w-5xl animate-in slide-in-from-bottom-10 fade-in duration-700">
      <h2 className="text-2xl font-bold text-slate-400 mb-2">Le verdict familial</h2>
      <h3 className="text-3xl md:text-4xl font-black text-white mb-4 text-center px-4">
        &ldquo;{question?.text}&rdquo;
      </h3>
      <p className="text-xs font-mono text-green-400 mb-10">En famille, on récompense l&apos;humilité · moins de votes = gagnant</p>

      <div className="flex flex-wrap justify-center items-end gap-6 md:gap-10 w-full min-h-[300px]">
        {podium.filter((p) => p.votes >= 0).length === 0 ? (
          <div className="text-slate-500 italic text-2xl">Personne n&apos;a voté. Quelle ambiance.</div>
        ) : (
          podium.map((p, index) => {
            const isWinner = p.votes === minVotes;
            const maxDisplayed = podium[podium.length - 1]?.votes || 1;
            const heightPercentage = Math.max((p.votes / maxDisplayed) * 100, 20);

            return (
              <div key={p.id} className="flex flex-col items-center justify-end h-full gap-4 w-32 md:w-40 animate-in zoom-in duration-500" style={{ animationDelay: `${index * 150}ms` }}>
                <div className="flex flex-wrap justify-center gap-1 min-h-[24px]">
                  {p.voters.map((voterName, i) => (
                    <span key={i} className="text-[10px] bg-white/10 text-slate-300 px-2 py-0.5 rounded-full border border-white/5">
                      {voterName}
                    </span>
                  ))}
                </div>

                <div
                  className={`w-full rounded-t-xl relative overflow-hidden transition-all duration-1000 ${
                    isWinner
                      ? 'bg-gradient-to-t from-green-600 to-green-400 shadow-[0_0_30px_rgba(34,197,94,0.4)]'
                      : 'bg-white/10'
                  }`}
                  style={{ height: `${heightPercentage}%`, minHeight: '80px' }}
                >
                  <div className="absolute bottom-2 w-full text-center text-3xl font-black text-white/50">
                    {p.votes}
                  </div>
                </div>

                <div className="text-center">
                  <span className={`font-bold text-xl ${isWinner ? 'text-white' : 'text-slate-400'}`}>
                    {p.name}
                  </span>
                  {isWinner && <div className="text-green-400 text-xs uppercase tracking-widest font-bold mt-1 animate-pulse">Le plus humble</div>}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
