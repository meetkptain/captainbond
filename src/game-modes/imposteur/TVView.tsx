'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { safeJsonParse, safeJsonParseRecord } from '@/lib/json';
import type { GameModeTVViewProps } from '../types';
import { getDiscussionPrompt } from '../prompts';

interface ImposteurStatement {
  text: string;
  isLie: boolean;
}

type DetectionsMap = Record<string, Record<string, number>>;

export function ImposteurTVView({ question, responses, gameState, roundConfig }: GameModeTVViewProps) {
  const params = useParams();
  const roomCode = (params.code as string).toUpperCase();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [showLie, setShowLie] = useState(false);

  const detections = useMemo<DetectionsMap>(() => {
    const rawConfig = typeof roundConfig === 'string' ? roundConfig : JSON.stringify(roundConfig ?? {});
    const config = safeJsonParseRecord(rawConfig) || {};
    return (config.detections as DetectionsMap) || {};
  }, [roundConfig]);

  useEffect(() => {
    if (gameState !== 'REVEALING') return;

    const eventsChannel = supabase.channel(`room-events-${roomCode}`);

    eventsChannel.on('broadcast', { event: 'IMPOSTEUR_REVEAL' }, () => {
      setShowLie(true);
    });

    eventsChannel.on('broadcast', { event: 'IMPOSTEUR_NEXT' }, () => {
      setShowLie(false);
      setCurrentIndex((prev) => prev + 1);
    });

    eventsChannel.subscribe();

    return () => {
      eventsChannel.unsubscribe();
    };
  }, [gameState, roomCode]);

  if (gameState === 'VOTING') {
    const readyCount = responses.filter((r) => r.answer && r.answer !== '__SKIP__').length;
    const isDetecting = detections && Object.keys(detections).length > 0;
    return (
      <div className="flex flex-col items-center w-full max-w-4xl text-center">
        <span className="text-neon-pink font-mono tracking-widest font-bold uppercase mb-4">Mode Imposteur</span>
        <h2 className="text-4xl md:text-6xl font-black leading-tight text-white mb-12">
          {question?.text || "Préparez 2 vérités et 1 mensonge."}
        </h2>

        <div className="flex items-center gap-6 mt-8">
          <div className="glass-panel px-8 py-4 text-2xl font-bold flex items-center gap-4">
            <span>{isDetecting ? '🔍' : '📥'}</span>
            <span>
              {isDetecting
                ? `${Object.values(detections).reduce((acc, d) => acc + Object.keys(d).length, 0)} votes reçus`
                : `${readyCount} Joueurs prêts`}
            </span>
          </div>
        </div>
        <p className="text-slate-400 mt-6 italic">
          {isDetecting
            ? 'Les détectives votent pour la phrase fausse de chaque suspect.'
            : 'Remplissez les champs sur votre téléphone.'}
        </p>
      </div>
    );
  }

  const validResponses = responses.filter((r) => r.answer && r.answer !== '__SKIP__');

  if (validResponses.length === 0) {
    return <div className="text-2xl italic text-slate-500">Aucun mensonge détecté.</div>;
  }

  if (currentIndex >= validResponses.length) {
    return (
      <div className="text-center animate-in zoom-in duration-500">
        <div className="text-6xl mb-6">🎭</div>
        <h2 className="text-4xl font-bold text-white">Tout le monde a été démasqué !</h2>
        <p className="text-slate-400 mt-4">Le Captain peut passer à la carte suivante.</p>
      </div>
    );
  }

  const currentPlayer = validResponses[currentIndex];
  const statements = safeJsonParse<ImposteurStatement[]>(currentPlayer.answer as string, []);
  const lieIndex = statements.findIndex((s) => s.isLie);

  const playerDetections = detections[currentPlayer.playerId] || {};
  const detectorNameMap = new Map(responses.map((r) => [r.playerId, r.name]));
  const correctDetectors = Object.entries(playerDetections)
    .filter(([detectorId, idx]) => detectorId !== currentPlayer.playerId && idx === lieIndex)
    .map(([detectorId]) => detectorNameMap.get(detectorId) || 'Inconnu');

  if (gameState === 'DISCUSSION') {
    const prompt = getDiscussionPrompt('IMPOSTEUR', {
      winnerName: currentPlayer.name,
      questionText: question?.text as string,
    });
    return (
      <div className="flex flex-col items-center w-full max-w-4xl text-center animate-in zoom-in duration-500">
        <span className="text-rose-400 font-mono tracking-widest font-bold uppercase mb-4">Interrogatoire</span>
        <h2 className="text-4xl md:text-6xl font-black leading-tight text-white mb-6">
          {prompt.title}
        </h2>
        <p className="text-xl text-slate-300 mb-2">{prompt.subtitle}</p>
        <p className="text-lg text-neon-pink font-medium mt-4">{prompt.action}</p>
        <div className="mt-8 text-6xl">🎤</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full max-w-5xl animate-in fade-in duration-500">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-slate-400">À qui le tour ?</h2>
        <h3 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-neon-purple to-neon-pink mt-2">
          {currentPlayer.name}
        </h3>
        <p className="text-slate-500 italic mt-2">Débattez. Laquelle de ces phrases est fausse ?</p>
      </div>

      <div className="flex flex-col gap-6 w-full max-w-3xl">
        {statements.map((stmt: ImposteurStatement, i) => {
          const isTheLie = stmt.isLie;
          const bgClass = showLie
            ? isTheLie
              ? 'bg-rose-900/40 border-rose-500 shadow-[0_0_30px_rgba(225,29,72,0.5)]'
              : 'bg-slate-900/50 border-white/5 opacity-30'
            : 'bg-white/5 border-white/10 hover:border-neon-purple/50';

          return (
            <div key={i} className={`p-6 rounded-2xl border-2 transition-all duration-700 flex items-center gap-6 ${bgClass}`}>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl font-black ${showLie && isTheLie ? 'bg-rose-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                {showLie && isTheLie ? '❌' : i + 1}
              </div>
              <span className={`text-2xl font-bold ${showLie && isTheLie ? 'text-rose-100' : 'text-slate-200'}`}>
                &quot;{stmt.text}&quot;
              </span>
              {showLie && isTheLie && (
                <div className="ml-auto text-rose-500 font-mono font-bold uppercase tracking-widest text-sm animate-pulse">
                  Mensonge
                </div>
              )}
            </div>
          );
        })}
      </div>

      {showLie && (
        <div className="mt-8 w-full max-w-3xl text-center animate-in fade-in">
          {correctDetectors.length > 0 ? (
            <div className="p-4 rounded-2xl bg-emerald-900/20 border border-emerald-500/30 text-emerald-100">
              <span className="text-2xl mr-2">🕵️</span>
              <span className="font-bold">
                {correctDetectors.join(', ')} {correctDetectors.length === 1 ? 'a trouvé' : 'ont trouvé'}
              </span>
              <span className="text-emerald-300 ml-2">(+1 chacun)</span>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-rose-900/20 border border-rose-500/30 text-rose-100">
              <span className="text-2xl mr-2">🎭</span>
              <span className="font-bold">Personne n&apos;a trouvé.</span>
              <span className="text-rose-300 ml-2">+2 pour {currentPlayer.name} !</span>
            </div>
          )}
        </div>
      )}

      {!showLie && (
        <div className="mt-12 text-slate-500 animate-pulse flex items-center gap-2">
          <span className="w-2 h-2 bg-neon-purple rounded-full"></span>
          En attente de la décision du Captain...
        </div>
      )}
    </div>
  );
}
