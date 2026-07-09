'use client';

import { useEffect, useRef, useState, type RefObject } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { CoupleDashboardProvider, useCoupleData } from '../_hooks/useCoupleDashboardContext';
import ConstellationOverlay, { type OverlaySelection } from '@/components/couple/ConstellationOverlay';
import type { TreeNode, TreeConnection } from '@/lib/db/types';

const ConstellationDouble = dynamic(
  () => import('@/components/couple/ConstellationDouble'),
  { ssr: false }
);

function startOfMonth(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), 1).getTime();
}

function ConstellationPageInner() {
  const router = useRouter();
  const { couple } = useCoupleData();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [nodes, setNodes] = useState<TreeNode[]>([]);
  const [connections, setConnections] = useState<TreeConnection[]>([]);
  const [selection, setSelection] = useState<OverlaySelection | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const coupleId = couple?.id;

  useEffect(() => {
    if (!coupleId) return;
    let cancelled = false;
    setLoading(true);
    setSelection(null);
    fetch('/api/couple/tree-nodes?coupleId=' + encodeURIComponent(coupleId))
      .then((res) => (res.ok ? res.json() : { nodes: [], connections: [] }))
      .then((data: { nodes?: TreeNode[]; connections?: TreeConnection[] }) => {
        if (cancelled) return;
        setNodes(data.nodes ?? []);
        setConnections(data.connections ?? []);
      })
      .catch(() => {
        if (cancelled) return;
        setNodes([]);
        setConnections([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [coupleId]);

  const onSelect = (id: string) => {
    const node = nodes.find((n) => n.id === id);
    if (!node) return;
    const conn = connections.find((c) => c.sourceId === id || c.targetId === id);
    if (!conn) return;
    const otherId = conn.sourceId === id ? conn.targetId : conn.sourceId;
    const other = nodes.find((n) => n.id === otherId);
    if (!other) return;

    const selection: OverlaySelection = {
      id: node.id,
      verbatimA: node.customText ?? '(sans texte)',
      verbatimB: other.customText ?? '(sans texte)',
      resonance: conn.resonance,
      diff: `Intensité ${node.intensity} vs ${other.intensity} · ${node.category}`,
      themeName: `Orbite ${nodes.length}-${connections.length}`,
    };
    setSelection(selection);
  };

  const monthLabel = new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' }).format(new Date());
  const monthStart = startOfMonth(new Date());
  const starsThisMonth = nodes.filter((n) => {
    if (!n.answeredAt) return false;
    const t = new Date(n.answeredAt).getTime();
    return t >= monthStart;
  }).length;
  const totalStars = nodes.length;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <button
        type="button"
        onClick={() => router.push('/couple')}
        className="mb-6 inline-flex items-center justify-center rounded-lg border border-white/10 bg-white/5 px-3 py-1 text-sm font-medium text-slate-300 transition-colors duration-200 hover:bg-white/10"
      >
        ← Retour
      </button>

      {loading && <p className="py-8 text-center text-slate-400">Chargement de votre ciel…</p>}

      <ConstellationDouble
        nodes={nodes}
        connections={connections}
        onSelect={onSelect}
        canvasRef={canvasRef}
      />

      {!loading && totalStars === 0 ? (
        <div className="mt-6 rounded-2xl bg-white/[0.03] p-6 text-center">
          <p className="text-slate-200">Votre ciel est encore vierge.</p>
          <p className="mt-1 text-sm text-slate-400">
            Répondez à votre premier rituel pour faire naître vos premières étoiles en commun.
          </p>
          <button
            type="button"
            onClick={() => router.push('/couple')}
            className="mt-4 inline-flex items-center justify-center rounded-xl bg-amber-400 px-4 py-2 font-medium text-slate-900 hover:bg-amber-300"
          >
            Commencer le rituel
          </button>
        </div>
      ) : (
        <div className="mt-6">
          <ConstellationOverlay
            selection={selection}
            monthLabel={monthLabel}
            starsThisMonth={starsThisMonth}
            totalStars={totalStars}
            canvasRef={canvasRef as RefObject<HTMLCanvasElement>}
          />
        </div>
      )}
    </div>
  );
}

export default function ConstellationPage() {
  return (
    <CoupleDashboardProvider>
      <ConstellationPageInner />
    </CoupleDashboardProvider>
  );
}
