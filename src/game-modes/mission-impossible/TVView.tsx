'use client';

import { useMemo } from 'react';
import type { GameModeTVViewProps } from '../types';

export function MissionImpossibleTVView({ question, responses, gameState, timerDisplay, isUntimed }: GameModeTVViewProps) {
  const options = question?.options || [];
  const correctAnswer = question?.correctAnswer || '';

  // Calculate vote counts and majority
  const { voteStats, totalVotes, majorityOption } = useMemo(() => {
    let total = 0;
    const counts: Record<string, number> = {};
    const votersMap: Record<string, string[]> = {};

    options.forEach((opt) => {
      counts[opt] = 0;
      votersMap[opt] = [];
    });

    responses.forEach((r) => {
      if (r.answer && r.answer !== '__SKIP__') {
        total++;
        const opt = r.answer as string;
        if (counts[opt] !== undefined) {
          counts[opt]++;
          votersMap[opt].push(r.name);
        }
      }
    });

    let maxVotes = -1;
    let majority = '';
    options.forEach((opt) => {
      if (counts[opt] > maxVotes) {
        maxVotes = counts[opt];
        majority = opt;
      }
    });

    return {
      voteStats: options.map((opt) => ({
        option: opt,
        votes: counts[opt],
        voters: votersMap[opt],
      })),
      totalVotes: total,
      majorityOption: total > 0 ? majority : '',
    };
  }, [responses, options]);

  const isSuccess = majorityOption && majorityOption.toLowerCase() === correctAnswer.toLowerCase();

  if (gameState === 'VOTING') {
    return (
      <div className="flex flex-col items-center w-full max-w-4xl text-center space-y-10">
        <span className="text-amber-500 font-mono tracking-widest font-bold uppercase mb-2">
          Mission Impossible — Briefing
        </span>
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight text-white px-4">
          {question?.text || 'Chargement de la question...'}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl text-left">
          {options.map((opt, i) => (
            <div
              key={i}
              className="glass-panel p-5 border border-white/10 rounded-2xl flex items-center gap-4 bg-white/[0.02]"
            >
              <span className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-mono font-bold">
                {String.fromCharCode(65 + i)}
              </span>
              <span className="text-lg font-semibold text-slate-200">{opt}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-6 mt-8">
          <div className="glass-panel px-8 py-4 text-xl font-bold flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl">
            <span>🗳️</span>
            <span>{totalVotes} / {responses.length} Votes</span>
          </div>
          {!isUntimed && <div className="w-20 h-20">{timerDisplay}</div>}
        </div>
      </div>
    );
  }

  if (gameState === 'DISCUSSION') {
    return (
      <div className="flex flex-col items-center w-full max-w-3xl text-center space-y-8 animate-in zoom-in duration-500">
        <span className="text-emerald-400 font-mono tracking-widest font-bold uppercase">Débriefing d&apos;équipe</span>
        <h2 className="text-4xl md:text-5xl font-black leading-tight text-white">
          {isSuccess ? 'L&apos;alliance a triomphé !' : 'Dysfonctionnement de liaison...'}
        </h2>
        <p className="text-lg text-slate-300 max-w-xl mx-auto leading-relaxed">
          {isSuccess
            ? 'La majorité a voté correctement. Profitez-en pour partager vos connaissances ou anecdotes sur le sujet !'
            : `La bonne réponse était "${correctAnswer}". Qui a la clé de l'énigme à la table ?`}
        </p>
        <div className="mt-8 p-4 bg-white/5 border border-white/10 rounded-full w-20 h-20 flex items-center justify-center text-3xl">
          🎤
        </div>
      </div>
    );
  }

  // Phase REVEALING
  return (
    <div className="flex flex-col items-center w-full max-w-4xl animate-in slide-in-from-bottom-10 fade-in duration-700 space-y-12">
      <div className="text-center space-y-3">
        <span className="text-xs font-mono uppercase tracking-widest text-slate-500">Verdict de la mission</span>
        <h3 className="text-3xl md:text-4xl font-black text-white px-4 leading-tight">
          &ldquo;{question?.text}&rdquo;
        </h3>
      </div>

      {/* Outcome Banner */}
      {majorityOption ? (
        <div
          className={`px-8 py-4 border rounded-2xl flex items-center gap-4 text-xl font-black shadow-lg animate-pulse ${
            isSuccess
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-emerald-500/5'
              : 'bg-red-500/10 border-red-500/30 text-red-400 shadow-red-500/5'
          }`}
        >
          <span>{isSuccess ? '✅ MISSION RÉUSSIE' : '❌ ÉCHEC DE LA MISSION'}</span>
          <span className="text-sm font-mono opacity-80 border-l border-white/20 pl-4">
            {isSuccess ? 'Consensus Valide' : 'Désaccord Tactique'}
          </span>
        </div>
      ) : (
        <div className="text-slate-500 italic text-xl">Aucun vote n&apos;a été enregistré.</div>
      )}

      {/* Options Result List */}
      <div className="w-full max-w-2xl flex flex-col gap-4">
        {voteStats.map((stat, i) => {
          const isCorrectOpt = stat.option.toLowerCase() === correctAnswer.toLowerCase();
          const isMajority = stat.option === majorityOption;
          const percent = totalVotes > 0 ? Math.round((stat.votes / totalVotes) * 100) : 0;

          return (
            <div
              key={i}
              className={`p-5 rounded-2xl border transition-all flex flex-col gap-3 relative overflow-hidden ${
                isCorrectOpt
                  ? 'bg-emerald-500/5 border-emerald-500/30 text-emerald-300'
                  : 'bg-white/[0.02] border-white/10 text-slate-300'
              }`}
            >
              {/* Progress fill */}
              <div
                className={`absolute left-0 top-0 bottom-0 transition-all duration-1000 opacity-[0.06] ${
                  isCorrectOpt ? 'bg-emerald-500' : 'bg-white'
                }`}
                style={{ width: `${percent}%` }}
              />

              <div className="flex items-center justify-between z-10">
                <div className="flex items-center gap-3">
                  <span
                    className={`w-7 h-7 rounded-full flex items-center justify-center font-mono font-bold text-xs ${
                      isCorrectOpt
                        ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400'
                        : 'bg-white/10 border border-white/20 text-slate-400'
                    }`}
                  >
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="text-lg font-bold">{stat.option}</span>
                  {isCorrectOpt && (
                    <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30 font-bold uppercase tracking-wider">
                      Correct
                    </span>
                  )}
                  {isMajority && (
                    <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/30 font-bold uppercase tracking-wider">
                      Majoritaire
                    </span>
                  )}
                </div>
                <span className="text-lg font-black">{percent}% ({stat.votes})</span>
              </div>

              {/* Voters List */}
              {stat.voters.length > 0 && (
                <div className="flex flex-wrap gap-1.5 z-10 pl-10">
                  {stat.voters.map((voter, index) => (
                    <span
                      key={index}
                      className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/5 text-slate-400"
                    >
                      {voter}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
