'use client';

import { useState } from 'react';
import { TreeNode, TreeConnection } from '@/lib/db/types';
import { Tree3DVisualization } from './Tree3DVisualization';
import { TreeVisualization } from './TreeVisualization';

interface ComparisonViewProps {
  treeA: {
    nodes: (TreeNode & { questionText?: string })[];
    connections: TreeConnection[];
    name: string;
  };
  treeB?: {
    nodes: (TreeNode & { questionText?: string })[];
    connections: TreeConnection[];
    name: string;
  };
  onClose: () => void;
}

// Generate a mock Tree B if none is supplied
const generateMockTreeB = (nodesA: (TreeNode & { questionText?: string })[]): {
  nodes: (TreeNode & { questionText?: string })[];
  connections: TreeConnection[];
  name: string;
} => {
  // Share some nodes, modify others
  const sharedNodes = nodesA.slice(0, 3).map(n => ({
    ...n,
    id: `shared-${n.id}`,
    customText: `${n.customText}`,
  }));

  const uniqueNodes = [
    { id: 'b-1', treeId: 'tb-1', customText: "Quel est ton plus grand rêve secret ?", intensity: 2, category: 'DEEP', answeredBy: ['Community'], questionText: "Quel est ton plus grand rêve secret ?" },
    { id: 'b-2', treeId: 'tb-1', customText: "Quelle est ton idée d'un rencard parfait ?", intensity: 1, category: 'CHILL', answeredBy: ['Community'], questionText: "Quelle est ton idée d'un rencard parfait ?" },
  ];

  const allNodes = [...sharedNodes, ...uniqueNodes];
  const connections: TreeConnection[] = [
    { id: 'cb-1', treeId: 'tb-1', sourceId: sharedNodes[0].id, targetId: sharedNodes[1].id, resonance: 0.92, type: 'SIMILARITY' },
    { id: 'cb-2', treeId: 'tb-1', sourceId: sharedNodes[1].id, targetId: uniqueNodes[0].id, resonance: 0.78, type: 'SIMILARITY' },
  ];

  return {
    nodes: allNodes,
    connections,
    name: "Moyenne Communauté"
  };
};

