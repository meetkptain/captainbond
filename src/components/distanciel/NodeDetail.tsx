'use client';

import { TreeNode, TreeConnection } from '@/lib/db/types';

interface NodeDetailProps {
  node: TreeNode & { questionText?: string };
  allNodes: (TreeNode & { questionText?: string })[];
  connections: TreeConnection[];
  onClose: () => void;
  onSelectNode: (nodeId: string) => void;
  isValidated?: boolean;
  onToggleValidate?: () => void;
}

export function NodeDetail({
  node,
  allNodes,
  connections,
  onClose,
  onSelectNode,
  isValidated = false,
  onToggleValidate,
}: NodeDetailProps) {
  // Find connections related to this node
  const relatedConnections = connections.filter(
    (c) => c.sourceId === node.id || c.targetId === node.id
  );

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

  const getCategoryGlow = (cat: string) => {
    switch (cat.toUpperCase()) {
      case 'DEEP':
        return 'shadow-[0_0_20px_rgba(245,158,11,0.15)] border-amber-500/30';
      case 'SPICY':
        return 'shadow-[0_0_20px_rgba(244,63,94,0.15)] border-rose-500/30';
      case 'CHILL':
      case 'ICEBREAKER':
        return 'shadow-[0_0_20px_rgba(16,185,129,0.15)] border-emerald-500/30';
      default:
        return 'shadow-[0_0_20px_rgba(14,165,233,0.15)] border-sky-500/30';
    }
  };

  return (
    <div className={`w-full max-w-md p-6 bg-slate-900/90 backdrop-blur-lg rounded-3xl border transition-all duration-300 ${getCategoryGlow(node.category)}`}>
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex flex-col gap-1.5">
          <span className={`px-2.5 py-1 text-xs font-bold tracking-wider rounded-md border w-fit ${getCategoryColor(node.category)}`}>
            {node.category.toUpperCase()}
          </span>
          <span className="text-xs text-slate-500 font-mono">
            Nœud répondu par {node.answeredBy.join(' & ')}
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-500 hover:text-slate-350 hover:bg-slate-800/40 cursor-pointer transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="space-y-6">
        <div>
          <h4 className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">Question / Défi</h4>
          <p className="text-lg font-medium text-slate-100 leading-relaxed italic mb-4">
            &quot;{node.questionText || node.customText || 'Question personnalisée'}&quot;
          </p>

          {onToggleValidate && (
            <button
              onClick={onToggleValidate}
              className={`w-full py-2.5 rounded-xl border font-bold text-xs cursor-pointer transition-all flex items-center justify-center gap-2 ${
                isValidated
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.15)]'
                  : 'bg-slate-800/40 hover:bg-slate-700/50 border-slate-750 hover:border-slate-700 text-slate-450 hover:text-slate-300'
              }`}
            >
              {isValidated ? (
                <>
                  <span className="text-amber-400 font-bold">✓</span> Question Validée
                </>
              ) : (
                'Valider la question'
              )}
            </button>
          )}
        </div>

        {/* Resonance / Connections */}
        <div>
          <h4 className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-3">
            Résonances Sémantiques ({relatedConnections.length})
          </h4>
          {relatedConnections.length === 0 ? (
            <p className="text-sm text-slate-500 italic">
              Ce nœud flotte pour l&apos;instant de manière isolée dans votre esprit de couple. Répondez à d&apos;autres questions pour créer des ponts sémantiques.
            </p>
          ) : (
            <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
              {relatedConnections.map((c) => {
                const targetNodeId = c.sourceId === node.id ? c.targetId : c.sourceId;
                const targetNode = allNodes.find((n) => n.id === targetNodeId);
                const targetText = targetNode?.questionText || targetNode?.customText || 'Question';
                const percent = Math.round(c.resonance * 100);

                return (
                  <button
                    key={c.id}
                    onClick={() => onSelectNode(targetNodeId)}
                    className="w-full text-left p-3 rounded-xl bg-slate-800/30 hover:bg-slate-850/50 border border-slate-750/50 hover:border-slate-700/60 transition-all flex items-center justify-between gap-4 group cursor-pointer"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-400 group-hover:text-slate-300 font-medium truncate">
                        {targetText}
                      </p>
                      <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                        {targetNode?.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <div className="flex flex-col items-end">
                        <span className="text-xs font-bold text-amber-400">{percent}%</span>
                        <span className="text-[8px] text-slate-500 uppercase tracking-widest">resonance</span>
                      </div>
                      <svg className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 transition-all transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
