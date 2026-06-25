'use client';

import { useRef, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { TreeNode, TreeConnection } from '@/lib/db/types';

// Load ForceGraph2D dynamically to bypass Next.js SSR build errors (as it accesses window/canvas)
const ForceGraph2D = dynamic(
  () => import('react-force-graph-2d').then((mod) => mod.default),
  { ssr: false }
);

interface TreeVisualizationProps {
  nodes: (TreeNode & { questionText?: string })[];
  connections: TreeConnection[];
  onSelectNode: (node: TreeNode & { questionText?: string }) => void;
  selectedNodeId?: string | null;
}

interface GraphNode {
  id: string;
  label: string;
  color: string;
  category: string;
  raw: TreeNode & { questionText?: string };
  x?: number;
  y?: number;
}

interface GraphLink {
  source: string | GraphNode;
  target: string | GraphNode;
  value?: number;
}

export function TreeVisualization({
  nodes,
  connections,
  onSelectNode,
  selectedNodeId,
}: TreeVisualizationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 400, height: 400 });

  // Handle responsiveness
  useEffect(() => {
    if (!containerRef.current) return;
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setDimensions({
          width: entry.contentRect.width || 400,
          height: entry.contentRect.height || 400,
        });
      }
    });
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  const getCategoryColor = (cat: string) => {
    switch (cat.toUpperCase()) {
      case 'DEEP':
        return '#F59E0B'; // Amber
      case 'SPICY':
        return '#F43F5E'; // Rose
      case 'CHILL':
      case 'ICEBREAKER':
        return '#10B981'; // Emerald
      default:
        return '#0EA5E9'; // Sky
    }
  };

  // Convert raw DB nodes & connections to graph format expected by react-force-graph
  const graphData = {
    nodes: nodes.map((node) => ({
      id: node.id,
      label: node.questionText || node.customText || 'Question',
      color: getCategoryColor(node.category),
      category: node.category,
      raw: node,
    })),
    links: connections.map((conn) => ({
      source: conn.sourceId,
      target: conn.targetId,
      value: conn.resonance,
    })),
  };

  return (
    <div ref={containerRef} className="w-full h-full relative min-h-[350px] bg-slate-950/20 rounded-3xl overflow-hidden border border-slate-900/50">
      <ForceGraph2D
        graphData={graphData}
        width={dimensions.width}
        height={dimensions.height}
        backgroundColor="rgba(2, 6, 23, 0)" // transparent
        nodeRelSize={7}
        nodeVal={(node: unknown) => {
          const n = node as GraphNode;
          return n.id === selectedNodeId ? 14 : 7;
        }}
        linkColor={() => 'rgba(212, 175, 55, 0.25)'} // gold transparent links
        linkWidth={(link: unknown) => {
          const l = link as GraphLink;
          return l.value ? l.value * 3.5 : 1;
        }}
        linkDirectionalParticles={2}
        linkDirectionalParticleSpeed={(link: unknown) => {
          const l = link as GraphLink;
          return l.value ? l.value * 0.01 : 0.005;
        }}
        linkDirectionalParticleWidth={1.5}
        linkDirectionalParticleColor={() => '#F59E0B'}
        onNodeClick={(node: unknown) => {
          const n = node as GraphNode;
          onSelectNode(n.raw);
        }}
        cooldownTicks={100}
        
        // Custom canvas drawer to render glowing glassmorphic circles & labels on canvas
        nodeCanvasObject={(node: unknown, ctx: CanvasRenderingContext25D, globalScale: number) => {
          const n = node as GraphNode;
          const label = n.label;
          const fontSize = 12 / globalScale;
          ctx.font = `${fontSize}px font-sans, system-ui`;
          const textWidth = ctx.measureText(label).width;
          const bckgDimensions = [textWidth, fontSize].map((num) => num + fontSize * 0.2);

          const r = n.id === selectedNodeId ? 10 : 6;

          // Draw neon outer glow for selected node
          if (n.id === selectedNodeId) {
            ctx.shadowColor = n.color;
            ctx.shadowBlur = 15;
          }

          // Draw main node circle
          ctx.beginPath();
          ctx.arc(n.x ?? 0, n.y ?? 0, r, 0, 2 * Math.PI, false);
          ctx.fillStyle = n.color;
          ctx.fill();

          // Reset shadow
          ctx.shadowColor = 'transparent';
          ctx.shadowBlur = 0;

          // Draw thin white border
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 1 / globalScale;
          ctx.stroke();

          // Draw label background & text if zoomed in close enough
          if (globalScale > 1.2) {
            ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
            ctx.beginPath();
            ctx.roundRect(
              (n.x ?? 0) - bckgDimensions[0] / 2,
              (n.y ?? 0) - r - bckgDimensions[1] - 2,
              bckgDimensions[0],
              bckgDimensions[1],
              4
            );
            ctx.fill();
            
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
            ctx.stroke();

            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#E2E8F0';
            ctx.fillText(label, n.x ?? 0, (n.y ?? 0) - r - bckgDimensions[1] / 2 - 2);
          }
        }}
      />
    </div>
  );
}

// Minimal placeholder Canvas2D type helper for NodeCanvasObject
type CanvasRenderingContext25D = CanvasRenderingContext2D;
