'use client';

import { useMemo } from 'react';
import type { GameModeTVViewProps } from '../types';
import { getDiscussionPrompt } from '../prompts';

interface WeightedVote {
  first: string;
  second: string;
}

function parseVote(answer: string): WeightedVote | null {
  if (answer === '__SKIP__') return null;
  try {
    const parsed = JSON.parse(answer) as Partial<WeightedVote>;
    if (parsed.first && parsed.second) {
      return { first: parsed.first, second: parsed.second };
    }
  } catch {
    return { first: answer, second: answer };
  }
  return null;
}

export function MostLikelyToTVView({ question, responses, gameState, timerDisplay, isUntimed }: GameModeTVViewProps) {
  const { podium, totalVotes } = useMemo(() => {
    let total = 0;
    const scores: Record<string, number> = {};
    const votersFirst: Record<string, string[]> = {};
    const votersSecond: Record<string, string[]> = {};

    responses.forEach((p) => {
      scores[p.playerId] = 0;
      votersFirst[p.playerId] = [];
      votersSecond[p.playerId] = [];
    });

    responses.forEach((r) => {
      const parsed = parseVote(r.answer as string);
      if (!parsed) return;
      total += 1;
      scores[parsed.first] = (scores[parsed.first] || 0) + 3;
      scores[parsed.second] = (scores[parsed.second] || 0) + 1;
      votersFirst[parsed.first].push(r.name);
      votersSecond[parsed.second].push(r.name);
    });

    const sortedPodium = Object.keys(scores)
      .map((id) => {
        const player = responses.find((p) => p.playerId === id);
        return {
          id,
          name: player?.name || 'Inconnu',
          score: scores[id],
          firstVoters: votersFirst[id],
          secondVoters: votersSecond[id],
        };
      })
      .sort((a, b) => b.score - a.score);

    return { podium: sortedPodium, totalVotes: total };
  }, [responses, gameState]);

  if (gameState === 'VOTING') {
    return (
      <div className="flex flex-col items-center w-full max-w-4xl text-center">
        <span className="text-neon-pink font-mono tracking-widest font-bold uppercase mb-4">Most Likely To</span>
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
        <p className="text-slate-400 mt-6 italic">Votez pour votre premier et second choix sur votre téléphone.</p>
      </div>
    );
  }

  const maxScore = podium[0]?.score || 0;
  const winner = podium.find((p) => p.score === maxScore && p.score > 0);

  if (gameState === 'DISCUSSION') {
    const prompt = getDiscussionPrompt('MOST_LIKELY_TO', {
      winnerName: winner?.name,
      questionText: question?.text as string,
    });
    return (
      <div className="flex flex-col items-center w-full max-w-4xl text-center animate-in zoom-in duration-500">
        <span className="text-emerald-400 font-mono tracking-widest font-bold uppercase mb-4">Cérémonie des awards</span>
        <h2 className="text-4xl md:text-6xl font-black leading-tight text-white mb-6">
          {prompt.title}
        </h2>
        <p className="text-xl text-slate-300 mb-2">{prompt.subtitle}</p>
        <p className="text-lg text-neon-pink font-medium mt-4">{prompt.action}</p>
        <div className="mt-8 text-6xl">🏆</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full max-w-5xl animate-in slide-in-from-bottom-10 fade-in duration-700">
      <h2 className="text-2xl font-bold text-slate-400 mb-2">Le verdict est tombé</h2>
      <h3 className="text-3xl md:text-4xl font-black text-white mb-6 text-center px-4">
        &ldquo;{question?.text}&rdquo;
      </h3>
      <p className="text-xs font-mono text-slate-500 mb-10">1er choix = 3 pts · 2ème choix = 1 pt</p>

      <div className="flex flex-wrap justify-center items-end gap-6 md:gap-10 w-full min-h-[300px]">
        {podium.filter((p) => p.score > 0).length === 0 ? (
          <div className="text-slate-500 italic text-2xl">Personne n&apos;a voté. Quelle ambiance.</div>
        ) : (
          podium.map((p, index) => {
            if (p.score === 0) return null;
            const isWinner = p.score === maxScore;
            const heightPercentage = Math.max((p.score / maxScore) * 100, 20);

            return (
              <div key={p.id} className="flex flex-col items-center justify-end h-full gap-4 w-32 md:w-48 animate-in zoom-in duration-500" style={{ animationDelay: `${index * 150}ms` }}>
                <div className="flex flex-wrap justify-center gap-1 min-h-[40px]">
                  {p.firstVoters.map((name, i) => (
                    <span key={`first-${i}`} className="text-[10px] bg-neon-purple/20 text-neon-purple px-2 py-0.5 rounded-full border border-neon-purple/20">
                      {name}
                    </span>
                  ))}
                  {p.secondVoters.map((name, i) => (
                    <span key={`second-${i}`} className="text-[10px] bg-white/10 text-slate-300 px-2 py-0.5 rounded-full border border-white/5">
                      {name}
                    </span>
                  ))}
                </div>

                <div
                  className={`w-full rounded-t-xl relative overflow-hidden transition-all duration-1000 ${
                    isWinner
                      ? 'bg-gradient-to-t from-neon-purple to-neon-pink shadow-[0_0_30px_rgba(236,72,153,0.4)]'
                      : 'bg-white/10'
                  }`}
                  style={{ height: `${heightPercentage}%`, minHeight: '80px' }}
                >
                  <div className="absolute bottom-2 w-full text-center text-3xl font-black text-white/50">
                    {p.score}
                  </div>
                </div>

                <div className="text-center">
                  <span className={`font-bold text-xl ${isWinner ? 'text-white' : 'text-slate-400'}`}>
                    {p.name}
                  </span>
                  {isWinner && <div className="text-neon-pink text-xs uppercase tracking-widest font-bold mt-1 animate-pulse">L&apos;Élu</div>}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
