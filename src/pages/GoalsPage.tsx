import React, { useMemo, useState } from 'react';
import {
  Target,
  Plus,
  Trash2,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  AlertTriangle,
  X,
  Pencil,
} from 'lucide-react';
import type { KeyResult, MetricDirection, MetricUnit, Objective } from '../types';
import { db, generateId } from '../db';
import {
  applyKeyResultValue,
  formatMetricValue,
  keyResultProgress,
  keyResultStatus,
  objectiveHealth,
  objectiveProgress,
  summarizeOkrs,
  type KeyResultStatus,
} from '../utils/okr';

interface GoalsPageProps {
  projectId: string;
  objectives?: Objective[];
  onGoalsUpdated: () => void;
  onOpenAICofounderWithPrompt?: (prompt: string) => void;
}

const UNIT_OPTIONS: Array<{ value: MetricUnit; label: string }> = [
  { value: 'number', label: 'Number' },
  { value: 'currency', label: 'Currency (GBP)' },
  { value: 'percent', label: 'Percent' },
  { value: 'ratio', label: 'Ratio' },
];

const STATUS_STYLES: Record<KeyResultStatus | 'no_key_results', string> = {
  met: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
  on_track:
    'bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800',
  at_risk:
    'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800',
  off_track:
    'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800',
  no_key_results: 'bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700',
};

const STATUS_LABELS: Record<KeyResultStatus | 'no_key_results', string> = {
  met: 'Met',
  on_track: 'On track',
  at_risk: 'At risk',
  off_track: 'Off track',
  no_key_results: 'No measures',
};

interface KeyResultDraft {
  id: string;
  title: string;
  unit: MetricUnit;
  direction: MetricDirection;
  baseline: string;
  target: string;
}

function emptyDraft(): KeyResultDraft {
  return {
    id: generateId('krd'),
    title: '',
    unit: 'number',
    direction: 'increase',
    baseline: '0',
    target: '',
  };
}

