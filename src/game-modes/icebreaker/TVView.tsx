import React, { useMemo } from 'react';
import type { GameModeTVViewProps } from '../types';
import { getDiscussionPrompt } from '../prompts';

export function IcebreakerTVView({ question, responses, gameState, timerDisplay, isUntimed }: GameModeTVViewProps) {
  
  // Calcul des votes lors de la phase de révélation
  const { podium, totalVotes } = useMemo(() => {
    let total = 0;
    const voteCounts: Record<string, number> = {};
    const votersMap: Record<string, string[]> = {}; // Qui a voté pour qui

    // Initialize counts for all players to 0
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

    // Convert to sorted array
    const sortedPodium = Object.keys(voteCounts)
      .map(id => {
        const player = responses.find((p) => p.playerId === id);
        return {
          id,
          name: player?.name || 'Inconnu',
          votes: voteCounts[id],
          voters: votersMap[id]
        };
      })
      .sort((a, b) => b.votes - a.votes);

    return { podium: sortedPodium, totalVotes: total };
  }, [responses, gameState]);

  if (gameState === 'VOTING') {
    return (
      <div className="flex flex-col items-center w-full max-w-4xl text-center">
        <span className="text-neon-pink font-mono tracking-widest font-bold uppercase mb-4">Icebreaker</span>
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
        <p className="text-slate-400 mt-6 italic">Sortez vos téléphones. Votez pour vos amis.</p>
      </div>
    );
  }

  const maxVotes = podium[0]?.votes || 0;
  const winner = podium.find((p) => p.votes === maxVotes && p.votes > 0);

  if (gameState === 'DISCUSSION') {
    const prompt = getDiscussionPrompt('ICEBREAKER', {
      winnerName: winner?.name,
      questionText: question?.text as string,
    });
    
    const displayTitle = question?.correctAnswer
      ? (question?.text?.includes("Qui est l'auteur") 
          ? `Parole à ${question.correctAnswer} !` 
          : `Microphone to ${question.correctAnswer}!`)
      : prompt.title;

    const displaySubtitle = question?.correctAnswer
      ? (question?.text?.includes("Qui est l'auteur") 
          ? `Racontez-nous l'histoire derrière votre secret...` 
          : `Tell us the story behind your secret...`)
      : prompt.subtitle;

    return (
      <div className="flex flex-col items-center w-full max-w-4xl text-center animate-in zoom-in duration-500">
        <span className="text-emerald-400 font-mono tracking-widest font-bold uppercase mb-4">
          {question?.correctAnswer 
            ? (question?.text?.includes("Qui est l'auteur") ? 'Le Secret Révélé' : 'The Secret Revealed')
            : 'Moment de parole'}
        </span>
        <h2 className="text-4xl md:text-6xl font-black leading-tight text-white mb-6">
          {displayTitle}
        </h2>
        <p className="text-xl text-slate-300 mb-2">{displaySubtitle}</p>
        <p className="text-lg text-neon-pink font-medium mt-4">
          {question?.correctAnswer 
            ? (question?.text?.includes("Qui est l'auteur") ? 'Partagez les coulisses avec l\'équipe !' : 'Share the behind-the-scenes with the team!')
            : prompt.action}
        </p>
        <div className="mt-8 p-4 bg-white/5 border border-white/10 rounded-2xl">
          <span className="text-4xl">🎤</span>
        </div>
      </div>
    );
  }

  // Phase REVEALING
  return (
    <div className="flex flex-col items-center w-full max-w-5xl animate-in slide-in-from-bottom-10 fade-in duration-700">
      {question?.correctAnswer ? (
        <div className="mb-10 px-6 py-3 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 text-emerald-300 font-bold rounded-2xl flex items-center gap-3 text-lg md:text-xl shadow-[0_0_20px_rgba(16,185,129,0.15)] animate-pulse">
          <span>🔎</span>
          <span>
            {question?.text?.includes("Qui est l'auteur") 
              ? `L'auteur de ce Dossier Secret était : ${question.correctAnswer} !` 
              : `The author of this Secret File was: ${question.correctAnswer}!`}
          </span>
        </div>
      ) : (
        <h2 className="text-2xl font-bold text-slate-400 mb-2">Le Tribunal a rendu son verdict</h2>
      )}
      <h3 className="text-3xl md:text-4xl font-black text-white mb-16 text-center px-4">
        &ldquo;{question?.text}&rdquo;
      </h3>

      <div className="flex flex-wrap justify-center items-end gap-6 md:gap-10 w-full min-h-[300px]">
        {podium.filter(p => p.votes > 0).length === 0 ? (
          <div className="text-slate-500 italic text-2xl">Personne n&apos;a voté. Quelle ambiance.</div>
        ) : (
          podium.map((p, index) => {
            if (p.votes === 0) return null; // Ne pas afficher ceux qui ont 0 vote
            
            const isWinner = p.votes === maxVotes;
            const heightPercentage = Math.max((p.votes / maxVotes) * 100, 20); // Min 20% height
            
            return (
              <div key={p.id} className="flex flex-col items-center justify-end h-full gap-4 w-32 md:w-40 animate-in zoom-in duration-500" style={{ animationDelay: `${index * 150}ms` }}>
                
                {/* Bulle des gens qui ont voté pour lui */}
                <div className="flex flex-wrap justify-center gap-1 min-h-[24px]">
                  {p.voters.map((voterName, i) => (
                    <span key={i} className="text-[10px] bg-white/10 text-slate-300 px-2 py-0.5 rounded-full border border-white/5">
                      {voterName}
                    </span>
                  ))}
                </div>

                {/* Barre du graphique */}
                <div 
                  className={`w-full rounded-t-xl relative overflow-hidden transition-all duration-1000 ${
                    isWinner 
                    ? 'bg-gradient-to-t from-neon-purple to-neon-pink shadow-[0_0_30px_rgba(236,72,153,0.4)]' 
                    : 'bg-white/10'
                  }`}
                  style={{ height: `${heightPercentage}%`, minHeight: '80px' }}
                >
                  <div className="absolute bottom-2 w-full text-center text-3xl font-black text-white/50">
                    {p.votes}
                  </div>
                </div>

                {/* Nom du joueur */}
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
