'use client';

import { useState, useEffect, useMemo } from 'react';
import { HourglassTimer } from './HourglassTimer';
import { TalkingStick, Player } from './TalkingStick';
import { DiscussionPhase } from './DiscussionPhase';
import { Paywall } from './Paywall';
import { EndGameSummary } from './EndGameSummary';
import { capture, AnalyticsEvents } from '@/lib/analytics';
import { supabase } from '@/lib/supabase';
import { CustomDeck, CustomQuestion } from '@/lib/custom-decks/types';

interface PresentialHostViewProps {
  roomCode: string;
  hostId: string;
  hostToken: string;
  players: Player[];
  modeId: string;
  onExit: () => void;
}

interface QuestionItem {
  id: string;
  text: string;
  intensityLevel?: number;
  tags?: string[];
  mode: string;
}

function sequenceDeck(questionsList: QuestionItem[]): QuestionItem[] {
  if (questionsList.length < 3) return questionsList;

  const lvl1 = questionsList.filter(q => (q.intensityLevel || 1) === 1).sort(() => Math.random() - 0.5);
  const lvl2 = questionsList.filter(q => (q.intensityLevel || 1) === 2).sort(() => Math.random() - 0.5);
  const lvl3 = questionsList.filter(q => (q.intensityLevel || 1) === 3).sort(() => Math.random() - 0.5);

  const sequenced: QuestionItem[] = [];
  
  if (lvl1.length > 0) sequenced.push(lvl1.pop()!);
  if (lvl1.length > 0) {
    sequenced.push(lvl1.pop()!);
  } else if (lvl2.length > 0) {
    sequenced.push(lvl2.pop()!);
  }
  
  if (lvl2.length > 0) sequenced.push(lvl2.pop()!);
  if (lvl2.length > 0) {
    sequenced.push(lvl2.pop()!);
  } else if (lvl3.length > 0) {
    sequenced.push(lvl3.pop()!);
  }
  
  if (lvl3.length > 0) sequenced.push(lvl3.pop()!);
  
  const positiveQ = [...lvl1, ...lvl2, ...lvl3].find(q => q.tags?.includes('positive') || q.tags?.includes('date_safe'));
  if (positiveQ) {
    sequenced.push(positiveQ);
  } else if (lvl1.length > 0) {
    sequenced.push(lvl1.pop()!);
  } else if (lvl2.length > 0) {
    sequenced.push(lvl2.pop()!);
  }

  const remaining = [...lvl1, ...lvl2, ...lvl3].sort(() => Math.random() - 0.5);
  sequenced.push(...remaining);

  return sequenced;
}

function injectWildcards(questionsList: QuestionItem[], players: Player[], modeId: string): QuestionItem[] {
  if (players.length < 2) return sequenceDeck(questionsList);

  const wildcards: QuestionItem[] = [];

  const p1 = players[Math.floor(Math.random() * players.length)].name;
  let p2 = players[Math.floor(Math.random() * players.length)].name;
  while (p2 === p1 && players.length > 1) {
    p2 = players[Math.floor(Math.random() * players.length)].name;
  }
  
  wildcards.push({
    id: `wc-ping-pong-${Date.now()}`,
    text: `${p1}, cite 3 qualités ou anecdotes sur ${p2} en moins de 15 secondes ! ⏱️`,
    intensityLevel: 1,
    tags: ['wildcard', 'positive'],
    mode: modeId
  });

  const p3 = players[Math.floor(Math.random() * players.length)].name;
  let p4 = players[Math.floor(Math.random() * players.length)].name;
  while (p4 === p3 && players.length > 1) {
    p4 = players[Math.floor(Math.random() * players.length)].name;
  }
  wildcards.push({
    id: `wc-rebond-${Date.now()}`,
    text: `${p3} doit répondre à la question suivante, mais c'est ${p4} qui doit deviner sa réponse secrète avant qu'elle ne soit dite !`,
    intensityLevel: 2,
    tags: ['wildcard'],
    mode: modeId
  });

  const sequenced = sequenceDeck(questionsList);
  if (sequenced.length >= 4) {
    sequenced.splice(1, 0, wildcards[0]);
    sequenced.splice(4, 0, wildcards[1]);
  } else {
    sequenced.push(...wildcards);
  }

  return sequenced;
}

const IMPOSTEUR_QUESTION_MAPPING: Record<string, string> = {
  "Tes 3 pires anecdotes de soirée ?": "Tes 3 pires anecdotes de repas de famille ?",
  "Tes 3 pires ruptures amoureuses ?": "Tes 3 pires râteaux ou rendez-vous ratés ?",
  "Tes 3 pires mensonges au boulot ?": "Tes 3 pires bêtises à l'école quand tu étais enfant ?",
};

function getImposteurQuestion(civilQuestion: string): string {
  if (IMPOSTEUR_QUESTION_MAPPING[civilQuestion]) {
    return IMPOSTEUR_QUESTION_MAPPING[civilQuestion];
  }
  const lower = civilQuestion.toLowerCase();
  if (lower.includes("soirée") || lower.includes("soirées")) {
    return "Tes 3 pires anecdotes de repas de famille ?";
  }
  if (lower.includes("rupture") || lower.includes("ruptures")) {
    return "Tes 3 pires râteaux ou rendez-vous ratés ?";
  }
  if (lower.includes("mensonge") || lower.includes("mensonges")) {
    return "Tes 3 pires bêtises à l'école quand tu étais enfant ?";
  }
  return civilQuestion + " (sur un thème légèrement différent)";
}

