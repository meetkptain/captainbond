'use client';

import { useEffect, useMemo, useState } from 'react';
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
import { OnboardingChecklist } from './OnboardingChecklist';
import { getOnboardingCurrentDay } from '@/lib/couple/onboarding';
import { CouplePaywall } from '@/components/couple/CouplePaywall';

interface CoupleDashboardViewProps {
  defaultLang?: 'fr' | 'en';
}

const ONBOARDING_STORAGE_KEY = 'captainbond:onboarding-dismissed';

export function CoupleDashboardView({ defaultLang = 'en' }: CoupleDashboardViewProps) {
  const router = useRouter();
  const { loading, error, userId, couple, todayQuestion, dailyQuestions, totemState, entitlements, timeCapsules } = useCoupleData();
  const { showAuthModal } = useDashboardUIState();
  const { setShowAuthModal } = useDashboardUISetters();

  const [onboardingDismissed, setOnboardingDismissed] = useState(false);

  useEffect(() => {
    if (!couple?.id) return;
    try {
      const stored = localStorage.getItem(`${ONBOARDING_STORAGE_KEY}:${couple.id}`);
      if (stored === 'true') setOnboardingDismissed(true);
    } catch {
      // ignore localStorage errors
    }
  }, [couple?.id]);

  const currentDay = useMemo(() => getOnboardingCurrentDay(couple?.createdAt), [couple?.createdAt]);
  const revealedCount = useMemo(
    () => dailyQuestions.filter((q) => q.isRevealed).length + (todayQuestion?.isRevealed ? 1 : 0),
    [dailyQuestions, todayQuestion]
  );
  const showPaywall = revealedCount >= 3 || currentDay >= 7;

  const completedDays = useMemo(() => {
    const completed: number[] = [];
    if (!couple) return completed;

    // Day 1: couple is linked when both user ids are present
    if (couple.user1Id && couple.user2Id) completed.push(1);

    // Day 2: any answer submitted by either partner
    const anyAnswered =
      todayQuestion?.user1Answered ||
      todayQuestion?.user2Answered ||
      dailyQuestions.some((q) => q.user1Answered || q.user2Answered);
    if (anyAnswered) completed.push(2);

    // Day 3: a reveal has been seen
    const anyRevealed =
      todayQuestion?.isRevealed || dailyQuestions.some((q) => q.isRevealed);
    if (anyRevealed) completed.push(3);

    // Day 4: totem has been interacted with / loaded
    if (totemState) completed.push(4);

    // Day 5: at least one TimeCapsule has been sealed
    if (timeCapsules.length > 0) completed.push(5);

    // Day 6: a themed pack has been encountered
    const hasThemePack =
      todayQuestion?.theme || dailyQuestions.some((q) => q.theme);
    if (hasThemePack) completed.push(6);

    // Day 7: an active Premium pass or subscription exists
    if (entitlements?.hasActivePass || entitlements?.hasActiveSubscription) completed.push(7);

    return completed;
  }, [couple, todayQuestion, dailyQuestions, totemState, entitlements, timeCapsules]);

  const dismissOnboarding = () => {
    setOnboardingDismissed(true);
    if (!couple?.id) return;
    try {
      localStorage.setItem(`${ONBOARDING_STORAGE_KEY}:${couple.id}`, 'true');
    } catch {
      // ignore localStorage errors
    }
  };

  const showOnboarding = !onboardingDismissed && couple?.createdAt && currentDay <= 7;

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
          <div className="flex items-center gap-2">
            <button
              className="couple-back-link min-h-[44px] min-w-[44px] flex items-center justify-center px-3 py-1 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors duration-200"
              onClick={() => router.push('/couple/archive?coupleId=' + encodeURIComponent(couple?.id ?? ''))}
              disabled={!couple?.id}
            >
              <Icon name="bookOpen" className="w-4 h-4 mr-1 text-slate-300" />
              <span className="text-slate-300 text-sm font-medium">Journal</span>
            </button>
            <button className="couple-back-link min-h-[44px] min-w-[44px] flex items-center justify-center px-3 py-1 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors duration-200" onClick={() => router.push('/')}>
              <Icon name="arrowLeft" className="w-4 h-4 mr-1 text-slate-300" /> <span className="text-slate-300 text-sm font-medium">Retour</span>
            </button>
          </div>
        </header>

        {/* Greeting */}
        <section className="couple-greeting">
          <h1>Miroir Relationnel</h1>
          <p>Votre rendez-vous quotidien pour comprendre, ressentir et grandir ensemble.</p>
        </section>

        {/* Onboarding Checklist */}
        {showOnboarding && (
          <div className="relative">
            <button
              type="button"
              onClick={dismissOnboarding}
              className="absolute top-3 right-3 p-1.5 text-slate-400 hover:text-slate-200 hover:bg-white/5 rounded-lg transition-colors z-10"
              aria-label={defaultLang === 'en' ? 'Hide onboarding' : 'Masquer l\'onboarding'}
            >
              <Icon name="x" className="w-4 h-4" />
            </button>
            <OnboardingChecklist
              currentDay={currentDay}
              completedDays={completedDays}
              lang={defaultLang}
            />
          </div>
        )}

        {/* Main Grid */}
        <div className="couple-grid">
          {/* ═══ Left Column: Today&apos;s Ritual ═══ */}
          <TodayRitualCard />

          {/* ═══ Right Column: Stats & Timeline ═══ */}
          <StatsColumn currentDay={currentDay} revealedCount={revealedCount} />
        </div>

        {/* Premium paywall — shown only after 3 reveals or after day 7 */}
        {couple && showPaywall && !entitlements?.hasActivePass && !entitlements?.hasActiveSubscription && (
          <section className="mt-8">
            <CouplePaywall
              coupleId={couple.id}
              passExpiresAt={entitlements?.passExpiresAt ?? null}
              successUrl="/couple?paid=premium"
              cancelUrl="/couple"
            />
          </section>
        )}
      </div>
    </div>
  );
}
