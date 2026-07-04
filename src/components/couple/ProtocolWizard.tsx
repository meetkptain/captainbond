'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api/client';

/* ────────────────────────────── Types ────────────────────────────── */

interface AnalysisData {
  alignmentScore: number;
  resonanceInsight: string;
  partnerAProfile: { traits: string[] };
  partnerBProfile: { traits: string[] };
  actionSuggestion: string;
}

interface ProtocolWizardProps {
  coupleId: string;
  dailyQuestionId: string;
  analysisData: AnalysisData;
  onComplete: () => void;
  partnerAName?: string;
  partnerBName?: string;
}

interface ProtocolQuestion {
  id: string;
  text: string;
  category: string;
}

interface ProtocolAction {
  text: string;
  difficulty: 'facile' | 'moyen' | 'engagé';
}

/* ────────────────────────────── Constants ────────────────────────────── */

const STEPS = [
  { key: 'comprendre', icon: 'M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z', label: 'Comprendre' },
  { key: 'questionner', icon: 'M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z', label: 'Questionner' },
  { key: 'agir', icon: 'M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z', label: 'Agir' },
] as const;

const DIFFICULTY_STYLES: Record<string, string> = {
  facile: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  moyen: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  engagé: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
};

/* ────────────────────────────── Styles ────────────────────────────── */

const keyframes = `
@keyframes pw-slide-in-right {
  from { transform: translateX(40px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}
@keyframes pw-slide-in-left {
  from { transform: translateX(-40px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}
@keyframes pw-fade-in-up {
  from { transform: translateY(16px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
@keyframes pw-skeleton {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
@keyframes pw-confetti-1 {
  0% { transform: translate(0,0) rotate(0deg) scale(1); opacity: 1; }
  100% { transform: translate(80px,-120px) rotate(360deg) scale(0); opacity: 0; }
}
@keyframes pw-confetti-2 {
  0% { transform: translate(0,0) rotate(0deg) scale(1); opacity: 1; }
  100% { transform: translate(-60px,-140px) rotate(-270deg) scale(0); opacity: 0; }
}
@keyframes pw-confetti-3 {
  0% { transform: translate(0,0) rotate(0deg) scale(1); opacity: 1; }
  100% { transform: translate(40px,-100px) rotate(180deg) scale(0); opacity: 0; }
}
@keyframes pw-confetti-4 {
  0% { transform: translate(0,0) rotate(0deg) scale(1); opacity: 1; }
  100% { transform: translate(-90px,-90px) rotate(-360deg) scale(0); opacity: 0; }
}
@keyframes pw-confetti-5 {
  0% { transform: translate(0,0) rotate(0deg) scale(1); opacity: 1; }
  100% { transform: translate(70px,-80px) rotate(270deg) scale(0); opacity: 0; }
}
@keyframes pw-confetti-6 {
  0% { transform: translate(0,0) rotate(0deg) scale(1); opacity: 1; }
  100% { transform: translate(-40px,-130px) rotate(-180deg) scale(0); opacity: 0; }
}
@keyframes pw-check-draw {
  0% { stroke-dashoffset: 24; }
  100% { stroke-dashoffset: 0; }
}
`;

/* ────────────────────────────── Sub-components ────────────────────────────── */

function Skeleton({ width = '100%', height = '1rem' }: { width?: string; height?: string }) {
  return (
    <div
      className="rounded-xl"
      style={{
        width,
        height,
        background: 'linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%)',
        backgroundSize: '200% 100%',
        animation: 'pw-skeleton 1.8s ease-in-out infinite',
      }}
    />
  );
}

function ConfettiEffect() {
  const particles = [
    { color: '#fb7185', anim: 'pw-confetti-1', delay: '0s' },
    { color: '#f59e0b', anim: 'pw-confetti-2', delay: '0.1s' },
    { color: '#c084fc', anim: 'pw-confetti-3', delay: '0.05s' },
    { color: '#38bdf8', anim: 'pw-confetti-4', delay: '0.15s' },
    { color: '#34d399', anim: 'pw-confetti-5', delay: '0.08s' },
    { color: '#fb923c', anim: 'pw-confetti-6', delay: '0.12s' },
    { color: '#f472b6', anim: 'pw-confetti-1', delay: '0.2s' },
    { color: '#a78bfa', anim: 'pw-confetti-3', delay: '0.18s' },
  ];

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden" aria-hidden="true">
      {particles.map((p, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 rounded-full"
          style={{
            backgroundColor: p.color,
            animation: `${p.anim} 1.2s ease-out ${p.delay} forwards`,
          }}
        />
      ))}
    </div>
  );
}

