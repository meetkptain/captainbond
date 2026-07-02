'use client';

import { useEffect, useRef } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { CustomQuestion } from '@/lib/custom-decks/types';
import { DeckQuestion } from '@/lib/presentiel/deck';
import { Player } from '@/components/presentiel/TalkingStick';
import { buildDeckFromCustom } from './usePresentialDeck';
import type { PresentialPhase } from './usePresentialRealtime';

export interface PresentialBroadcastState {
  currentQuestionIndex: number;
  currentPlayerIndex: number;
  phase: PresentialPhase;
  questions: DeckQuestion[];
  players: Player[];
  modeId: string;
}

export interface PresentialBroadcastCallbacks {
  onTriggerSound?: (soundType: string) => void;
  onTriggerEmoji?: (emoji: string) => void;
  onTriggerJoker?: (targetPlayerName: string) => void;
  onInjectDeck?: (senderName: string, questions: DeckQuestion[]) => void;
}

export interface PresentialBroadcastActions {
  skip: () => void;
  swapQuestion: (selectedIndex: number) => void;
  setCurrentPlayerIndex: (index: number) => void;
  setPhase: (phase: PresentialPhase) => void;
  setQuestions: (updater: React.SetStateAction<DeckQuestion[]>) => void;
  setSpectatorVotes: (updater: React.SetStateAction<Record<string, number>>) => void;
}

export interface UsePresentialBroadcastInput {
  roomCode: string;
  modeId: string;
  players: Player[];
  stateRef: React.MutableRefObject<PresentialBroadcastState>;
  callbacks: PresentialBroadcastCallbacks;
  actions: PresentialBroadcastActions;
}

export function usePresentialBroadcast(input: UsePresentialBroadcastInput): void {
  const { roomCode, modeId, players, stateRef, callbacks, actions } = input;

  const channelRef = useRef<RealtimeChannel | null>(null);
  const callbacksRef = useRef(callbacks);
  const actionsRef = useRef(actions);

  // Keep refs current on every render without re-triggering the subscription effect.
  useEffect(() => {
    callbacksRef.current = callbacks;
    actionsRef.current = actions;
  });

  useEffect(() => {
    const channel = supabase.channel(`room-events-${roomCode}`);
    channelRef.current = channel;

    const broadcastState = () => {
      const { currentQuestionIndex, currentPlayerIndex, phase, questions, players, modeId } = stateRef.current;
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
        if (payload && typeof payload.soundType === 'string') {
          callbacksRef.current.onTriggerSound?.(payload.soundType);
        }
      })
      .on('broadcast', { event: 'TRIGGER_EMOJI' }, ({ payload }) => {
        if (payload && typeof payload.emoji === 'string') {
          callbacksRef.current.onTriggerEmoji?.(payload.emoji);
        }
      })
      .on('broadcast', { event: 'TRIGGER_JOKER_SOLIDAIRE' }, ({ payload }) => {
        if (payload && typeof payload.targetPlayerName === 'string') {
          callbacksRef.current.onTriggerJoker?.(payload.targetPlayerName);
          actionsRef.current.skip();
        }
      })
      .on('broadcast', { event: 'TRIGGER_GLOBAL_SKIP' }, () => {
        if (stateRef.current.questions.length > 1) {
          const nextIndex = (stateRef.current.currentQuestionIndex + 1) % stateRef.current.questions.length;
          actionsRef.current.swapQuestion(nextIndex);
          actionsRef.current.setCurrentPlayerIndex(0);
          actionsRef.current.setPhase('question');
          callbacksRef.current.onTriggerSound?.('joker_bell');
        }
      })
      .on('broadcast', { event: 'SUBMIT_SPECTATOR_VOTE' }, ({ payload }) => {
        if (payload && typeof payload.suspectPlayerId === 'string') {
          actionsRef.current.setSpectatorVotes((prev) => ({
            ...prev,
            [payload.suspectPlayerId]: (prev[payload.suspectPlayerId] || 0) + 1
          }));
        }
      })
      .on('broadcast', { event: 'INJECT_CUSTOM_DECK' }, ({ payload }) => {
        if (payload && Array.isArray(payload.questions)) {
          const injectQuestions = buildDeckFromCustom(
            { questions: payload.questions as CustomQuestion[] },
            players,
            modeId
          );
          if (injectQuestions.length > 0) {
            actionsRef.current.setQuestions((prev) => [...prev, ...injectQuestions]);
            callbacksRef.current.onInjectDeck?.(payload.senderName || 'Un spectateur', injectQuestions);
          }
        }
      })
      .subscribe();

    broadcastState();

    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [roomCode, modeId, players, stateRef]);
}
