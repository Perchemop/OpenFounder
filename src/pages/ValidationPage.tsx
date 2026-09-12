import React, { useState } from 'react';
import {
  FlaskConical,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  Sparkles,
  HelpCircle,
} from 'lucide-react';
import type { Experiment, ExperimentStatus, ValidationDimension } from '../types';
import { db } from '../db';

interface ValidationPageProps {
  projectId: string;
  experiments?: Experiment[];
  onExperimentsUpdated: () => void;
  onOpenAICofounderWithPrompt?: (prompt: string) => void;
}

const DIMENSIONS: { id: ValidationDimension; label: string; description: string }[] = [
  { id: 'problem', label: 'Problem Validation', description: 'Does this painful problem genuinely exist?' },
  { id: 'customer', label: 'Customer Validation', description: 'Can we reliably reach and identify who suffers from it?' },
  { id: 'solution', label: 'Solution Validation', description: 'Does our specific approach solve it satisfactorily?' },
  { id: 'market', label: 'Market Validation', description: 'Is the total pool of paying customers large enough?' },
  { id: 'commercial', label: 'Commercial Validation', description: 'Will customers pay real money at a sustainable margin?' },
];

export const ValidationPage: React.FC<ValidationPageProps> = ({
  projectId,
  experiments = [],
  onExperimentsUpdated,
  onOpenAICofounderWithPrompt,
}) => {
  const [selectedDimension, setSelectedDimension] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form state
  const [hypothesis, setHypothesis] = useState('');
  const [dimension, setDimension] = useState<ValidationDimension>('problem');
  const [method, setMethod] = useState<'interview' | 'landing_page' | 'concierge' | 'cold_outreach' | 'prototype' | 'pre_sale'>('landing_page');
  const [targetSampleSize, setTargetSampleSize] = useState(25);
  const [currentSampleSize, setCurrentSampleSize] = useState(0);
  const [successCriteria, setSuccessCriteria] = useState('');
  const [failureCriteria, setFailureCriteria] = useState('');
  const [results, setResults] = useState('');

  const filtered = experiments.filter((ex) => {
    if (selectedDimension === 'all') return true;
    return ex.dimension === selectedDimension;
  });

  const handleAddExperiment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hypothesis.trim()) return;

    const now = Date.now();
    const newExp: Experiment = {
      id: `exp-${now}-${Math.random().toString(36).substring(2, 6)}`,
      projectId,
      hypothesis: hypothesis.trim(),
      dimension,
      method,
      targetSampleSize: Number(targetSampleSize) || 20,
      currentSampleSize: Number(currentSampleSize) || 0,
      successCriteria,
      failureCriteria,
      status: 'planned',
      results,
      createdAt: now,
      updatedAt: now,
    };

    await db.experiments.put(newExp);
    setHypothesis('');
    setSuccessCriteria('');
    setFailureCriteria('');
    setResults('');
    setIsAddModalOpen(false);
    onExperimentsUpdated();
  };

  const handleUpdateStatus = async (id: string, newStatus: ExperimentStatus) => {
    await db.experiments.update(id, {
      status: newStatus,
      updatedAt: Date.now(),
    });
    onExperimentsUpdated();
  };

  const handleDeleteExperiment = async (id: string) => {
    if (confirm('Delete this validation experiment?')) {
      await db.experiments.delete(id);
      onExperimentsUpdated();
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center space-x-2">
            <FlaskConical className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span>Validation Experiments</span>
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Test falsifiable hypotheses with measurable pass/fail criteria before building high-effort features.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center space-x-1.5 px-3.5 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg text-xs font-semibold hover:opacity-90 transition-opacity shadow-xs self-start"
        >
          <Plus className="w-4 h-4" />
          <span>New Experiment</span>
        </button>
      </div>

      {/* 5 Validation Dimensions Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {DIMENSIONS.map((dim) => {
          const count = experiments.filter((e) => e.dimension === dim.id).length;
          const passed = experiments.filter((e) => e.dimension === dim.id && e.status === 'passed').length;
          const running = experiments.filter((e) => e.dimension === dim.id && e.status === 'running').length;

          return (
            <button
              key={dim.id}
              onClick={() => setSelectedDimension(selectedDimension === dim.id ? 'all' : dim.id)}
              className={`p-3 rounded-xl border text-left transition-all ${
                selectedDimension === dim.id
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-zinc-900 dark:border-zinc-100 shadow-xs'
                  : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-zinc-400'
              }`}
            >
              <div className="text-[10px] uppercase font-mono tracking-wider opacity-70">
                {dim.id}
              </div>
              <div className="font-semibold text-xs mt-0.5 truncate">{dim.label}</div>
              <div className="text-[11px] mt-2 opacity-80 flex items-center justify-between">
                <span>{count > 0 ? `${passed}/${count} passed` : '0 tests'}</span>
                {running > 0 && <span className="text-amber-500 font-medium">({running} active)</span>}
              </div>
            </button>
          );
        })}
      </div>

      {/* Experiment Cards List */}
      <div className="space-y-3">
        {filtered.map((exp) => {
          const progressPct = Math.min(
            100,
            Math.round(((exp.currentSampleSize || 0) / (exp.targetSampleSize || 1)) * 100)
          );

          return (
            <div
              key={exp.id}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-xs space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center space-x-2">
                  <span className="capitalize text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                    {exp.dimension}
                  </span>
                  <span className="capitalize text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                    Method: {exp.method.replace('_', ' ')}
                  </span>
                  {exp.isSynthetic && (
                    <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 font-semibold border border-amber-300/60 dark:border-amber-800">
                      Synthetic Demo
                    </span>
                  )}
                </div>

                {/* Status Switcher */}
                <div className="flex items-center space-x-2">
                  <select
                    value={exp.status}
                    onChange={(e) => handleUpdateStatus(exp.id, e.target.value as ExperimentStatus)}
                    className="text-xs font-semibold px-2.5 py-1 rounded-md border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 focus:outline-none"
                  >
                    <option value="planned">Planned</option>
                    <option value="running">Running</option>
                    <option value="completed">Completed</option>
                    <option value="passed">Passed (Validated)</option>
                    <option value="failed">Failed (Falsified)</option>
                  </select>

                  <button
                    onClick={() => handleDeleteExperiment(exp.id)}
                    className="p-1 text-zinc-400 hover:text-rose-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Hypothesis */}
              <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  {exp.hypothesis}
                </h3>
              </div>

              {/* Success / Failure criteria */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 text-emerald-900 dark:text-emerald-300 space-y-1">
                  <div className="font-semibold text-[10px] uppercase tracking-wider flex items-center space-x-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>Success Threshold (Pass)</span>
                  </div>
                  <div>{exp.successCriteria || 'Not set'}</div>
                </div>

                <div className="p-2.5 rounded-lg bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/40 text-rose-900 dark:text-rose-300 space-y-1">
                  <div className="font-semibold text-[10px] uppercase tracking-wider flex items-center space-x-1">
                    <XCircle className="w-3 h-3 text-rose-600" />
                    <span>Failure Threshold (Falsified)</span>
                  </div>
                  <div>{exp.failureCriteria || 'Not set'}</div>
                </div>
              </div>

              {/* Sample Progress */}
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between text-[11px] text-zinc-500">
                  <span>
                    Sample Progress: <strong>{exp.currentSampleSize}</strong> / {exp.targetSampleSize} respondents
                  </span>
                  <span>{progressPct}%</span>
                </div>
                <div className="h-1.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-zinc-900 dark:bg-zinc-100 rounded-full transition-all"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>

              {/* Recorded Results */}
              {exp.results && (
                <div className="text-xs p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300">
                  <strong>Outcome / Findings:</strong> {exp.results}
                </div>
              )}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="p-12 text-center border border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl space-y-2">
            <FlaskConical className="w-8 h-8 text-zinc-400 mx-auto" />
            <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              No validation experiments created for this dimension yet.
            </p>
            <p className="text-[11px] text-zinc-500">
              Design a low-cost test (smoke test, interview round, concierge pilot) to collect verifiable proof.
            </p>
          </div>
        )}
      </div>

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl max-w-lg w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Design New Falsification Test
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddExperiment} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Hypothesis Under Test <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="We believe [target group] will [take action/pay] because [core reason]."
                  value={hypothesis}
                  onChange={(e) => setHypothesis(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Validation Dimension
                  </label>
                  <select
                    value={dimension}
                    onChange={(e) => setDimension(e.target.value as ValidationDimension)}
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2"
                  >
                    {DIMENSIONS.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Experiment Method
                  </label>
                  <select
                    value={method}
                    onChange={(e) => setMethod(e.target.value as any)}
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2"
                  >
                    <option value="landing_page">Landing Page Smoke Test</option>
                    <option value="interview">Customer Discovery Interview</option>
                    <option value="concierge">Manual Concierge MVP</option>
                    <option value="cold_outreach">Targeted Cold Email / DM Campaign</option>
                    <option value="prototype">Clickable Prototype Test</option>
                    <option value="pre_sale">Letter of Intent / Paid Pre-Sale</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Target Sample Size
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={targetSampleSize}
                    onChange={(e) => setTargetSampleSize(Number(e.target.value))}
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Current Sample Collected
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={currentSampleSize}
                    onChange={(e) => setCurrentSampleSize(Number(e.target.value))}
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Success Criteria (Falsifiable threshold)
                </label>
                <input
                  type="text"
                  placeholder="e.g. >= 15% email signup conversion from 100 targeted visitor clicks."
                  value={successCriteria}
                  onChange={(e) => setSuccessCriteria(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Failure Criteria
                </label>
                <input
                  type="text"
                  placeholder="e.g. < 4% signup rate or 0 interviewees who have spent money to solve this in past 6 months."
                  value={failureCriteria}
                  onChange={(e) => setFailureCriteria(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2 text-zinc-900 dark:text-zinc-100"
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
                  Save Experiment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
