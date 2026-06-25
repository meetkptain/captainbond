'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TreeVisualization } from '@/components/distanciel/TreeVisualization';
import { Tree3DVisualization } from '@/components/distanciel/Tree3DVisualization';
import { ComparisonView } from '@/components/distanciel/ComparisonView';
import { NodeDetail } from '@/components/distanciel/NodeDetail';
import { WeeklySummary } from '@/components/distanciel/WeeklySummary';
import { BackgroundOrbs } from '@/components/BackgroundOrbs';
import { api } from '@/lib/api/client';
import { TreeNode, TreeConnection } from '@/lib/db/types';
import { useTranslation } from '@/lib/i18n';
import {
  joinRemoteSession,
  leaveRemoteSession,
  broadcastNodeSelected,
  broadcastQuestionValidated,
} from '@/services/distanciel/syncService';

// Seed mock data for demonstration when DB tables are empty
const MOCK_NODES: (TreeNode & { questionText?: string })[] = [
  { id: 'n-1', treeId: 't-1', customText: "Quel est ton plus vieux souvenir joyeux ?", intensity: 1, category: 'CHILL', answeredBy: ['Alex', 'Sam'], questionText: "Quel est ton plus vieux souvenir joyeux ?", answeredAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'n-2', treeId: 't-1', customText: "Quelle blessure d'enfance te guide encore ?", intensity: 3, category: 'DEEP', answeredBy: ['Alex', 'Sam'], questionText: "Quelle blessure d'enfance te guide encore ?", answeredAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'n-3', treeId: 't-1', customText: "Quel est l'endroit le plus insolite où tu veux faire l'amour ?", intensity: 2, category: 'SPICY', answeredBy: ['Alex', 'Sam'], questionText: "Quel est l'endroit le plus insolite où tu veux faire l'amour ?", answeredAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'n-4', treeId: 't-1', customText: "Comment définirais-tu notre complicité en 3 mots ?", intensity: 2, category: 'DEEP', answeredBy: ['Alex', 'Sam'], questionText: "Comment définirais-tu notre complicité en 3 mots ?", answeredAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'n-5', treeId: 't-1', customText: "Raconte ta pire honte de lycée.", intensity: 1, category: 'CHILL', answeredBy: ['Alex', 'Sam'], questionText: "Raconte ta pire honte de lycée.", answeredAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
];

const MOCK_CONNECTIONS: TreeConnection[] = [
  { id: 'c-1', treeId: 't-1', sourceId: 'n-1', targetId: 'n-2', resonance: 0.81, type: 'SIMILARITY' },
  { id: 'c-2', treeId: 't-1', sourceId: 'n-2', targetId: 'n-4', resonance: 0.88, type: 'SIMILARITY' },
  { id: 'c-3', treeId: 't-1', sourceId: 'n-1', targetId: 'n-5', resonance: 0.76, type: 'SIMILARITY' },
];

type ViewMode = 'GRAPH' | 'TIMELINE' | 'CLUSTERS';

export default function NeuralTreePage() {
  const router = useRouter();
  const { t, language, setLanguage } = useTranslation();
  
  // Data State
  const [nodes, setNodes] = useState<(TreeNode & { questionText?: string })[]>(MOCK_NODES);
  const [connections, setConnections] = useState<TreeConnection[]>(MOCK_CONNECTIONS);
  const [loading, setLoading] = useState(true);
  
  // UI Controls State
  const [viewMode, setViewMode] = useState<ViewMode>('GRAPH');
  const [dimension3D, setDimension3D] = useState(true); // Default to 3D for premium feels
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'CHILL' | 'DEEP' | 'SPICY'>('ALL');
  const [intensityFilter, setIntensityFilter] = useState<'ALL' | '1' | '2' | '3'>('ALL');
  const [selectedNode, setSelectedNode] = useState<(TreeNode & { questionText?: string }) | null>(null);
  const [showWeeklySummary, setShowWeeklySummary] = useState(false);
  const [showComparison, setShowComparison] = useState(false);

  // Sync state
  const [partnerSelectedNodeId, setPartnerSelectedNodeId] = useState<string | null>(null);
  const [validatedNodeIds, setValidatedNodeIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function loadTreeData() {
      try {
        // Fetch from API
        const result = await api.get<{
          nodes: (TreeNode & { questionText?: string })[];
          connections: TreeConnection[];
        }>('/api/trees/get?coupleId=demo-couple');
        
        if (result.nodes && result.nodes.length > 0) {
          setNodes(result.nodes);
          setConnections(result.connections || []);
        }
      } catch (err) {
        console.error('No custom database records found, displaying pre-seeded neural tree:', err);
      } finally {
        setLoading(false);
      }
    }
    loadTreeData();

    // Subscribe to remote real-time session
    joinRemoteSession('demo-couple-room', 'sam-id', (event) => {
      if (event.type === 'node_selected') {
        setPartnerSelectedNodeId(event.payload.nodeId);
      } else if (event.type === 'question_validated') {
        const { nodeId, validated } = event.payload;
        setValidatedNodeIds((prev) => {
          const next = new Set(prev);
          if (validated) next.add(nodeId);
          else next.delete(nodeId);
          return next;
        });
      } else if (event.type === 'node_answered') {
        const { nodeId, answeredBy } = event.payload;
        setNodes((prev) =>
          prev.map((n) => (n.id === nodeId ? { ...n, answeredBy } : n))
        );
      }
    });

    return () => {
      leaveRemoteSession('demo-couple-room');
    };
  }, []);

  const handleSelectNode = (node: (TreeNode & { questionText?: string }) | null) => {
    setSelectedNode(node);
    broadcastNodeSelected('demo-couple-room', 'sam-id', node ? node.id : null);
  };

  const handleSelectNodeId = (nodeId: string) => {
    const matched = nodes.find((n) => n.id === nodeId);
    if (matched) handleSelectNode(matched);
  };

  const handleToggleValidate = (nodeId: string) => {
    const isCurrentlyValidated = validatedNodeIds.has(nodeId);
    const nextState = !isCurrentlyValidated;

    setValidatedNodeIds((prev) => {
      const next = new Set(prev);
      if (nextState) next.add(nodeId);
      else next.delete(nodeId);
      return next;
    });

    broadcastQuestionValidated('demo-couple-room', 'sam-id', nodeId, nextState);
  };

  const getCategoryColor = (cat: string) => {
    switch (cat.toUpperCase()) {
      case 'DEEP':
        return 'text-amber-400 border-amber-500/30 bg-amber-500/5';
      case 'SPICY':
        return 'text-rose-400 border-rose-500/30 bg-rose-500/5';
      case 'CHILL':
      case 'ICEBREAKER':
        return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/5';
      default:
        return 'text-sky-400 border-sky-500/30 bg-sky-500/5';
    }
  };

  // Helper function to remove accents and make lowercase for fuzzy search
  const normalizeText = (text: string) =>
    text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

  // Filter nodes client-side based on search query, category, and intensity filters
  const filteredNodes = nodes.filter((node) => {
    const text = node.questionText || node.customText || '';
    const matchesSearch = normalizeText(text).includes(normalizeText(searchQuery));
    const matchesCategory = categoryFilter === 'ALL' || node.category.toUpperCase() === categoryFilter.toUpperCase();
    const matchesIntensity = intensityFilter === 'ALL' || node.intensity === Number(intensityFilter);
    return matchesSearch && matchesCategory && matchesIntensity;
  });

  // Filter connections: keep only links between nodes that are BOTH present in the filtered nodes list
  const filteredNodeIds = new Set(filteredNodes.map((n) => n.id));
  const filteredConnections = connections.filter(
    (c) => filteredNodeIds.has(c.sourceId) && filteredNodeIds.has(c.targetId)
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 relative overflow-hidden px-4 py-8">
      <BackgroundOrbs />

      {/* Weekly Summary Modal */}
      {showWeeklySummary && (
        <WeeklySummary
          partnerName="Alex"
          onClose={() => setShowWeeklySummary(false)}
        />
      )}

      {/* Header */}
      <div className="w-full max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 z-10">
        <div className="flex flex-col">
          <span className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-400 tracking-tight">
            {t('tree_header')}
          </span>
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono">
            {t('tree_subtitle')}
          </span>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Language Selector */}
          <div className="flex rounded-xl bg-slate-900 p-1 border border-slate-800">
            <button
              onClick={() => setLanguage('fr')}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-all ${
                language === 'fr' ? 'bg-slate-800 text-slate-100' : 'text-slate-550'
              }`}
            >
              FR
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-all ${
                language === 'en' ? 'bg-slate-800 text-slate-100' : 'text-slate-550'
              }`}
            >
              EN
            </button>
          </div>

          <button
            onClick={() => setShowComparison(true)}
            className="flex-1 md:flex-none px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-bold rounded-xl border border-slate-800 cursor-pointer transition-all flex items-center justify-center gap-1.5"
          >
            ⚖️ Comparer
          </button>

          <button
            onClick={() => setShowWeeklySummary(true)}
            className="flex-1 md:flex-none px-4 py-2 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 hover:from-amber-500/30 hover:to-yellow-500/30 text-amber-400 text-xs font-bold rounded-xl border border-amber-500/30 cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(245,158,11,0.1)]"
          >
            {t('tree_weekly_summary')}
          </button>
          
          <button
            onClick={() => router.push('/couple')}
            className="flex-1 md:flex-none px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-bold rounded-xl border border-slate-800 cursor-pointer transition-all flex items-center justify-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
            </svg>
            {t('tree_back')}
          </button>
        </div>
      </div>

      {/* Control Panel: Search & Filters */}
      <div className="w-full max-w-6xl mx-auto mb-6 p-4 bg-slate-900/40 backdrop-blur-md rounded-2xl border border-slate-800/60 z-10 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        
        {/* Search */}
        <div className="relative flex-1">
          <input
            type="text"
            placeholder={t('tree_search_placeholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950/40 border border-slate-800 focus:border-amber-500/50 rounded-xl text-xs text-slate-250 focus:outline-none transition-all placeholder:text-slate-650"
          />
          <svg className="w-3.5 h-3.5 text-slate-600 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Category Filter */}
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mr-1">{t('tree_filter_category')}</span>
            {(['ALL', 'CHILL', 'DEEP', 'SPICY'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer transition-all border ${
                  categoryFilter === cat
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    : 'bg-slate-950/20 text-slate-500 border-slate-850 hover:border-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Intensity Filter */}
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mr-1">{t('tree_filter_intensity')}</span>
            {(['ALL', '1', '2', '3'] as const).map((intensity) => (
              <button
                key={intensity}
                onClick={() => setIntensityFilter(intensity)}
                className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer transition-all border ${
                  intensityFilter === intensity
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    : 'bg-slate-950/20 text-slate-500 border-slate-850 hover:border-slate-800'
                }`}
              >
                {intensity}
              </button>
            ))}
          </div>
        </div>

        {/* View Mode & Dimensions Toggle */}
        <div className="flex items-center gap-3">
          {viewMode === 'GRAPH' && (
            <div className="flex rounded-xl bg-slate-950/50 p-1 border border-slate-850/60">
              <button
                onClick={() => setDimension3D(false)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer transition-all ${
                  !dimension3D
                    ? 'bg-slate-800 text-slate-100 shadow-md'
                    : 'text-slate-550 hover:text-slate-400'
                }`}
              >
                2D
              </button>
              <button
                onClick={() => setDimension3D(true)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer transition-all ${
                  dimension3D
                    ? 'bg-slate-800 text-slate-100 shadow-md'
                    : 'text-slate-550 hover:text-slate-400'
                }`}
              >
                3D
              </button>
            </div>
          )}

          <div className="flex rounded-xl bg-slate-950/50 p-1 border border-slate-850/60">
            {(['GRAPH', 'TIMELINE', 'CLUSTERS'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer transition-all ${
                  viewMode === mode
                    ? 'bg-slate-800 text-slate-100 shadow-md'
                    : 'text-slate-550 hover:text-slate-400'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch z-10 min-h-[500px]">
        
        {/* Primary View Area (take 2 cols) */}
        <div className="lg:col-span-2 relative h-full flex flex-col">
          {loading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/40 rounded-3xl border border-slate-900/50">
              <div className="w-10 h-10 border-4 border-amber-500/10 border-t-amber-500 rounded-full animate-spin" />
              <p className="text-xs text-slate-500 mt-3 font-semibold">Génération des branches...</p>
            </div>
          ) : (
            <>
              {/* View 1: Graph */}
              {viewMode === 'GRAPH' && (
                dimension3D ? (
                  <Tree3DVisualization
                    nodes={filteredNodes}
                    connections={filteredConnections}
                    onSelectNode={handleSelectNode}
                    selectedNodeId={selectedNode?.id}
                  />
                ) : (
                  <TreeVisualization
                    nodes={filteredNodes}
                    connections={filteredConnections}
                    onSelectNode={handleSelectNode}
                    selectedNodeId={selectedNode?.id}
                  />
                )
              )}

              {/* View 2: Chronological Timeline */}
              {viewMode === 'TIMELINE' && (
                <div className="space-y-4 max-h-[600px] overflow-y-auto w-full p-2 pr-4 custom-scrollbar">
                  {filteredNodes.length === 0 ? (
                    <div className="p-8 text-center bg-slate-900/20 border border-slate-900/40 rounded-2xl italic text-slate-500 text-xs">
                      Aucun nœud ne correspond aux critères de recherche.
                    </div>
                  ) : (
                    filteredNodes.map((node, index) => (
                      <div key={node.id} className="relative flex gap-6 items-start">
                        {index < filteredNodes.length - 1 && (
                          <div className="absolute left-[19px] top-10 bottom-0 w-0.5 bg-slate-800/40" />
                        )}
                        
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-900 border border-slate-800 font-mono text-sm font-bold text-amber-400 shadow-md">
                          {index + 1}
                        </div>

                        <div className="flex-1 p-5 bg-slate-900/40 backdrop-blur-sm border border-slate-800/60 rounded-2xl space-y-3">
                          <div className="flex justify-between items-center">
                            <span className={`px-2 py-0.5 text-[9px] font-bold rounded uppercase tracking-wider border ${getCategoryColor(node.category)}`}>
                              {node.category}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">
                              {node.answeredAt ? new Date(node.answeredAt).toLocaleDateString('fr-FR') : 'Date inconnue'}
                            </span>
                          </div>
                          <p className="text-sm font-medium text-slate-200 leading-relaxed italic">
                            &quot;{node.questionText || node.customText || 'Question'}&quot;
                          </p>
                          
                          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-850/30">
                            <div className="text-xs">
                              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block mb-0.5">Sam</span>
                              <span className="text-slate-400 italic font-sans">&quot;C&apos;est ma réponse secrète...&quot;</span>
                            </div>
                            <div className="text-xs">
                              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block mb-0.5">Alex</span>
                              <span className="text-slate-400 italic font-sans">&quot;C&apos;est la sienne...&quot;</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* View 3: Category Clusters Grid */}
              {viewMode === 'CLUSTERS' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full h-full items-start">
                  {(['CHILL', 'DEEP', 'SPICY'] as const).map((cat) => {
                    const catNodes = filteredNodes.filter((n) => n.category.toUpperCase() === cat);
                    return (
                      <div key={cat} className="p-5 bg-slate-900/30 backdrop-blur-sm border border-slate-900/60 rounded-3xl space-y-4 flex flex-col max-h-[550px]">
                        <div className="flex items-center justify-between border-b border-slate-850/60 pb-3">
                          <h4 className={`font-bold text-xs tracking-wider uppercase px-2 py-0.5 rounded border ${getCategoryColor(cat)}`}>
                            {cat}
                          </h4>
                          <span className="px-2 py-0.5 rounded-full bg-slate-800/50 text-[10px] text-slate-400 font-bold font-mono">
                            {catNodes.length} nœuds
                          </span>
                        </div>

                        <div className="space-y-3 overflow-y-auto flex-1 pr-1 custom-scrollbar">
                          {catNodes.length === 0 ? (
                            <p className="text-xs text-slate-500 italic py-4 text-center">Aucun nœud dans cette catégorie.</p>
                          ) : (
                            catNodes.map((node) => (
                              <button
                                key={node.id}
                                onClick={() => setSelectedNode(node)}
                                className="w-full text-left p-3.5 bg-slate-900/40 hover:bg-slate-850/40 border border-slate-800/40 hover:border-slate-750/50 rounded-xl transition-all cursor-pointer group"
                              >
                                <p className="text-xs text-slate-300 group-hover:text-amber-400 font-medium leading-relaxed italic truncate">
                                  &quot;{node.questionText || node.customText || 'Question'}&quot;
                                </p>
                                <div className="flex justify-between items-center mt-2 text-[8px] text-slate-500 font-mono uppercase tracking-wider">
                                  <span>Intensité {node.intensity}</span>
                                  <span>{node.answeredBy.join(' & ')}</span>
                                </div>
                              </button>
                            ))
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>

        {/* Node detail panel (take 1 col) */}
        <div className="flex items-start justify-center">
          {selectedNode ? (
            <NodeDetail
              node={selectedNode}
              allNodes={nodes}
              connections={connections}
              onClose={() => handleSelectNode(null)}
              onSelectNode={handleSelectNodeId}
              isValidated={validatedNodeIds.has(selectedNode.id)}
              onToggleValidate={() => handleToggleValidate(selectedNode.id)}
            />
          ) : (
            <div className="w-full p-8 bg-slate-900/30 backdrop-blur-sm rounded-3xl border border-slate-800/40 text-center flex flex-col items-center justify-center gap-4 min-h-[300px]">
              <span className="text-5xl animate-pulse">🌿</span>
              <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                {t('tree_select_node_title')}
              </h4>
              <p className="text-xs text-slate-500 max-w-[200px] leading-relaxed">
                {t('tree_select_node_desc')}
              </p>
              {partnerSelectedNodeId && (
                <div className="px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[10px] text-amber-400 font-bold uppercase tracking-wider animate-pulse">
                  Alex explore un nœud...
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {showComparison && (
        <ComparisonView
          treeA={{ nodes, connections, name: "Sam & Alex" }}
          onClose={() => setShowComparison(false)}
        />
      )}
    </div>
  );
}
