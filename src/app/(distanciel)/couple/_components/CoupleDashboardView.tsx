'use client';

import { useRouter } from 'next/navigation';
import { BackgroundOrbs } from '@/components/BackgroundOrbs';
import { CoupleLanding } from '@/components/couple/CoupleLanding';
import { ThemeLabel } from '@/components/couple/ThemeLabel';
import { Icon } from '@/components/Icon';
import { AuthModal } from '@/components/AuthModal';
import { useCoupleData, useDashboardUIState, useDashboardUISetters } from '../_hooks/useCoupleDashboardContext';
import { TodayRitualCard } from './TodayRitualCard';
import { StatsColumn } from './StatsColumn';
import { OnboardingInvite } from './OnboardingInvite';

interface CoupleDashboardViewProps {
  defaultLang?: 'fr' | 'en';
}

export function CoupleDashboardView({ defaultLang = 'en' }: CoupleDashboardViewProps) {
  const router = useRouter();
  const { loading, error, userId, couple, todayQuestion } = useCoupleData();
  const { showAuthModal } = useDashboardUIState();
  const { setShowAuthModal } = useDashboardUISetters();

  // ─── Render: Loading ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="couple-page">
        <BackgroundOrbs />
        <div className="couple-container">
          <div className="couple-empty">
            <div className="couple-spinner" />
            <p className="couple-empty-text">Chargement de votre espace couple…</p>
          </div>
        </div>
      </div>
    );
  }

  // ─── Render: Public Landing Page if not authenticated ───────────────────
  if (!userId) {
    return (
      <>
        <CoupleLanding defaultLang={defaultLang} onStartAuth={() => setShowAuthModal(true)} />
        <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      </>
    );
  }

  // ─── Render: Onboarding Invite ───────────────────────────────────────────
  if (error && error.includes('Aucun espace couple') && !couple) {
    return <OnboardingInvite />;
  }

  // ─── Render: Error ────────────────────────────────────────────────────────
  if (error && !couple) {
    return (
      <div className="couple-page">
        <BackgroundOrbs />
        <div className="couple-container">
          <div className="couple-card couple-empty">
            <span className="couple-empty-icon">
              <Icon name="heartCrack" className="w-8 h-8" />
            </span>
            <p className="couple-empty-text">{error}</p>
            <button className="couple-action-btn" onClick={() => router.push('/')}>
              Retour à l&apos;accueil
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="couple-page">
      <BackgroundOrbs />

      <div className="couple-container">
        {/* Header */}
        <header className="couple-header">
          <div className="couple-brand">
            <span className="couple-brand-name">CAPTAIN BOND</span>
            <span className="couple-badge">Espace Couple</span>
            {todayQuestion?.theme && <ThemeLabel theme={todayQuestion.theme} className="ml-2" />}
          </div>
          <button className="couple-back-link min-h-[44px] min-w-[44px] flex items-center justify-center px-3 py-1 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors duration-200" onClick={() => router.push('/')}>
            <Icon name="arrowLeft" className="w-4 h-4 mr-1 text-slate-300" /> <span className="text-slate-300 text-sm font-medium">Retour</span>
          </button>
        </header>

        {/* Greeting */}
        <section className="couple-greeting">
          <h1>Miroir Relationnel</h1>
          <p>Votre rendez-vous quotidien pour comprendre, ressentir et grandir ensemble.</p>
        </section>

        {/* Main Grid */}
        <div className="couple-grid">
          {/* ═══ Left Column: Today&apos;s Ritual ═══ */}
          <TodayRitualCard />

          {/* ═══ Right Column: Stats & Timeline ═══ */}
          <StatsColumn />
        </div>
      </div>
    </div>
  );
}
