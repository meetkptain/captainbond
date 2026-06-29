'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Icon } from '@/components/Icon';
import { api, ApiClientError } from '@/lib/api/client';
import { MonthlyReport } from '@/lib/db/types';

interface Props {
  coupleId: string;
}

function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function formatMonth(month: string): string {
  const [year, m] = month.split('-');
  const date = new Date(Number(year), Number(m) - 1, 1);
  return date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
}

function encouragementMessage(avg: number): string {
  if (avg > 0.7) return '✨ Mois exceptionnel — votre connexion brille fort !';
  if (avg >= 0.4) return '💫 Belle dynamique ce mois-ci — continuez sur cette lancée.';
  return '🌱 Chaque ritual compte — vous construisez quelque chose de solide.';
}

export function MonthlyReportCard({ coupleId }: Props) {
  const [report, setReport] = useState<MonthlyReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const month = getCurrentMonth();

  const fetchReport = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get<{ report: MonthlyReport }>(
        `/api/couple/report?coupleId=${encodeURIComponent(coupleId)}&month=${month}`
      );
      setReport(data.report);
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError('Impossible de charger le rapport mensuel.');
      }
    } finally {
      setLoading(false);
    }
  }, [coupleId, month]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  // --- Loading ---
  if (loading) {
    return (
      <div
        style={{
          padding: '1.5rem',
          textAlign: 'center',
          color: 'rgba(148,163,184,0.7)',
          fontSize: '0.85rem',
        }}
      >
        <Icon name="zap" className="w-4 h-4 inline mr-2" />
        Chargement du bilan mensuel…
      </div>
    );
  }

  // --- Error ---
  if (error) {
    return (
      <div
        style={{
          padding: '1rem',
          color: 'rgba(252,165,165,0.8)',
          fontSize: '0.82rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}
      >
        <Icon name="alert" className="w-4 h-4 flex-shrink-0" />
        {error}
      </div>
    );
  }

  // --- Empty state ---
  if (!report || report.totalQuestionsRevealed === 0) {
    return (
      <div
        style={{
          padding: '1.25rem',
          color: 'rgba(148,163,184,0.6)',
          fontSize: '0.82rem',
          textAlign: 'center',
        }}
      >
        <Icon name="hourglass" className="w-5 h-5 mx-auto mb-2 opacity-50" />
        Aucune question révélée ce mois-ci encore.
      </div>
    );
  }

  const pct = Math.round(report.avgResonanceScore * 100);
  const barColor =
    report.avgResonanceScore > 0.7
      ? 'rgba(167, 243, 208, 0.8)'
      : report.avgResonanceScore >= 0.4
      ? 'rgba(196, 181, 253, 0.8)'
      : 'rgba(148, 163, 184, 0.6)';

  return (
    <div style={{ padding: '0.25rem 0' }}>
      {/* Header */}
      <div
        className="couple-label"
        style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
      >
        <Icon name="chart" className="w-4 h-4" />
        Bilan de {formatMonth(month)}
      </div>

      {/* Score global */}
      <div style={{ marginBottom: '1.25rem' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            marginBottom: '0.4rem',
          }}
        >
          <span style={{ fontSize: '0.78rem', color: 'rgba(148,163,184,0.7)' }}>
            Score de résonance moyen
          </span>
          <span
            style={{ fontSize: '1.2rem', fontWeight: 700, color: barColor }}
          >
            {pct}%
          </span>
        </div>
        <div
          style={{
            height: '6px',
            borderRadius: '9999px',
            background: 'rgba(255,255,255,0.06)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${pct}%`,
              borderRadius: '9999px',
              background: barColor,
              boxShadow: `0 0 8px ${barColor}`,
              transition: 'width 0.6s ease',
            }}
          />
        </div>
        <div style={{ fontSize: '0.75rem', color: 'rgba(148,163,184,0.5)', marginTop: '0.35rem' }}>
          {report.totalQuestionsRevealed} question{report.totalQuestionsRevealed > 1 ? 's' : ''}{' '}
          révélée{report.totalQuestionsRevealed > 1 ? 's' : ''}
          {report.peakResonanceDay && (
            <> · Pic le {new Date(report.peakResonanceDay).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</>
          )}
        </div>
      </div>

      {/* Highlights */}
      {report.highlights.length > 0 && (
        <div style={{ marginBottom: '1.25rem' }}>
          <div
            style={{
              fontSize: '0.72rem',
              color: 'rgba(148,163,184,0.5)',
              textTransform: 'uppercase',
              letterSpacing: '0.07em',
              marginBottom: '0.5rem',
            }}
          >
            Moments forts
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {report.highlights.map((h, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '0.5rem',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <span
                  style={{
                    fontSize: '0.75rem',
                    color: barColor,
                    fontWeight: 700,
                    minWidth: '2.5rem',
                    textAlign: 'right',
                  }}
                >
                  {Math.round(h.resonanceScore * 100)}%
                </span>
                <span
                  style={{
                    fontSize: '0.78rem',
                    color: 'rgba(226,232,240,0.75)',
                    flex: 1,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {h.questionText}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Message d'encouragement */}
      <div
        style={{
          fontSize: '0.8rem',
          color: 'rgba(196,181,253,0.75)',
          fontStyle: 'italic',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          paddingTop: '0.75rem',
          lineHeight: 1.5,
        }}
      >
        {encouragementMessage(report.avgResonanceScore)}
      </div>
    </div>
  );
}
