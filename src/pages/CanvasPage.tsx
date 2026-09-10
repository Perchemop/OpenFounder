import React, { useState, useRef, useEffect } from 'react';
import {
  Network,
  Plus,
  Trash2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
} from 'lucide-react';
import type { CanvasNode, CanvasEdge } from '../types';
import { db } from '../db';

interface CanvasPageProps {
  projectId: string;
}

type CanvasNodeType = CanvasNode['type'];

const NODE_COLORS: Record<CanvasNodeType, { bg: string; text: string; border: string }> = {
  problem: { bg: 'bg-rose-50 dark:bg-rose-950/40', text: 'text-rose-900 dark:text-rose-300', border: 'border-rose-300 dark:border-rose-800' },
  customer: { bg: 'bg-blue-50 dark:bg-blue-950/40', text: 'text-blue-900 dark:text-blue-300', border: 'border-blue-300 dark:border-blue-800' },
  solution: { bg: 'bg-emerald-50 dark:bg-emerald-950/40', text: 'text-emerald-900 dark:text-emerald-300', border: 'border-emerald-300 dark:border-emerald-800' },
  hypothesis: { bg: 'bg-amber-50 dark:bg-amber-950/40', text: 'text-amber-900 dark:text-amber-300', border: 'border-amber-300 dark:border-amber-800' },
  experiment: { bg: 'bg-purple-50 dark:bg-purple-950/40', text: 'text-purple-900 dark:text-purple-300', border: 'border-purple-300 dark:border-purple-800' },
  evidence: { bg: 'bg-teal-50 dark:bg-teal-950/40', text: 'text-teal-900 dark:text-teal-300', border: 'border-teal-300 dark:border-teal-800' },
  competitor: { bg: 'bg-zinc-100 dark:bg-zinc-800', text: 'text-zinc-900 dark:text-zinc-200', border: 'border-zinc-300 dark:border-zinc-700' },
  feature: { bg: 'bg-indigo-50 dark:bg-indigo-950/40', text: 'text-indigo-900 dark:text-indigo-300', border: 'border-indigo-300 dark:border-indigo-800' },
  decision: { bg: 'bg-amber-100 dark:bg-amber-900/40', text: 'text-amber-900 dark:text-amber-200', border: 'border-amber-400 dark:border-amber-700' },
  note: { bg: 'bg-yellow-50 dark:bg-yellow-950/40', text: 'text-yellow-900 dark:text-yellow-200', border: 'border-yellow-300 dark:border-yellow-700' },
};

