'use client';

import { useState, useEffect } from 'react';
import { Icon } from '@/components/Icon';

interface TreeProgressEntry {
  month: string;
  nodeCount: number;
  connectionCount: number;
  avgSimilarity: number;
  dominantTheme: string;
  strongestLink: {
    sourceId: string;
    targetId: string;
    resonance: number;
  } | null;
}

interface Props {
  coupleId: string;
}

const THEME_LABELS: Record<string, string> = {
  'general': 'Général',
  'émotions': 'Émotions',
  'values': 'Valeurs',
  'memory': 'Mémoire',
  'desire': 'Désir',
  'conflict': 'Conflit',
  'future': 'Futur',
  'intimacy': 'Intimité',
};

export function TreeEvolution({ coupleId }: Props) {
  const [progress, setProgress] = useState<TreeProgressEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProgress() {
      try {
        const res = await fetch(`/api/couple/tree-progress?coupleId=${coupleId}`);
        if (!res.ok) throw new Error('Erreur lors du chargement');
        const data = await res.json();
        setProgress(data.progress || []);
      } catch {
        setError('Impossible de charger la progression');
      } finally {
        setLoading(false);
      }
    }
    fetchProgress();
  }, [coupleId]);

  if (loading) {
    return (
      <div className="bg-black/40 border border-white/10 rounded-2xl p-6">
        <div className="flex items-center gap-2 text-white/50">
          <Icon name="tree" className="w-4 h-4 animate-pulse" />
          <span className="text-sm">Chargement de l'arbre…</span>
        </div>
      </div>
    );
  }

  if (error || progress.length === 0) {
    return null;
  }

  const latest = progress[0];
  const previous = progress[1] || null;

  const nodeGrowth = previous ? latest.nodeCount - previous.nodeCount : 0;
  const connectionGrowth = previous ? latest.connectionCount - previous.connectionCount : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Icon name="tree" className="w-5 h-5 text-emerald-400" />
        <h3 className="text-white font-medium text-lg">Arbre de Résonance</h3>
      </div>

      {/* Stats actuelles */}
      <div className="bg-black/40 border border-white/10 rounded-2xl p-5 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-white/50 text-xs uppercase tracking-wider mb-1">Nœuds</div>
            <div className="flex items-center gap-2">
              <span className="text-white text-2xl font-bold">{latest.nodeCount}</span>
              {nodeGrowth > 0 && (
                <span className="text-emerald-400 text-xs">+{nodeGrowth}</span>
              )}
            </div>
          </div>
          <div>
            <div className="text-white/50 text-xs uppercase tracking-wider mb-1">Connexions</div>
            <div className="flex items-center gap-2">
              <span className="text-white text-2xl font-bold">{latest.connectionCount}</span>
              {connectionGrowth > 0 && (
                <span className="text-emerald-400 text-xs">+{connectionGrowth}</span>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-white/50 text-xs uppercase tracking-wider mb-1">Similarité moy.</div>
            <span className="text-white text-lg font-medium">
              {Math.round(latest.avgSimilarity * 100)}%
            </span>
          </div>
          <div>
            <div className="text-white/50 text-xs uppercase tracking-wider mb-1">Thème dominant</div>
            <span className="text-emerald-400 text-sm font-medium">
              {THEME_LABELS[latest.dominantTheme] || latest.dominantTheme}
            </span>
          </div>
        </div>

        {latest.strongestLink && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3">
            <div className="text-white/50 text-xs uppercase tracking-wider mb-1">Lien le plus fort</div>
            <div className="flex items-center gap-2">
              <Icon name="link" className="w-4 h-4 text-emerald-400" />
              <span className="text-white/80 text-sm">
                Resonance {Math.round(latest.strongestLink.resonance * 100)}%
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Historique */}
      {progress.length > 1 && (
        <div className="space-y-2">
          <h4 className="text-white/50 text-xs uppercase tracking-wider">Évolution</h4>
          <div className="flex gap-2">
            {[...progress].reverse().map((entry, i) => {
              const height = Math.min(100, (entry.nodeCount / Math.max(...progress.map((p) => p.nodeCount), 1)) * 100);
              return (
                <div key={entry.month} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full bg-emerald-500/20 rounded-t" style={{ height: `${Math.max(height, 10)}%` }}>
                    <div
                      className="w-full bg-emerald-500 rounded-t transition-all"
                      style={{ height: `${height}%` }}
                    />
                  </div>
                  <span className="text-white/40 text-[10px]">
                    {new Date(entry.month + '-01').toLocaleDateString('fr-FR', { month: 'short' })}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
