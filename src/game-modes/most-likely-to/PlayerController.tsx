'use client';
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api/client';
import type { Player } from '@/lib/db/types';
import type { GameModePlayerControllerProps } from '../types';

export function MostLikelyToPlayerController({ question, hasSubmitted, onSubmitAnswer }: GameModePlayerControllerProps) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [firstChoice, setFirstChoice] = useState<string | null>(null);
  const params = useParams();
  const roomCode = (params.code as string).toUpperCase();

  useEffect(() => {
    async function fetchPlayers() {
      try {
        const data = await api.get<{ room: unknown; players?: Player[] }>(`/api/room/state?roomCode=${roomCode}`);
        if (!data.room) return;
        setPlayers((data.players || []).filter((p) => !p.isHost));
      } catch (e) {
        console.error('Erreur chargement joueurs Most Likely To:', e);
      } finally {
        setLoading(false);
      }
    }
    fetchPlayers();
  }, [roomCode]);

  useEffect(() => {
    if (firstChoice && players.length <= 2) {
      const second = players.find((p) => p.id !== firstChoice)?.id;
      if (second) {
        onSubmitAnswer(JSON.stringify({ first: firstChoice, second }));
      }
    }
  }, [firstChoice, players, onSubmitAnswer]);

  if (loading) {
    return <div className="text-slate-400 animate-pulse text-center p-6">Chargement des candidats...</div>;
  }

  if (hasSubmitted) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center animate-in zoom-in duration-500">
        <div className="w-20 h-20 bg-neon-purple/20 text-neon-purple rounded-full flex items-center justify-center text-4xl mb-4 shadow-[0_0_30px_rgba(139,92,246,0.3)]">
          📩
        </div>
        <h2 className="text-2xl font-bold">Votre double vote est enregistré.</h2>
        <p className="text-slate-400 mt-2">Regardez la TV pour le résultat.</p>
      </div>
    );
  }

  if (!firstChoice) {
    return (
      <div className="flex flex-col gap-6 w-full max-w-sm px-4 pb-8">
        <div className="text-center mb-4">
          <span className="text-neon-pink font-mono text-xs uppercase tracking-widest font-bold">Most Likely To</span>
          <h3 className="text-xl font-medium mt-2 leading-snug">
            Qui est votre <span className="text-neon-purple font-bold">premier choix</span> ?
          </h3>
          <p className="text-xs text-slate-500 mt-2">3 points pour le premier, 1 point pour le second.</p>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {players.map((p) => (
            <button
              key={p.id}
              onClick={() => setFirstChoice(p.id)}
              className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center justify-between active:scale-95 transition-all hover:bg-white/10"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-300">
                  {p.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-lg font-bold text-slate-200">{p.name}</span>
              </div>
              <span className="text-slate-500">1er</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-sm px-4 pb-8">
      <div className="text-center mb-4">
        <span className="text-neon-pink font-mono text-xs uppercase tracking-widest font-bold">Most Likely To</span>
        <h3 className="text-xl font-medium mt-2 leading-snug">
          Et votre <span className="text-neon-pink font-bold">second choix</span> ?
        </h3>
        <p className="text-xs text-slate-500 mt-2">1 point pour le second.</p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {players
          .filter((p) => p.id !== firstChoice)
          .map((p) => (
            <button
              key={p.id}
              onClick={() => onSubmitAnswer(JSON.stringify({ first: firstChoice, second: p.id }))}
              className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center justify-between active:scale-95 transition-all hover:bg-white/10"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-300">
                  {p.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-lg font-bold text-slate-200">{p.name}</span>
              </div>
              <span className="text-slate-500">2ème</span>
            </button>
          ))}
      </div>

      <button
        onClick={() => setFirstChoice(null)}
        className="text-xs text-slate-500 hover:text-slate-300 underline"
      >
        Revenir au premier choix
      </button>
    </div>
  );
}
