'use client';

import { createContext, useContext, useMemo, ReactNode } from 'react';
import { useCoupleDashboard } from './useCoupleDashboard';

type DashboardState = ReturnType<typeof useCoupleDashboard>;

// ─── CoupleDataContext ────────────────────────────────────────────────────────
interface CoupleDataContextValue {
  loading: DashboardState['loading'];
  error: DashboardState['error'];
  userId: DashboardState['userId'];
  couple: DashboardState['couple'];
  todayQuestion: DashboardState['todayQuestion'];
  dailyQuestions: DashboardState['dailyQuestions'];
  pastQuestions: DashboardState['pastQuestions'];
  portraits: DashboardState['portraits'];
  totemState: DashboardState['totemState'];
  entitlements: DashboardState['entitlements'];
  timeCapsules: DashboardState['timeCapsules'];
  isUser1: DashboardState['isUser1'];
  partnerName: DashboardState['partnerName'];
  myName: DashboardState['myName'];
  hasMyAnswer: DashboardState['hasMyAnswer'];
  hasPartnerAnswer: DashboardState['hasPartnerAnswer'];
  bothAnswered: DashboardState['bothAnswered'];
  hasMyMood: DashboardState['hasMyMood'];
  streak: DashboardState['streak'];
}

const CoupleDataContext = createContext<CoupleDataContextValue | null>(null);

export function useCoupleData(): CoupleDataContextValue {
  const context = useContext(CoupleDataContext);
  if (!context) {
    throw new Error('useCoupleData must be used within CoupleDashboardProvider');
  }
  return context;
}

// ─── DashboardActionsContext ──────────────────────────────────────────────────
interface DashboardActionsContextValue {
  submitAnswer: DashboardState['submitAnswer'];
  submitCouchAnswers: DashboardState['submitCouchAnswers'];
  submitMood: DashboardState['submitMood'];
  skipQuestion: DashboardState['skipQuestion'];
  toggleSafeZone: DashboardState['toggleSafeZone'];
  triggerReveal: DashboardState['triggerReveal'];
  revealNow: DashboardState['revealNow'];
}

const DashboardActionsContext = createContext<DashboardActionsContextValue | null>(null);

export function useDashboardActions(): DashboardActionsContextValue {
  const context = useContext(DashboardActionsContext);
  if (!context) {
    throw new Error('useDashboardActions must be used within CoupleDashboardProvider');
  }
  return context;
}

// ─── DashboardUIStateContext ──────────────────────────────────────────────────
interface DashboardUIStateContextValue {
  answer: DashboardState['answer'];
  submitting: DashboardState['submitting'];
  submitted: DashboardState['submitted'];
  showProtocol: DashboardState['showProtocol'];
  selectedQuestion: DashboardState['selectedQuestion'];
  revealAnimation: DashboardState['revealAnimation'];
  isCouchMode: DashboardState['isCouchMode'];
  showAuthModal: DashboardState['showAuthModal'];
  moodEnergy: DashboardState['moodEnergy'];
  moodStress: DashboardState['moodStress'];
  moodFeeling: DashboardState['moodFeeling'];
  submittingMood: DashboardState['submittingMood'];
}

const DashboardUIStateContext = createContext<DashboardUIStateContextValue | null>(null);

export function useDashboardUIState(): DashboardUIStateContextValue {
  const context = useContext(DashboardUIStateContext);
  if (!context) {
    throw new Error('useDashboardUIState must be used within CoupleDashboardProvider');
  }
  return context;
}

// ─── DashboardUISettersContext ────────────────────────────────────────────────
interface DashboardUISettersContextValue {
  setAnswer: DashboardState['setAnswer'];
  setShowProtocol: DashboardState['setShowProtocol'];
  setSelectedQuestion: DashboardState['setSelectedQuestion'];
  setRevealAnimation: DashboardState['setRevealAnimation'];
  setIsCouchMode: DashboardState['setIsCouchMode'];
  setShowAuthModal: DashboardState['setShowAuthModal'];
  setMoodEnergy: DashboardState['setMoodEnergy'];
  setMoodStress: DashboardState['setMoodStress'];
  setMoodFeeling: DashboardState['setMoodFeeling'];
}

const DashboardUISettersContext = createContext<DashboardUISettersContextValue | null>(null);

