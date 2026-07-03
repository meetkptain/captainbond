'use client';

import { useState, useEffect } from 'react';
import { Icon } from '@/components/Icon';

interface HeatmapEntry {
  axis: string;
  score: number;
  trend: 'up' | 'down' | 'stable';
}

interface Props {
  coupleId: string;
  onSelect?: (axis: string) => void;
}

const AXIS_LABELS: Record<string, string> = {
  'vulnérabilité': 'Vulnérabilité',
  'communication': 'Communication',
  'conflit': 'Gestion du conflit',
  'désir': 'Désir & Intimité',
  'projets': 'Projets communs',
};

const AXIS_COLORS: Record<string, string> = {
  'vulnérabilité': '#c084fc',
  'communication': '#60a5fa',
  'conflit': '#f87171',
  'désir': '#f472b6',
  'projets': '#34d399',
};

const TREND_ICONS: Record<string, { name: string; color: string }> = {
  up: { name: 'trendingUp', color: '#34d399' },
  down: { name: 'trendingDown', color: '#f87171' },
  stable: { name: 'target', color: '#9ca3af' },
};

export function CoupleHeatmap({ coupleId, onSelect }: Props) {
  const [heatmap, setHeatmap] = useState<HeatmapEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAxis, setSelectedAxis] = useState<string | null>(null);

  useEffect(() => {
    async function fetchHeatmap() {
      try {
        const res = await fetch(`/api/couple/heatmap?coupleId=${coupleId}`);
        if (!res.ok) throw new Error('Erreur lors du chargement');
        const data = await res.json();
        setHeatmap(data.heatmap || []);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    }
    fetchHeatmap();
  }, [coupleId]);

  if (loading) {
    return (
      <div className="bg-black/40 border border-white/10 rounded-2xl p-6">
        <div className="flex items-center gap-2 text-white/50">
          <Icon name="sparkles" className="w-4 h-4 animate-pulse" />
          <span className="text-sm">Chargement de la heatmap…</span>
        </div>
      </div>
    );
  }

  if (heatmap.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Icon name="chart" className="w-5 h-5 text-blue-400" />
        <h3 className="text-white font-medium text-lg">Confiance</h3>
      </div>

      <div className="grid grid-cols-5 gap-2">
        {heatmap.map((entry) => {
          const color = AXIS_COLORS[entry.axis] || '#9ca3af';
          const trend = TREND_ICONS[entry.trend] || TREND_ICONS.stable;
          const isSelected = selectedAxis === entry.axis;

          return (
            <button
              key={entry.axis}
              onClick={() => {
                setSelectedAxis(isSelected ? null : entry.axis);
                onSelect?.(entry.axis);
              }}
              className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${
                isSelected
                  ? 'border-white/30 bg-white/10'
                  : 'border-white/10 bg-black/30 hover:border-white/20'
              }`}
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold"
                style={{ backgroundColor: color, opacity: 0.3 + entry.score * 0.7 }}
              >
                {Math.round(entry.score * 100)}
              </div>
              <span className="text-white/70 text-xs text-center leading-tight">
                {AXIS_LABELS[entry.axis] || entry.axis}
              </span>
              <Icon name={trend.name as 'trendingUp' | 'trendingDown' | 'target'} className="w-3 h-3" style={{ color: trend.color }} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
