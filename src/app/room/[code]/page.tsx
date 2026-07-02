'use client';

export const runtime = 'edge';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PlayerSetup, Player } from '@/components/presentiel/PlayerSetup';
import { ModeSelector } from '@/components/presentiel/ModeSelector';
import { PresentialHostView } from '@/components/presentiel/PresentialHostView';
import { Onboarding } from '@/components/presentiel/Onboarding';
import { BackgroundOrbs } from '@/components/BackgroundOrbs';
import { ApiClientError } from '@/lib/api/client';
import { useHostSession } from '@/hooks/useHostSession';
import { capture, AnalyticsEvents } from '@/lib/analytics';
import { useTranslation, Language } from '@/lib/i18n';

type Step = 'setup' | 'mode' | 'game';

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
  const roomCode = (params.code as string).toUpperCase();
  const { t, language, setLanguage } = useTranslation();

  const [step, setStep] = useState<Step>('setup');
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedMode, setSelectedMode] = useState<string>('');
  
  const [hostId, setHostId] = useState<string | null>(null);
  const [hostToken, setHostToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { hostId: storedHostId, hostToken: storedHostToken } = useHostSession(roomCode);

  useEffect(() => {
    if (!roomCode) return;
    
    // Fetch room language to sync translation client-side
    fetch(`/api/room/info?roomCode=${roomCode}`)
      .then(res => {
        if (res.ok) return res.json();
        throw new Error('Failed to load room language');
      })
      .then(data => {
        if (data.language === 'en' || data.language === 'fr') {
          setLanguage(data.language as Language);
        }
      })
      .catch((err) => {
        console.error('Error fetching room language:', err);
      });
  }, [roomCode, setLanguage]);

  useEffect(() => {
    requestAnimationFrame(() => {
      if (!storedHostId || !storedHostToken) {
        setError(t('room_err_auth'));
      } else {
        setHostId(storedHostId);
        setHostToken(storedHostToken);
      }
      setLoading(false);
    });
  }, [storedHostId, storedHostToken, t]);

  const [showPresentielOnboarding, setShowPresentielOnboarding] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('cb_presentiel_onboarding_viewed') !== 'true';
  });

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
        <p className="text-slate-400 font-medium z-10">{t('room_loading')}</p>
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
          <h2 className="text-2xl font-bold text-slate-200">{t('room_err_title')}</h2>
          <p className="text-slate-400 text-sm leading-relaxed">{error}</p>
          <button
            onClick={() => router.push(language === 'fr' ? '/fr' : '/')}
            className="w-full py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl transition-all cursor-pointer border border-slate-700"
          >
            {t('room_err_btn')}
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
        <div className="flex flex-col max-w-md mx-auto w-full mb-6 z-10 gap-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <span className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-400 tracking-tight">
                CAPTAIN BOND
              </span>
              <div className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 font-mono text-amber-400 font-bold tracking-widest text-sm shadow-[0_0_10px_rgba(245,158,11,0.15)]">
                {roomCode}
              </div>
            </div>
          </div>
          <div className="w-full p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl text-left">
            <p className="text-xs text-amber-400 font-mono font-bold uppercase tracking-wider mb-1.5">
              {language === 'fr' ? '3 étapes pour lancer la partie' : '3 steps to start the game'}
            </p>
            <ol className="text-xs text-slate-400 space-y-1 list-decimal list-inside leading-relaxed">
              <li>
                {language === 'fr'
                  ? 'Partagez le code ci-dessus à vos amis.'
                  : 'Share the code above with your friends.'}
              </li>
              <li>
                {language === 'fr'
                  ? 'Choisissez un mode adapté à votre groupe.'
                  : 'Pick a mode suited to your group.'}
              </li>
              <li>
                {language === 'fr'
                  ? "Attendez que tout le monde soit prêt, puis lancez la carte."
                  : 'Wait for everyone to be ready, then start the round.'}
              </li>
            </ol>
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
