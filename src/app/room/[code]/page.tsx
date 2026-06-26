'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PlayerSetup, Player } from '@/components/presentiel/PlayerSetup';
import { ModeSelector } from '@/components/presentiel/ModeSelector';
import { PresentialHostView } from '@/components/presentiel/PresentialHostView';
import { Onboarding } from '@/components/presentiel/Onboarding';
import { BackgroundOrbs } from '@/components/BackgroundOrbs';
import { ApiClientError } from '@/lib/api/client';
import { safeJsonParse } from '@/lib/json';
import { capture, AnalyticsEvents } from '@/lib/analytics';

type Step = 'setup' | 'mode' | 'game';

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
  const roomCode = (params.code as string).toUpperCase();

  const [step, setStep] = useState<Step>('setup');
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedMode, setSelectedMode] = useState<string>('');
  
  const [hostId, setHostId] = useState<string | null>(null);
  const [hostToken, setHostToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [showPresentielOnboarding, setShowPresentielOnboarding] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('cb_presentiel_onboarding_viewed') !== 'true';
  });

  useEffect(() => {
    // Authenticate host session
    async function checkHostSession() {
      try {
        const hostSession = safeJsonParse<{ hostId?: string; hostToken?: string }>(
          sessionStorage.getItem(`host_${roomCode}`) || '{}',
          {}
        );
        const storedHostId = hostSession.hostId || null;
        const storedHostToken = hostSession.hostToken || null;

        if (!storedHostId || !storedHostToken) {
          throw new ApiClientError('Session administrateur manquante. Veuillez créer la partie depuis l\'accueil.', 401);
        }

        setHostId(storedHostId);
        setHostToken(storedHostToken);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError(err instanceof ApiClientError ? err.message : 'Session invalide.');
        setLoading(false);
      }
    }
    checkHostSession();
  }, [roomCode]);

  const handleSetupComplete = (registeredPlayers: Player[]) => {
    setPlayers(registeredPlayers);
    setStep('mode');
    capture(AnalyticsEvents.PLAYER_JOINED, {
      roomCode,
      playerCount: registeredPlayers.length,
    });
  };

  const handleModeSelected = (modeId: string) => {
    setSelectedMode(modeId);
    setStep('game');
    capture(AnalyticsEvents.MODE_SELECTED, {
      roomCode,
      modeId,
    });
  };

  const handleExitGame = () => {
    setStep('mode');
    capture(AnalyticsEvents.GAME_ENDED, {
      roomCode,
      modeId: selectedMode,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white relative">
        <BackgroundOrbs />
        <div className="w-12 h-12 border-4 border-white/10 border-t-amber-500 rounded-full animate-spin mb-4" />
        <p className="text-slate-400 font-medium z-10">Initialisation de la table...</p>
      </div>
    );
  }

  if (showPresentielOnboarding) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white relative px-4 py-8">
        <BackgroundOrbs />
        <Onboarding onComplete={() => setShowPresentielOnboarding(false)} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white p-6 text-center relative">
        <BackgroundOrbs />
        <div className="glass-panel p-8 max-w-md w-full flex flex-col items-center gap-6 z-10">
          <span className="text-5xl">🔒</span>
          <h2 className="text-2xl font-bold text-slate-200">Accès Refusé</h2>
          <p className="text-slate-400 text-sm leading-relaxed">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="w-full py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl transition-all cursor-pointer border border-slate-700"
          >
            Retour à l&apos;accueil
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-white relative overflow-hidden px-4 py-8">
      <BackgroundOrbs />

      {/* Header */}
      {step !== 'game' && (
        <div className="flex justify-between items-center max-w-md mx-auto w-full mb-8 z-10">
          <div className="flex items-center gap-3">
            <span className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-400 tracking-tight">
              CAPTAIN BOND
            </span>
            <div className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 font-mono text-amber-400 font-bold tracking-widest text-sm shadow-[0_0_10px_rgba(245,158,11,0.15)]">
              {roomCode}
            </div>
          </div>
        </div>
      )}

      {/* Main step routing */}
      <div className="flex-1 flex flex-col items-center justify-center z-10 w-full">
        {step === 'setup' && (
          <PlayerSetup
            onStart={handleSetupComplete}
            minPlayers={2}
            maxPlayers={6}
          />
        )}

        {step === 'mode' && (
          <ModeSelector
            onSelect={handleModeSelected}
          />
        )}

        {step === 'game' && hostId && hostToken && (
          <PresentialHostView
            roomCode={roomCode}
            hostId={hostId}
            hostToken={hostToken}
            players={players}
            modeId={selectedMode}
            onExit={handleExitGame}
          />
        )}
      </div>
    </div>
  );
}