export function PresentialHostView({
  roomCode,
  hostId,
  hostToken,
  players,
  modeId,
  onExit
}: PresentialHostViewProps) {
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [phase, setPhase] = useState<'question' | 'imposteur_voting' | 'imposteur_reveal' | 'discussion'>('question');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Imposteur state
  const [imposteurIndex, setImposteurIndex] = useState<number | null>(null);
  const [imposteurSetupFinished, setImposteurSetupFinished] = useState(false);
  const [setupPlayerIndex, setSetupPlayerIndex] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const [checkedVoters, setCheckedVoters] = useState<Record<string, boolean>>({}); // { playerId: guessedCorrectly }
  const [votingCountdown, setVotingCountdown] = useState(3);
  const [isVotingCountdownActive, setIsVotingCountdownActive] = useState(false);

  // Spectator state
  const [showQRModal, setShowQRModal] = useState(false);
  const [spectatorVotes, setSpectatorVotes] = useState<Record<string, number>>({});
  const [floatingEmojis, setFloatingEmojis] = useState<{ id: string; emoji: string; x: number }[]>([]);

  // Scores & Mute state
  const [scores, setScores] = useState<Record<string, number>>({});
  const [isMuted, setIsMuted] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isGameEnded, setIsGameEnded] = useState(false);

  // Paywall & Entitlements state
  const [entitlements, setEntitlements] = useState<{ accessibleModes?: string[] } | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [showPaywall, setShowPaywall] = useState(false);

  useEffect(() => {
    async function loadDeck() {
      try {
        // Check for custom deck from vault
        const customDeckJson = typeof window !== 'undefined' ? sessionStorage.getItem('cb_active_custom_deck') : null;
        if (customDeckJson) {
          try {
            const customDeck: CustomDeck = JSON.parse(customDeckJson);
            // Smart Skip: filter questions based on present players
            const presentNames = players.map(p => p.name.toLowerCase());
            const activeQuestions: QuestionItem[] = customDeck.questions
              .filter(q => {
                if (q.isGeneric) return true;
                return q.involvedPlayers.every(name => 
                  presentNames.includes(name.toLowerCase())
                );
              })
              .map(q => ({
                id: q.id,
                text: q.text,
                intensityLevel: q.intensityLevel,
                tags: q.isGeneric ? ['generic'] : [],
                mode: q.mode
              }));
            
            if (activeQuestions.length > 0) {
              const targetSize = Math.min(activeQuestions.length, players.length * 3);
              const sequenced = sequenceDeck(activeQuestions);
              setQuestions(sequenced.slice(0, targetSize));
              sessionStorage.removeItem('cb_active_custom_deck');
              setLoading(false);
              return; // Skip the default deck
            }
          } catch (e) {
            console.error('Failed to load custom deck:', e);
          }
        }

        const res = await fetch(
          `/api/questions/deck?roomCode=${roomCode}&hostId=${hostId}&hostToken=${hostToken}`
        );
        if (!res.ok) {
          throw new Error('Impossible de charger les questions');
        }
        const data = await res.json();
        
        // Filter by mode
        let filtered: QuestionItem[] = data.filter((q: QuestionItem) => q.mode === modeId);
        
        // Mode specific overrides
        if (modeId === 'DATE_NIGHT') {
          filtered = data.filter((q: QuestionItem) => q.tags?.includes('date_safe'));
        } else if (modeId === 'FAMILY') {
          filtered = data.filter((q: QuestionItem) => q.mode === modeId && q.tags?.includes('positive'));
        }

        if (filtered.length === 0) {
          // Fallback if no questions matched the mode
          filtered = data.filter((q: QuestionItem) => q.mode === 'ICEBREAKER');
        }

        // Sequence and inject wildcards
        let preparedDeck = [...filtered];
        if (modeId !== 'IMPOSTEUR') {
          preparedDeck = injectWildcards(preparedDeck, players, modeId);
        } else {
          preparedDeck = sequenceDeck(preparedDeck);
        }

        // Check for presential couples and inject specialized couple questions
        const couplesJson = typeof window !== 'undefined' ? sessionStorage.getItem('cb_presentiel_couples') : null;
        if (couplesJson) {
          try {
            const couplesList: string[][] = JSON.parse(couplesJson);
            if (couplesList.length > 0) {
              const coupleQuestions: QuestionItem[] = [];
              couplesList.forEach((c, idx) => {
                const pA = c[0];
                const pB = c[1];
                coupleQuestions.push({
                  id: `couple-q1-${idx}-${Date.now()}`,
                  text: `💖 COMPLICITÉ : ${pA} et ${pB}, quel est le plus beau souvenir de votre rencontre ? L'autre doit valider !`,
                  intensityLevel: 1,
                  tags: ['couple', 'positive'],
                  mode: modeId
                });
                coupleQuestions.push({
                  id: `couple-q2-${idx}-${Date.now()}`,
                  text: `💖 ALIGNEMENT : Si ${pA} devait citer le plus mignon petit défaut de ${pB} en un mot, est-ce que ${pB} devinerait le même ?`,
                  intensityLevel: 2,
                  tags: ['couple'],
                  mode: modeId
                });
              });
              if (coupleQuestions.length > 0) {
                if (preparedDeck.length >= 4) {
                  preparedDeck.splice(2, 0, coupleQuestions[0]);
                  if (coupleQuestions.length > 1) {
                    preparedDeck.splice(Math.min(preparedDeck.length, 5), 0, coupleQuestions[1]);
                  }
                } else {
                  preparedDeck.push(...coupleQuestions);
                }
              }
            }
          } catch (e) {
            console.error('Failed to parse couples for presential deck:', e);
          }
        }

        // Limit presential session to 6 questions for pacing
        setQuestions(preparedDeck.slice(0, 6));

        // Fetch entitlements
        const entitlementsRes = await fetch(
          `/api/me/entitlements?playerId=${hostId}&roomCode=${roomCode}`
        ).catch(() => null);
        
        if (entitlementsRes && entitlementsRes.ok) {
          const loadedEntitlements = await entitlementsRes.json();
          setEntitlements(loadedEntitlements);
        }

        setLoading(false);
      } catch (err) {
        console.error(err);
        setError('Erreur lors du chargement des questions');
        setLoading(false);
      }
    }
    loadDeck();
  }, [roomCode, hostId, hostToken, modeId, players]);

  // Handle Imposteur selection on new question
  useEffect(() => {
    if (modeId === 'IMPOSTEUR' && players.length > 0) {
      const randomIndex = Math.floor(Math.random() * players.length);
      Promise.resolve().then(() => {
        setImposteurIndex(randomIndex);
        setImposteurSetupFinished(false);
        setSetupPlayerIndex(0);
        setIsHolding(false);
      });
    }
  }, [currentQuestionIndex, modeId, players]);

  // Web Audio Synthesizer for reactions
  const playSynthesizedSound = (soundType: string, isMuted: boolean) => {
    if (isMuted) return;
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();

      if (soundType === 'buzzer') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(100, ctx.currentTime);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      } else if (soundType === 'applaudissements') {
        const bufferSize = ctx.sampleRate * 0.1;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        for (let delay = 0; delay < 0.6; delay += 0.15) {
          const noise = ctx.createBufferSource();
          noise.buffer = buffer;
          const filter = ctx.createBiquadFilter();
          filter.type = 'bandpass';
          filter.frequency.value = 1000;
          const gain = ctx.createGain();
          noise.connect(filter);
          filter.connect(gain);
          gain.connect(ctx.destination);
          gain.gain.setValueAtTime(0.15, ctx.currentTime + delay);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + delay + 0.08);
          noise.start(ctx.currentTime + delay);
        }
      } else if (soundType === 'rires') {
        for (let delay = 0; delay < 0.5; delay += 0.18) {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(250 + Math.random() * 50, ctx.currentTime + delay);
          osc.frequency.exponentialRampToValueAtTime(380 + Math.random() * 50, ctx.currentTime + delay + 0.12);
          gain.gain.setValueAtTime(0.15, ctx.currentTime + delay);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + delay + 0.12);
          osc.start(ctx.currentTime + delay);
          osc.stop(ctx.currentTime + delay + 0.12);
        }
      } else if (soundType === 'violon') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(330, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(360, ctx.currentTime + 0.8);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.6);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
        osc.start();
        osc.stop(ctx.currentTime + 0.8);
      } else if (soundType === 'joker_bell') {
        const freqs = [880, 1109, 1318, 1760];
        freqs.forEach((f, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.type = 'sine';
          osc.frequency.setValueAtTime(f, ctx.currentTime);
          gain.gain.setValueAtTime(0.05 - idx * 0.01, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2 - idx * 0.2);
          osc.start();
          osc.stop(ctx.currentTime + 1.2);
        });
      }
    } catch (e) {
      console.error('Audio synthesis failed:', e);
    }
  };

  const triggerLocalEmoji = (emoji: string) => {
    const id = crypto.randomUUID();
    const x = 10 + Math.random() * 80;
    setFloatingEmojis(prev => [...prev, { id, emoji, x }]);
    setTimeout(() => {
      setFloatingEmojis(prev => prev.filter(e => e.id !== id));
    }, 2000);
  };

  const triggerLocalJoker = (targetPlayerName: string) => {
    playSynthesizedSound('joker_bell', isMuted);
    setToastMessage(`🕊️ Joker Solidaire activé par un ange gardien pour ${targetPlayerName} !`);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
    handlePlayerFinished();
  };

  // Setup broadcast channel
  const channel = useMemo(() => {
    return supabase.channel(`room-events-${roomCode}`);
  }, [roomCode]);

  // Synchronization with spectator devices
  useEffect(() => {
    const broadcastState = () => {
      channel.send({
        type: 'broadcast',
        event: 'ROOM_STATE_UPDATE',
        payload: {
          currentQuestionText: modeId === 'IMPOSTEUR'
            ? "Chacun répond à sa question secrète à tour de rôle."
            : questions[currentQuestionIndex]?.text || '',
          currentPlayerName: players[currentPlayerIndex]?.name || '',
          phase,
          players,
          modeId
        }
      });
    };

    channel
      .on('broadcast', { event: 'REQUEST_ROOM_STATE' }, () => {
        broadcastState();
      })
      .on('broadcast', { event: 'TRIGGER_SOUND' }, ({ payload }) => {
        playSynthesizedSound(payload.soundType, isMuted);
      })
      .on('broadcast', { event: 'TRIGGER_EMOJI' }, ({ payload }) => {
        triggerLocalEmoji(payload.emoji);
      })
      .on('broadcast', { event: 'TRIGGER_JOKER_SOLIDAIRE' }, ({ payload }) => {
        triggerLocalJoker(payload.targetPlayerName);
      })
      .on('broadcast', { event: 'SUBMIT_SPECTATOR_VOTE' }, ({ payload }) => {
        setSpectatorVotes(prev => ({
          ...prev,
          [payload.suspectPlayerId]: (prev[payload.suspectPlayerId] || 0) + 1
        }));
      })
      .on('broadcast', { event: 'INJECT_CUSTOM_DECK' }, ({ payload }) => {
        const injectQuestions: QuestionItem[] = (payload.questions as CustomQuestion[])
          .filter(q => {
            if (q.isGeneric) return true;
            const presentNames = players.map(p => p.name.toLowerCase());
            return q.involvedPlayers.every(name => presentNames.includes(name.toLowerCase()));
          })
          .map(q => ({
            id: q.id,
            text: q.text,
            intensityLevel: q.intensityLevel,
            tags: q.isGeneric ? ['generic'] : [],
            mode: q.mode
          }));
        if (injectQuestions.length > 0) {
          setToastMessage(`🌴 ${payload.senderName || 'Un spectateur'} injecte son deck de souvenirs !`);
          setTimeout(() => setToastMessage(null), 4500);
          setQuestions(prev => [...prev, ...injectQuestions]);
        }
      })
      .subscribe();

    broadcastState();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [channel, currentQuestionIndex, currentPlayerIndex, phase, questions, players, modeId, isMuted]);

  // Handle Imposteur Voting Countdown
  useEffect(() => {
    let timerId: ReturnType<typeof setTimeout> | undefined;
    if (phase === 'imposteur_voting' && isVotingCountdownActive && votingCountdown > 0) {
      timerId = setTimeout(() => {
        setVotingCountdown(prev => prev - 1);
      }, 1000);
    } else if (phase === 'imposteur_voting' && isVotingCountdownActive && votingCountdown === 0) {
      // Play Gong Sound (Web Audio API Synthesizer)
      try {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (AudioContextClass && !isMuted) {
          const ctx = new AudioContextClass();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(120, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 1.5);
          
          gain.gain.setValueAtTime(0.3, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.5);
          
          osc.start();
          osc.stop(ctx.currentTime + 1.5);
        }
      } catch (e) {
        console.error('Failed to play gong sound:', e);
      }
      Promise.resolve().then(() => {
        setIsVotingCountdownActive(false);
      });
    }
    return () => {
      if (timerId) clearTimeout(timerId);
    };
  }, [phase, isVotingCountdownActive, votingCountdown, isMuted]);

  if (showPaywall) {
    return (
      <Paywall
        roomCode={roomCode}
        hostId={hostId}
        onExit={onExit}
      />
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 max-w-md mx-auto min-h-[400px] text-slate-100 bg-slate-900/60 backdrop-blur-md rounded-3xl border border-slate-700/50 shadow-2xl">
        <div className="w-12 h-12 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin"></div>
        <p className="mt-4 text-sm text-slate-400">Préparation de l&apos;ambiance...</p>
      </div>
    );
  }

  if (error || questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 max-w-md mx-auto min-h-[400px] text-slate-100 bg-slate-900/60 backdrop-blur-md rounded-3xl border border-slate-700/50 shadow-2xl text-center gap-4">
        <span className="text-4xl">⚠️</span>
        <h3 className="text-xl font-bold text-slate-200">Une erreur est survenue</h3>
        <p className="text-sm text-slate-400">
          {error || 'Aucune question disponible pour ce mode.'}
        </p>
        <button
          onClick={onExit}
          className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-all cursor-pointer"
        >
          Retour
        </button>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const hasAccess = entitlements?.accessibleModes?.includes('*') || entitlements?.accessibleModes?.includes(modeId);

  // Timer duration logic based on mode
  let duration = 60; // default 1 min
  if (modeId === 'DEEP_CONNECTION' || modeId === 'DATE_NIGHT') {
    duration = 180; // 3 min
  } else if (modeId === 'SPICY') {
    duration = 90; // 1.5 min
  }

  function handlePlayerFinished() {
    if (currentPlayerIndex < players.length - 1) {
      setCurrentPlayerIndex(prev => prev + 1);
    } else {
      // All players answered -> Discussion or Imposteur voting phase
      if (modeId === 'IMPOSTEUR') {
        setPhase('imposteur_voting');
        setVotingCountdown(3);
        setIsVotingCountdownActive(true);
        setCheckedVoters({});
      } else {
        setPhase('discussion');
      }
      capture(AnalyticsEvents.QUESTION_ANSWERED, {
        roomCode,
        modeId,
        questionIndex: currentQuestionIndex,
      });
    }
  }

  const handlePlayerSkipped = () => {
    setToastMessage(`Joker utilisé par ${players[currentPlayerIndex].name}. Aucun jugement, la parole est libre !`);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
    handlePlayerFinished();
  };

  const handleVoteComplete = (votedPlayerId: string) => {
    setScores(prev => ({
      ...prev,
      [votedPlayerId]: (prev[votedPlayerId] || 0) + 1
    }));
    handlePlayerFinished();
  };

  const handleImposteurNext = () => {
    const imposteurPlayer = players[imposteurIndex!];
    const newPoints: Record<string, number> = {};

    // Determine correct voters (Civils who guessed the Imposteur correctly)
    const correctVoterIds = Object.entries(checkedVoters)
      .filter(([, guessedCorrectly]) => guessedCorrectly)
      .map(([voterId]) => voterId);

    // Civil players get +1 if they guessed correctly
    players.forEach(p => {
      if (p.id !== imposteurPlayer.id && correctVoterIds.includes(p.id)) {
        newPoints[p.id] = 1;
      }
    });

    // Imposteur gets +2 if nobody found them
    if (correctVoterIds.length === 0) {
      newPoints[imposteurPlayer.id] = 2;
    }

    // Update state scores
    setScores(prev => {
      const updated = { ...prev };
      Object.entries(newPoints).forEach(([pid, pts]) => {
        updated[pid] = (updated[pid] || 0) + pts;
      });
      return updated;
    });

    // Proceed to next question
    handleNextQuestion();
  };

  const handleNextQuestion = () => {
    // Lock after 3 questions (disabled for now - presential is free)
    /*
    const isPremiumMode = modeId === 'DATE_NIGHT' || modeId === 'SPICY' || modeId === 'DEEP_CONNECTION';
    if ((isPremiumMode || currentQuestionIndex >= 2) && !hasAccess) {
      setShowPaywall(true);
      return;
    }
    */

    setPhase('question');
    setCurrentPlayerIndex(0);
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // Show endgame summary screen
      setIsGameEnded(true);
    }
  };

  // Imposteur Game Setup Screen (Sequential Anti-Peeking Flow with Hold-to-Reveal)
  if (modeId === 'IMPOSTEUR' && !imposteurSetupFinished) {
    const activeSetupPlayer = players[setupPlayerIndex];
    const isLastSetupPlayer = setupPlayerIndex === players.length - 1;
    const isPlayerImposteur = setupPlayerIndex === imposteurIndex;

    const startHold = (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      setIsHolding(true);
    };

    const endHold = () => {
      setIsHolding(false);
    };

    return (
      <div className="flex flex-col items-center justify-between gap-6 p-6 max-w-md mx-auto min-h-[500px] text-slate-100 bg-slate-900/60 backdrop-blur-md rounded-3xl border border-slate-700/50 shadow-2xl text-center w-full relative overflow-hidden">
        {/* Beautiful Repeating Visual Pattern */}
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[repeating-linear-gradient(45deg,#d4af37,#d4af37_10px,#000_10px,#000_20px)] animate-[pulse_3s_infinite]"></div>

        <div className="flex flex-col gap-4 mt-6 z-10 w-full">
          <span className="text-5xl animate-bounce">🕵️</span>
          <h2 className="text-2xl font-black text-amber-400 uppercase tracking-tight">Révélation Secrète</h2>
          <div className="h-px bg-slate-800 w-24 mx-auto my-1"></div>
          <p className="text-slate-400 text-xs leading-relaxed px-4">
            Passez l&apos;appareil. Maintenez le bouton enfoncé pour lire votre rôle en secret, relâchez pour le cacher.
          </p>
        </div>

        <div className="my-4 flex flex-col gap-2 z-10">
          <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">Joueur actif</span>
          <div className="text-4xl font-extrabold text-slate-200 tracking-tight uppercase">
            {activeSetupPlayer.name}
          </div>
        </div>

        {/* Display secret role while holding */}
        <div className="w-full min-h-[180px] z-10 flex items-center justify-center">
          {isHolding ? (
            <div className="w-full animate-[fadeIn_0.2s_ease-out]">
              {isPlayerImposteur ? (
                <div className="bg-amber-500/10 border border-amber-500/30 p-5 rounded-2xl flex flex-col gap-2 shadow-inner">
                  <span className="text-xl">⚠️</span>
                  <h4 className="text-base font-black text-amber-400 tracking-wide">TU ES L&apos;IMPOSTEUR !</h4>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    Ta question secrète est légèrement différente. Mens ou oriente tes réponses pour ne pas te faire démasquer !
                  </p>
                  <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-xs font-semibold italic text-amber-100 leading-relaxed shadow-sm">
                    &quot;{getImposteurQuestion(currentQuestion.text)}&quot;
                  </div>
                </div>
              ) : (
                <div className="bg-emerald-500/10 border border-emerald-500/30 p-5 rounded-2xl flex flex-col gap-2 shadow-inner">
                  <span className="text-xl">🟢</span>
                  <h4 className="text-base font-black text-emerald-400 tracking-wide">TU ES CIVIL</h4>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    Réponds sincèrement à la question ci-dessous. Sois attentif pour déceler les réponses suspectes.
                  </p>
                  <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-xs font-semibold italic text-emerald-100 leading-relaxed shadow-sm">
                    &quot;{currentQuestion.text}&quot;
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="w-full py-8 border-2 border-dashed border-slate-800/40 rounded-2xl flex flex-col gap-2 items-center justify-center text-slate-500 text-sm font-medium">
              <span>👁️</span>
              <span>Maintenez le bouton ci-dessous pour voir</span>
            </div>
          )}
        </div>

        <div className="w-full flex flex-col gap-3 z-10">
          <button
            onMouseDown={startHold}
            onMouseUp={endHold}
            onMouseLeave={endHold}
            onTouchStart={startHold}
            onTouchEnd={endHold}
            className="w-full py-4 bg-amber-500 hover:bg-amber-600 active:scale-[0.98] text-slate-950 font-extrabold text-base rounded-2xl transition-all cursor-pointer shadow-lg shadow-amber-500/10 select-none"
          >
            {isHolding ? '🔓 CARTE RÉVÉLÉE' : '🔒 MAINTENIR POUR LIRE'}
          </button>

          <button
            onClick={() => {
              setIsHolding(false);
              if (isLastSetupPlayer) {
                setImposteurSetupFinished(true);
              } else {
                setSetupPlayerIndex(prev => prev + 1);
              }
            }}
            disabled={isHolding}
            className="w-full py-3 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-200 font-bold text-sm rounded-xl transition-all cursor-pointer border border-slate-700 shadow-sm"
          >
            {isLastSetupPlayer ? 'Commencer la partie →' : `Passer à ${players[setupPlayerIndex + 1].name} >`}
          </button>
        </div>
      </div>
    );
  }

  // Imposteur Voting Countdown Screen (Physical Voting Option B)
  if (phase === 'imposteur_voting') {
    return (
      <div className="flex flex-col items-center justify-between gap-6 p-6 max-w-md mx-auto min-h-[500px] text-slate-100 bg-slate-900/60 backdrop-blur-md rounded-3xl border border-slate-700/50 shadow-2xl text-center w-full relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[repeating-linear-gradient(45deg,#3b82f6,#3b82f6_10px,#000_10px,#000_20px)] animate-[pulse_3s_infinite]"></div>

        <div className="flex flex-col gap-4 mt-6 z-10 w-full">
          <span className="text-xs text-blue-400 font-bold uppercase tracking-widest font-mono">Désignation physique</span>
          <h2 className="text-2xl font-black text-white tracking-tight uppercase">Le Vote du Tribunal</h2>
          <div className="h-px bg-slate-800 w-24 mx-auto my-2"></div>
          <p className="text-slate-400 text-xs leading-relaxed px-4">
            Préparez-vous à désigner l&apos;Imposteur du doigt. Au gong, tout le monde pointe son suspect en même temps !
          </p>
        </div>

        <div className="my-8 flex flex-col items-center justify-center z-10">
          {votingCountdown > 0 ? (
            <div className="text-8xl font-black text-blue-400 animate-ping">
              {votingCountdown}
            </div>
          ) : (
            <div className="flex flex-col gap-2 items-center animate-bounce">
              <span className="text-7xl">👇</span>
              <span className="text-4xl font-black text-emerald-400 uppercase tracking-widest animate-pulse">POINTEZ !</span>
            </div>
          )}
        </div>

        <div className="w-full flex flex-col gap-3 z-10">
          {votingCountdown > 0 && !isVotingCountdownActive && (
            <button
              onClick={() => {
                setVotingCountdown(3);
                setIsVotingCountdownActive(true);
              }}
              className="w-full py-4 bg-blue-500 hover:bg-blue-600 text-slate-950 font-bold rounded-2xl transition-all cursor-pointer shadow-lg"
            >
              Lancer le compte à rebours
            </button>
          )}

          {votingCountdown === 0 && (
            <button
              onClick={() => setPhase('imposteur_reveal')}
              className="w-full py-4 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-slate-950 font-extrabold text-base rounded-2xl transition-all cursor-pointer shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-2"
            >
              Révéler l&apos;Imposteur
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>
      </div>
    );
  }

  // Imposteur Reveal and Score Submission Screen (Physical Voting Option B)
  if (phase === 'imposteur_reveal') {
    const imposteurPlayer = players[imposteurIndex!];
    const correctVotersCount = Object.values(checkedVoters).filter(Boolean).length;
    const imposteurFound = correctVotersCount > 0;

    return (
      <div className="flex flex-col items-center justify-between gap-6 p-6 max-w-md mx-auto min-h-[500px] text-slate-100 bg-slate-900/60 backdrop-blur-md rounded-3xl border border-slate-700/50 shadow-2xl text-center w-full relative overflow-hidden">
        <div className="flex flex-col items-center gap-5 mt-2 w-full z-10 animate-[fadeIn_0.25s_ease-out]">
          
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] text-rose-400 font-bold uppercase tracking-widest font-mono">Fin de la manche</span>
            <h2 className="text-2xl font-black text-white tracking-tight uppercase">Révélation !</h2>
          </div>

          {/* Reveal Card */}
          <div className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl p-5 flex flex-col items-center gap-3.5 relative overflow-hidden shadow-inner">
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[repeating-linear-gradient(45deg,#ef4444,#ef4444_10px,#000_10px,#000_20px)]"></div>
            
            <span className="text-5xl animate-[pulse_1.5s_infinite]">🎭</span>
            <div>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-0.5">L&apos;Imposteur était...</span>
              <span className="text-xl font-black text-rose-400 uppercase tracking-tight">
                {imposteurPlayer.name}
              </span>
            </div>
            
            <div className="bg-slate-900/80 border border-slate-800/80 px-4 py-2 rounded-xl text-[11px] text-slate-400 max-w-xs leading-relaxed">
              La question secrète de l&apos;Imposteur était : <br />
              <strong className="text-amber-300 font-medium block mt-1 italic">&ldquo;{getImposteurQuestion(currentQuestion.text)}&rdquo;</strong>
            </div>
          </div>

          {/* Voting Results Checklist */}
          <div className="w-full text-left bg-slate-900/40 border border-slate-800/60 p-4 rounded-2xl">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block mb-2 text-center">Qui l&apos;avait démasqué ?</span>
            <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
              {players.map(p => {
                if (p.id === imposteurPlayer.id) return null;
                const isChecked = !!checkedVoters[p.id];
                return (
                  <label key={p.id} className="flex items-center justify-between p-2 hover:bg-white/5 rounded-xl cursor-pointer transition-all">
                    <span className="text-sm font-medium text-slate-200">{p.name}</span>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => setCheckedVoters(prev => ({ ...prev, [p.id]: e.target.checked }))}
                      className="w-5 h-5 rounded border-slate-700 bg-slate-950 text-emerald-500 focus:ring-emerald-500/40 cursor-pointer"
                    />
                  </label>
                );
              })}
            </div>
          </div>

          {/* Automatic Score Preview */}
          <div className="w-full bg-slate-950/40 border border-slate-900 p-3.5 rounded-xl text-left text-xs font-mono">
            <span className="text-slate-500 font-bold block mb-1 uppercase tracking-wider text-[9px]">Calcul des Points :</span>
            {imposteurFound ? (
              <p className="text-emerald-400">
                Civils corrects : +1 pt chacun.<br />
                Imposteur démasqué : 0 pt.
              </p>
            ) : (
              <p className="text-rose-400">
                Personne n&apos;a trouvé l&apos;Imposteur.<br />
                {imposteurPlayer.name} gagne : +2 pts de bluff !
              </p>
            )}
          </div>

          {/* Spectator votes */}
          {Object.keys(spectatorVotes).length > 0 && (
            <div className="w-full bg-slate-950/30 border border-slate-900/50 p-3 rounded-xl text-left text-[11px] font-mono mt-1">
              <span className="text-slate-500 font-bold block mb-1 uppercase tracking-wider text-[9px]">Votes du Public (Spectateurs) :</span>
              <div className="space-y-1">
                {players.map(p => {
                  const count = spectatorVotes[p.id] || 0;
                  if (count === 0) return null;
                  return (
                    <div key={p.id} className="flex justify-between items-center text-slate-300">
                      <span>{p.name} :</span>
                      <span className="text-blue-400 font-bold">{count} {count > 1 ? 'votes' : 'vote'}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        <button
          onClick={handleImposteurNext}
          className="w-full py-4 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-bold text-lg rounded-2xl transition-all cursor-pointer shadow-lg shadow-rose-500/15 flex items-center justify-center gap-2 z-10"
        >
          Manche suivante
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    );
  }

  if (isGameEnded) {
    return (
      <EndGameSummary
        roomCode={roomCode}
        players={players}
        modeId={modeId}
        scores={scores}
        onRestart={() => {
          setIsGameEnded(false);
          setCurrentQuestionIndex(0);
          setCurrentPlayerIndex(0);
          setPhase('question');
          setScores({});
          // Reshuffle deck
          setQuestions(prev => [...prev].sort(() => Math.random() - 0.5));
        }}
        onExit={onExit}
      />
    );
  }

  // Intermission / Discussion phase
  if (phase === 'discussion') {
    return (
      <DiscussionPhase
        onResume={handleNextQuestion}
        topic={modeId === 'IMPOSTEUR' ? "Débattez pour trouver qui est l'imposteur ce soir !" : undefined}
        scores={scores}
        players={players}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-md mx-auto relative">
      <style>{`
        .floating-emoji {
          position: absolute;
          bottom: 0;
          font-size: 2.5rem;
          pointer-events: none;
          z-index: 50;
          animation: floatUp 2s ease-out forwards;
        }
        @keyframes floatUp {
          0% { transform: translateY(0) scale(0.5); opacity: 0; }
          15% { opacity: 1; transform: translateY(-30px) scale(1.3); }
          100% { transform: translateY(-350px) scale(0.9); opacity: 0; }
        }
      `}</style>

      {/* Render Floating Emojis */}
      {floatingEmojis.map(item => (
        <span
          key={item.id}
          className="floating-emoji"
          style={{ left: `${item.x}%` }}
        >
          {item.emoji}
        </span>
      ))}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 max-w-sm w-11/12 bg-amber-500/95 backdrop-blur-md text-slate-950 font-bold px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 border border-amber-400 animate-[fadeIn_0.2s_ease-out]">
          <span className="text-xl">🕊️</span>
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Header bar with room code and sound controls */}
      <div className="flex justify-between items-center w-full px-2 gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider hidden sm:inline">
            Mode : {modeId.replace('_', ' ')}
          </span>
          <button
            onClick={() => setShowQRModal(true)}
            className="px-2.5 py-1 text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 rounded-lg cursor-pointer transition-all flex items-center gap-1 shadow-[0_0_8px_rgba(245,158,11,0.05)]"
          >
            <span>📱 captainbond.com</span>
            <span className="font-mono bg-amber-500/10 px-1 rounded text-[10px] tracking-wider font-extrabold">{roomCode}</span>
          </button>
        </div>
        <button
          onClick={() => setIsMuted(prev => !prev)}
          className="p-2 rounded-lg bg-slate-900/60 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 transition-all cursor-pointer"
          title={isMuted ? 'Activer le son' : 'Couper le son'}
        >
          {isMuted ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
            </svg>
          ) : (
            <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M12 18.75V5.25L7.75 9.5H4.5v5h3.25L12 18.75z" />
            </svg>
          )}
        </button>
      </div>

      {/* Hourglass Timer */}
      <HourglassTimer
        duration={duration}
        mode="automatic"
        onComplete={handlePlayerFinished}
        isMuted={isMuted}
      />

      {/* Talking Stick Rotation Controls */}
      <TalkingStick
        players={players}
        currentPlayerIndex={currentPlayerIndex}
        onNext={handlePlayerFinished}
        question={
          modeId === 'IMPOSTEUR' 
            ? "Chacun répond à sa question secrète à tour de rôle."
            : currentQuestion.text
        }
        onSkip={handlePlayerSkipped}
        showSkip={modeId === 'DEEP_CONNECTION' || modeId === 'DATE_NIGHT' || modeId === 'SPICY'}
        modeId={modeId}
        onVoteComplete={handleVoteComplete}
        isMuted={isMuted}
        questions={questions}
        currentQuestionIndex={currentQuestionIndex}
        onSelectQuestion={(selectedIndex) => {
          const updated = [...questions];
          const temp = updated[currentQuestionIndex];
          updated[currentQuestionIndex] = updated[selectedIndex];
          updated[selectedIndex] = temp;
          setQuestions(updated);
        }}
      />

      {/* Free questions progress gauge (disabled - presential is free) */}
      {false && !hasAccess && (
        <div className="w-full text-center space-y-1.5 my-2">
          <p className="text-xs text-slate-400 font-medium">
            Carte gratuite {Math.min(currentQuestionIndex + 1, 3)}/3
          </p>
          <div className="w-28 mx-auto h-1.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700/30">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-yellow-500 transition-all duration-500"
              style={{ width: `${(Math.min(currentQuestionIndex + 1, 3) / 3) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Exit Button */}
      <button
        onClick={onExit}
        className="text-xs text-slate-500 hover:text-slate-400 font-semibold text-center cursor-pointer hover:underline mt-1"
      >
        Quitter la partie
      </button>

      {/* QR Code Modale */}
      {showQRModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl max-w-sm w-full text-center relative space-y-6 shadow-2xl">
            <button
              onClick={() => setShowQRModal(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors cursor-pointer"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="space-y-1">
              <span className="text-xs text-amber-500 font-bold uppercase tracking-widest font-mono">Rejoindre le salon</span>
              <h3 className="text-xl font-black text-slate-200">Spectateur Interactif</h3>
            </div>
            
            <div className="bg-slate-950/60 border border-slate-800/80 p-5 rounded-2xl space-y-2">
              <p className="text-xs text-slate-400 leading-relaxed">
                Rendez-vous sur votre téléphone sur :
              </p>
              <p className="text-lg font-black text-white tracking-wide">
                captainbond.com
              </p>
              <p className="text-xs text-slate-400 leading-relaxed mt-1">
                Et entrez le code secret :
              </p>
              <p className="text-3xl font-mono font-black text-amber-400 tracking-widest bg-amber-500/10 py-2.5 rounded-xl border border-amber-500/20">
                {roomCode}
              </p>
            </div>
            
            <p className="text-[10px] text-slate-500 leading-relaxed">
              Friction zéro : pas besoin de créer de compte ni d&apos;entrer de prénom. Flashez ou tapez pour buzzer la table !
            </p>
            
            <button
              onClick={() => setShowQRModal(false)}
              className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl transition-all cursor-pointer border border-slate-700 text-sm"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
