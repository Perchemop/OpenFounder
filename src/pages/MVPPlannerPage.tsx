import React, { useState } from 'react';
import {
  ListTodo,
  Plus,
  Trash2,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import type { FeatureItem, MoscowPriority } from '../types';
import { db } from '../db';
import { generateMVPBacklog, suggestProjectField } from '../ai/autoCompleteService';
import { AIAutoFillButton } from '../components/ai/AIAutoFillButton';

interface MVPPlannerPageProps {
  projectId: string;
  features?: FeatureItem[];
  onFeaturesUpdated: () => void;
  onOpenAICofounderWithPrompt?: (prompt: string) => void;
}

const PRIORITIES: { id: MoscowPriority; label: string; tagClass: string; desc: string }[] = [
  {
    id: 'must',
    label: 'Must Have',
    tagClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
    desc: 'Non-negotiable for proving the core value proposition. Max 3-4 items.',
  },
  {
    id: 'should',
    label: 'Should Have',
    tagClass: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-300 dark:border-blue-800',
    desc: 'Important, but not vital for day 1 validation test.',
  },
  {
    id: 'could',
    label: 'Could Have',
    tagClass: 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700',
    desc: 'Desirable nice-to-have enhancements if time permits.',
  },
  {
    id: 'wont',
    label: "Won't Have (MVP)",
    tagClass: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-300 dark:border-rose-800',
    desc: 'Explicitly excluded from initial MVP to eliminate scope bloat.',
  },
];

export const MVPPlannerPage: React.FC<MVPPlannerPageProps> = ({
  projectId,
  features = [],
  onFeaturesUpdated,
  onOpenAICofounderWithPrompt,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isGeneratingBacklog, setIsGeneratingBacklog] = useState(false);
  const [isSuggestingRationale, setIsSuggestingRationale] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<MoscowPriority>('must');
  const [technicalComplexity, setTechnicalComplexity] = useState<'low' | 'medium' | 'high'>('medium');
  const [solvesProblem, setSolvesProblem] = useState('');

  const mustFeatures = features.filter((f) => f.priority === 'must');
  const isBloated = mustFeatures.length > 3;

  const handleAutoGenerateBacklog = async () => {
    setIsGeneratingBacklog(true);
    try {
      const project = await db.projects.get(projectId);
      if (!project) return;
      const generated = await generateMVPBacklog(project);
      const now = Date.now();
      for (let i = 0; i < generated.length; i++) {
        const item = generated[i];
        await db.features.put({
          id: `feat-${now}-${i}-${Math.random().toString(36).substring(2, 6)}`,
          projectId,
          title: item.title,
          description: item.description,
          priority: item.priority as MoscowPriority,
          solvesProblem: item.solvesProblem,
          technicalComplexity: item.technicalComplexity,
          status: 'planned',
          createdAt: now + i,
        });
      }
      onFeaturesUpdated();
    } catch (err) {
      console.error('Failed to generate MVP backlog:', err);
    } finally {
      setIsGeneratingBacklog(false);
    }
  };

  const handleSuggestRationale = async () => {
    setIsSuggestingRationale(true);
    try {
      const project = await db.projects.get(projectId);
      const res = await suggestProjectField('oneSentenceIdea', {
        name: project?.name,
        problemStatement: project?.problemStatement,
      });
      if (res) {
        setSolvesProblem(`Directly validates: ${res}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSuggestingRationale(false);
    }
  };

  const handleAddFeature = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const now = Date.now();
    const newFeature: FeatureItem = {
      id: `feat-${now}-${Math.random().toString(36).substring(2, 6)}`,
      projectId,
      title: title.trim(),
      description,
      priority,
      solvesProblem,
      technicalComplexity,
      status: 'planned',
      createdAt: now,
    };

    await db.features.put(newFeature);
    setTitle('');
    setDescription('');
    setSolvesProblem('');
    setIsAddModalOpen(false);
    onFeaturesUpdated();
  };

  const handleMovePriority = async (id: string, newPriority: MoscowPriority) => {
    await db.features.update(id, {
      priority: newPriority,
    });
    onFeaturesUpdated();
  };

  const handleDeleteFeature = async (id: string) => {
    await db.features.delete(id);
    onFeaturesUpdated();
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center space-x-2">
            <ListTodo className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span>MVP Scope & MoSCoW Backlog</span>
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Ruthless scope discipline. An MVP should solve ONE acute problem with minimum engineering effort.
          </p>
        </div>

        <div className="flex items-center space-x-2 self-start">
          <AIAutoFillButton
            onClick={handleAutoGenerateBacklog}
            isLoading={isGeneratingBacklog}
            label="⚡ AI Auto-Generate MVP Backlog"
            loadingLabel="Synthesizing backlog..."
            size="sm"
            variant="subtle"
          />
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg text-xs font-semibold hover:opacity-90 transition-opacity shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Feature / Task</span>
          </button>
        </div>
      </div>

      {/* Scope Bloat Alert */}
      {isBloated && (
        <div className="p-4 bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60 rounded-xl flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900 dark:text-amber-200 space-y-1">
            <div className="font-semibold">
              Warning: MVP Scope Bloat ({mustFeatures.length} Must-Have Features)
            </div>
            <p className="text-amber-800/80 dark:text-amber-300/80 leading-relaxed">
              True minimum viable products should rarely exceed 2-3 essential capabilities. Extra features delay customer learning and increase development risk.
            </p>
          </div>
        </div>
      )}

      {/* Non-Code MVP Options Banner */}
      <div className="bg-zinc-100/70 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/80 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="space-y-0.5">
          <span className="font-semibold text-zinc-900 dark:text-zinc-100">
            Consider a Non-Code MVP first
          </span>
          <p className="text-zinc-500 dark:text-zinc-400 text-[11px]">
            Could you test customer willingness to pay via a Manual Concierge, Landing Page Smoke Test, or Spreadsheet before writing code?
          </p>
        </div>
        <button
          onClick={() =>
            onOpenAICofounderWithPrompt(
              'Audit our MVP feature backlog. How could we test this value proposition manually without writing software?'
            )
          }
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg text-xs font-semibold hover:opacity-90 shrink-0"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Audit MVP Scope</span>
        </button>
      </div>

      {/* MoSCoW Columns */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {PRIORITIES.map((col) => {
          const colFeatures = features.filter((f) => f.priority === col.id);
          return (
            <div
              key={col.id}
              className="bg-zinc-50/70 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 flex flex-col space-y-3"
            >
              <div className="space-y-1 pb-2 border-b border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100">
                    {col.label}
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                    {colFeatures.length}
                  </span>
                </div>
                <p className="text-[10px] text-zinc-400 leading-tight">{col.desc}</p>
              </div>

              {/* Items */}
              <div className="space-y-2 flex-1 overflow-y-auto max-h-[500px]">
                {colFeatures.map((feat) => (
                  <div
                    key={feat.id}
                    className="bg-white dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/80 rounded-lg p-3 space-y-2 shadow-2xs hover:shadow-xs transition-shadow"
                  >
                    <div className="flex items-start justify-between gap-1">
                      <h4 className="font-semibold text-xs text-zinc-900 dark:text-zinc-100 leading-snug">
                        {feat.title}
                      </h4>
                      <button
                        onClick={() => handleDeleteFeature(feat.id)}
                        className="text-zinc-400 hover:text-rose-600 p-1.5"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>

                    {feat.solvesProblem && (
                      <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
                        {feat.solvesProblem}
                      </p>
                    )}

                    <div className="pt-2 border-t border-zinc-100 dark:border-zinc-700/60 flex items-center justify-between text-[10px]">
                      <span className="text-zinc-400 capitalize">
                        Complexity: <strong>{feat.technicalComplexity}</strong>
                      </span>

                      {/* Move priority selector */}
                      <select
                        value={feat.priority}
                        onChange={(e) =>
                          handleMovePriority(feat.id, e.target.value as MoscowPriority)
                        }
                        className="bg-transparent text-zinc-600 dark:text-zinc-300 font-medium cursor-pointer focus:outline-none"
                      >
                        <option value="must">→ Must</option>
                        <option value="should">→ Should</option>
                        <option value="could">→ Could</option>
                        <option value="wont">→ Won't</option>
                      </select>
                    </div>
                  </div>
                ))}

                {colFeatures.length === 0 && (
                  <div className="p-6 text-center text-zinc-400 text-[11px] italic">
                    No items in this column.
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Feature Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl max-w-md w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Add Feature or Deliverable
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddFeature} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Feature Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 1-Click SMS Job Accept Link"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    MoSCoW Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as MoscowPriority)}
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2"
                  >
                    <option value="must">Must Have (Core value)</option>
                    <option value="should">Should Have (Important)</option>
                    <option value="could">Could Have (Enhancement)</option>
                    <option value="wont">Won't Have (Excluded from MVP)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Technical Complexity
                  </label>
                  <select
                    value={technicalComplexity}
                    onChange={(e) => setTechnicalComplexity(e.target.value as any)}
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2"
                  >
                    <option value="low">Low (&lt; 1-2 days)</option>
                    <option value="medium">Medium (3-5 days)</option>
                    <option value="high">High (&gt; 1 week)</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-medium text-zinc-700 dark:text-zinc-300">
                    Value Rationale / Solves What Problem?
                  </label>
                  <AIAutoFillButton
                    onClick={handleSuggestRationale}
                    isLoading={isSuggestingRationale}
                    label="AI Suggest Rationale"
                    size="xs"
                  />
                </div>
                <textarea
                  rows={2}
                  placeholder="Directly enables contractor to confirm a booking in under 10 seconds without logging into a web app."
                  value={solvesProblem}
                  onChange={(e) => setSolvesProblem(e.target.value)}
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
                  Save Feature
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
