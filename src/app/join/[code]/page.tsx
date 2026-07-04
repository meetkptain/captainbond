'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { BackgroundOrbs } from '@/components/BackgroundOrbs';
import { ConsentModal } from '@/components/ConsentModal';
import { Icon } from '@/components/Icon';
import { api, ApiClientError } from '@/lib/api/client';
import { capture, AnalyticsEvents } from '@/lib/analytics';

const content = {
  fr: {
    roomCodeLabel: "Code de la salle",
    blazeLabel: "Votre blaze / Prénom",
    blazePlaceholder: "Ex: Sophie",
    errorEmptyName: "Entrez votre prénom pour rejoindre la table.",
    continueBtn: "Continuer",
    spectatorOr: "Ou jeu sans manette",
    spectatorBtn: "Rejoindre en Spectateur (Bruitages & Emojis)",
    errorGeneric: "Une erreur est survenue.",
    consentModalTitle: "Consentement de participation",
  },
  en: {
    roomCodeLabel: "Room Code",
    blazeLabel: "Your Name / Nickname",
    blazePlaceholder: "E.g., Sophie",
    errorEmptyName: "Enter your first name to join the table.",
    continueBtn: "Continue",
    spectatorOr: "Or play without controller",
    spectatorBtn: "Join as Spectator (Sound effects & Emojis)",
    errorGeneric: "An error occurred.",
    consentModalTitle: "Participation Consent",
  }
};

export default function JoinRoomWithCode() {
  const params = useParams();
  const router = useRouter();
  const roomCode = (params.code as string).toUpperCase();

  const [lang, setLang] = useState<'fr' | 'en'>('en');
  const [playerName, setPlayerName] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConsent, setShowConsent] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    nameInputRef.current?.focus();
    
    // Autodetect language based on room configuration
    if (roomCode !== 'DEMO12') {
      fetch(`/api/room/info?roomCode=${roomCode}`)
        .then(res => {
          if (res.ok) return res.json();
          throw new Error('Not found');
        })
        .then(data => {
          if (data.language === 'fr' || data.language === 'en') {
            setLang(data.language);
          }
        })
        .catch(() => {});
    }
  }, [roomCode]);

  const t = content[lang];

  const handleSubmitName = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim()) {
      setError(t.errorEmptyName);
      return;
    }
    setError(null);
    setShowConsent(true);
  };

  const joinWithConsent = async (consent: boolean) => {
    setIsJoining(true);
    setError(null);

    try {
      if (roomCode === 'DEMO12') {
        sessionStorage.setItem(`player_${roomCode}`, JSON.stringify({
          id: 'player-demo-id',
          name: playerName.trim() || 'Reviewer',
        }));
        sessionStorage.setItem(`cb_consent_${roomCode}`, consent ? 'true' : 'false');
        router.push(`/room/${roomCode}/player`);
        return;
      }

      const data = await api.post<{ playerId: string; playerName: string }>('/api/room/join', {
        roomCode: roomCode,
        playerName: playerName.trim(),
        consent,
      });

      sessionStorage.setItem(`player_${roomCode}`, JSON.stringify({
        id: data.playerId,
        name: data.playerName,
      }));
      sessionStorage.setItem(`cb_consent_${roomCode}`, consent ? 'true' : 'false');
      capture(AnalyticsEvents.PLAYER_JOINED, { room_code: roomCode, consent });

      router.push(`/room/${roomCode}/player`);
    } catch (err) {
      console.error(err);
      setError(err instanceof ApiClientError ? err.message : t.errorGeneric);
      setIsJoining(false);
    }
  };

  if (showConsent) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 md:p-12 relative overflow-hidden bg-slate-950 text-white">
        <BackgroundOrbs />
        <ConsentModal
          playerName={playerName.trim()}
          onAccept={() => joinWithConsent(true)}
          onDecline={() => joinWithConsent(false)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-between p-6 md:p-12 relative overflow-hidden bg-slate-950 text-white">
      <BackgroundOrbs />

      <header className="text-center mt-8 mb-4">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-2 drop-shadow-2xl">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-purple to-neon-pink">
            CAPTAIN BOND
          </span>
        </h1>
        <p className="text-xs text-slate-500 font-mono tracking-widest uppercase mt-2">
          {t.roomCodeLabel}
        </p>
      </header>

      <main className="w-full max-w-md flex flex-col gap-6 z-10 flex-1 justify-center">
        <div className="glass-panel p-8 border-neon-purple/20 shadow-[0_0_50px_rgba(139,92,246,0.1)]">
          <div className="flex flex-col items-center text-center mb-6">
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">{t.roomCodeLabel}</span>
            <div className="px-6 py-2 rounded-2xl bg-neon-purple/10 border border-neon-purple/30 font-mono text-neon-purple font-black tracking-widest text-3xl shadow-[0_0_20px_rgba(139,92,246,0.2)]">
              {roomCode}
            </div>
          </div>

          <form onSubmit={handleSubmitName} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {t.blazeLabel}
              </label>
              <input
                ref={nameInputRef}
                type="text"
                placeholder={t.blazePlaceholder}
                maxLength={15}
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="cb-input text-center text-xl"
                disabled={isJoining}
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm font-medium text-center bg-red-400/10 border border-red-400/20 rounded-xl p-3">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isJoining}
              className="cb-btn-primary py-4 text-lg shadow-[0_0_30px_rgba(139,92,246,0.4)] border-none cursor-pointer w-full text-center"
            >
              {t.continueBtn}
            </button>
          </form>

          {/* Spectator Join separator & button */}
          <div className="flex flex-col items-center gap-4 mt-6 pt-6 border-t border-white/5">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono">
              {t.spectatorOr}
            </span>
            <button
              type="button"
              onClick={() => router.push(`/room/${roomCode}/spectator`)}
              className="w-full py-3.5 bg-slate-900/60 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-white font-bold text-sm rounded-xl transition-all cursor-pointer shadow-sm flex items-center justify-center gap-2"
            >
              <Icon name="volume" className="w-4 h-4" />
              <span>{t.spectatorBtn}</span>
            </button>
          </div>
        </div>
      </main>

      <footer className="mt-8 text-slate-600 text-xs font-mono">
        <p>CAPTAIN BOND © 2026</p>
      </footer>
    </div>
  );
}
