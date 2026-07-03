'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/components/Icon';
import { DailyQuestion } from '@/lib/db/types';
import { AnalyticsEvents, capture } from '@/lib/analytics';

type ArchiveQuestion = DailyQuestion & {
  question?: { text?: string | null } | null;
};

type EntitlementsPayload = {
  hasActivePass: boolean;
  passExpiresAt: string | null;
  hasActiveSubscription: boolean;
};

function formatReleasedAt(dateStr?: string): string {
  if (!dateStr) return 'Date inconnue';
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function truncate(text: string | null | undefined, max = 80): string {
  if (!text) return '';
  if (text.length <= max) return text;
  return `${text.slice(0, max).trim()}…`;
}

function getIsLocked(
  isPremiumActive: boolean,
  entitlements: EntitlementsPayload | null,
  releasedAt?: string | null
): boolean {
  if (isPremiumActive) return false;
  const expiresAt = entitlements?.passExpiresAt;
  if (!expiresAt) return true;
  return new Date(releasedAt || Date.now()).getTime() < new Date(expiresAt).getTime();
}

interface ArchiveClientProps {
  coupleId?: string;
}

export function ArchiveClient({ coupleId }: ArchiveClientProps) {
  const [questions, setQuestions] = useState<ArchiveQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [entitlements, setEntitlements] = useState<EntitlementsPayload | null>(null);

  useEffect(() => {
    if (!coupleId) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(`/api/couple/archive?coupleId=${encodeURIComponent(coupleId)}`)
      .then(async (res) => {
        if (!res.ok) {
          const payload = await res.json().catch(() => ({}));
          throw new Error(payload.error || 'Erreur lors du chargement du journal');
        }
        return res.json();
      })
      .then((payload: { questions: ArchiveQuestion[] }) => {
        if (!cancelled) setQuestions(payload.questions ?? []);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Erreur inconnue');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [coupleId]);

  useEffect(() => {
    let cancelled = false;

    fetch('/api/user/entitlements')
      .then(async (res) => {
        if (!res.ok) return null;
        return res.json();
      })
      .then((payload: EntitlementsPayload | null) => {
        if (!cancelled && payload) setEntitlements(payload);
      })
      .catch(() => {
        // Best-effort: leave entitlements null, all cards fall back to locked.
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const isPremiumActive = entitlements?.hasActivePass || entitlements?.hasActiveSubscription || false;

  const lockedCount = useMemo(
    () => questions.filter((q) => getIsLocked(isPremiumActive, entitlements, q.releasedAt)).length,
    [questions, isPremiumActive, entitlements]
  );

  useEffect(() => {
    if (lockedCount > 0 && coupleId) {
      capture(AnalyticsEvents.PAYWALL_SHOWN, { context: 'archive', coupleId });
    }
  }, [lockedCount, coupleId]);

  if (!coupleId) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center px-4">
        <div className="max-w-md w-full bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
          <Icon name="heartCrack" className="w-10 h-10 text-rose-400 mx-auto mb-4" />
          <h1 className="text-xl font-bold mb-2">Paramètre manquant</h1>
          <p className="text-slate-400 mb-6">Ouvrez votre journal depuis l&apos;espace couple.</p>
          <Link
            href="/couple"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 hover:bg-rose-500/20 transition-colors"
          >
            <Icon name="arrowLeft" className="w-4 h-4" />
            Retour à l&apos;espace couple
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 px-4 py-8 md:py-12">
      <div className="max-w-3xl mx-auto">
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Journal de couple</h1>
            <p className="text-slate-400 mt-1">Vos questions et réponses passées, jour après jour.</p>
          </div>
          <Link
            href="/couple"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-slate-300 hover:bg-white/10 transition-colors"
          >
            <Icon name="arrowLeft" className="w-4 h-4" />
            Retour
          </Link>
        </header>

        {loading && (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <div className="w-8 h-8 border-2 border-slate-600 border-t-rose-400 rounded-full animate-spin mb-4" />
            <p>Chargement de votre journal…</p>
          </div>
        )}

        {error && !loading && (
          <div className="bg-white/5 border border-red-500/20 rounded-2xl p-6 text-center">
            <Icon name="alert" className="w-8 h-8 text-red-400 mx-auto mb-3" />
            <p className="text-slate-200 mb-2">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="text-sm text-rose-300 hover:text-rose-200 underline underline-offset-2"
            >
              Réessayer
            </button>
          </div>
        )}

        {!loading && !error && questions.length === 0 && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
            <Icon name="sprout" className="w-10 h-10 text-emerald-400 mx-auto mb-4" />
            <h2 className="text-lg font-semibold mb-2">Votre journal est vide</h2>
            <p className="text-slate-400 mb-6">
              Répondez à votre première question pour faire grandir votre historique.
            </p>
            <Link
              href="/couple"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 hover:bg-rose-500/20 transition-colors"
            >
              Retourner à l&apos;espace couple
            </Link>
          </div>
        )}

        {!loading && !error && questions.length > 0 && (
          <div className="space-y-4">
            {questions.map((q) => {
              const questionText = q.customText || q.question?.text || 'Question';
              const isRevealed = q.isRevealed;
              const myAnswer = truncate(q.user1Answer);
              const partnerAnswer = truncate(q.user2Answer);
              const isLocked = getIsLocked(isPremiumActive, entitlements, q.releasedAt);

              return (
                <article
                  key={q.id}
                  className="relative bg-white/5 border border-white/10 rounded-2xl p-5 md:p-6 hover:bg-white/[0.07] transition-colors"
                >
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <time className="text-sm text-slate-400 capitalize">{formatReleasedAt(q.releasedAt)}</time>
                    {q.theme && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                        {q.theme}
                      </span>
                    )}
                    {isLocked && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-300 border border-amber-500/20">
                        <Icon name="lock" className="w-3 h-3" />
                        Premium
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-semibold text-slate-100 mb-4">{questionText}</h3>

                  {isRevealed ? (
                    <div className={`grid gap-3 sm:grid-cols-2 ${isLocked ? 'blur-sm' : ''}`}>
                      <div className="bg-slate-900/50 rounded-xl p-4 border border-white/5">
                        <div className="text-xs text-slate-500 mb-1">Partenaire 1</div>
                        <p className="text-sm text-slate-300">{myAnswer || <span className="italic text-slate-600">Sans réponse</span>}</p>
                      </div>
                      <div className="bg-slate-900/50 rounded-xl p-4 border border-white/5">
                        <div className="text-xs text-slate-500 mb-1">Partenaire 2</div>
                        <p className="text-sm text-slate-300">{partnerAnswer || <span className="italic text-slate-600">Sans réponse</span>}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 rounded-xl bg-slate-900/50 border border-white/5 px-4 py-3 text-slate-400">
                      <Icon name="lock" className="w-4 h-4" />
                      <span className="text-sm">Réponses scellées jusqu&apos;à la révélation.</span>
                    </div>
                  )}

                  {isLocked && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-slate-950/60 p-6 text-center">
                      <Icon name="sparkles" className="w-8 h-8 text-amber-300 mb-2" />
                      <p className="text-sm text-slate-200 mb-3">Activez Premium pour relire cette entrée</p>
                      <Link
                        href="/couple"
                        onClick={() => capture(AnalyticsEvents.CHECKOUT_INITIATED, { context: 'archive', coupleId, source: 'archive_card_overlay' })}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 hover:bg-amber-500/20 transition-colors text-sm font-medium"
                      >
                        Découvrir Premium
                      </Link>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}

        {!loading && !error && !isPremiumActive && (
          <div className="mt-8 p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
            <p className="text-sm text-slate-400">
              Activez Premium pour débloquer l&apos;historique complet et explorer tous vos miroirs.
            </p>
            <Link
              href="/couple"
              onClick={() => capture(AnalyticsEvents.CHECKOUT_INITIATED, { context: 'archive', coupleId, source: 'archive_cta' })}
              className="inline-flex items-center justify-center gap-2 mt-3 px-5 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 hover:bg-amber-500/20 transition-colors text-sm font-medium"
            >
              <Icon name="sparkles" className="w-4 h-4" />
              Découvrir Premium
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
