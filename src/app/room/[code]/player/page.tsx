'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { gameModesRegistry } from '@/game-modes';
import { supabase } from '@/lib/supabase';
import { BackgroundOrbs } from '@/components/BackgroundOrbs';
import { ClassifiedDossierPlayer } from '@/components/endgame/ClassifiedDossierPlayer';

import { AuthModal } from '@/components/AuthModal';
import { Icon } from '@/components/Icon';
import { OnboardingModal } from '@/components/OnboardingModal';
import { SafeWordModal } from '@/components/SafeWordModal';
import { UnlockPanel } from '@/components/UnlockPanel';
import { WaitingRoom } from '@/components/WaitingRoom';
import { BadgeTray } from '@/components/BadgeTray';
import type { Pack } from '@/lib/monetization/catalog';
import { onAuthStateChange, getCurrentUser } from '@/lib/supabase-auth';
import { safeJsonParse } from '@/lib/json';
import { logger } from '@/lib/logger';
import type { Room, Response as GameResponse, Player, Question } from '@/lib/db/types';
import { api, ApiClientError } from '@/lib/api/client';
import { capture, AnalyticsEvents } from '@/lib/analytics';
import { useHostSession } from '@/hooks/useHostSession';

export default function PlayerController() {
  const params = useParams();
  const router = useRouter();
  const roomCode = (params.code as string).toUpperCase();
  const { hostId: storedHostId, hostToken: storedHostToken } = useHostSession(roomCode);

  const [roomId, setRoomId] = useState<string | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [playerName, setPlayerName] = useState<string>('');
  const [targetType, setTargetType] = useState('GROUP');

  const [status, setStatus] = useState<'WAITING' | 'PLAYING' | 'REVEALING' | 'DISCUSSION' | 'ENDED'>('WAITING');
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [activeMode, setActiveMode] = useState('ICEBREAKER');
  
  const [myAnswer, setMyAnswer] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [voteError, setVoteError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paidMessage, setPaidMessage] = useState<string | null>(null);
  const [hasConsented, setHasConsented] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return sessionStorage.getItem(`cb_consent_${roomCode}`) === 'true';
  });
  const [entitlements, setEntitlements] = useState<{ accessibleFeatures?: string[]; hasActivePass?: boolean } | null>(null);
  const [authUser, setAuthUser] = useState<{ id: string; email?: string } | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [freeQuestions, setFreeQuestions] = useState<{ used: number; limit: number } | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showSafeWord, setShowSafeWord] = useState(false);
  const [showBadges, setShowBadges] = useState(false);
  const [availablePacks, setAvailablePacks] = useState<Pack[]>([]);
  const [showUnlockPanel, setShowUnlockPanel] = useState(false);
  const [stats, setStats] = useState<{ currentStreak: number; gamesPlayedToday: number; badges: string[]; archetypes: string[] } | null>(null);

  useEffect(() => {
    // Écouter l'état d'authentification Supabase
    const subscription = onAuthStateChange((user) => {
      setAuthUser(user);
      if (user && typeof window !== 'undefined') {
        window.__CAPTAIN_BOND_USER_ID__ = user.id;
      }
    });

    getCurrentUser().then((user) => {
      if (user) {
        setAuthUser(user);
        if (typeof window !== 'undefined') {
          window.__CAPTAIN_BOND_USER_ID__ = user.id;
        }
      }
    });

    return () => {
      subscription.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    async function init() {
      try {
        const storedPlayerRaw = sessionStorage.getItem(`player_${roomCode}`);

        const data = await api.get<{
          room: Room & { currentQuestion?: Question | null };
          players?: Player[];
          responses?: Partial<GameResponse & { answer?: string }>[];
        }>(`/api/room/state?roomCode=${roomCode}`);
        if (!data.room) {
          router.push('/');
          return;
        }

        const room = data.room;
        const roomPlayers = (data.players || []) as Player[];
        const responses = data.responses || [];
        setPlayers(roomPlayers.filter((p) => !p.isHost));

        setRoomId(room.id);
        setStatus(room.status);
        setActiveMode(room.currentMode || 'ICEBREAKER');
        setCurrentQuestion(room.currentQuestion ?? null);

        const roomType = room.targetType || 'GROUP';
        setTargetType(roomType);

        const isUserHost = storedHostId === room.hostId;
        setIsHost(isUserHost);

        let effectivePlayerId: string | null = null;

        if (roomType === 'SOLO') {
          effectivePlayerId = room.hostId;
          setPlayerId(room.hostId);
          const nameFromSoloStorage = sessionStorage.getItem(`solo_name_${roomCode}`);
          let name = 'Agent Solo';
          if (nameFromSoloStorage) {
            name = nameFromSoloStorage;
          } else if (storedPlayerRaw) {
            name = safeJsonParse<{ name?: string }>(storedPlayerRaw, {}).name || name;
          }
          setPlayerName(name);

          if (room.currentQuestion) {
            const myResp = responses.find(
              (r) => r.playerId === room.hostId && r.questionId === room.currentQuestion?.id
            );
            if (myResp) {
              setHasVoted(true);
              setMyAnswer(myResp.answer ?? null);
            }
          }
        } else if (isUserHost) {
          effectivePlayerId = 'host';
          setPlayerId('host');
          setPlayerName('Hôte');
        } else if (storedPlayerRaw) {
          const parsedPlayer = safeJsonParse<{ id?: string }>(storedPlayerRaw, {});
          const parsedPlayerId = parsedPlayer.id || storedPlayerRaw;

          const pData = roomPlayers.find((p) => p.id === parsedPlayerId);
          if (pData) {
            effectivePlayerId = pData.id;
            setPlayerId(pData.id);
            setPlayerName(pData.name);

            if (room.currentQuestion) {
              const myResp = responses.find(
                (r) => r.playerId === pData.id && r.questionId === room.currentQuestion?.id
              );
              if (myResp) {
                setHasVoted(true);
                setMyAnswer(myResp.answer ?? null);
              }
            }
          } else {
            sessionStorage.removeItem(`player_${roomCode}`);
            router.push(`/join/${roomCode}`);
            return;
          }
        } else {
          router.push(`/join/${roomCode}`);
          return;
        }

        // Charger les entitlements
        if (effectivePlayerId && effectivePlayerId !== 'host') {
          api.get<{ accessibleFeatures?: string[]; hasActivePass?: boolean }>(`/api/me/entitlements?playerId=${effectivePlayerId}&roomCode=${roomCode}`)
            .then(setEntitlements)
            .catch(console.error);
        }

        // Charger le catalogue pour le paywall
        api.get<Pack[]>('/api/packs')
          .then(setAvailablePacks)
          .catch(console.error);

        // Charger les stats Daily Bond + badges
        if (effectivePlayerId && effectivePlayerId !== 'host') {
          api.get<{ currentStreak?: number; gamesPlayedToday?: number; badges?: string[]; archetypesUnlocked?: string[] }>(`/api/me/stats?playerId=${effectivePlayerId}&roomCode=${roomCode}`)
            .then((data) => setStats({
              currentStreak: data.currentStreak ?? 0,
              gamesPlayedToday: data.gamesPlayedToday ?? 0,
              badges: data.badges ?? [],
              archetypes: data.archetypesUnlocked ?? [],
            }))
            .catch(console.error);
        }

        // Afficher l'onboarding joueur une seule fois (sauf hôte)
        if (!isUserHost && !sessionStorage.getItem(`cb_player_onboarding_${roomCode}`)) {
          setShowOnboarding(true);
        }

        setLoading(false);
      } catch (err) {
        setError(err instanceof ApiClientError ? err.message : 'Erreur d\'initialisation');
        setLoading(false);
      }
    }
    init();
  }, [roomCode, router, storedHostId]);

  useEffect(() => {
    if (!roomId) return;
    
    const roomChannel = supabase.channel(`room-player-${roomCode}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'Room', filter: `id=eq.${roomId}` }, (payload) => {
        const roomUpdate = payload.new as Partial<Room>;
        setStatus(roomUpdate.status || 'WAITING');
        setActiveMode(roomUpdate.currentMode || 'ICEBREAKER');
        
        if (roomUpdate.status === 'PLAYING') {
           setHasVoted(false);
           setMyAnswer(null);
        }
        
        if (roomUpdate.currentQuestionId) {
          api.get<{ question?: Question }>(`/api/questions/get?id=${roomUpdate.currentQuestionId}`)
            .then(({ question }) => setCurrentQuestion(question ?? null))
            .catch(console.error);
        } else {
          setCurrentQuestion(null);
        }
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'Player', filter: `roomId=eq.${roomId}` }, (payload) => {
        const newPlayer = payload.new as Player;
        setPlayers((prev) => (prev.some((p) => p.id === newPlayer.id) ? prev : [...prev, newPlayer]));
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'Player', filter: `roomId=eq.${roomId}` }, (payload) => {
        const updated = payload.new as Player;
        setPlayers((prev) => prev.map((p) => (p.id === updated.id ? { ...p, ...updated } : p)));
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'Player', filter: `roomId=eq.${roomId}` }, (payload) => {
        const removed = payload.old as Player;
        setPlayers((prev) => prev.filter((p) => p.id !== removed.id));
      });

    roomChannel.subscribe(async (subStatus) => {
      if (subStatus === 'SUBSCRIBED' && playerId && !isHost) {
        await roomChannel.track({ id: playerId, name: playerName });
      }
    });

    return () => {
      supabase.removeChannel(roomChannel);
    };
  }, [roomId, roomCode, playerId, isHost, playerName]);

  const handleVote = async (answer: string) => {
    if (!playerId || (isHost && targetType !== 'SOLO')) return;
    try {
      setVoteError(null);
      setHasVoted(true);
      setMyAnswer(answer);
      await api.post('/api/room/vote', { roomCode, playerId, answer, questionId: currentQuestion?.id });
      capture(AnalyticsEvents.QUESTION_ANSWERED, {
        room_code: roomCode,
        question_id: currentQuestion?.id,
        mode_id: activeMode,
      });
    } catch {
      setVoteError('Impossible d\'enregistrer le vote. Réessaie.');
      setHasVoted(false);
      setMyAnswer(null);
    }
  };

  const handleStartRound = async () => {
    if (!isHost || !storedHostId || !storedHostToken) return;
    const data = await api.post<{
      freeQuestionsLimit?: number;
      freeQuestionsUsed?: number;
    }>('/api/room/next-round', { roomCode, hostId: storedHostId, hostToken: storedHostToken });
    if (data.freeQuestionsLimit) {
      setFreeQuestions({ used: data.freeQuestionsUsed ?? 0, limit: data.freeQuestionsLimit });
    }
  };

  const handleReveal = async () => {
    if (!isHost || !storedHostId || !storedHostToken) return;
    await api.post('/api/room/reveal', { roomCode, hostId: storedHostId, hostToken: storedHostToken });
  };

  const handleEndGame = async () => {
    try {
      await api.post('/api/room/end', { roomCode });
    } catch(e) { console.error(e) }
  };

  // Gérer le retour de Stripe après paiement
  useEffect(() => {
    if (typeof window === 'undefined' || !playerId) return;
    const params = new URLSearchParams(window.location.search);
    const paid = params.get('paid');
    if (paid === 'pass' || paid === 'profile') {
      capture(AnalyticsEvents.PURCHASE_COMPLETED, {
        room_code: roomCode,
        product_type: paid,
      });
      // Re-vérifier les entitlements serveur
      api.get<{ accessibleFeatures?: string[]; hasActivePass?: boolean }>(`/api/me/entitlements?playerId=${playerId}&roomCode=${roomCode}`)
        .then(data => {
          setEntitlements(data);
          if (paid === 'pass') {
            setPaidMessage('🎉 Pass 24h activé ! Tous les modes sont débloqués.');
          } else {
            setPaidMessage('🎉 Dossier débloqué ! Retournez à la fin de partie pour le voir.');
          }
          window.history.replaceState({}, '', `/room/${roomCode}/player`);
          setTimeout(() => setPaidMessage(null), 5000);
        })
        .catch(console.error);
    }
  }, [roomCode, playerId]);

  // Vérifier le consentement RGPD
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const consent = sessionStorage.getItem(`cb_consent_${roomCode}`);
    if (consent === null) {
      // Le nouveau flow de join exige le consentement avant la redirection.
      router.push(`/join/${roomCode}`);
    }
  }, [roomCode, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="w-8 h-8 border-2 border-white/10 border-t-neon-pink rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white p-4">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  const ActiveGameMode = gameModesRegistry[activeMode] || gameModesRegistry['ICEBREAKER'];

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-white relative">
      <BackgroundOrbs />
      
      <div className="p-4 border-b border-white/5 flex justify-between items-center z-10 bg-slate-950/50 backdrop-blur-md">
        <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-neon-purple to-neon-pink">CB.</span>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowSafeWord(true)}
            className="text-xs font-mono text-amber-400 hover:text-white transition-colors"
            aria-label="Safe word / Passer"
          >
            🛑
          </button>
          <button
            onClick={() => setShowUnlockPanel(true)}
            className="text-xs font-mono text-neon-pink hover:text-white transition-colors underline decoration-neon-pink/30"
          >
            {entitlements?.hasActivePass ? '✓ Pass actif' : '🔓 Débloquer'}
          </button>
          {!authUser && (
            <button
              onClick={() => setShowAuthModal(true)}
              className="text-xs font-mono text-slate-400 hover:text-white transition-colors"
            >
              Sauvegarder
            </button>
          )}
          {freeQuestions && freeQuestions.limit > 0 && !gameModesRegistry[activeMode]?.manifest.isPremium && (
            <span className="text-xs font-mono text-amber-400">
              🎴 {freeQuestions.used}/{freeQuestions.limit} gratuit
            </span>
          )}
          {stats && stats.currentStreak > 0 && (
            <span className="text-xs font-mono text-amber-400" title="Daily Bond">
              🔥 {stats.currentStreak}
            </span>
          )}
          {stats && stats.badges.length > 0 && (
            <button
              onClick={() => setShowBadges(true)}
              className="text-xs font-mono text-neon-purple hover:text-white transition-colors"
              aria-label="Mes badges"
            >
              🏅 {stats.badges.length}
            </button>
          )}
          <span className="text-sm text-slate-400">Joueur : <strong className="text-white">{playerName}</strong></span>
        </div>
      </div>

      {paidMessage && (
        <div className="mx-4 mt-4 p-4 bg-green-500/20 border border-green-500/50 rounded-xl text-center animate-in fade-in slide-in-from-top-2">
          <p className="text-green-400 font-bold text-sm">{paidMessage}</p>
        </div>
      )}



      {showUnlockPanel && (
        <div className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-sm p-4 flex items-center justify-center">
          <div className="w-full max-w-md bg-slate-950 border border-white/10 rounded-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-black text-white">Débloquer Captain Bond</h2>
              <button onClick={() => setShowUnlockPanel(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            {playerId && (
              <UnlockPanel
                roomCode={roomCode}
                playerId={playerId}
                packs={availablePacks}
                freeQuestionsUsed={freeQuestions?.used}
                freeQuestionsLimit={freeQuestions?.limit}
                onCheckoutError={(message) => setError(message)}
              />
            )}
          </div>
        </div>
      )}

      {showOnboarding && (
        <OnboardingModal
          storageKey={`cb_player_onboarding_${roomCode}`}
          onComplete={() => setShowOnboarding(false)}
          slides={[
            {
              icon: 'smartphone',
              title: 'Votre téléphone est une manette',
              description: 'Ne le regardez pas en permanence. La partie s\'affiche sur la TV.',
            },
            {
              icon: 'gamepad',
              title: 'Répondez quand c\'est votre tour',
              description: 'Suivez les instructions : votez, répondez ou écrivez. Le Captain guide chaque tour.',
            },
          ]}
        />
      )}

      {showBadges && stats && (
        <div className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-sm p-4 flex items-center justify-center">
          <div className="w-full max-w-md bg-slate-950 border border-white/10 rounded-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-black text-white">Votre progression</h2>
              <button onClick={() => setShowBadges(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <Icon name="x" className="w-5 h-5" />
              </button>
            </div>
            <BadgeTray badges={stats.badges} archetypes={stats.archetypes} />
          </div>
        </div>
      )}

      {showSafeWord && (
        <SafeWordModal
          onClose={() => setShowSafeWord(false)}
          onSkip={() => {
            setShowSafeWord(false);
            if (currentQuestion) {
              handleVote('__SKIP__');
            } else {
              setMyAnswer('__SKIP__');
              setHasVoted(true);
            }
          }}
          onLeave={() => {
            sessionStorage.removeItem(`player_${roomCode}`);
            router.push('/');
          }}
        />
      )}

      <div className="flex-1 flex flex-col p-4 z-10">
        {status === 'WAITING' && (
          <WaitingRoom
            roomCode={roomCode}
            players={players}
            myPlayerId={playerId}
            isHost={isHost}
            onStart={handleStartRound}
          />
        )}

        {status === 'PLAYING' && !currentQuestion && (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-neon-purple/20 text-neon-purple rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(139,92,246,0.3)]">
              <span className="text-4xl">🚀</span>
            </div>
            <h2 className="text-2xl font-bold mb-2">Prêt pour votre profil ?</h2>
            <p className="text-slate-400 mb-8 max-w-xs mx-auto">
              {targetType === 'SOLO'
                ? 'Le test de personnalité Solo va commencer. Répondez honnêtement aux questions.'
                : 'En attente du tirage de la première carte par l\'hôte.'}
            </p>
            
            {isHost && (
              <button onClick={handleStartRound} className="cb-btn-primary w-full py-4 text-lg">
                Démarrer le Test
              </button>
            )}
          </div>
        )}

        {status === 'PLAYING' && currentQuestion && (
          <div className="flex flex-col h-full w-full">
            {targetType === 'SOLO' && hasVoted ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center max-w-sm mx-auto">
                <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mb-6 border border-green-500/30 shadow-[0_0_30px_rgba(34,197,94,0.2)] animate-pulse">
                  <span className="text-3xl">✓</span>
                </div>
                <h2 className="text-2xl font-black mb-2 text-green-400">RÉPONSE ENREGISTRÉE</h2>
                <p className="text-slate-400 mb-8 text-sm leading-relaxed">
                  Votre décision a été prise en compte par le DJ Émotionnel.
                </p>
                
                <div className="flex flex-col gap-4 w-full">
                  <button onClick={handleStartRound} className="cb-btn-primary w-full py-4 text-lg">
                    Question Suivante
                  </button>
                  
                  <button onClick={handleEndGame} className="w-full bg-red-900/30 text-red-400 border border-red-500/20 font-bold py-4 rounded-xl hover:bg-red-900/50 transition-all text-lg mt-2">
                    Terminer & Révéler mon Profil
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-bold text-center mb-6 leading-tight mt-4 text-slate-200">
                  {currentQuestion.text}
                </h2>
                
                <div className="flex-1 flex justify-center">
                  {isHost && targetType !== 'SOLO' ? (
                    <div className="flex flex-col items-center justify-center h-full opacity-50 text-center">
                       <p className="text-slate-400 mb-8">Vous êtes l&apos;Hôte. Les joueurs votent.</p>
                       <button onClick={handleReveal} className="cb-btn-secondary w-full py-4 text-lg">
                          Forcer Révéler
                       </button>
                    </div>
                  ) : (
                    <>
                      <ActiveGameMode.PlayerController
                        question={currentQuestion}
                        onSubmitAnswer={handleVote}
                        onVote={handleVote}
                        hasSubmitted={hasVoted}
                        hasVoted={hasVoted}
                        myAnswer={myAnswer || undefined}
                      />
                      {voteError && (
                        <p className="mt-4 text-center text-sm text-red-400">{voteError}</p>
                      )}
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {(status === 'REVEALING' || status === 'DISCUSSION') && (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(139,92,246,0.3)] animate-pulse ${status === 'DISCUSSION' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-neon-purple/20 text-neon-purple'}`}>
              <span className="text-4xl">{status === 'DISCUSSION' ? '💬' : '👀'}</span>
            </div>
            <h2 className="text-3xl font-black mb-4 tracking-tight">
              {status === 'DISCUSSION' ? "C'est le moment d'en parler" : 'Levez les yeux !'}
            </h2>
            <p className="text-slate-300 text-lg">
              {status === 'DISCUSSION'
                ? 'Regardez la TV et laissez la conversation vivre.'
                : 'Les résultats sont affichés sur la TV.'}
            </p>
            
            {isHost && (
              <button onClick={handleStartRound} className="cb-btn-primary w-full py-4 text-lg mt-12">
                {status === 'DISCUSSION' ? 'Passer à la carte suivante' : 'Manche Suivante'}
              </button>
            )}
          </div>
        )}

        {status === 'ENDED' && (
          <ClassifiedDossierPlayer playerName={playerName} playerId={playerId || ''} roomCode={roomCode} />
        )}
      </div>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthenticated={(email) => {
          console.log('Authenticated:', email);
        }}
      />
    </div>
  );
}
