import React, { useState } from 'react';
import {
  CheckCircle2,
  Circle,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  HelpCircle,
  FileCheck,
} from 'lucide-react';
import type { Project } from '../types';
import { FOUNDER_PHASES } from '../data/phases';
import { db } from '../db';

interface PhasesPageProps {
  project: Project | null;
  onProjectUpdated: () => void;
  onOpenAICofounderWithPrompt: (prompt: string) => void;
}

export const PhasesPage: React.FC<PhasesPageProps> = ({
  project,
  onProjectUpdated,
  onOpenAICofounderWithPrompt,
}) => {
  const [activePhaseIndex, setActivePhaseIndex] = useState(
    project?.currentPhaseIndex ?? 0
  );
  const [taskNotes, setTaskNotes] = useState<{ [key: string]: string }>({});

  if (!project) return null;

  const currentPhase = FOUNDER_PHASES[activePhaseIndex] || FOUNDER_PHASES[0];

  const handleAdvancePhase = async () => {
    if (project.currentPhaseIndex < 9) {
      const nextIndex = project.currentPhaseIndex + 1;
      await db.projects.update(project.id, {
        currentPhaseIndex: nextIndex,
        updatedAt: Date.now(),
      });
      setActivePhaseIndex(nextIndex);
      onProjectUpdated();
    }
  };

  const handleTaskCheck = (taskId: string) => {
    setTaskNotes((prev) => ({
      ...prev,
      [`checked_${taskId}`]: prev[`checked_${taskId}`] ? '' : 'done',
    }));
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            Guided Founder Workflow
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Step-by-step evidence-driven progression from Idea to MVP and Customer Feedback.
          </p>
        </div>

        {activePhaseIndex === project.currentPhaseIndex && (
          <button
            onClick={handleAdvancePhase}
            disabled={project.currentPhaseIndex >= 9}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs disabled:opacity-40 transition-colors"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Complete Phase & Advance</span>
          </button>
        )}
      </div>

      {/* Phase Track Navigator Tabs */}
      <div className="flex overflow-x-auto space-x-2 pb-2 scrollbar-none">
        {FOUNDER_PHASES.map((p, idx) => {
          const isSelected = idx === activePhaseIndex;
          const isCompleted = idx < project.currentPhaseIndex;
          const isCurrent = idx === project.currentPhaseIndex;

          return (
            <button
              key={p.key}
              onClick={() => setActivePhaseIndex(idx)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all border shrink-0 ${
                isSelected
                  ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 border-zinc-900 dark:border-zinc-100 shadow-xs'
                  : 'bg-white dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              {isCompleted ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              ) : isCurrent ? (
                <span className="w-2 h-2 rounded-full bg-amber-500" />
              ) : (
                <Circle className="w-3.5 h-3.5 text-zinc-400" />
              )}
              <span>{p.name}</span>
            </button>
          );
        })}
      </div>

      {/* Main Phase Detail Card */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-xs space-y-6">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-widest">
              Phase #{currentPhase.index + 1}
            </span>
            <span className="text-xs text-zinc-400">·</span>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              {currentPhase.tagline}
            </span>
          </div>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
            {currentPhase.name}
          </h2>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 max-w-2xl leading-relaxed">
            {currentPhase.objective}
          </p>
        </div>

        {/* AI Guidance Bar */}
        <div className="bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start space-x-2.5">
            <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-xs font-semibold text-amber-900 dark:text-amber-200">
                Recommended Co-Founder Inquiry
              </h3>
              <p className="text-[11px] text-amber-800/80 dark:text-amber-300/80 italic mt-0.5">
                "{currentPhase.aiGuidancePrompt}"
              </p>
            </div>
          </div>
          <button
            onClick={() => onOpenAICofounderWithPrompt(currentPhase.aiGuidancePrompt)}
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold transition-colors shrink-0 shadow-2xs"
          >
            Ask Co-Founder
          </button>
        </div>

        {/* Required Inputs */}
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">
            Required Deliverables & Inputs
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {currentPhase.requiredInputs.map((input, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/80 text-xs flex items-center space-x-2 text-zinc-700 dark:text-zinc-300"
              >
                <FileCheck className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                <span>{input}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Phase Tasks Checklist */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">
            Phase Execution Tasks
          </h3>
          <div className="space-y-2.5">
            {currentPhase.tasks.map((task) => {
              const isChecked = Boolean(taskNotes[`checked_${task.id}`]);
              return (
                <div
                  key={task.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    isChecked
                      ? 'bg-emerald-50/40 dark:bg-emerald-950/10 border-emerald-200 dark:border-emerald-800/40'
                      : 'bg-white dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-700/80'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <button
                      onClick={() => handleTaskCheck(task.id)}
                      className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center transition-colors ${
                        isChecked
                          ? 'bg-emerald-600 text-white'
                          : 'border border-zinc-400 dark:border-zinc-500 hover:border-zinc-600'
                      }`}
                    >
                      {isChecked && <Check className="w-3 h-3" />}
                    </button>
                    <div className="flex-1 space-y-1">
                      <div className="font-semibold text-xs text-zinc-900 dark:text-zinc-100">
                        {task.title}
                      </div>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                        {task.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Completion Criteria Notice */}
        <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-500">
          <div>
            <span className="font-semibold text-zinc-800 dark:text-zinc-200">
              Completion Threshold:{' '}
            </span>
            <span>{currentPhase.completionCriteria}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
