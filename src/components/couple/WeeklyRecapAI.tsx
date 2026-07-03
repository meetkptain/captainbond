'use client';

import { useState, useEffect } from 'react';
import { Icon } from '@/components/Icon';

interface Recap {
  weekStart: string;
  theme: string;
  summary: string;
  insight: string;
  lesson: string;
}

interface Props {
  coupleId: string;
}

export function WeeklyRecapAI({ coupleId }: Props) {
  const [recaps, setRecaps] = useState<Recap[]>([]);
  const [selectedRecap, setSelectedRecap] = useState<Recap | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRecaps() {
      try {
        const res = await fetch(`/api/couple/weekly-recap?coupleId=${coupleId}`);
        if (!res.ok) throw new Error('Erreur lors du chargement');
        const data = await res.json();
        setRecaps(data.recaps || []);
      } catch {
        setError('Impossible de charger les récapitulatifs');
      } finally {
        setLoading(false);
      }
    }
    fetchRecaps();
  }, [coupleId]);

  if (loading) {
    return (
      <div className="bg-black/40 border border-white/10 rounded-2xl p-6">
        <div className="flex items-center gap-2 text-white/50">
          <Icon name="sparkles" className="w-4 h-4 animate-pulse" />
          <span className="text-sm">Chargement des récapitulatifs…</span>
        </div>
      </div>
    );
  }

  if (error || recaps.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Icon name="sparkles" className="w-5 h-5 text-purple-400" />
        <h3 className="text-white font-medium text-lg">Récap de la semaine</h3>
      </div>

      <div className="grid gap-3">
        {recaps.map((recap) => (
          <button
            key={recap.weekStart}
            onClick={() => setSelectedRecap(selectedRecap?.weekStart === recap.weekStart ? null : recap)}
            className="w-full text-left bg-black/40 border border-white/10 rounded-2xl p-5 hover:border-purple-500/30 transition-all active:scale-[0.98]"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-purple-400 text-sm font-medium uppercase tracking-wider">
                {recap.theme}
              </span>
              <span className="text-white/40 text-xs">
                Semaine du {new Date(recap.weekStart).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
              </span>
            </div>
            <p className="text-white/70 text-sm line-clamp-2">{recap.summary}</p>
          </button>
        ))}
      </div>

      {selectedRecap && (
        <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-500/20 rounded-2xl p-6 space-y-4">
          <div>
            <h4 className="text-white/50 text-xs uppercase tracking-wider mb-1">Résumé</h4>
            <p className="text-white/90 text-sm leading-relaxed">{selectedRecap.summary}</p>
          </div>
          <div>
            <h4 className="text-white/50 text-xs uppercase tracking-wider mb-1">Insight</h4>
            <p className="text-white/90 text-sm leading-relaxed">{selectedRecap.insight}</p>
          </div>
          <div className="bg-white/5 rounded-xl p-4">
            <h4 className="text-purple-400 text-xs uppercase tracking-wider mb-1">Leçon pour cette semaine</h4>
            <p className="text-white/90 text-sm leading-relaxed font-medium">{selectedRecap.lesson}</p>
          </div>
        </div>
      )}
    </div>
  );
}
