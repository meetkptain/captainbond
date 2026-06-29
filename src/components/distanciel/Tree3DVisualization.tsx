'use client';

import { useRef, useEffect, useState, MouseEvent, TouchEvent, useCallback, useMemo } from 'react';
import { TreeNode, TreeConnection } from '@/lib/db/types';

interface Tree3DVisualizationProps {
  nodes: (TreeNode & { questionText?: string })[];
  connections: TreeConnection[];
  onSelectNode: (node: TreeNode & { questionText?: string }) => void;
  selectedNodeId?: string | null;
}

interface Point3D {
  x: number;
  y: number;
  z: number;
}

interface RenderNode {
  id: string;
  label: string;
  category: string;
  color: string;
  raw: TreeNode & { questionText?: string };
  // 3D coordinates
  local: Point3D;
  rotated: Point3D;
  // 2D projection
  screenX: number;
  screenY: number;
  scale: number;
  visible: boolean;
}

interface RenderLink {
  source: RenderNode;
  target: RenderNode;
  value: number;
  avgZ: number;
}

export function Tree3DVisualization({
  nodes,
  connections,
  onSelectNode,
  selectedNodeId,
}: Tree3DVisualizationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [dimensions, setDimensions] = useState({ width: 400, height: 400 });
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  // Rotation angles (radians)
  const rotationX = useRef<number>(-0.3); // Slight tilt down
  const rotationY = useRef<number>(0.5);  // Slight angle
  const isDragging = useRef<boolean>(false);
  const dragStart = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const lastRotation = useRef<{ x: number; y: number }>({ x: -0.3, y: 0.5 });
  const hasDragged = useRef<boolean>(false);

  // Handle container resizing
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

  // Generate stable 3D positions for nodes using Spherical Fibonacci lattice (calculated only when nodes change)
  const initialNodesWithPositions = useMemo((): RenderNode[] => {
    const total = nodes.length;
    return nodes.map((node, index) => {
      // Deterministic spread on a sphere
      const phi = Math.acos(-1 + (2 * index) / Math.max(total, 1));
      const theta = Math.sqrt(Math.max(total, 1) * Math.PI) * phi;
      const radius = 100; // Sphere radius

      const x = radius * Math.cos(theta) * Math.sin(phi);
      const y = radius * Math.sin(theta) * Math.sin(phi);
      const z = radius * Math.cos(phi);

      return {
        id: node.id,
        label: node.questionText || node.customText || 'Question',
        category: node.category,
        color: getCategoryColor(node.category),
        raw: node,
        local: { x, y, z },
        rotated: { x: 0, y: 0, z: 0 },
        screenX: 0,
        screenY: 0,
        scale: 1,
        visible: true,
      };
    });
  }, [nodes]);

  // Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    // Deep clone positions to allow in-place mutations during rotation updates
    const renderNodes = initialNodesWithPositions.map((node: RenderNode) => ({
      ...node,
      rotated: { ...node.rotated },
      local: { ...node.local }
    }));

    const render = () => {
      // Auto-rotate slowly when not dragging
      if (!isDragging.current) {
        rotationY.current += 0.002;
      }

      const rx = rotationX.current;
      const ry = rotationY.current;

      const centerX = dimensions.width / 2;
      const centerY = dimensions.height / 2;
      const focalLength = 300;
      const zOffset = 220;

      // 1. Calculate positions and project (Reuse local static positions, avoid recreating arrays)
      renderNodes.forEach((rn: RenderNode) => {
        const { x, y, z } = rn.local;

        // Rotate Y (horizontal rotation)
        const x1 = x * Math.cos(ry) + z * Math.sin(ry);
        const z1 = -x * Math.sin(ry) + z * Math.cos(ry);

        // Rotate X (vertical rotation)
        const y2 = y * Math.cos(rx) - z1 * Math.sin(rx);
        const z2 = y * Math.sin(rx) + z1 * Math.cos(rx);

        rn.rotated = { x: x1, y: y2, z: z2 };

        // Perspective scale factor
        const scale = focalLength / (focalLength + z2 + zOffset);
        rn.scale = scale;
        rn.screenX = centerX + x1 * scale * 1.5;
        rn.screenY = centerY + y2 * scale * 1.5;
        rn.visible = z2 + zOffset > 10; // Simple clip plane
      });

      // 2. Build and map links
      const renderLinks: RenderLink[] = [];
      connections.forEach((conn) => {
        const sourceNode = renderNodes.find((n: RenderNode) => n.id === conn.sourceId);
        const targetNode = renderNodes.find((n: RenderNode) => n.id === conn.targetId);

        if (sourceNode && targetNode && sourceNode.visible && targetNode.visible) {
          renderLinks.push({
            source: sourceNode,
            target: targetNode,
            value: conn.resonance,
            avgZ: (sourceNode.rotated.z + targetNode.rotated.z) / 2,
          });
        }
      });

      // 3. Clear canvas
      ctx.clearRect(0, 0, dimensions.width, dimensions.height);

      // 4. Draw Links (Painter's algorithm: sort connections by depth and draw back-to-front)
      renderLinks.sort((a, b) => b.avgZ - a.avgZ);
      renderLinks.forEach((link) => {
        const scaleAvg = (link.source.scale + link.target.scale) / 2;
        const opacity = Math.max(0.05, Math.min(0.3, scaleAvg * 0.25));

        ctx.beginPath();
        ctx.moveTo(link.source.screenX, link.source.screenY);
        ctx.lineTo(link.target.screenX, link.target.screenY);
        ctx.strokeStyle = `rgba(212, 175, 55, ${opacity * (link.value ? link.value * 2 : 1)})`; // Amber-gold line
        ctx.lineWidth = Math.max(0.5, (link.value ? link.value * 2.5 : 1) * scaleAvg);
        ctx.stroke();

        // If high resonance connection, draw subtle particles
        if (link.value && link.value > 0.8 && scaleAvg > 0.8) {
          const t = (Date.now() / 1500) % 1;
          const px = link.source.screenX + (link.target.screenX - link.source.screenX) * t;
          const py = link.source.screenY + (link.target.screenY - link.source.screenY) * t;
          ctx.beginPath();
          ctx.arc(px, py, 1.5 * scaleAvg, 0, 2 * Math.PI);
          ctx.fillStyle = '#F59E0B'; // Glowing amber particle
          ctx.fill();
        }
      });

      // 5. Draw Nodes (sort by z depth and draw back-to-front)
      const sortedNodes = [...renderNodes].sort((a, b) => b.rotated.z - a.rotated.z);
      sortedNodes.forEach((rn) => {
        if (!rn.visible) return;

        const isSelected = rn.id === selectedNodeId;
        const isHovered = rn.id === hoveredNodeId;
        const baseRadius = isSelected ? 11 : isHovered ? 9 : 6;
        const r = Math.max(2, baseRadius * rn.scale);

        // Draw shadow glow for selected or hovered nodes
        if (isSelected || isHovered) {
          ctx.save();
          ctx.shadowColor = rn.color;
          ctx.shadowBlur = isSelected ? 15 : 8;
        }

        ctx.beginPath();
        ctx.arc(rn.screenX, rn.screenY, r, 0, 2 * Math.PI);
        ctx.fillStyle = rn.color;
        ctx.fill();

        if (isSelected || isHovered) {
          ctx.restore();
        }

        // Draw thin white border for high-end glass look
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = Math.max(0.5, 1 * rn.scale);
        ctx.stroke();

        // Draw node labels on hover, selection, or if node is in the front half (closer to camera)
        const isCloseToFront = rn.rotated.z < -20;
        if (isSelected || isHovered || (isCloseToFront && rn.scale > 0.95)) {
          const fontSize = Math.max(8, Math.min(11, 10 * rn.scale));
          ctx.font = `${isSelected || isHovered ? 'bold' : 'normal'} ${fontSize}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'top';

          // Background box for label to make it readable
          const labelText = rn.label;
          const textWidth = ctx.measureText(labelText).width;
          const paddingX = 6;
          const paddingY = 3;

          ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
          ctx.beginPath();
          ctx.roundRect(
            rn.screenX - textWidth / 2 - paddingX,
            rn.screenY + r + 4,
            textWidth + paddingX * 2,
            fontSize + paddingY * 2,
            4
          );
          ctx.fill();

          ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
          ctx.lineWidth = 0.5;
          ctx.stroke();

          // Label Text
          ctx.fillStyle = isSelected ? '#F59E0B' : isHovered ? '#FFFFFF' : '#94A3B8';
          ctx.fillText(labelText, rn.screenX, rn.screenY + r + 4 + paddingY);
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [initialNodesWithPositions, connections, dimensions, selectedNodeId, hoveredNodeId]);

  // Mouse / Touch Interactivity
  const handleMouseDown = (e: MouseEvent<HTMLCanvasElement>) => {
    isDragging.current = true;
    hasDragged.current = false;
    dragStart.current = { x: e.clientX, y: e.clientY };
    lastRotation.current = { x: rotationX.current, y: rotationY.current };
  };

  const handleMouseMove = (e: MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (isDragging.current) {
      hasDragged.current = true;
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;

      // Update rotation angles with sensitivity
      rotationY.current = lastRotation.current.y + dx * 0.007;
      // Cap vertical rotation to avoid flipping upside down
      rotationX.current = Math.max(-1.3, Math.min(1.3, lastRotation.current.x + dy * 0.007));
    } else {
      // Hover detection
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      let foundHover: string | null = null;
      const renderNodes = initialNodesWithPositions;
      const centerX = dimensions.width / 2;
      const centerY = dimensions.height / 2;
      const focalLength = 300;
      const zOffset = 220;

      // Project positions to map with mouse
      for (const rn of renderNodes) {
        const { x, y, z } = rn.local;
        const x1 = x * Math.cos(rotationY.current) + z * Math.sin(rotationY.current);
        const z1 = -x * Math.sin(rotationY.current) + z * Math.cos(rotationY.current);
        const y2 = y * Math.cos(rotationX.current) - z1 * Math.sin(rotationX.current);
        const z2 = y * Math.sin(rotationX.current) + z1 * Math.cos(rotationX.current);

        const scale = focalLength / (focalLength + z2 + zOffset);
        const screenX = centerX + x1 * scale * 1.5;
        const screenY = centerY + y2 * scale * 1.5;

        const dist = Math.hypot(mouseX - screenX, mouseY - screenY);
        const baseRadius = rn.id === selectedNodeId ? 11 : 6;
        if (dist < Math.max(12, baseRadius * scale * 1.8)) {
          foundHover = rn.id;
          break;
        }
      }

      setHoveredNodeId(foundHover);
      canvas.style.cursor = foundHover ? 'pointer' : 'grab';
    }
  };

  const handleMouseUpOrLeave = (e: MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging.current) return;
    isDragging.current = false;

    // Handle Click
    if (!hasDragged.current) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const renderNodes = initialNodesWithPositions;
      const centerX = dimensions.width / 2;
      const centerY = dimensions.height / 2;
      const focalLength = 300;
      const zOffset = 220;

      let clickedNode: (TreeNode & { questionText?: string }) | null = null;
      let minDistance = 9999;

      for (const rn of renderNodes) {
        const { x, y, z } = rn.local;
        const x1 = x * Math.cos(rotationY.current) + z * Math.sin(rotationY.current);
        const z1 = -x * Math.sin(rotationY.current) + z * Math.cos(rotationY.current);
        const y2 = y * Math.cos(rotationX.current) - z1 * Math.sin(rotationX.current);
        const z2 = y * Math.sin(rotationX.current) + z1 * Math.cos(rotationX.current);

        const scale = focalLength / (focalLength + z2 + zOffset);
        const screenX = centerX + x1 * scale * 1.5;
        const screenY = centerY + y2 * scale * 1.5;

        const dist = Math.hypot(mouseX - screenX, mouseY - screenY);
        const baseRadius = rn.id === selectedNodeId ? 11 : 6;
        if (dist < Math.max(15, baseRadius * scale * 2) && dist < minDistance) {
          minDistance = dist;
          clickedNode = rn.raw;
        }
      }

      if (clickedNode) {
        onSelectNode(clickedNode);
      }
    }
  };

  // Touch handlers for mobile
  const handleTouchStart = (e: TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length !== 1) return;
    isDragging.current = true;
    hasDragged.current = false;
    dragStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    lastRotation.current = { x: rotationX.current, y: rotationY.current };
  };

  const handleTouchMove = (e: TouchEvent<HTMLCanvasElement>) => {
    if (!isDragging.current || e.touches.length !== 1) return;
    hasDragged.current = true;
    const dx = e.touches[0].clientX - dragStart.current.x;
    const dy = e.touches[0].clientY - dragStart.current.y;

    rotationY.current = lastRotation.current.y + dx * 0.008;
    rotationX.current = Math.max(-1.3, Math.min(1.3, lastRotation.current.x + dy * 0.008));
  };

  const handleTouchEnd = () => {
    isDragging.current = false;
    // For simplicity, click on touch is resolved instantly via touchstart coordinates
  };

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative min-h-[400px] bg-slate-950/40 rounded-3xl overflow-hidden border border-slate-900/50 flex items-center justify-center backdrop-blur-sm"
    >
      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="w-full h-full block active:cursor-grabbing cursor-grab"
      />

      {/* 3D Guide helper banner overlay */}
      <div className="absolute top-3 left-3 bg-slate-950/70 border border-slate-800/80 rounded-xl px-3 py-1.5 pointer-events-none select-none">
        <p className="text-[10px] text-slate-400 font-medium flex items-center gap-1.5 uppercase font-mono tracking-wider">
          <span>🔄</span> Glisser pour pivoter en 3D
        </p>
      </div>
    </div>
  );
}
