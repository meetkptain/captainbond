'use client';

import { useMemo } from 'react';
import { Icon } from '@/components/Icon';
import { getOnboardingSteps } from '@/lib/couple/onboarding';

interface OnboardingChecklistProps {
  currentDay: number;
  completedDays: number[];
  onStepClick?: (day: number) => void;
  lang?: 'fr' | 'en';
}

export function OnboardingChecklist({
  currentDay,
  completedDays,
  onStepClick,
  lang = 'fr',
}: OnboardingChecklistProps) {
  const steps = useMemo(() => getOnboardingSteps(completedDays), [completedDays]);
  const label = lang === 'en' ? 'First week roadmap' : 'Votre première semaine';

  return (
    <div className="couple-card">
      <div className="flex items-center justify-between mb-3">
        <div className="couple-label mb-0">{label}</div>
        <div className="text-xs font-medium text-slate-400">
          {lang === 'en' ? 'Day' : 'Jour'} {currentDay}/7
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {steps.map((step) => {
          const isCurrent = step.day === currentDay;
          const isDone = step.done;
          const isFuture = step.day > currentDay;
          const title = lang === 'en' ? (step.titleEn ?? step.title) : step.title;

          return (
            <button
              key={step.day}
              type="button"
              disabled={!onStepClick || isDone || isFuture}
              onClick={() => onStepClick?.(step.day)}
              className={[
                'flex items-center gap-3 w-full text-left p-2 rounded-xl transition-colors',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/40',
                isCurrent ? 'bg-rose-500/10 border border-rose-500/20' : 'hover:bg-white/5 border border-transparent',
                onStepClick && !isDone && !isFuture ? 'cursor-pointer' : 'cursor-default',
              ].join(' ')}
            >
              <div
                className={[
                  'flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border',
                  isDone
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    : isCurrent
                      ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                      : 'bg-slate-700/50 text-slate-400 border-slate-600/30',
                ].join(' ')}
              >
                {isDone ? <Icon name="check" className="w-4 h-4" /> : step.day}
              </div>

              <div className="flex-1 min-w-0">
                <div
                  className={[
                    'text-sm font-medium truncate',
                    isDone ? 'text-slate-400 line-through' : isCurrent ? 'text-rose-200' : 'text-slate-200',
                  ].join(' ')}
                >
                  {title}
                </div>
              </div>

              {isCurrent && !isDone && (
                <div className="flex-shrink-0 w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