export function useDashboardUISetters(): DashboardUISettersContextValue {
  const context = useContext(DashboardUISettersContext);
  if (!context) {
    throw new Error('useDashboardUISetters must be used within CoupleDashboardProvider');
  }
  return context;
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export function CoupleDashboardProvider({ children }: { children: ReactNode }) {
  const dashboard = useCoupleDashboard();

  const dataValue = useMemo<CoupleDataContextValue>(
    () => ({
      loading: dashboard.loading,
      error: dashboard.error,
      userId: dashboard.userId,
      couple: dashboard.couple,
      todayQuestion: dashboard.todayQuestion,
      dailyQuestions: dashboard.dailyQuestions,
      pastQuestions: dashboard.pastQuestions,
      portraits: dashboard.portraits,
      totemState: dashboard.totemState,
      entitlements: dashboard.entitlements,
      timeCapsules: dashboard.timeCapsules,
      isUser1: dashboard.isUser1,
      partnerName: dashboard.partnerName,
      myName: dashboard.myName,
      hasMyAnswer: dashboard.hasMyAnswer,
      hasPartnerAnswer: dashboard.hasPartnerAnswer,
      bothAnswered: dashboard.bothAnswered,
      hasMyMood: dashboard.hasMyMood,
      streak: dashboard.streak,
    }),
    [
      dashboard.loading,
      dashboard.error,
      dashboard.userId,
      dashboard.couple,
      dashboard.todayQuestion,
      dashboard.dailyQuestions,
      dashboard.pastQuestions,
      dashboard.portraits,
      dashboard.totemState,
      dashboard.entitlements,
      dashboard.timeCapsules,
      dashboard.isUser1,
      dashboard.partnerName,
      dashboard.myName,
      dashboard.hasMyAnswer,
      dashboard.hasPartnerAnswer,
      dashboard.bothAnswered,
      dashboard.hasMyMood,
      dashboard.streak,
    ]
  );

  const actionsValue = useMemo<DashboardActionsContextValue>(
    () => ({
      submitAnswer: dashboard.submitAnswer,
      submitCouchAnswers: dashboard.submitCouchAnswers,
      submitMood: dashboard.submitMood,
      skipQuestion: dashboard.skipQuestion,
      toggleSafeZone: dashboard.toggleSafeZone,
      triggerReveal: dashboard.triggerReveal,
      revealNow: dashboard.revealNow,
    }),
    [
      dashboard.submitAnswer,
      dashboard.submitCouchAnswers,
      dashboard.submitMood,
      dashboard.skipQuestion,
      dashboard.toggleSafeZone,
      dashboard.triggerReveal,
      dashboard.revealNow,
    ]
  );

  const uiStateValue = useMemo<DashboardUIStateContextValue>(
    () => ({
      answer: dashboard.answer,
      submitting: dashboard.submitting,
      submitted: dashboard.submitted,
      showProtocol: dashboard.showProtocol,
      selectedQuestion: dashboard.selectedQuestion,
      revealAnimation: dashboard.revealAnimation,
      isCouchMode: dashboard.isCouchMode,
      showAuthModal: dashboard.showAuthModal,
      moodEnergy: dashboard.moodEnergy,
      moodStress: dashboard.moodStress,
      moodFeeling: dashboard.moodFeeling,
      submittingMood: dashboard.submittingMood,
    }),
    [
      dashboard.answer,
      dashboard.submitting,
      dashboard.submitted,
      dashboard.showProtocol,
      dashboard.selectedQuestion,
      dashboard.revealAnimation,
      dashboard.isCouchMode,
      dashboard.showAuthModal,
      dashboard.moodEnergy,
      dashboard.moodStress,
      dashboard.moodFeeling,
      dashboard.submittingMood,
    ]
  );

  const uiSettersValue = useMemo<DashboardUISettersContextValue>(
    () => ({
      setAnswer: dashboard.setAnswer,
      setShowProtocol: dashboard.setShowProtocol,
      setSelectedQuestion: dashboard.setSelectedQuestion,
      setRevealAnimation: dashboard.setRevealAnimation,
      setIsCouchMode: dashboard.setIsCouchMode,
      setShowAuthModal: dashboard.setShowAuthModal,
      setMoodEnergy: dashboard.setMoodEnergy,
      setMoodStress: dashboard.setMoodStress,
      setMoodFeeling: dashboard.setMoodFeeling,
    }),
    [
      dashboard.setAnswer,
      dashboard.setShowProtocol,
      dashboard.setSelectedQuestion,
      dashboard.setRevealAnimation,
      dashboard.setIsCouchMode,
      dashboard.setShowAuthModal,
      dashboard.setMoodEnergy,
      dashboard.setMoodStress,
      dashboard.setMoodFeeling,
    ]
  );

  return (
    <CoupleDataContext.Provider value={dataValue}>
      <DashboardActionsContext.Provider value={actionsValue}>
        <DashboardUIStateContext.Provider value={uiStateValue}>
          <DashboardUISettersContext.Provider value={uiSettersValue}>
            {children}
          </DashboardUISettersContext.Provider>
        </DashboardUIStateContext.Provider>
      </DashboardActionsContext.Provider>
    </CoupleDataContext.Provider>
  );
}
