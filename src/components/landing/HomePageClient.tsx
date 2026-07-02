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

const content = {
  fr: {
    heroTitle: <>Votre TV devient le plateau.<br />Vos smartphones les manettes.</>,
    heroDesc: "Pas de cartes à distribuer, pas de règles compliquées. Connectez vos téléphones à l'écran géant et découvrez vos amis sous un nouveau jour.",
    launchBtn: "Lancer une partie",
    launchingBtn: "Création...",
    joinBtn: "Rejoindre une table",
    createError: "Erreur lors de l'ouverture du deck.",
    step1Title: "La TV devient la table",
    step1Desc: "Créez une salle sur l'écran principal. C'est le cœur de la soirée. Tous les joueurs voient la carte, le timer et le score.",
    step2Title: "Scannez le QR code",
    step2Desc: "Chaque joueur rejoint en scannant le code depuis son téléphone. Pas d'application à installer.",
    step3Title: "Captain choisit les cartes",
    step3Desc: "Icebreaker, Spicy, Deep : l'ambiance s'adapte à votre table. Vous n'avez qu'à jouer.",
    joinTitle: "Rejoindre une table",
    joinDesc: "Entrez le code secret à 4 caractères affiché sur l'écran TV pour utiliser votre smartphone.",
    joinSubmitBtn: "Rejoindre",
    tablesActive: "tables ouvertes",
    playersActive: "joueurs",
    ambiencesTitle: "Choisissez l'ambiance",
    ambiences: [
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
    ],
    testimonialsTitle: "Ils ont joué avec Captain Bond"
  },
  en: {
    heroTitle: <>Your TV is the board.<br />Your smartphones are the controllers.</>,
    heroDesc: "No cards to deal, no complicated rules. Connect your phones to the big screen and discover your friends in a whole new light.",
    launchBtn: "Launch a Game",
    launchingBtn: "Creating...",
    joinBtn: "Join a Table",
    createError: "Error opening the deck.",
    step1Title: "The TV is the table",
    step1Desc: "Create a room on the main screen. This is the heart of the party. All players see the card, the timer, and the score.",
    step2Title: "Scan the QR code",
    step2Desc: "Each player joins by scanning the code from their phone. No app to install.",
    step3Title: "Captain picks the cards",
    step3Desc: "Icebreaker, Spicy, Deep: the vibe adapts to your table. You just have to play.",
    joinTitle: "Join a Table",
    joinDesc: "Enter the 4-character secret code displayed on the TV screen to use your smartphone.",
    joinSubmitBtn: "Join",
    tablesActive: "active tables",
    playersActive: "players",
    ambiencesTitle: "Pick the Vibe",
    ambiences: [
      {
        id: 'ICEBREAKER',
        name: 'Icebreaker',
        icon: 'ice' as const,
        desc: 'Loosens up the table in 3 questions.',
      },
      {
        id: 'SPICY',
        name: 'Spicy',
        icon: 'spicy' as const,
        desc: 'Debates, dilemmas and unexpected revelations.',
      },
      {
        id: 'DEEP_CONNECTION',
        name: 'Deep',
        icon: 'deep' as const,
        desc: 'Unfiltered connection, no timers.',
      },
    ],
    testimonialsTitle: "They played Captain Bond"
  }
};