export const GoalsPage: React.FC<GoalsPageProps> = ({
  projectId,
  objectives = [],
  onGoalsUpdated,
  onOpenAICofounderWithPrompt,
}) => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [owner, setOwner] = useState('Founder');
  const [timeframe, setTimeframe] = useState('');
  const [drafts, setDrafts] = useState<KeyResultDraft[]>([emptyDraft()]);
  const [error, setError] = useState<string | null>(null);

  const summary = useMemo(() => summarizeOkrs(objectives), [objectives]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setOwner('Founder');
    setTimeframe('');
    setDrafts([emptyDraft()]);
    setError(null);
  };

  const closeCreate = () => {
    setIsCreateOpen(false);
    resetForm();
  };

  const updateDraft = (id: string, patch: Partial<KeyResultDraft>) => {
    setDrafts((current) =>
      current.map((draft) => (draft.id === id ? { ...draft, ...patch } : draft))
    );
  };

  const createObjective = async () => {
    if (!title.trim()) {
      setError('Objectives need a title.');
      return;
    }

    const usableDrafts = drafts.filter((draft) => draft.title.trim() && draft.target.trim());
    if (usableDrafts.length === 0) {
      setError('Add at least one measurable key result with a target.');
      return;
    }

    for (const draft of usableDrafts) {
      if (Number.isNaN(Number(draft.baseline)) || Number.isNaN(Number(draft.target))) {
        setError(`"${draft.title}" needs numeric baseline and target values.`);
        return;
      }
    }

    const now = Date.now();
    const keyResults: KeyResult[] = usableDrafts.map((draft) => ({
      id: generateId('kr'),
      title: draft.title.trim(),
      unit: draft.unit,
      direction: draft.direction,
      baseline: Number(draft.baseline),
      target: Number(draft.target),
      current: Number(draft.baseline),
      updatedAt: now,
    }));

    await db.objectives.put({
      id: generateId('obj'),
      projectId,
      title: title.trim(),
      description: description.trim(),
      owner: owner.trim(),
      timeframe: timeframe.trim(),
      status: 'active',
      keyResults,
      createdAt: now,
      updatedAt: now,
    });

    onGoalsUpdated();
    closeCreate();
  };

  const saveKeyResult = async (
    objective: Objective,
    keyResult: KeyResult,
    value: number,
    source: string
  ) => {
    if (Number.isNaN(value)) return;
    const updated = applyKeyResultValue(objective, keyResult.id, value, source.trim() || undefined);
    await db.objectives.put(updated);
    onGoalsUpdated();
  };

  const setObjectiveStatus = async (objective: Objective, status: Objective['status']) => {
    await db.objectives.put({ ...objective, status, updatedAt: Date.now() });
    onGoalsUpdated();
  };

  const deleteObjective = async (objective: Objective) => {
    const confirmed = window.confirm(
      `Delete "${objective.title}" and its ${objective.keyResults.length} key result(s)?`
    );
    if (!confirmed) return;
    await db.objectives.delete(objective.id);
    onGoalsUpdated();
  };

  const askAIToReview = (objective: Objective) => {
    onOpenAICofounderWithPrompt?.(
      `Review this objective and its key results. Which measure is least trustworthy, and what evidence would make it credible? Objective: "${objective.title}". Key results: ${objective.keyResults
        .map(
          (keyResult) =>
            `${keyResult.title} (${formatMetricValue(keyResult.current, keyResult.unit)} of ${formatMetricValue(
              keyResult.target,
              keyResult.unit
            )}, ${keyResultStatus(keyResult)})`
        )
        .join('; ')}.`
    );
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center space-x-2">
            <Target className="w-5 h-5 text-emerald-500" />
            <span>Goals &amp; Scorecard</span>
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-2xl">
            Objectives with measurable key results. Progress is derived from the values you
            record, so a goal cannot be declared met without a number behind it.
          </p>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-semibold hover:opacity-90 shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New objective</span>
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <SummaryCard label="Active objectives" value={`${summary.activeObjectives}`} />
        <SummaryCard label="Average progress" value={`${summary.averageProgress}%`} />
        <SummaryCard
          label="Key results met"
          value={`${summary.met} / ${summary.keyResults}`}
          tone="good"
        />
        <SummaryCard
          label="At risk or off track"
          value={`${summary.atRisk + summary.offTrack}`}
          tone={summary.atRisk + summary.offTrack > 0 ? 'bad' : undefined}
        />
      </div>

      {objectives.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl p-8 text-center">
          <Target className="w-8 h-8 text-zinc-300 dark:text-zinc-600 mx-auto mb-3" />
          <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
            No objectives yet
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-md mx-auto">
            Start with the outcome that would prove the business works, then add one measurable key
            result. A goal without a number is a wish.
          </p>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="mt-4 inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create the first objective</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {objectives
            .slice()
            .sort((a, b) => Number(a.status !== 'active') - Number(b.status !== 'active') || b.createdAt - a.createdAt)
            .map((objective) => {
              const health = objectiveHealth(objective);
              const progress = objectiveProgress(objective);
              return (
                <div
                  key={objective.id}
                  className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                          {objective.title}
                        </h2>
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${STATUS_STYLES[health]}`}
                        >
                          {STATUS_LABELS[health]}
                        </span>
                        {objective.status !== 'active' && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded border border-zinc-200 dark:border-zinc-700 text-zinc-500">
                            {objective.status}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
                        {[objective.owner, objective.timeframe].filter(Boolean).join(' · ')}
                      </p>
                      {objective.description && (
                        <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-2 max-w-2xl">
                          {objective.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center space-x-1.5 shrink-0">
                      {onOpenAICofounderWithPrompt && (
                        <button
                          onClick={() => askAIToReview(objective)}
                          className="p-1.5 rounded text-zinc-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40"
                          title="Ask the AI co-founder to review the measures"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <select
                        value={objective.status}
                        onChange={(event) =>
                          setObjectiveStatus(objective, event.target.value as Objective['status'])
                        }
                        className="text-[11px] bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded px-1.5 py-1 text-zinc-700 dark:text-zinc-300"
                        aria-label={`Status for ${objective.title}`}
                      >
                        <option value="active">Active</option>
                        <option value="done">Done</option>
                        <option value="archived">Archived</option>
                      </select>
                      <button
                        onClick={() => deleteObjective(objective)}
                        className="p-1.5 rounded text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                        title="Delete objective"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-3">
                    <div className="flex items-center justify-between text-[10px] text-zinc-500 mb-1">
                      <span>Overall progress</span>
                      <span className="font-mono">{progress}%</span>
                    </div>
                    <div
                      className="h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden"
                      role="progressbar"
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={progress}
                      aria-label={`Progress for ${objective.title}`}
                    >
                      <div
                        className={`h-full ${
                          progress >= 100 ? 'bg-emerald-500' : progress >= 40 ? 'bg-sky-500' : 'bg-rose-500'
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-3 space-y-2">
                    {objective.keyResults.map((keyResult) => (
                      <KeyResultRow
                        key={keyResult.id}
                        keyResult={keyResult}
                        onSave={(value, source) => saveKeyResult(objective, keyResult, value, source)}
                      />
                    ))}
                    {objective.keyResults.length === 0 && (
                      <p className="text-[11px] text-amber-700 dark:text-amber-400">
                        This objective has no key results, so its progress cannot be measured.
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-start justify-center p-4 pt-16 overflow-y-auto">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl max-w-2xl w-full shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800">
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                New objective
              </h2>
              <button
                onClick={closeCreate}
                className="p-1 text-zinc-400 hover:text-zinc-600"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-3 max-h-[70vh] overflow-y-auto">
              <Field label="Objective">
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Prove independent plumbers will pay monthly"
                  className={inputClass}
                  autoFocus
                />
              </Field>
              <Field label="Why it matters">
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  rows={2}
                  placeholder="What decision this objective unlocks"
                  className={inputClass}
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Owner">
                  <input
                    value={owner}
                    onChange={(event) => setOwner(event.target.value)}
                    className={inputClass}
                  />
                </Field>
                <Field label="Timeframe">
                  <input
                    value={timeframe}
                    onChange={(event) => setTimeframe(event.target.value)}
                    placeholder="Q4 2026"
                    className={inputClass}
                  />
                </Field>
              </div>

              <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                    Key results
                  </p>
                  <button
                    onClick={() => setDrafts((current) => [...current, emptyDraft()])}
                    className="text-[11px] text-emerald-700 dark:text-emerald-400 hover:underline"
                  >
                    + Add another
                  </button>
                </div>

                <div className="space-y-3">
                  {drafts.map((draft, index) => (
                    <div
                      key={draft.id}
                      className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-3 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-zinc-400">
                          KR {index + 1}
                        </span>
                        {drafts.length > 1 && (
                          <button
                            onClick={() =>
                              setDrafts((current) => current.filter((item) => item.id !== draft.id))
                            }
                            className="text-zinc-400 hover:text-rose-600"
                            aria-label={`Remove key result ${index + 1}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <input
                        value={draft.title}
                        onChange={(event) => updateDraft(draft.id, { title: event.target.value })}
                        placeholder="Reach 40 paying customers"
                        className={inputClass}
                      />
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <label className="text-[10px] text-zinc-500">
                          Unit
                          <select
                            value={draft.unit}
                            onChange={(event) =>
                              updateDraft(draft.id, { unit: event.target.value as MetricUnit })
                            }
                            className={`${inputClass} mt-1`}
                          >
                            {UNIT_OPTIONS.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label className="text-[10px] text-zinc-500">
                          Direction
                          <select
                            value={draft.direction}
                            onChange={(event) =>
                              updateDraft(draft.id, {
                                direction: event.target.value as MetricDirection,
                              })
                            }
                            className={`${inputClass} mt-1`}
                          >
                            <option value="increase">Higher is better</option>
                            <option value="decrease">Lower is better</option>
                          </select>
                        </label>
                        <label className="text-[10px] text-zinc-500">
                          Baseline
                          <input
                            type="number"
                            value={draft.baseline}
                            onChange={(event) =>
                              updateDraft(draft.id, { baseline: event.target.value })
                            }
                            className={`${inputClass} mt-1`}
                          />
                        </label>
                        <label className="text-[10px] text-zinc-500">
                          Target
                          <input
                            type="number"
                            value={draft.target}
                            onChange={(event) => updateDraft(draft.id, { target: event.target.value })}
                            className={`${inputClass} mt-1`}
                          />
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {error && (
                <p className="text-[11px] text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 rounded p-2">
                  {error}
                </p>
              )}
            </div>

            <div className="flex items-center justify-end space-x-2 p-4 border-t border-zinc-200 dark:border-zinc-800">
              <button
                onClick={closeCreate}
                className="px-3 py-2 rounded-lg text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                Cancel
              </button>
              <button
                onClick={createObjective}
                className="px-3 py-2 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700"
              >
                Save objective
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function SummaryCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: 'good' | 'bad';
}) {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3">
      <p className="text-[10px] uppercase tracking-wider text-zinc-400 font-medium">{label}</p>
      <p
        className={`text-xl font-bold mt-1 ${
          tone === 'good'
            ? 'text-emerald-600 dark:text-emerald-400'
            : tone === 'bad'
              ? 'text-rose-600 dark:text-rose-400'
              : 'text-zinc-900 dark:text-zinc-100'
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[10px] uppercase tracking-wider text-zinc-500 mb-1">{label}</span>
      {children}
    </label>
  );
}

function KeyResultRow({
  keyResult,
  onSave,
}: {
  keyResult: KeyResult;
  onSave: (value: number, source: string) => void;
}) {
  const progress = keyResultProgress(keyResult);
  const status = keyResultStatus(keyResult);
  const [value, setValue] = useState(String(keyResult.current));
  const [source, setSource] = useState(keyResult.source ?? '');
  const [saved, setSaved] = useState(false);

  const commit = () => {
    const parsed = Number(value);
    if (Number.isNaN(parsed)) return;
    if (parsed === keyResult.current && source === (keyResult.source ?? '')) return;
    onSave(parsed, source);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1500);
  };

  return (
    <div className="rounded-lg border border-zinc-100 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-950/40 p-2.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-1.5 min-w-0">
          {keyResult.direction === 'increase' ? (
            <TrendingUp className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
          ) : (
            <TrendingDown className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
          )}
          <span className="text-xs text-zinc-800 dark:text-zinc-200 truncate">
            {keyResult.title}
          </span>
        </div>
        <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${STATUS_STYLES[status]}`}>
          {STATUS_LABELS[status]}
        </span>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-zinc-500">
        <span>
          Baseline {formatMetricValue(keyResult.baseline, keyResult.unit)} → target{' '}
          {formatMetricValue(keyResult.target, keyResult.unit)}
        </span>
      </div>

      <div className="mt-2 flex flex-wrap items-end gap-2">
        <label className="text-[10px] text-zinc-500">
          Current
          <input
            type="number"
            value={value}
            onChange={(event) => {
              setValue(event.target.value);
              setSaved(false);
            }}
            onBlur={commit}
            onKeyDown={(event) => {
              if (event.key === 'Enter') commit();
            }}
            className={`${inputClass} mt-0.5 w-28`}
            aria-label={`Current value for ${keyResult.title}`}
          />
        </label>
        <label className="text-[10px] text-zinc-500 flex-1 min-w-[10rem]">
          Source (optional)
          <input
            value={source}
            onChange={(event) => {
              setSource(event.target.value);
              setSaved(false);
            }}
            onBlur={commit}
            onKeyDown={(event) => {
              if (event.key === 'Enter') commit();
            }}
            placeholder="Stripe dashboard, interview round 2…"
            className={`${inputClass} mt-0.5`}
            aria-label={`Source for ${keyResult.title}`}
          />
        </label>
        <span className="text-[10px] text-zinc-400 font-mono pb-2">{progress}%</span>
        {saved && (
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 pb-2 flex items-center space-x-0.5">
            <CheckCircle2 className="w-3 h-3" />
            <span>Saved</span>
          </span>
        )}
      </div>

      <div className="mt-2 h-1 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
        <div
          className={`h-full ${
            status === 'met'
              ? 'bg-emerald-500'
              : status === 'on_track'
                ? 'bg-sky-500'
                : status === 'at_risk'
                  ? 'bg-amber-500'
                  : 'bg-rose-500'
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>

      {(!keyResult.source || keyResult.source.trim() === '') && progress > 0 && (
        <p className="mt-1.5 text-[10px] text-amber-700 dark:text-amber-400 flex items-center space-x-1">
          <AlertTriangle className="w-3 h-3" />
          <span>No source recorded. Add where this number came from.</span>
        </p>
      )}
    </div>
  );
}

const inputClass =
  'w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded px-2 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-emerald-500';
