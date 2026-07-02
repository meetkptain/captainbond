'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { api } from '@/lib/api/client';
import { safeJsonParse, safeJsonParseRecord } from '@/lib/json';
import type { GameModePlayerControllerProps } from '../types';
import { EMERGENCY_TRUTHS, EMERGENCY_LIES, pickRandomLie, pickTwoDistinct } from './emergencyCards';

interface PublicStatement {
  playerId: string;
  name: string;
  statements: string[];
}

function shuffleArray<T>(array: T[]): T[] {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
}

export function ImposteurPlayerController({ hasSubmitted, onSubmitAnswer }: GameModePlayerControllerProps) {
  const params = useParams();
  const roomCode = (params.code as string).toUpperCase();

  const [truth1, setTruth1] = useState('');
  const [truth2, setTruth2] = useState('');
  const [lie, setLie] = useState('');

  const [phase, setPhase] = useState<'writing' | 'waiting' | 'detecting' | 'done'>('writing');
  const [statements, setStatements] = useState<PublicStatement[]>([]);
  const [votedMap, setVotedMap] = useState<Record<string, number>>({});
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const playerId = useMemo(() => {
    if (typeof window === 'undefined') return null;
    const raw = sessionStorage.getItem(`player_${roomCode}`);
    const parsed = safeJsonParse<{ id?: string }>(raw, {});
    return parsed.id || raw || null;
  }, [roomCode]);

  useEffect(() => {
    if (hasSubmitted && phase === 'writing') {
      requestAnimationFrame(() => {
        setPhase('waiting');
      });
    }
  }, [hasSubmitted, phase]);

  useEffect(() => {
    if (!playerId) return;
    api
      .get<{ room?: { roundConfig?: string | Record<string, unknown> | null } }>(`/api/room/state?roomCode=${roomCode}`)
      .then((data) => {
        const rawConfig = data.room?.roundConfig;
        const configString = typeof rawConfig === 'string' ? rawConfig : JSON.stringify(rawConfig ?? {});
        const config = safeJsonParseRecord(configString) || {};
        if (config.detectionPhase === true && phase !== 'detecting' && phase !== 'done') {
          setPhase('detecting');
        }
      })
      .catch(console.error);
  }, [playerId, roomCode, phase]);

  useEffect(() => {
    const eventsChannel = supabase.channel(`room-events-${roomCode}`);
    eventsChannel.on('broadcast', { event: 'IMPOSTEUR_START_DETECTION' }, () => {
      setPhase((current) => (current === 'waiting' ? 'detecting' : current));
    });
    eventsChannel.subscribe();
    return () => {
      supabase.removeChannel(eventsChannel);
    };
  }, [roomCode]);

  useEffect(() => {
    if (phase !== 'detecting' || !playerId) return;
    requestAnimationFrame(() => {
      setLoading(true);
    });
    api
      .get<{ statements: PublicStatement[] }>(`/api/room/imposteur/statements?roomCode=${roomCode}`)
      .then((data) => {
        setStatements(data.statements || []);
        setLoading(false);
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : 'Erreur de chargement');
        setLoading(false);
      });
  }, [phase, playerId, roomCode]);

  const handleNoIdea = () => {
    const [t1, t2] = pickTwoDistinct(EMERGENCY_TRUTHS);
    setTruth1(t1);
    setTruth2(t2);
    setLie(pickRandomLie(EMERGENCY_LIES));
  };

  const handleValidate = () => {
    if (!truth1.trim() || !truth2.trim() || !lie.trim()) {
      alert('Il faut remplir les 3 champs !');
      return;
    }
    const statements = [
      { text: truth1.trim(), isLie: false },
      { text: truth2.trim(), isLie: false },
      { text: lie.trim(), isLie: true },
    ];
    const shuffled = shuffleArray(statements);
    onSubmitAnswer(JSON.stringify(shuffled));
  };

  const handleVote = async (targetPlayerId: string, lieIndex: number) => {
    if (!playerId) return;
    setLoading(true);
    try {
      await api.post('/api/room/imposteur/detect', {
        roomCode,
        targetPlayerId,
        lieIndex,
      });
      const updatedVotes = { ...votedMap, [targetPlayerId]: lieIndex };
      setVotedMap(updatedVotes);
      setSelectedTarget(null);
      const remaining = statements.filter((s) => !(s.playerId in updatedVotes));
      if (remaining.length === 0) {
        setPhase('done');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur de vote');
    } finally {
      setLoading(false);
    }
  };

  if (phase === 'waiting') {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center animate-in zoom-in duration-500">
        <div className="w-20 h-20 bg-neon-purple/20 text-neon-purple rounded-full flex items-center justify-center text-4xl mb-4 shadow-[0_0_30px_rgba(139,92,246,0.3)]">
          🎭
        </div>
        <h2 className="text-2xl font-bold">Vos secrets sont cryptés.</h2>
        <p className="text-slate-400 mt-2">Attendez le signal du Captain pour détecter les mensonges.</p>
      </div>
    );
  }

  if (phase === 'detecting') {
    if (loading && statements.length === 0) {
      return <div className="text-slate-400 animate-pulse text-center p-6">Chargement des suspects...</div>;
    }

    if (error) {
      return <div className="text-rose-400 text-center p-6">{error}</div>;
    }

    if (statements.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <div className="text-4xl mb-4">🎭</div>
          <h2 className="text-xl font-bold">Aucun suspect disponible</h2>
          <p className="text-slate-400 mt-2">Attendez que tout le monde ait soumis ses phrases.</p>
        </div>
      );
    }

    if (selectedTarget) {
      const target = statements.find((s) => s.playerId === selectedTarget);
      if (!target) return null;
      return (
        <div className="flex flex-col gap-6 w-full max-w-sm px-4 pb-8 animate-in fade-in">
          <div className="text-center">
            <span className="text-neon-pink font-mono text-xs uppercase tracking-widest font-bold">Détective</span>
            <h3 className="text-xl font-medium mt-2">
              Quelle phrase de <span className="text-neon-purple font-bold">{target.name}</span> est un mensonge ?
            </h3>
          </div>
          <div className="flex flex-col gap-3">
            {target.statements.map((text, i) => (
              <button
                key={i}
                disabled={loading}
                onClick={() => handleVote(target.playerId, i)}
                className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-left active:scale-95 transition-all hover:bg-white/10 disabled:opacity-50"
              >
                <span className="text-neon-purple font-black mr-3">{i + 1}</span>
                <span className="text-slate-200">{text}</span>
              </button>
            ))}
          </div>
          <button onClick={() => setSelectedTarget(null)} className="text-xs text-slate-500 hover:text-slate-300 underline">
            Choisir un autre suspect
          </button>
        </div>
      );
    }

    const remainingTargets = statements.filter((s) => !(s.playerId in votedMap));

    return (
      <div className="flex flex-col gap-6 w-full max-w-sm px-4 pb-8 animate-in fade-in">
        <div className="text-center">
          <span className="text-neon-pink font-mono text-xs uppercase tracking-widest font-bold">Détective</span>
          <h3 className="text-xl font-medium mt-2">Choisissez un suspect</h3>
          <p className="text-xs text-slate-500 mt-2">Trouvez le mensonge de chaque joueur.</p>
        </div>
        <div className="grid grid-cols-1 gap-3">
          {statements.map((s) => {
            const voted = s.playerId in votedMap;
            return (
              <button
                key={s.playerId}
                disabled={voted || loading}
                onClick={() => setSelectedTarget(s.playerId)}
                className={`w-full p-4 rounded-2xl flex items-center justify-between active:scale-95 transition-all ${
                  voted
                    ? 'bg-emerald-950/20 border border-emerald-500/30 text-emerald-400'
                    : 'bg-white/5 border border-white/10 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-300">
                    {s.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-lg font-bold text-slate-200">{s.name}</span>
                </div>
                <span className="text-sm">{voted ? '✓' : '>'}</span>
              </button>
            );
          })}
        </div>
        {remainingTargets.length === 0 && (
          <button onClick={() => setPhase('done')} className="cb-btn-primary">
            Terminer la détection
          </button>
        )}
      </div>
    );
  }

  if (phase === 'done') {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center animate-in zoom-in duration-500">
        <div className="w-20 h-20 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center text-4xl mb-4 shadow-[0_0_30px_rgba(34,197,94,0.3)]">
          🕵️
        </div>
        <h2 className="text-2xl font-bold">Votre enquête est terminée.</h2>
        <p className="text-slate-400 mt-2">Regardez la TV pour découvrir qui bluffe le mieux.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-sm px-4 pb-8">
      <div className="text-center mb-2">
        <span className="text-neon-pink font-mono text-xs uppercase tracking-widest font-bold">L&apos;Art du Bluff</span>
        <h3 className="text-xl font-medium mt-2 leading-snug">Écrivez 2 vérités et 1 mensonge sur vous.</h3>
        <p className="text-slate-400 text-xs mt-1">(Ils seront mélangés avant de passer à la TV)</p>
      </div>

      <div className="flex flex-col gap-4">
        <div>
          <label className="block text-xs font-bold text-emerald-400 uppercase tracking-widest mb-1 ml-2">Vérité 1</label>
          <input
            type="text"
            maxLength={60}
            value={truth1}
            onChange={(e) => setTruth1(e.target.value)}
            placeholder="J'ai déjà..."
            className="w-full bg-emerald-950/20 border border-emerald-500/30 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-emerald-400 uppercase tracking-widest mb-1 ml-2">Vérité 2</label>
          <input
            type="text"
            maxLength={60}
            value={truth2}
            onChange={(e) => setTruth2(e.target.value)}
            placeholder="Je sais..."
            className="w-full bg-emerald-950/20 border border-emerald-500/30 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-rose-400 uppercase tracking-widest mb-1 ml-2">Mensonge absolu</label>
          <input
            type="text"
            maxLength={60}
            value={lie}
            onChange={(e) => setLie(e.target.value)}
            placeholder="Une fois j'ai..."
            className="w-full bg-rose-950/20 border border-rose-500/30 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-rose-500"
          />
        </div>

        <div className="flex gap-2 mt-4">
          <button onClick={handleNoIdea} className="cb-btn-secondary flex-1 border-dashed border-white/20 text-xs">
            🧠 Pas d&apos;idées ?
          </button>
          <button onClick={handleValidate} className="cb-btn-primary flex-[2]">
            C&apos;est parti
          </button>
        </div>
      </div>
    </div>
  );
}