export const CanvasPage: React.FC<CanvasPageProps> = ({ projectId }) => {
  const [nodes, setNodes] = useState<CanvasNode[]>([]);
  const [edges, setEdges] = useState<CanvasEdge[]>([]);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isDraggingNode, setIsDraggingNode] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const dragStartRef = useRef<{ mouseX: number; mouseY: number; nodeX: number; nodeY: number } | null>(null);
  const panStartRef = useRef<{ mouseX: number; mouseY: number; panX: number; panY: number } | null>(null);

  // New Node creation
  const [newNodeType, setNewNodeType] = useState<CanvasNodeType>('problem');
  const [newNodeTitle, setNewNodeTitle] = useState('');

  useEffect(() => {
    loadCanvas();
  }, [projectId]);

  const loadCanvas = async () => {
    const loadedNodes = await db.canvasNodes.where('projectId').equals(projectId).toArray();
    const loadedEdges = await db.canvasEdges.where('projectId').equals(projectId).toArray();

    if (loadedNodes.length === 0) {
      // Seed default template nodes
      const seedNodes: CanvasNode[] = [
        {
          id: `node-1`,
          projectId,
          type: 'customer',
          title: 'Target Customer',
          description: 'Solo trade contractors (1-3 crew members)',
          x: 100,
          y: 120,
        },
        {
          id: `node-2`,
          projectId,
          type: 'problem',
          title: 'Acute Pain Point',
          description: 'Wasting $800/mo on shared, stale leads with low win rates',
          x: 400,
          y: 120,
        },
        {
          id: `node-3`,
          projectId,
          type: 'solution',
          title: 'Value Proposition',
          description: '100% pay-per-booked-job exclusive alert service',
          x: 700,
          y: 120,
        },
        {
          id: `node-4`,
          projectId,
          type: 'experiment',
          title: 'Falsification Test',
          description: 'Smoke test: 5 phone pre-sales before building software',
          x: 400,
          y: 300,
        },
      ];

      const seedEdges: CanvasEdge[] = [
        { id: 'edge-1', projectId, fromNodeId: 'node-1', toNodeId: 'node-2', label: 'Experiences' },
        { id: 'edge-2', projectId, fromNodeId: 'node-2', toNodeId: 'node-3', label: 'Resolved By' },
        { id: 'edge-3', projectId, fromNodeId: 'node-2', toNodeId: 'node-4', label: 'Tested By' },
      ];

      for (const n of seedNodes) await db.canvasNodes.put(n);
      for (const e of seedEdges) await db.canvasEdges.put(e);

      setNodes(seedNodes);
      setEdges(seedEdges);
    } else {
      setNodes(loadedNodes);
      setEdges(loadedEdges);
    }
  };

  const handleAddNode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNodeTitle.trim()) return;

    const newNode: CanvasNode = {
      id: `node-${Date.now()}`,
      projectId,
      type: newNodeType,
      title: newNodeTitle.trim(),
      description: '',
      x: 250 - pan.x,
      y: 200 - pan.y,
    };

    await db.canvasNodes.put(newNode);
    setNodes((prev) => [...prev, newNode]);
    setNewNodeTitle('');
  };

  const handleDeleteNode = async (nodeId: string) => {
    await db.canvasNodes.delete(nodeId);
    await db.canvasEdges.where('fromNodeId').equals(nodeId).delete();
    await db.canvasEdges.where('toNodeId').equals(nodeId).delete();
    setNodes((prev) => prev.filter((n) => n.id !== nodeId));
    setEdges((prev) => prev.filter((e) => e.fromNodeId !== nodeId && e.toNodeId !== nodeId));
    setSelectedNodeId(null);
  };

  const handleNodeMouseDown = (e: React.MouseEvent, node: CanvasNode) => {
    e.stopPropagation();
    setSelectedNodeId(node.id);
    setIsDraggingNode(true);
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      nodeX: node.x,
      nodeY: node.y,
    };
  };

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) {
      setIsPanning(true);
      panStartRef.current = {
        mouseX: e.clientX,
        mouseY: e.clientY,
        panX: pan.x,
        panY: pan.y,
      };
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDraggingNode && selectedNodeId && dragStartRef.current) {
      const deltaX = (e.clientX - dragStartRef.current.mouseX) / zoom;
      const deltaY = (e.clientY - dragStartRef.current.mouseY) / zoom;
      const updatedX = dragStartRef.current.nodeX + deltaX;
      const updatedY = dragStartRef.current.nodeY + deltaY;

      setNodes((prev) =>
        prev.map((n) => (n.id === selectedNodeId ? { ...n, x: updatedX, y: updatedY } : n))
      );
    } else if (isPanning && panStartRef.current) {
      const deltaX = e.clientX - panStartRef.current.mouseX;
      const deltaY = e.clientY - panStartRef.current.mouseY;
      setPan({
        x: panStartRef.current.panX + deltaX,
        y: panStartRef.current.panY + deltaY,
      });
    }
  };

  const handleMouseUp = async () => {
    if (isDraggingNode && selectedNodeId) {
      const targetNode = nodes.find((n) => n.id === selectedNodeId);
      if (targetNode) {
        await db.canvasNodes.update(selectedNodeId, { x: targetNode.x, y: targetNode.y });
      }
    }
    setIsDraggingNode(false);
    setIsPanning(false);
    dragStartRef.current = null;
    panStartRef.current = null;
  };

  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col select-none overflow-hidden relative">
      {/* Top Toolbar */}
      <div className="h-12 border-b border-zinc-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 backdrop-blur px-4 flex items-center justify-between z-10">
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1.5 font-semibold text-xs text-zinc-900 dark:text-zinc-100">
            <Network className="w-4 h-4 text-emerald-500" />
            <span>Interactive Project Canvas</span>
          </div>

          <div className="h-4 w-px bg-zinc-200 dark:border-zinc-700 mx-2" />

          {/* Add quick node */}
          <form onSubmit={handleAddNode} className="flex items-center space-x-1.5 text-xs">
            <select
              value={newNodeType}
              onChange={(e) => setNewNodeType(e.target.value as CanvasNodeType)}
              className="bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md px-2 py-1 text-xs"
            >
              <option value="problem">Problem</option>
              <option value="customer">Customer</option>
              <option value="solution">Solution</option>
              <option value="hypothesis">Hypothesis</option>
              <option value="experiment">Experiment</option>
              <option value="evidence">Evidence</option>
              <option value="competitor">Competitor</option>
              <option value="feature">Feature</option>
              <option value="note">Note</option>
            </select>
            <input
              type="text"
              placeholder="Node title..."
              value={newNodeTitle}
              onChange={(e) => setNewNodeTitle(e.target.value)}
              className="bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md px-2 py-1 text-xs w-44"
            />
            <button
              type="submit"
              className="p-1.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-md hover:opacity-90"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        {/* Zoom & Reset Controls */}
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))}
            className="p-1.5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[11px] font-mono w-12 text-center text-zinc-500">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom((z) => Math.min(2, z + 0.1))}
            className="p-1.5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              setZoom(1);
              setPan({ x: 0, y: 0 });
            }}
            className="p-1.5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800"
            title="Reset Pan/Zoom"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* SVG Canvas Board */}
      <div
        className="flex-1 bg-zinc-50 dark:bg-zinc-950 relative overflow-hidden cursor-grab active:cursor-grabbing"
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={{
          backgroundImage:
            'radial-gradient(circle, #e4e4e7 1px, transparent 1px)',
          backgroundSize: `${24 * zoom}px ${24 * zoom}px`,
          backgroundPosition: `${pan.x}px ${pan.y}px`,
        }}
      >
        <div
          className="absolute inset-0 origin-top-left pointer-events-none"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          }}
        >
          {/* Edges Lines */}
          <svg className="absolute inset-0 w-[4000px] h-[4000px] overflow-visible">
            {edges.map((edge) => {
              const srcNode = nodes.find((n) => n.id === edge.fromNodeId);
              const tgtNode = nodes.find((n) => n.id === edge.toNodeId);
              if (!srcNode || !tgtNode) return null;

              const x1 = srcNode.x + 100;
              const y1 = srcNode.y + 40;
              const x2 = tgtNode.x + 100;
              const y2 = tgtNode.y + 40;

              return (
                <g key={edge.id}>
                  <line
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="#a1a1aa"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                  />
                  {edge.label && (
                    <text
                      x={(x1 + x2) / 2}
                      y={(y1 + y2) / 2 - 5}
                      fill="#71717a"
                      fontSize="10"
                      textAnchor="middle"
                      className="font-mono bg-white dark:bg-zinc-900"
                    >
                      {edge.label}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Nodes */}
          {nodes.map((node) => {
            const colors = NODE_COLORS[node.type] || NODE_COLORS.problem;
            const isSelected = selectedNodeId === node.id;

            return (
              <div
                key={node.id}
                onMouseDown={(e) => handleNodeMouseDown(e, node)}
                className={`absolute w-52 p-3 rounded-xl border shadow-sm transition-shadow pointer-events-auto cursor-pointer ${
                  colors.bg
                } ${colors.border} ${
                  isSelected ? 'ring-2 ring-zinc-900 dark:ring-zinc-100 shadow-md' : ''
                }`}
                style={{
                  left: `${node.x}px`,
                  top: `${node.y}px`,
                }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-[9px] font-mono uppercase font-bold tracking-wider px-1.5 py-0.2 rounded ${colors.text}`}
                  >
                    {node.type}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteNode(node.id);
                    }}
                    className="text-zinc-400 hover:text-rose-600 p-0.5 rounded"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>

                <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 leading-snug">
                  {node.title}
                </h4>

                {node.description && (
                  <p className="text-[11px] text-zinc-600 dark:text-zinc-300 mt-1 leading-relaxed">
                    {node.description}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