export function ComparisonView({
  treeA,
  treeB,
  onClose,
}: ComparisonViewProps) {
  const [layoutMode, setLayoutMode] = useState<'SIDE_BY_SIDE' | 'OVERLAP'>('SIDE_BY_SIDE');
  const [dimension3D, setDimension3D] = useState<boolean>(true);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const finalTreeB = treeB || generateMockTreeB(treeA.nodes);

  // Compute common questions
  const questionsB = new Set(finalTreeB.nodes.map(nb => nb.questionText || nb.customText || ''));
  const commonNodesInA = treeA.nodes.filter(n => {
    const text = n.questionText || n.customText || '';
    return questionsB.has(text);
  });

  const compatibilityScore = Math.min(
    100,
    Math.round((commonNodesInA.length / Math.max(1, treeA.nodes.length)) * 40 + 60)
  );

  const handleSelectNode = (node: TreeNode & { questionText?: string }) => {
    setSelectedNodeId(node.id);
  };

  // Overlap tree merge nodes
  const getMergedTree = () => {
    const mergedNodes: (TreeNode & { questionText?: string })[] = [];
    const mergedConnections: TreeConnection[] = [];

    // Add Tree A
    treeA.nodes.forEach((n) => {
      const isCommon = finalTreeB.nodes.some(
        (nb) => (nb.questionText || nb.customText || '') === (n.questionText || n.customText || '')
      );
      mergedNodes.push({
        ...n,
        id: `treeA-${n.id}`,
        // Decorate category name for visual color difference in merged tree
        category: isCommon ? 'DEEP' : 'CHILL', 
      });
    });

    // Add Tree B unique nodes
    finalTreeB.nodes.forEach((nb) => {
      const isCommon = treeA.nodes.some(
        (na) => (na.questionText || na.customText || '') === (nb.questionText || nb.customText || '')
      );
      if (!isCommon) {
        mergedNodes.push({
          ...nb,
          id: `treeB-${nb.id}`,
          category: 'SPICY', // Render with rose
        });
      }
    });

    // Map connections
    treeA.connections.forEach((c, index) => {
      mergedConnections.push({
        ...c,
        id: `merged-c-a-${index}`,
        sourceId: `treeA-${c.sourceId}`,
        targetId: `treeA-${c.targetId}`,
      });
    });

    return { nodes: mergedNodes, connections: mergedConnections };
  };

  const mergedTree = getMergedTree();

  return (
    <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-md z-50 flex flex-col p-4 md:p-8 animate-[fadeIn_0.25s_ease-out] overflow-y-auto">
      {/* Top Banner */}
      <div className="w-full max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-900 pb-6 mb-6">
        <div>
          <h2 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-400 uppercase tracking-tight">
            Analyse Comparative d&apos;Arbres
          </h2>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider font-mono">
            {treeA.name} vs. {finalTreeB.name}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Dimension toggle */}
          <div className="flex rounded-xl bg-slate-900 p-1 border border-slate-800">
            <button
              onClick={() => setDimension3D(false)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                !dimension3D ? 'bg-slate-800 text-slate-100' : 'text-slate-500'
              }`}
            >
              2D
            </button>
            <button
              onClick={() => setDimension3D(true)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                dimension3D ? 'bg-slate-800 text-slate-100' : 'text-slate-500'
              }`}
            >
              3D
            </button>
          </div>

          {/* Layout mode toggle */}
          <div className="flex rounded-xl bg-slate-900 p-1 border border-slate-800">
            <button
              onClick={() => setLayoutMode('SIDE_BY_SIDE')}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                layoutMode === 'SIDE_BY_SIDE' ? 'bg-slate-800 text-slate-100' : 'text-slate-500'
              }`}
            >
              Côte à côte
            </button>
            <button
              onClick={() => setLayoutMode('OVERLAP')}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                layoutMode === 'OVERLAP' ? 'bg-slate-800 text-slate-100' : 'text-slate-500'
              }`}
            >
              Superposé
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-bold rounded-xl cursor-pointer transition-all"
          >
            Fermer
          </button>
        </div>
      </div>

      {/* Resonance Compatibility score header */}
      <div className="w-full max-w-6xl mx-auto mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-slate-900/40 border border-slate-850 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block">Score de Similitude</span>
            <p className="text-xs text-slate-400">Degré de résonance entre vos thèmes.</p>
          </div>
          <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-400 font-mono">
            {compatibilityScore}%
          </span>
        </div>

        <div className="p-4 bg-slate-900/40 border border-slate-850 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block">Nœuds en Résonance</span>
            <p className="text-xs text-slate-400">Questions partagées en commun.</p>
          </div>
          <span className="text-3xl font-black text-slate-200 font-mono">
            {commonNodesInA.length} / {treeA.nodes.length}
          </span>
        </div>

        <div className="p-4 bg-slate-900/40 border border-slate-850 rounded-2xl">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-1">
            Légende Superposée
          </span>
          <div className="flex gap-4 items-center">
            <span className="flex items-center gap-1.5 text-xs text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-500" /> Unique {treeA.name}
            </span>
            <span className="flex items-center gap-1.5 text-xs text-amber-400">
              <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" /> Partagé (Résonant)
            </span>
            <span className="flex items-center gap-1.5 text-xs text-rose-450">
              <span className="h-2 w-2 rounded-full bg-rose-500" /> Unique {finalTreeB.name}
            </span>
          </div>
        </div>
      </div>

      {/* Main Graph Content */}
      <div className="flex-1 w-full max-w-6xl mx-auto min-h-[450px]">
        {layoutMode === 'SIDE_BY_SIDE' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full items-stretch">
            {/* Tree A */}
            <div className="flex flex-col space-y-3 h-full">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest px-2">
                🌳 {treeA.name}
              </span>
              <div className="flex-1 min-h-[380px]">
                {dimension3D ? (
                  <Tree3DVisualization
                    nodes={treeA.nodes}
                    connections={treeA.connections}
                    onSelectNode={handleSelectNode}
                    selectedNodeId={selectedNodeId}
                  />
                ) : (
                  <TreeVisualization
                    nodes={treeA.nodes}
                    connections={treeA.connections}
                    onSelectNode={handleSelectNode}
                    selectedNodeId={selectedNodeId}
                  />
                )}
              </div>
            </div>

            {/* Tree B */}
            <div className="flex flex-col space-y-3 h-full">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest px-2">
                🌳 {finalTreeB.name}
              </span>
              <div className="flex-1 min-h-[380px]">
                {dimension3D ? (
                  <Tree3DVisualization
                    nodes={finalTreeB.nodes}
                    connections={finalTreeB.connections}
                    onSelectNode={handleSelectNode}
                    selectedNodeId={selectedNodeId}
                  />
                ) : (
                  <TreeVisualization
                    nodes={finalTreeB.nodes}
                    connections={finalTreeB.connections}
                    onSelectNode={handleSelectNode}
                    selectedNodeId={selectedNodeId}
                  />
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full h-full min-h-[450px]">
            {dimension3D ? (
              <Tree3DVisualization
                nodes={mergedTree.nodes}
                connections={mergedTree.connections}
                onSelectNode={handleSelectNode}
                selectedNodeId={selectedNodeId}
              />
            ) : (
              <TreeVisualization
                nodes={mergedTree.nodes}
                connections={mergedTree.connections}
                onSelectNode={handleSelectNode}
                selectedNodeId={selectedNodeId}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