export default function HomePageClient({ defaultLang = 'en' }: { defaultLang?: 'fr' | 'en' }) {
  const router = useRouter();
  const codeInputRef = useRef<HTMLInputElement>(null);
  const joinSectionRef = useRef<HTMLElement>(null);

  const [lang, setLang] = useState<'fr' | 'en'>(defaultLang);
  const [roomCode, setRoomCode] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [publicStats, setPublicStats] = useState<{ totalRooms: number; totalPlayers: number } | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isFr = window.location.pathname.startsWith('/fr');
      setLang(isFr ? 'fr' : 'en');
    }
    codeInputRef.current?.focus();
    api.get<{ totalRooms: number; totalPlayers: number }>('/api/public/stats')
      .then(setPublicStats)
      .catch(() => setPublicStats(null));
  }, []);

  const t = content[lang];

  const handleRoomCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').trim();
    setRoomCode(val);
  };

  const handleJoinRoom = () => {
    if (roomCode.length === 4 || roomCode === 'DEMO12') {
      window.location.href = `/join/${roomCode}`;
    }
  };

  const handleCreateRoom = async () => {
    setIsCreating(true);
    setCreateError(null);
    try {
      const data = await api.post<{ roomCode: string; hostId: string; hostToken: string; status: string }>('/api/room/create', {
        language: lang,
      });

      sessionStorage.setItem(`host_${data.roomCode}`, JSON.stringify({ hostId: data.hostId, hostToken: data.hostToken }));
      capture(AnalyticsEvents.ROOM_CREATED, { room_code: data.roomCode, source: 'landing_group' });
      router.push(`/room/${data.roomCode}`);
    } catch (err) {
      console.error(err);
      setCreateError(err instanceof ApiClientError ? err.message : t.createError);
      setIsCreating(false);
    }
  };

  return (
    <LandingLayout variant="soiree">
      {/* Hero */}
      <Section className="pt-10 md:pt-20">
        <div className="text-center space-y-8 max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.1]">
            {t.heroTitle}
          </h1>
          <p className="text-lg md:text-xl text-white/70 max-w-xl mx-auto leading-relaxed">
            {t.heroDesc}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <LandingButton onClick={handleCreateRoom} disabled={isCreating}>
              {isCreating ? t.launchingBtn : t.launchBtn}
            </LandingButton>
            <LandingButton
              variant="secondary"
              onClick={() => joinSectionRef.current?.scrollIntoView({ behavior: 'smooth' })}
            >
              {t.joinBtn}
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
            title={t.step1Title}
            description={t.step1Desc}
            visual={
              <div className="aspect-video bg-[#0a0f1e] rounded-2xl border border-white/10 flex items-center justify-center">
                <Icon name="tv" className="w-20 h-20 text-white/20" />
              </div>
            }
          />
          <FeatureShowcase
            step="02"
            title={t.step2Title}
            description={t.step2Desc}
            visual={
              <div className="aspect-video bg-[#0a0f1e] rounded-2xl border border-white/10 flex items-center justify-center">
                <Icon name="qrCode" className="w-20 h-20 text-white/20" />
              </div>
            }
            reverse
          />
          <FeatureShowcase
            step="03"
            title={t.step3Title}
            description={t.step3Desc}
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
            {t.joinTitle}
          </h2>
          <p className="text-white/60">
            {t.joinDesc}
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
                maxLength={6}
                value={roomCode}
                onChange={handleRoomCodeChange}
                className="w-full text-center font-black tracking-widest text-2xl text-white bg-white/5 border border-white/10 focus:border-white/30 focus:outline-none rounded-2xl p-4 placeholder-white/20 transition-colors uppercase"
                disabled={isCreating}
              />
              {(roomCode.length === 4 || roomCode === 'DEMO12') && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center">
                  <span className="w-2 h-2 rounded-full bg-white" />
                </div>
              )}
            </div>
            <LandingButton
              type="submit"
              disabled={(roomCode.length !== 4 && roomCode !== 'DEMO12') || isCreating}
              className="px-6 py-4"
            >
              {t.joinSubmitBtn}
            </LandingButton>
          </form>
          {publicStats && (
            <p className="text-xs font-mono text-white/40 uppercase tracking-wider">
              {publicStats.totalRooms.toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-US')} {t.tablesActive} · {publicStats.totalPlayers.toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-US')} {t.playersActive}
            </p>
          )}
        </div>
      </Section>

      {/* Ambiances */}
      <Section compact>
        <div className="text-center space-y-10">
          <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
            {t.ambiencesTitle}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {t.ambiences.map((mode) => (
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
            {t.testimonialsTitle}
          </h2>
          <Testimonials defaultLang={lang} />
        </div>
      </Section>
    </LandingLayout>
  );
}