/* ────────────────────────────── Main Component ────────────────────────────── */

export function ProtocolWizard({
  coupleId,
  dailyQuestionId,
  analysisData,
  onComplete,
  partnerAName = 'Partenaire A',
  partnerBName = 'Partenaire B',
}: ProtocolWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState<'right' | 'left'>('right');
  const [questions, setQuestions] = useState<ProtocolQuestion[]>([]);
  const [action, setAction] = useState<ProtocolAction | null>(null);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch questions when entering step 2
  const fetchQuestions = useCallback(async () => {
    if (questions.length > 0) return;
    setLoadingQuestions(true);
    setError(null);
    try {
      const data = await api.post<{ questions: ProtocolQuestion[] }>('/api/couple/protocol', {
        coupleId,
        dailyQuestionId,
        step: 'questions',
      });
      setQuestions(data.questions ?? []);
    } catch {
      setError('Impossible de charger les questions. Réessayez.');
    } finally {
      setLoadingQuestions(false);
    }
  }, [coupleId, dailyQuestionId, questions.length]);

  // Fetch action when entering step 3
  const fetchAction = useCallback(async () => {
    if (action) return;
    setLoadingAction(true);
    setError(null);
    try {
      const data = await api.post<{ action: ProtocolAction }>('/api/couple/protocol', {
        coupleId,
        dailyQuestionId,
        step: 'action',
      });
      setAction(data.action ?? null);
    } catch {
      setError('Impossible de charger l\'action. Réessayez.');
    } finally {
      setLoadingAction(false);
    }
  }, [coupleId, dailyQuestionId, action]);

  useEffect(() => {
    if (currentStep === 1) {
      setTimeout(() => fetchQuestions(), 0);
    }
    if (currentStep === 2) {
      setTimeout(() => fetchAction(), 0);
    }
  }, [currentStep, fetchQuestions, fetchAction]);

  const goNext = () => {
    if (currentStep < STEPS.length - 1) {
      setDirection('right');
      setCurrentStep((s) => s + 1);
    }
  };

  const goPrev = () => {
    if (currentStep > 0) {
      setDirection('left');
      setCurrentStep((s) => s - 1);
    }
  };

  const handleComplete = () => {
    setCompleted(true);
    setTimeout(() => onComplete(), 1800);
  };

  /* ── Progress bar ── */
  const progress = ((currentStep + 1) / STEPS.length) * 100;

  /* ── Slide animation ── */
  const slideAnim = direction === 'right' ? 'pw-slide-in-right' : 'pw-slide-in-left';

  return (
    <div className="w-full max-w-lg mx-auto">
      <style>{keyframes}</style>

      {/* Glass container */}
      <div className="relative bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 md:p-8 overflow-hidden">
        {/* ── Progress bar ── */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            {STEPS.map((step, i) => (
              <button
                key={step.key}
                onClick={() => {
                  if (i < currentStep) {
                    setDirection('left');
                    setCurrentStep(i);
                  }
                }}
                className={`flex items-center gap-2 text-xs font-semibold tracking-wide transition-colors duration-300 ${
                  i <= currentStep
                    ? 'text-slate-100'
                    : 'text-slate-500'
                } ${i < currentStep ? 'cursor-pointer hover:text-slate-200' : 'cursor-default'}`}
                disabled={i >= currentStep}
                style={{ fontFamily: "'Inter', sans-serif" }}
                aria-current={i === currentStep ? 'step' : undefined}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="shrink-0"
                  aria-hidden="true"
                >
                  <path d={step.icon} />
                </svg>
                <span className="hidden sm:inline">{step.label}</span>
              </button>
            ))}
          </div>
          <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${progress}%`,
                background: 'linear-gradient(90deg, #fb7185 0%, #f59e0b 100%)',
              }}
            />
          </div>
        </div>

        {/* ── Step content ── */}
        <div
          key={currentStep}
          style={{
            animation: `${slideAnim} 0.4s ease-out both`,
            minHeight: '280px',
          }}
        >
          {/* ────── Step 1: Comprendre ────── */}
          {currentStep === 0 && (
            <div className="space-y-6">
              <h2
                className="text-xl font-bold text-slate-100 tracking-tight"
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                Analyse de votre alignement
              </h2>

              {/* Score badge */}
              <div className="flex items-center gap-3">
                <div
                  className="flex items-center justify-center w-16 h-16 rounded-2xl border border-white/10"
                  style={{
                    background: `conic-gradient(
                      #fb7185 0%,
                      #f59e0b ${analysisData.alignmentScore * 100}%,
                      rgba(255,255,255,0.05) ${analysisData.alignmentScore * 100}%
                    )`,
                  }}
                >
                  <div className="w-12 h-12 rounded-xl bg-slate-950 flex items-center justify-center">
                    <span className="text-lg font-bold text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>
                      {Math.round(analysisData.alignmentScore * 100)}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-slate-400 font-medium">Score d&apos;alignement</p>
                  <p className="text-xs text-slate-500">sur 100</p>
                </div>
              </div>

              {/* Insight */}
              <div className="bg-white/[0.03] rounded-2xl p-4 border border-white/5">
                <p className="text-sm text-slate-300 italic leading-relaxed" style={{ fontFamily: "'Inter', sans-serif" }}>
                  &ldquo;{analysisData.resonanceInsight}&rdquo;
                </p>
              </div>

              {/* Partner profiles */}
              <div className="grid grid-cols-2 gap-3">
                {/* Partner A */}
                <div className="bg-white/[0.03] rounded-2xl p-4 border border-rose-500/10">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 rounded-full bg-rose-400" />
                    <span className="text-xs font-semibold text-rose-300 uppercase tracking-wider">{partnerAName}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {analysisData.partnerAProfile.traits.map((trait) => (
                      <span
                        key={trait}
                        className="inline-block px-2.5 py-1 text-[11px] font-medium text-rose-200 bg-rose-500/15 border border-rose-500/20 rounded-full"
                      >
                        {trait}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Partner B */}
                <div className="bg-white/[0.03] rounded-2xl p-4 border border-sky-500/10">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 rounded-full bg-sky-400" />
                    <span className="text-xs font-semibold text-sky-300 uppercase tracking-wider">{partnerBName}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {analysisData.partnerBProfile.traits.map((trait) => (
                      <span
                        key={trait}
                        className="inline-block px-2.5 py-1 text-[11px] font-medium text-sky-200 bg-sky-500/15 border border-sky-500/20 rounded-full"
                      >
                        {trait}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ────── Step 2: Questionner ────── */}
          {currentStep === 1 && (
            <div className="space-y-5">
              <h2
                className="text-xl font-bold text-slate-100 tracking-tight"
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                Questions à explorer ensemble
              </h2>
              <p className="text-sm text-slate-400 leading-relaxed">
                Prenez un moment pour discuter de ces questions. Pas de bonne ou mauvaise réponse.
              </p>

              {loadingQuestions ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white/[0.03] rounded-2xl p-5 border border-white/5 space-y-2">
                      <Skeleton width="30%" height="0.75rem" />
                      <Skeleton width="90%" height="1rem" />
                      <Skeleton width="70%" height="1rem" />
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 text-center">
                  <p className="text-sm text-rose-300">{error}</p>
                  <button
                    onClick={() => { setError(null); fetchQuestions(); }}
                    className="mt-3 px-4 py-2 text-xs font-semibold text-rose-200 bg-rose-500/20 rounded-xl hover:bg-rose-500/30 transition-colors cursor-pointer"
                  >
                    Réessayer
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {questions.map((q, i) => (
                    <div
                      key={q.id}
                      className="group bg-white/[0.03] hover:bg-white/[0.06] rounded-2xl p-5 border border-white/5 hover:border-white/10 transition-all duration-300 cursor-pointer"
                      style={{
                        animation: `pw-fade-in-up 0.4s ease-out ${i * 0.12}s both`,
                      }}
                      tabIndex={0}
                      role="button"
                      aria-label={`Question ${i + 1}: ${q.text}`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="shrink-0 flex items-center justify-center w-7 h-7 rounded-lg bg-amber-500/15 text-amber-400 text-xs font-bold border border-amber-500/20">
                          {i + 1}
                        </span>
                        <div>
                          <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">
                            {q.category}
                          </p>
                          <p className="text-sm text-slate-200 leading-relaxed group-hover:text-slate-100 transition-colors">
                            {q.text}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ────── Step 3: Agir ────── */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h2
                className="text-xl font-bold text-slate-100 tracking-tight"
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                Votre micro-action du jour
              </h2>

              {loadingAction ? (
                <div className="bg-white/[0.03] rounded-2xl p-6 border border-white/5 space-y-4">
                  <Skeleton width="20%" height="1.5rem" />
                  <Skeleton width="100%" height="1rem" />
                  <Skeleton width="80%" height="1rem" />
                  <Skeleton width="40%" height="2.5rem" />
                </div>
              ) : error ? (
                <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 text-center">
                  <p className="text-sm text-rose-300">{error}</p>
                  <button
                    onClick={() => { setError(null); fetchAction(); }}
                    className="mt-3 px-4 py-2 text-xs font-semibold text-rose-200 bg-rose-500/20 rounded-xl hover:bg-rose-500/30 transition-colors cursor-pointer"
                  >
                    Réessayer
                  </button>
                </div>
              ) : action ? (
                <div
                  className="relative bg-white/[0.03] rounded-2xl p-6 border border-white/5"
                  style={{ animation: 'pw-fade-in-up 0.5s ease-out both' }}
                >
                  {/* Difficulty badge */}
                  <span
                    className={`inline-block px-3 py-1 text-[11px] font-bold uppercase tracking-wider rounded-full border mb-4 ${
                      DIFFICULTY_STYLES[action.difficulty] ?? DIFFICULTY_STYLES.moyen
                    }`}
                  >
                    {action.difficulty}
                  </span>

                  <p className="text-base text-slate-200 leading-relaxed mb-6">
                    {action.text}
                  </p>

                  {/* AI suggestion */}
                  <div className="bg-white/[0.03] rounded-xl p-3 border border-white/5 mb-6">
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">
                      Suggestion IA
                    </p>
                    <p className="text-sm text-slate-300 italic">
                      {analysisData.actionSuggestion}
                    </p>
                  </div>

                  {/* Complete button */}
                  {!completed ? (
                    <button
                      onClick={handleComplete}
                      className="w-full py-3.5 rounded-2xl font-bold text-sm tracking-wide text-white transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                      style={{
                        background: 'linear-gradient(135deg, #f59e0b 0%, #fb7185 100%)',
                        boxShadow: '0 0 30px rgba(245,158,11,0.2)',
                        fontFamily: "'Inter', sans-serif",
                      }}
                    >
                      Marquer comme fait
                    </button>
                  ) : (
                    <div className="relative flex flex-col items-center gap-3 py-2">
                      <ConfettiEffect />
                      <div
                        className="w-14 h-14 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center"
                      >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                          <path
                            d="M5 13l4 4L19 7"
                            stroke="#34d399"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeDasharray="24"
                            style={{ animation: 'pw-check-draw 0.5s ease-out forwards' }}
                          />
                        </svg>
                      </div>
                      <p className="text-sm font-semibold text-emerald-300">
                        Bravo ! Action complétée
                      </p>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          )}
        </div>

        {/* ── Navigation ── */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/5">
          <button
            onClick={goPrev}
            disabled={currentStep === 0}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
              currentStep === 0
                ? 'text-slate-600 cursor-not-allowed'
                : 'text-slate-300 hover:text-white hover:bg-white/5 cursor-pointer'
            }`}
            style={{ fontFamily: "'Inter', sans-serif" }}
            aria-label="Étape précédente"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Retour
          </button>

          {currentStep < STEPS.length - 1 ? (
            <button
              onClick={goNext}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, #fb7185 0%, #f59e0b 100%)',
                fontFamily: "'Inter', sans-serif",
              }}
              aria-label="Étape suivante"
            >
              Suivant
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          ) : (
            !completed && (
              <span className="text-xs text-slate-500 italic">
                Complétez l&apos;action ci-dessus
              </span>
            )
          )}
        </div>
      </div>
    </div>
  );
}
