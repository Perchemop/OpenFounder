import React, { useState } from 'react';
import {
  Milestone,
  Plus,
  Trash2,
} from 'lucide-react';
import type { RoadmapItem, RoadmapStatus } from '../types';
import { db } from '../db';

interface RoadmapPageProps {
  projectId: string;
  roadmap?: RoadmapItem[];
  onRoadmapUpdated: () => void;
}

const STATUS_COLUMNS: { id: RoadmapStatus; label: string; bg: string }[] = [
  { id: 'not_started', label: 'Not Started', bg: 'bg-zinc-100 dark:bg-zinc-800' },
  { id: 'in_progress', label: 'In Progress', bg: 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300' },
  { id: 'blocked', label: 'Blocked', bg: 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300' },
  { id: 'completed', label: 'Completed', bg: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300' },
];

export const RoadmapPage: React.FC<RoadmapPageProps> = ({
  projectId,
  roadmap = [],
  onRoadmapUpdated,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [objective, setObjective] = useState('');
  const [status, setStatus] = useState<RoadmapStatus>('not_started');
  const [priority, setPriority] = useState<RoadmapItem['priority']>('high');
  const [owner, setOwner] = useState('Founder');
  const [evidenceRequired, setEvidenceRequired] = useState('');
  const [estimatedEffort, setEstimatedEffort] = useState('1 week');

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const now = Date.now();
    const newItem: RoadmapItem = {
      id: `road-${now}-${Math.random().toString(36).substring(2, 6)}`,
      projectId,
      title: title.trim(),
      objective,
      status,
      priority,
      owner,
      evidenceRequired,
      estimatedEffort,
      orderIndex: roadmap.length,
      createdAt: now,
      updatedAt: now,
    };

    await db.roadmap.put(newItem);
    setTitle('');
    setObjective('');
    setEvidenceRequired('');
    setIsAddModalOpen(false);
    onRoadmapUpdated();
  };

  const handleUpdateStatus = async (id: string, newStatus: RoadmapStatus) => {
    await db.roadmap.update(id, {
      status: newStatus,
      updatedAt: Date.now(),
    });
    onRoadmapUpdated();
  };

  const handleDeleteItem = async (id: string) => {
    await db.roadmap.delete(id);
    onRoadmapUpdated();
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center space-x-2">
            <Milestone className="w-5 h-5 text-emerald-600 dark:text-emerald-400"  aria-hidden="true" />
            <span>Visual Roadmap & Milestones</span>
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Phase gates tied to evidence thresholds rather than arbitrary calendar dates.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center space-x-1.5 px-3.5 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg text-xs font-semibold hover:opacity-90 transition-opacity shadow-xs self-start"
        >
          <Plus className="w-4 h-4" />
          <span>Add Roadmap Milestone</span>
        </button>
      </div>

      {/* Kanban Status Columns */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {STATUS_COLUMNS.map((col) => {
          const items = roadmap.filter((r) => r.status === col.id);
          return (
            <div
              key={col.id}
              className="bg-zinc-50/70 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 flex flex-col space-y-3"
            >
              <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
                <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100">
                  {col.label}
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                  {items.length}
                </span>
              </div>

              <div className="space-y-3 flex-1 overflow-y-auto max-h-[550px]">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/80 rounded-xl p-3.5 space-y-2.5 shadow-2xs"
                  >
                    <div className="flex items-start justify-between gap-1">
                      <h4 className="font-semibold text-xs text-zinc-900 dark:text-zinc-100 leading-snug">
                        {item.title}
                      </h4>
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="text-zinc-400 hover:text-rose-600 p-1.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {item.objective && (
                      <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
                        {item.objective}
                      </p>
                    )}

                    {item.evidenceRequired && (
                      <div className="p-2 bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 rounded text-[10px] text-amber-900 dark:text-amber-300 leading-normal">
                        <strong>Evidence Gate:</strong> {item.evidenceRequired}
                      </div>
                    )}

                    <div className="pt-2 border-t border-zinc-100 dark:border-zinc-700/60 flex items-center justify-between text-[10px]">
                      <span className="text-zinc-400">
                        Effort: <strong>{item.estimatedEffort}</strong>
                      </span>

                      <select
                        value={item.status}
                        onChange={(e) =>
                          handleUpdateStatus(item.id, e.target.value as RoadmapStatus)
                        }
                        className="font-semibold text-zinc-700 dark:text-zinc-300 focus:outline-none cursor-pointer bg-transparent"
                      >
                        <option value="not_started">→ Not Started</option>
                        <option value="in_progress">→ In Progress</option>
                        <option value="blocked">→ Blocked</option>
                        <option value="completed">→ Completed</option>
                      </select>
                    </div>
                  </div>
                ))}

                {items.length === 0 && (
                  <div className="p-6 text-center text-zinc-400 text-xs italic">
                    No milestones in this stage.
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl max-w-md w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Add Roadmap Milestone
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddItem} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Milestone Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Discovery Interview Gate: 10 completed"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2"
                />
              </div>

              <div>
                <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Objective & Key Result
                </label>
                <textarea
                  rows={2}
                  placeholder="What specifically will be proven or shipped?"
                  value={objective}
                  onChange={(e) => setObjective(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2"
                  >
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Estimated Effort
                  </label>
                  <input
                    type="text"
                    value={estimatedEffort}
                    onChange={(e) => setEstimatedEffort(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Evidence Gate (What proof is required to pass?)
                </label>
                <input
                  type="text"
                  placeholder="e.g. At least 4 interviewees confirm willingness to switch."
                  value={evidenceRequired}
                  onChange={(e) => setEvidenceRequired(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2"
                />
              </div>

              <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 text-zinc-600 hover:text-zinc-900 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg font-semibold hover:opacity-90 transition-opacity"
                >
                  Save Milestone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
