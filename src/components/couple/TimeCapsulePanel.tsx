'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { api, ApiClientError } from '@/lib/api/client';
import { Icon } from '@/components/Icon';

interface TimeCapsule {
  id: string;
  coupleId: string;
  senderId: string;
  content: string;
  createdAt: string;
  unlocksAt: string;
  isUnlocked: boolean;
}

interface Props {
  coupleId: string;
  userId: string;
}

function formatCountdown(targetDate: string): string {
  const diff = new Date(targetDate).getTime() - Date.now();
  if (diff <= 0) return 'Prête à s\'ouvrir';
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days > 0) return `${days} jour${days > 1 ? 's' : ''}`;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  return `${hours}h`;
}

const DURATION_OPTIONS = [
  { label: '1 mois', days: 30 },
  { label: '3 mois', days: 90 },
  { label: '6 mois', days: 180 },
  { label: '1 an', days: 365 },
];

export function TimeCapsulePanel({ coupleId, userId }: Props) {
  const [capsules, setCapsules] = useState<TimeCapsule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [content, setContent] = useState('');
  const [daysUntilUnlock, setDaysUntilUnlock] = useState(180);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCapsules = useCallback(async () => {
    try {
      const data = await api.get<{ capsules: TimeCapsule[] }>(`/api/couple/capsule?coupleId=${coupleId}`);
      setCapsules(data.capsules);
    } catch (err) {
      if (err instanceof ApiClientError) setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [coupleId]);

  useEffect(() => { fetchCapsules(); }, [fetchCapsules]);

  const handleSeal = async () => {
    if (!content.trim() || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      await api.post('/api/couple/capsule', { coupleId, content, daysUntilUnlock });
      setContent('');
      setShowForm(false);
      await fetchCapsules();
    } catch (err) {
      if (err instanceof ApiClientError) setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const lockedCapsules = capsules.filter(c => !c.isUnlocked);
  const unlockedCapsules = capsules.filter(c => c.isUnlocked);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="couple-label">Capsules Temporelles</div>
        <button
          onClick={() => setShowForm(v => !v)}
          style={{
            background: 'rgba(168, 85, 247, 0.12)',
            border: '1px solid rgba(168, 85, 247, 0.3)',
            color: '#a855f7',
            borderRadius: '0.5rem',
            padding: '0.4rem 0.85rem',
            fontSize: '0.75rem',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          <Icon name="lock" className="w-3.5 h-3.5 inline mr-1" />
          {showForm ? 'Annuler' : 'Créer'}
        </button>
      </div>

      {showForm && (
        <div style={{
          background: 'rgba(168, 85, 247, 0.06)',
          border: '1px solid rgba(168, 85, 247, 0.18)',
          borderRadius: '0.75rem',
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
        }}>
          <p style={{ fontSize: '0.8125rem', color: '#c084fc', margin: 0, lineHeight: 1.5 }}>
            Scelle un message à ton partenaire. Il ne pourra pas l&apos;ouvrir avant la date choisie.
          </p>
          <textarea
            className="answer-textarea"
            rows={4}
            placeholder="Ce que je veux que tu saches dans 6 mois…"
            value={content}
            onChange={e => setContent(e.target.value)}
            maxLength={2000}
            style={{ minHeight: '100px' }}
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={{ fontSize: '0.75rem', color: '#cbd5e1', fontWeight: 600 }}>Durée de verrouillage</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.4rem' }}>
              {DURATION_OPTIONS.map(opt => (
                <button
                  key={opt.days}
                  onClick={() => setDaysUntilUnlock(opt.days)}
                  style={{
                    background: daysUntilUnlock === opt.days ? 'rgba(168, 85, 247, 0.25)' : 'transparent',
                    border: daysUntilUnlock === opt.days ? '1px solid rgba(168, 85, 247, 0.5)' : '1px solid rgba(255,255,255,0.1)',
                    color: daysUntilUnlock === opt.days ? '#d8b4fe' : '#94a3b8',
                    borderRadius: '0.5rem',
                    padding: '0.4rem',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          {error && <p style={{ color: '#f87171', fontSize: '0.75rem', margin: 0 }}>{error}</p>}
          <button
            className="answer-submit"
            onClick={handleSeal}
            disabled={!content.trim() || submitting}
          >
            {submitting ? <span className="couple-spinner" /> : (
              <><Icon name="lock" className="w-4 h-4 inline mr-1" />Sceller la capsule</>
            )}
          </button>
        </div>
      )}

      {/* Capsules verrouillées */}
      {lockedCapsules.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {lockedCapsules.map(c => (
            <div key={c.id} style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '0.75rem',
              padding: '0.75rem 1rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '0.5rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Icon name="lock" className="w-4 h-4 text-indigo-400" />
                <div>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>
                    {c.senderId === userId ? 'Envoyé par toi' : 'De ton partenaire'}
                  </p>
                  <p style={{ margin: 0, fontSize: '0.8125rem', color: '#cbd5e1', fontStyle: 'italic' }}>
                    Scellée jusqu&apos;au {new Date(c.unlocksAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </div>
              <span style={{
                background: 'rgba(99, 102, 241, 0.12)',
                border: '1px solid rgba(99, 102, 241, 0.2)',
                borderRadius: '0.5rem',
                padding: '0.25rem 0.5rem',
                fontSize: '0.6875rem',
                color: '#818cf8',
                fontWeight: 700,
                whiteSpace: 'nowrap',
              }}>
                {formatCountdown(c.unlocksAt)}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Capsules déverrouillées */}
      {unlockedCapsules.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <p style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 700, margin: 0 }}>
            <Icon name="sparkles" className="w-3.5 h-3.5 inline mr-1" />
            Capsules ouvertes
          </p>
          {unlockedCapsules.map(c => (
            <div key={c.id} style={{
              background: 'rgba(52, 211, 153, 0.06)',
              border: '1px solid rgba(52, 211, 153, 0.18)',
              borderRadius: '0.75rem',
              padding: '1rem',
            }}>
              <p style={{ margin: '0 0 0.5rem', fontSize: '0.75rem', color: '#64748b' }}>
                {c.senderId === userId ? 'Tu as écrit' : 'Ton partenaire a écrit'} · {new Date(c.createdAt).toLocaleDateString('fr-FR')}
              </p>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#f1f5f9', lineHeight: 1.6 }}>{c.content}</p>
            </div>
          ))}
        </div>
      )}

      {!loading && capsules.length === 0 && !showForm && (
        <p style={{ fontSize: '0.8125rem', color: '#475569', textAlign: 'center', margin: 0, padding: '1rem 0' }}>
          Aucune capsule. Scelle un message pour le futur.
        </p>
      )}
    </div>
  );
}
