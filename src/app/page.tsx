'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { LandingLayout } from '@/components/landing/LandingLayout';
import { LandingButton } from '@/components/landing/LandingButton';
import { Section } from '@/components/landing/Section';
import { FeatureShowcase } from '@/components/landing/FeatureShowcase';
import { SoireeVisualMockup } from '@/components/landing/SoireeVisualMockup';
import { Testimonials } from '@/components/Testimonials';
import { Icon } from '@/components/Icon';
import { api, ApiClientError } from '@/lib/api/client';
import { capture, AnalyticsEvents } from '@/lib/analytics';

const AMBIENCES = [
  {
    id: 'ICEBREAKER',
    name: 'Icebreaker',
    icon: 'ice' as const,
    desc: 'Décoince la table en 3 questions.',
  },
  {
    id: 'SPICY',
    name: 'Spicy',
    icon: 'spicy' as const,
    desc: 'Débats, dilemmes et révélations inattendues.',
  },
  {
    id: 'DEEP_CONNECTION',
    name: 'Deep',
    icon: 'deep' as const,
    desc: 'Connexion sans filtre, sans chronomètre.',
  },
];

export default function Home() {
  const router = useRouter();
  const codeInputRef = useRef<HTMLInputElement>(null);
  const joinSectionRef = useRef<HTMLElement>(null);

  const [roomCode, setRoomCode] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [publicStats, setPublicStats] = useState<{ totalRooms: number; totalPlayers: number } | null>(null);

  useEffect(() => {
    codeInputRef.current?.focus();
    api.get<{ totalRooms: number; totalPlayers: number }>('/api/public/stats')
      .then(setPublicStats)
      .catch(() => setPublicStats(null));
  }, []);

  const handleRoomCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').trim();
    setRoomCode(val);
  };

  const handleJoinRoom = () => {
    if (roomCode.length === 4) {
      window.location.href = `/join/${roomCode}`;
    }
  };

  const handleCreateRoom = async () => {
    setIsCreating(true);
    setCreateError(null);
    try {
      const data = await api.post<{ roomCode: string; hostId: string; hostToken: string; status: string }>('/api/room/create');

      sessionStorage.setItem(`host_${data.roomCode}`, JSON.stringify({ hostId: data.hostId, hostToken: data.hostToken }));
      capture(AnalyticsEvents.ROOM_CREATED, { room_code: data.roomCode, source: 'landing_group' });
      router.push(`/room/${data.roomCode}`);
    } catch (err) {
      console.error(err);
      setCreateError(err instanceof ApiClientError ? err.message : 'Erreur lors de l\'ouverture du deck.');
      setIsCreating(false);
    }
  };

  return (
    <LandingLayout variant="soiree">
      {/* Hero */}
      <Section className="pt-10 md:pt-20">
        <div className="text-center space-y-8 max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.1]">
            Votre TV devient le plateau.<br />
            Vos smartphones les manettes.
          </h1>
          <p className="text-lg md:text-xl text-white/70 max-w-xl mx-auto leading-relaxed">
            Pas de cartes à distribuer, pas de règles compliquées. Connectez vos téléphones à l&apos;écran géant et découvrez vos amis sous un nouveau jour.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <LandingButton onClick={handleCreateRoom} disabled={isCreating}>
              {isCreating ? 'Création...' : 'Lancer une partie'}
            </LandingButton>
            <LandingButton
              variant="secondary"
              onClick={() => joinSectionRef.current?.scrollIntoView({ behavior: 'smooth' })}
            >
              Rejoindre une table
            </LandingButton>
          </div>
          {createError && (
            <p className="text-red-400 text-sm font-medium bg-red-400/10 border border-red-400/20 rounded-xl p-3 max-w-md mx-auto">
              {createError}
            </p>
          )}
        </div>
      </Section>

      {/* Visual Proof */}
      <Section compact>
        <SoireeVisualMockup />
      </Section>

      {/* How it works */}
      <Section>
        <div className="space-y-24 md:space-y-32">
          <FeatureShowcase
            step="01"
            title="La TV devient la table"
            description="Créez une salle sur l'écran principal. C'est le cœur de la soirée. Tous les joueurs voient la carte, le timer et le score."
            visual={
              <div className="aspect-video bg-[#0a0f1e] rounded-2xl border border-white/10 flex items-center justify-center">
                <Icon name="tv" className="w-20 h-20 text-white/20" />
              </div>
            }
          />
          <FeatureShowcase
            step="02"
            title="Scannez le QR code"
            description="Chaque joueur rejoint en scannant le code depuis son téléphone. Pas d'application à installer."
            visual={
              <div className="aspect-video bg-[#0a0f1e] rounded-2xl border border-white/10 flex items-center justify-center">
                <Icon name="qrCode" className="w-20 h-20 text-white/20" />
              </div>
            }
            reverse
          />
          <FeatureShowcase
            step="03"
            title="Captain choisit les cartes"
            description="Icebreaker, Spicy, Deep : l'ambiance s'adapte à votre table. Vous n'avez qu'à jouer."
            visual={
              <div className="aspect-video bg-[#0a0f1e] rounded-2xl border border-white/10 flex items-center justify-center">
                <Icon name="gamepad" className="w-20 h-20 text-white/20" />
              </div>
            }
          />
        </div>
      </Section>

      {/* Join Section */}
      <Section ref={joinSectionRef} id="join-section" compact className="bg-white/[0.02]">
        <div className="max-w-xl mx-auto text-center space-y-6">
          <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
            Rejoindre une table
          </h2>
          <p className="text-white/60">
            Entrez le code secret à 4 caractères affiché sur l&apos;écran TV pour utiliser votre smartphone.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleJoinRoom();
            }}
            className="relative max-w-xs mx-auto flex flex-col sm:flex-row gap-3"
          >
            <div className="relative flex-1">
              <input
                ref={codeInputRef}
                type="text"
                placeholder="CODE"
                maxLength={4}
                value={roomCode}
                onChange={handleRoomCodeChange}
                className="w-full text-center font-black tracking-widest text-2xl text-white bg-white/5 border border-white/10 focus:border-white/30 focus:outline-none rounded-2xl p-4 placeholder-white/20 transition-colors uppercase"
                disabled={isCreating}
              />
              {roomCode.length === 4 && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center">
                  <span className="w-2 h-2 rounded-full bg-white" />
                </div>
              )}
            </div>
            <LandingButton
              type="submit"
              disabled={roomCode.length !== 4 || isCreating}
              className="px-6 py-4"
            >
              Rejoindre
            </LandingButton>
          </form>
          {publicStats && (
            <p className="text-xs font-mono text-white/40 uppercase tracking-wider">
              {publicStats.totalRooms.toLocaleString('fr-FR')} tables ouvertes · {publicStats.totalPlayers.toLocaleString('fr-FR')} joueurs
            </p>
          )}
        </div>
      </Section>

      {/* Ambiances */}
      <Section compact>
        <div className="text-center space-y-10">
          <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
            Choisissez l&apos;ambiance
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {AMBIENCES.map((mode) => (
              <div
                key={mode.id}
                className="flex items-start gap-4 p-5 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-white/20 transition-colors"
              >
                <div className="p-2.5 rounded-xl bg-white/5">
                  <Icon name={mode.icon} className="w-5 h-5 text-white/80" />
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-white">{mode.name}</h3>
                  <p className="text-sm text-white/60 leading-relaxed">{mode.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Testimonials */}
      <Section>
        <div className="text-center space-y-10">
          <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
            Ils ont joué avec Captain Bond
          </h2>
          <Testimonials />
        </div>
      </Section>
    </LandingLayout>
  );
}
