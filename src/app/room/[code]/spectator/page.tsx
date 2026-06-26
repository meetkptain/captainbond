'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { BackgroundOrbs } from '@/components/BackgroundOrbs';
import { CustomDeck } from '@/lib/custom-decks/types';
import { getLocalDecks } from '@/lib/custom-decks/storage';

interface Player {
  id: string;
  name: string;
}

export default function SpectatorCompanion() {
  const params = useParams();
  const router = useRouter();
  const roomCode = (params.code as string).toUpperCase();

  // Room state synchronized via WebSockets Broadcast
  const [currentQuestionText, setCurrentQuestionText] = useState<string>('');
  const [currentPlayerName, setCurrentPlayerName] = useState<string>('');
  const [phase, setPhase] = useState<string>('waiting');
  const [players, setPlayers] = useState<Player[]>([]);
  const [modeId, setModeId] = useState<string>('');

  const [connected, setConnected] = useState(false);
  const [jokerUsed, setJokerUsed] = useState(false);
  const [prevQuestionText, setPrevQuestionText] = useState<string>('');
  const [suspectVote, setSuspectVote] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showDeckDrawer, setShowDeckDrawer] = useState(false);
  const [localDecks] = useState<CustomDeck[]>(() => {
    if (typeof window === 'undefined') return [];
    return getLocalDecks().filter(d => d.isPurchased);
  });

  if (currentQuestionText !== prevQuestionText) {
    setPrevQuestionText(currentQuestionText);
    setJokerUsed(false);
  }

  // Setup broadcast channel
  const channel = useMemo(() => {
    return supabase.channel(`room-events-${roomCode}`);
  }, [roomCode]);

  useEffect(() => {
    // 1. Subscribe to events channel
    channel
      .on('broadcast', { event: 'ROOM_STATE_UPDATE' }, ({ payload }) => {
        setConnected(true);
        if (payload.currentQuestionText !== undefined) setCurrentQuestionText(payload.currentQuestionText);
        if (payload.currentPlayerName !== undefined) setCurrentPlayerName(payload.currentPlayerName);
        if (payload.phase !== undefined) setPhase(payload.phase);
        if (payload.players !== undefined) setPlayers(payload.players);
        if (payload.modeId !== undefined) setModeId(payload.modeId);
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setConnected(true);
          // Request current room state from host immediately
          channel.send({
            type: 'broadcast',
            event: 'REQUEST_ROOM_STATE',
            payload: {}
          });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [channel]);

  const triggerSound = (soundType: string) => {
    channel.send({
      type: 'broadcast',
      event: 'TRIGGER_SOUND',
      payload: { soundType }
    });
    showToast(`Bruitage "${soundType}" envoyé ! 🔊`);
  };

  const triggerEmoji = (emoji: string) => {
    channel.send({
      type: 'broadcast',
      event: 'TRIGGER_EMOJI',
      payload: { emoji }
    });
    showToast(`Réaction ${emoji} envoyée ! 🎈`);
  };

  const triggerJokerSolidaire = () => {
    if (jokerUsed) return;
    channel.send({
      type: 'broadcast',
      event: 'TRIGGER_JOKER_SOLIDAIRE',
      payload: { targetPlayerName: currentPlayerName }
    });
    setJokerUsed(true);
    showToast('Sauvetage par Joker Solidaire envoyé ! 🕊️');
  };

  const handleSpectatorVote = (suspectId: string) => {
    setSuspectVote(suspectId);
    channel.send({
      type: 'broadcast',
      event: 'SUBMIT_SPECTATOR_VOTE',
      payload: { suspectPlayerId: suspectId }
    });
    showToast('Votre vote de détective a été transmis ! 🕵️');
  };

  const injectDeck = (deck: CustomDeck) => {
    channel.send({
      type: 'broadcast',
      event: 'INJECT_CUSTOM_DECK',
      payload: {
        questions: deck.questions,
        senderName: 'Un spectateur'
      }
    });
    setShowDeckDrawer(false);
    showToast(`Deck "${deck.title}" injecté ! 🌴`);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between p-6 relative overflow-hidden bg-slate-950 text-white">
      <BackgroundOrbs />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 max-w-sm w-11/12 bg-amber-500/95 backdrop-blur-md text-slate-950 font-bold px-4 py-3 rounded-2xl shadow-xl border border-amber-400 text-center text-sm font-medium animate-[fadeIn_0.2s_use-out]">
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <header className="flex justify-between items-center w-full max-w-md mx-auto z-10">
        <div className="flex flex-col">
          <span className="text-sm font-black text-amber-400 tracking-wider">CAPTAIN BOND</span>
          <span className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">Spectateur · Room {roomCode}</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/60 border border-slate-800 text-[10px] font-mono text-slate-400">
          <span className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
          {connected ? 'Synchro en direct' : 'Connexion...'}
        </div>
      </header>

      {/* Main Panel */}
      <main className="w-full max-w-md mx-auto flex-1 flex flex-col justify-center gap-6 my-6 z-10">
        
        {/* Active Question Display */}
        <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-3xl p-5 text-center space-y-3 relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[repeating-linear-gradient(45deg,#3b82f6,#3b82f6_10px,#000_10px,#000_20px)]"></div>
          
          {phase === 'waiting' ? (
            <div className="py-8 space-y-2">
              <span className="text-4xl animate-pulse block">💤</span>
              <h3 className="text-base font-bold text-slate-300">En attente du lancement</h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                Le Captain s&apos;apprête à poser la première question. Restez branché !
              </p>
            </div>
          ) : phase === 'imposteur_voting' ? (
            <div className="py-4 space-y-3">
              <span className="text-4xl animate-bounce block">🕵️</span>
              <h3 className="text-lg font-black text-blue-400 uppercase tracking-wide">Tribunal en cours</h3>
              <p className="text-xs text-slate-400 leading-relaxed px-4">
                Pointez physiquement votre suspect au gong, ou votez ci-dessous :
              </p>
            </div>
          ) : phase === 'imposteur_reveal' ? (
            <div className="py-4 space-y-3">
              <span className="text-4xl block">🎭</span>
              <h3 className="text-lg font-black text-rose-400 uppercase tracking-wide">Révélation !</h3>
              <p className="text-xs text-slate-400 leading-relaxed px-4">
                L&apos;Hôte dévoile l&apos;identité de l&apos;Imposteur sur son écran principal.
              </p>
            </div>
          ) : phase === 'discussion' ? (
            <div className="py-6 space-y-2">
              <span className="text-4xl block animate-pulse">💬</span>
              <h3 className="text-base font-bold text-slate-300">Temps de discussion</h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                Débattez librement et apprenez-en plus sur les anecdotes révélées !
              </p>
            </div>
          ) : (
            <div className="space-y-3 animate-[fadeIn_0.2s_ease-out]">
              <div className="flex flex-col items-center gap-1">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest font-mono">Lecture en direct</span>
                <span className="text-sm font-extrabold text-slate-300 uppercase tracking-tight">
                  Tour de : {currentPlayerName || 'Quelqu&apos;un'}
                </span>
              </div>
              <div className="h-px bg-slate-800 w-20 mx-auto"></div>
              <p className="text-base font-semibold italic text-slate-200 leading-relaxed px-2">
                &ldquo;{currentQuestionText || 'Chargement de la question...'}&rdquo;
              </p>
            </div>
          )}
        </div>

        {phase === 'question' && (
          <>
            {/* Interactive Soundboard */}
            <div className="space-y-2">
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block px-1">Soundboard Réactionnel (Sons)</span>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { type: 'applaudissements', label: '👏 Bravo !', color: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20' },
                  { type: 'rires', label: '😂 Rires', color: 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20' },
                  { type: 'buzzer', label: '🚨 Menteur !', color: 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20' },
                  { type: 'violon', label: '🎻 Drame/Sad', color: 'bg-purple-500/10 border-purple-500/30 text-purple-400 hover:bg-purple-500/20' },
                ].map(sound => (
                  <button
                    key={sound.type}
                    onClick={() => triggerSound(sound.type)}
                    className={`py-3.5 border rounded-2xl font-bold text-sm transition-all active:scale-95 cursor-pointer shadow-sm ${sound.color}`}
                  >
                    {sound.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Floating Emojis */}
            <div className="space-y-2">
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block px-1">Réactions Emojis</span>
              <div className="flex justify-between gap-2 bg-slate-900/40 border border-slate-800/80 p-3.5 rounded-2xl">
                {['🌶️', '😂', '🤫', '🎭', '💚'].map(emoji => (
                  <button
                    key={emoji}
                    onClick={() => triggerEmoji(emoji)}
                    className="w-12 h-12 flex items-center justify-center text-2xl hover:bg-white/5 active:scale-90 rounded-xl transition-all cursor-pointer"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Safe Skip / Joker Solidaire */}
            <button
              onClick={triggerJokerSolidaire}
              disabled={jokerUsed}
              className={`w-full py-4 rounded-2xl font-black text-sm transition-all active:scale-[0.98] cursor-pointer shadow-md flex items-center justify-center gap-2 ${
                jokerUsed
                  ? 'bg-slate-900/60 border border-slate-850 text-slate-600 cursor-not-allowed'
                  : 'bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              <span>🕊️</span>
              <span>{jokerUsed ? 'SAUVETAGE ENVOYÉ' : `JOKER SOLIDAIRE (Sauver ${currentPlayerName})`}</span>
            </button>

            {/* Custom Deck Injection */}
            {localDecks.length > 0 && (
              <>
                <button
                  onClick={() => setShowDeckDrawer(!showDeckDrawer)}
                  className="w-full py-3 rounded-2xl font-bold text-sm transition-all active:scale-[0.98] cursor-pointer bg-violet-500/10 border border-violet-500/30 text-violet-400 hover:bg-violet-500/20 flex items-center justify-center gap-2"
                >
                  <span>📦</span>
                  <span>Injecter un de mes Decks Privés</span>
                </button>
                {showDeckDrawer && (
                  <div className="space-y-2 bg-slate-900/60 border border-slate-800 rounded-2xl p-3 animate-[fadeIn_0.2s_ease-out] max-h-[200px] overflow-y-auto">
                    {localDecks.map(deck => (
                      <button
                        key={deck.id}
                        onClick={() => injectDeck(deck)}
                        className="w-full py-3 px-4 border border-slate-700 rounded-xl text-left hover:bg-slate-850 transition-all cursor-pointer block"
                      >
                        <span className="text-sm font-bold text-slate-200 block">{deck.title}</span>
                        <span className="text-xs text-slate-500 block">{deck.questions.length} cartes · {deck.friends.length} amis</span>
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* Imposteur Voting Screen */}
        {phase === 'imposteur_voting' && modeId === 'IMPOSTEUR' && (
          <div className="space-y-2.5 bg-slate-900/40 border border-slate-800 p-4 rounded-3xl animate-[fadeIn_0.2s_ease-out]">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block text-center mb-1">Qui suspectez-vous ?</span>
            <div className="space-y-2">
              {players.map(p => (
                <button
                  key={p.id}
                  onClick={() => handleSpectatorVote(p.id)}
                  disabled={suspectVote !== null}
                  className={`w-full py-3.5 px-4 border rounded-2xl font-semibold text-sm transition-all flex justify-between items-center cursor-pointer ${
                    suspectVote === p.id
                      ? 'bg-blue-500/20 border-blue-500 text-blue-300'
                      : suspectVote !== null
                      ? 'bg-slate-900/20 border-slate-850 text-slate-600 cursor-not-allowed'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-slate-100'
                  }`}
                >
                  <span>{p.name}</span>
                  {suspectVote === p.id && <span className="text-xs font-bold uppercase font-mono bg-blue-500/10 px-2 py-0.5 rounded-md">Suspect désigné</span>}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* End Game / Redirection CTA */}
        {phase === 'ended' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center space-y-4 shadow-xl animate-[fadeIn_0.25s_ease-out]">
            <span className="text-5xl block animate-bounce">🏆</span>
            <div className="space-y-1">
              <h3 className="text-lg font-black text-amber-400 uppercase tracking-wide">Mission Terminée !</h3>
              <p className="text-xs text-slate-400 leading-relaxed px-4">
                Vous avez bruité et animé le salon. Envie de découvrir vos propres traits psychologiques cachés et vos badges de soirée ?
              </p>
            </div>
            <button
              onClick={() => router.push(`/room/${roomCode}/player?paid=profile`)}
              className="w-full py-4 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-black text-base rounded-2xl transition-all cursor-pointer shadow-lg shadow-amber-500/15 flex items-center justify-center gap-2"
            >
              🚀 Débloquer mon Profiling Personnel
            </button>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="w-full text-center py-4 z-10">
        <button
          onClick={() => router.push('/')}
          className="text-xs text-slate-500 hover:text-slate-400 font-semibold cursor-pointer hover:underline"
        >
          Retour à l&apos;accueil
        </button>
      </footer>
    </div>
  );
}
