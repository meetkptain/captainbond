'use client';
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api/client';
import type { Player } from '@/lib/db/types';
import type { GameModePlayerControllerProps } from '../types';

export function IcebreakerPlayerController({ question, hasSubmitted, onSubmitAnswer }: GameModePlayerControllerProps) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const params = useParams();
  const roomCode = (params.code as string).toUpperCase();

  useEffect(() => {
    async function fetchPlayers() {
      try {
        const data = await api.get<{ room: unknown; players?: Player[] }>(`/api/room/state?roomCode=${roomCode}`);
        if (!data.room) return;
        setPlayers((data.players || []).filter((p) => !p.isHost));
      } catch (e) {
        console.error('Erreur chargement joueurs icebreaker:', e);
      } finally {
        setLoading(false);
      }
    }
    fetchPlayers();
  }, [roomCode]);

  if (loading) {
    return <div className="text-slate-400 animate-pulse text-center p-6">Chargement des suspects...</div>;
  }

  if (hasSubmitted) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center animate-in zoom-in duration-500">
        <div className="w-20 h-20 bg-neon-purple/20 text-neon-purple rounded-full flex items-center justify-center text-4xl mb-4 shadow-[0_0_30px_rgba(139,92,246,0.3)]">
          📩
        </div>
        <h2 className="text-2xl font-bold">Le vote est glissé dans l&apos;urne.</h2>
        <p className="text-slate-400 mt-2">Regardez la TV pour voir le résultat.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-sm px-4 pb-8">
      <div className="text-center mb-4">
        <span className="text-neon-pink font-mono text-xs uppercase tracking-widest font-bold">Tribunal Social</span>
        <h3 className="text-xl font-medium mt-2 leading-snug">
          À qui attribuez-vous cet Award ?
        </h3>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {players.map((p) => (
          <button
            key={p.id}
            onClick={() => onSubmitAnswer(p.id)}
            className="w-full relative overflow-hidden group bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center justify-between active:scale-95 transition-all"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-neon-purple/0 via-neon-purple/10 to-neon-purple/0 translate-x-[-100%] group-active:translate-x-[100%] transition-transform duration-500" />
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-300">
                {p.name.charAt(0).toUpperCase()}
              </div>
              <span className="text-lg font-bold text-slate-200">{p.name}</span>
            </div>
            
            <div className="text-slate-500 group-active:text-neon-purple transition-colors">
              👉
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
