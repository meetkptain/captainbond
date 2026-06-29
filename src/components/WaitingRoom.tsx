'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api/client';
import { Icon } from '@/components/Icon';
import type { Player } from '@/lib/db/types';
import { useTranslation } from '@/lib/i18n';

interface WaitingRoomProps {
  roomCode: string;
  players: Player[];
  myPlayerId?: string | null;
  isHost?: boolean;
  onStart?: () => void;
  targetType?: string;
  customAnecdotes?: any[] | null;
}

const FUN_FACTS = [
  "Le silence de 4 secondes augmente la qualité perçue d'une réponse.",
  "Poser une question personnelle crée plus de lien que 20 minutes de small talk.",
  "Le rire synchronise le rythme cardiaque des personnes autour de la table.",
  "La vulnérabilité est contagieuse : celui qui ose inspire les autres.",
  "Captain Bond a été conçu pour que vous posiez votre téléphone.",
  "Une question absurde détend plus qu'un compliment.",
];

export function WaitingRoom({ roomCode, players, myPlayerId, isHost, onStart, targetType, customAnecdotes }: WaitingRoomProps) {
  const { language } = useTranslation();
  const [anecdoteText, setAnecdoteText] = useState('');
  const [anecdoteSubmitted, setAnecdoteSubmitted] = useState(false);
  const [submittingAnecdote, setSubmittingAnecdote] = useState(false);

  const handleAnecdoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (anecdoteText.trim().length < 3 || submittingAnecdote) return;
    setSubmittingAnecdote(true);
    try {
      await api.post('/api/room/anecdotes/submit', {
        roomCode,
        playerId: myPlayerId,
        anecdoteText: anecdoteText.trim(),
      });
      setAnecdoteSubmitted(true);
    } catch (err) {
      console.error('Error submitting anecdote:', err);
    } finally {
      setSubmittingAnecdote(false);
    }
  };
  const [readyMap, setReadyMap] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {};
    for (const p of players) {
      map[p.id] = p.isReady ?? false;
    }
    return map;
  });
  const [isToggling, setIsToggling] = useState(false);
  const [factIndex, setFactIndex] = useState(0);

  useEffect(() => {
    const map: Record<string, boolean> = {};
    for (const p of players) {
      map[p.id] = p.isReady ?? false;
    }
    requestAnimationFrame(() => {
      setReadyMap(map);
    });
  }, [players]);

  useEffect(() => {
    const interval = setInterval(() => {
      setFactIndex((prev) => (prev + 1) % FUN_FACTS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const myReady = myPlayerId ? readyMap[myPlayerId] : false;
  const allReady = players.length > 0 && players.every((p) => readyMap[p.id]);
  const readyCount = players.filter((p) => readyMap[p.id]).length;

  const toggleReady = async () => {
    if (!myPlayerId || isToggling) return;
    setIsToggling(true);
    const next = !myReady;
    try {
      await api.post('/api/room/ready', { roomCode, playerId: myPlayerId, isReady: next });
      setReadyMap((prev) => ({ ...prev, [myPlayerId]: next }));
    } catch (e) {
      console.error('Erreur toggle ready:', e);
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-4 py-8 max-w-md mx-auto w-full">
      <div className="w-20 h-20 bg-neon-purple/20 rounded-full flex items-center justify-center mb-6 border border-neon-purple/30 shadow-[0_0_30px_rgba(139,92,246,0.2)] animate-pulse">
        <Icon name="coffee" className="w-10 h-10 text-white/80" />
      </div>

      <h2 className="text-2xl font-bold mb-2">La table se prépare</h2>
      <p className="text-slate-400 mb-8 text-sm">
        {readyCount}/{players.length} prêt{players.length > 1 ? 's' : ''}
      </p>

      <div className="w-full flex flex-wrap justify-center gap-4 mb-8">
        {players.length === 0 ? (
          <p className="text-slate-500 italic">Personne n&apos;est encore arrivé...</p>
        ) : (
          players.map((p) => {
            const hasSubmittedSecret = Array.isArray(customAnecdotes) && customAnecdotes.some((anec) => anec.id === p.id);
            return (
              <div key={p.id} className="flex flex-col items-center gap-2 relative">
                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold transition-all relative ${
                    readyMap[p.id]
                      ? 'bg-gradient-to-br from-neon-purple to-neon-pink text-white ring-4 ring-neon-purple/30'
                      : 'bg-white/10 text-slate-300'
                  }`}
                >
                  {p.name.charAt(0).toUpperCase()}
                  {targetType === 'CORPORATE' && (
                    <span className="absolute -top-1.5 -right-1.5 bg-slate-900 border border-white/10 text-[10px] w-5 h-5 rounded-full flex items-center justify-center shadow-lg">
                      {hasSubmittedSecret ? '🕵️' : '📝'}
                    </span>
                  )}
                </div>
                <span className="text-xs text-slate-300 font-medium max-w-[80px] truncate">{p.name}</span>
                {readyMap[p.id] && <span className="text-[10px] text-neon-purple font-bold uppercase">Prêt</span>}
              </div>
            );
          })
        )}
      </div>

      {targetType === 'CORPORATE' && !isHost && myPlayerId && (
        <div className="w-full p-5 bg-violet-950/20 border border-violet-850/80 rounded-2xl mb-6 text-left space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🕵️</span>
            <h3 className="text-sm font-bold text-violet-300 uppercase tracking-wide">
              {language === 'fr' ? 'Dossier Secret (Anecdote)' : 'Secret File (Anecdote)'}
            </h3>
          </div>
          {anecdoteSubmitted ? (
            <p className="text-xs text-green-400 font-semibold flex items-center gap-1.5">
              <span>✓</span> {language === 'fr' ? 'Anecdote enregistrée avec succès pour le jeu.' : 'Anecdote successfully registered for the game.'}
            </p>
          ) : (
            <form onSubmit={handleAnecdoteSubmit} className="space-y-3">
              <p className="text-xs text-slate-400 leading-relaxed">
                {language === 'fr' 
                  ? "Saisissez une anecdote insolite sur votre passé ou parcours. Elle sera devinée anonymement par le groupe." 
                  : "Enter a unique anecdote about your past or career. The group will guess it anonymously."}
              </p>
              <input
                type="text"
                required
                maxLength={250}
                value={anecdoteText}
                onChange={(e) => setAnecdoteText(e.target.value)}
                placeholder={language === 'fr' ? 'Mon secret croustillant ou insolite...' : 'My secret or funny story...'}
                className="w-full bg-slate-900/80 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/50"
              />
              <button
                type="submit"
                disabled={anecdoteText.trim().length < 3 || submittingAnecdote}
                className="w-full py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 border-none cursor-pointer"
              >
                {submittingAnecdote ? (language === 'fr' ? 'Envoi...' : 'Sending...') : (language === 'fr' ? 'Valider mon anecdote' : 'Submit my anecdote')}
              </button>
            </form>
          )}
        </div>
      )}

      {!isHost && myPlayerId && (
        <button
          onClick={toggleReady}
          disabled={isToggling}
          className={`w-full py-4 rounded-xl font-black text-lg transition-all mb-6 ${
            myReady
              ? 'bg-green-500/20 border border-green-500/50 text-green-400 hover:bg-green-500/30'
              : 'cb-btn-primary'
          }`}
        >
          {myReady ? <><Icon name="check" className="w-5 h-5" /> Je suis prêt</> : 'Je suis prêt'}
        </button>
      )}

      {isHost && (
        <button
          onClick={onStart}
          disabled={!allReady || (targetType === 'CORPORATE' && (!customAnecdotes || customAnecdotes.length < 2))}
          className="w-full cb-btn-primary py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed mb-6"
        >
          {targetType === 'CORPORATE' && (!customAnecdotes || customAnecdotes.length < 2)
            ? (language === 'fr' 
                ? `Attente des secrets (${customAnecdotes?.length || 0}/${players.length})` 
                : `Waiting for secrets (${customAnecdotes?.length || 0}/${players.length})`)
            : (allReady ? 'Lancer la partie' : `Attendre les joueurs (${readyCount}/${players.length})`)}
        </button>
      )}

      <div className="w-full p-4 bg-white/5 border border-white/10 rounded-xl">
        <p className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-2">Le saviez-vous ?</p>
        <p className="text-sm text-slate-300 italic min-h-[40px] transition-all duration-500" key={factIndex}>
          {FUN_FACTS[factIndex]}
        </p>
      </div>
    </div>
  );
}
