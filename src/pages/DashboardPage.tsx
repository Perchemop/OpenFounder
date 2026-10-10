import React from 'react';
import {
  Scale,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  FlaskConical,
  Target,
  ShieldAlert,
} from 'lucide-react';
import type {
  Project,
  EvidenceItem,
  Experiment,
  Competitor,
  FeatureItem,
  ResearchSource,
  RiskItem,
} from '../types';
import { FOUNDER_PHASES } from '../data/phases';
import type { WorkspaceTab } from '../components/layout/Sidebar';
import {
  isOpenRisk,
  isHotRisk,
  riskScore,
  scoreLabel,
  sortRisksByScore,
} from '../utils/riskScoring';

interface DashboardPageProps {
  project: Project | null;
  evidence?: EvidenceItem[];
  experiments?: Experiment[];
  competitors?: Competitor[];
  features?: FeatureItem[];
  research?: ResearchSource[];
  risks?: RiskItem[];
  onSelectTab: (tab: WorkspaceTab) => void;
  onOpenAICofounder?: () => void;
  onOpenAICofounderWithPrompt?: (prompt: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  project,
  evidence = [],
  experiments = [],
  competitors = [],
  features = [],
  research = [],
  risks = [],
  onSelectTab,
  onOpenAICofounder,
  onOpenAICofounderWithPrompt,
}) => {
  if (!project) {
    return (
      <div className="p-8 text-center max-w-md mx-auto space-y-3">
        <p className="text-sm text-zinc-500">No project selected.</p>
      </div>
    );
  }

  const currentPhase = FOUNDER_PHASES[project.currentPhaseIndex] || FOUNDER_PHASES[0];

  const unverifiedAssumptions = evidence.filter(
    (e) => e.status === 'unverified' || e.status === 'assumption'
  );
  const confirmedEvidence = evidence.filter(
    (e) => e.status === 'customer_confirmed' || e.status === 'experiment_confirmed'
  );

  const runningExperiments = experiments.filter((e) => e.status === 'running');
  const passedExperiments = experiments.filter((e) => e.status === 'passed');
  const failedExperiments = experiments.filter((e) => e.status === 'failed');
  const mustFeatures = features.filter((f) => f.priority === 'must');

  const openRisks = risks.filter(isOpenRisk);
  const hotRisks = sortRisksByScore(openRisks.filter(isHotRisk));
  const topOpenRisks = sortRisksByScore(openRisks).slice(0, 3);

  let nextRecommendedAction = {
    title: 'Define Foundational Assumptions',
    description:
      'Log your baseline assumptions regarding customer behavior into the Evidence Ledger.',
    tab: 'evidence' as WorkspaceTab,
    btnLabel: 'Open Evidence Ledger',
  };

  if (hotRisks.length > 0 && runningExperiments.length === 0) {
    nextRecommendedAction = {
      title: 'Address Your Highest Risk',
      description: `"${hotRisks[0].title}" scores ${riskScore(hotRisks[0].probability, hotRisks[0].impact)}/9. Design a test or mitigation before expanding scope.`,
      tab: 'risks' as WorkspaceTab,
      btnLabel: 'Open Risk Register',
    };
  } else if (unverifiedAssumptions.length > 0 && runningExperiments.length === 0) {
    nextRecommendedAction = {
      title: 'Test Your Riskiest Assumption',
      description: `You have ${unverifiedAssumptions.length} untested assumptions. Design an experiment or conduct customer interviews before writing code.`,
      tab: 'validation' as WorkspaceTab,
      btnLabel: 'Launch Experiment',
    };
  } else if (runningExperiments.length > 0) {
    nextRecommendedAction = {
      title: 'Collect Experiment Results',
      description: `Experiment "${runningExperiments[0].hypothesis.slice(0, 45)}..." is currently running. Record your findings and update evidence confidence.`,
      tab: 'validation' as WorkspaceTab,
      btnLabel: 'Update Experiment',
    };
  } else if (competitors.length < 2) {
    nextRecommendedAction = {
      title: 'Map Competitor Landscape',
      description:
        'Document at least 2 direct or indirect competitor workarounds to understand existing customer friction.',
      tab: 'competitors' as WorkspaceTab,
      btnLabel: 'Add Competitors',
    };
  } else if (mustFeatures.length === 0) {
    nextRecommendedAction = {
      title: 'Scope Your MVP Backlog',
      description: 'Select fewer than 4 "Must-Have" features to prove value without scope creep.',
      tab: 'mvp' as WorkspaceTab,
      btnLabel: 'Prioritize MVP',
    };
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {project.isSynthetic && (
        <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/80 rounded-xl p-3.5 flex items-start space-x-3 text-xs text-amber-900 dark:text-amber-200">
          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold tracking-wide uppercase text-[10px] bg-amber-200/80 dark:bg-amber-900/60 px-1.5 py-0.5 rounded mr-1.5 text-amber-900 dark:text-amber-100">
              Synthetic Demo Workspace
            </span>
            <span>
              All data, customer interviews, competitor reviews, and experiment statistics in this
              project are simulated examples for educational and demonstration purposes. They do not
              represent real-world empirical findings.
            </span>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-[11px] uppercase font-mono tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                Phase {project.currentPhaseIndex + 1} of 10
              </span>
              <span className="text-xs text-zinc-400">·</span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                Category: {project.category}
              </span>
            </div>
            <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{project.name}</h1>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 max-w-2xl leading-relaxed">
              {project.oneSentenceIdea || project.problemStatement}
            </p>
          </div>

          <button
            onClick={() => {
              if (onOpenAICofounder) {
                onOpenAICofounder();
              } else if (onOpenAICofounderWithPrompt) {
                onOpenAICofounderWithPrompt(
                  `I am currently at Phase ${project.currentPhaseIndex + 1}: ${currentPhase.name}. What is the single highest leverage step I should take right now?`
                );
              }
            }}
            className="flex items-center space-x-2 px-3.5 py-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-xs font-semibold hover:bg-amber-100 transition-colors shrink-0 shadow-2xs cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Consult AI Co-Founder</span>
          </button>
        </div>

        <div className="mt-5 pt-4 border-t border-zinc-100 dark:border-zinc-800/80">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-semibold text-zinc-800 dark:text-zinc-200">
              Current Focus: {currentPhase.name}
            </span>
            <button
              onClick={() => onSelectTab('phases')}
              className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 text-[11px] underline"
            >
              View all 10 phases →
            </button>
          </div>
          <div className="grid grid-cols-10 gap-1.5 h-2">
            {FOUNDER_PHASES.map((p, idx) => (
              <div
                key={p.key}
                title={`${p.name}: ${p.tagline}`}
                className={`rounded-full transition-all ${
                  idx < project.currentPhaseIndex
                    ? 'bg-emerald-500'
                    : idx === project.currentPhaseIndex
                      ? 'bg-zinc-900 dark:bg-zinc-100 ring-2 ring-zinc-400 dark:ring-zinc-600'
                      : 'bg-zinc-200 dark:bg-zinc-800'
                }`}
              />
            ))}
          </div>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-2">{currentPhase.objective}</p>
        </div>
      </div>

      <div className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-1.5 text-[11px] uppercase tracking-wider text-amber-400 dark:text-amber-600 font-bold">
            <Target className="w-3.5 h-3.5" />
            <span>Highest-Value Next Action</span>
          </div>
          <h2 className="text-sm font-semibold">{nextRecommendedAction.title}</h2>
          <p className="text-xs text-zinc-300 dark:text-zinc-600 max-w-xl">
            {nextRecommendedAction.description}
          </p>
        </div>
        <button
          onClick={() => onSelectTab(nextRecommendedAction.tab)}
          className="px-4 py-2 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white rounded-lg text-xs font-semibold hover:opacity-90 transition-opacity shrink-0 flex items-center space-x-1.5"
        >
          <span>{nextRecommendedAction.btnLabel}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2 text-xs font-semibold text-zinc-900 dark:text-zinc-100">
            <ShieldAlert className="w-4 h-4 text-rose-500" />
            <span>Risk Register Snapshot</span>
          </div>
          <button
            onClick={() => onSelectTab('risks')}
            className="text-[11px] text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 underline"
          >
            Full register →
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
          <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-800 text-center">
            <div className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{risks.length}</div>
            <div className="text-[10px] uppercase font-mono text-zinc-500">Total</div>
          </div>
          <div className="p-2.5 rounded-lg bg-amber-50/80 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40 text-center">
            <div className="text-lg font-bold text-amber-700 dark:text-amber-400">{openRisks.length}</div>
            <div className="text-[10px] uppercase font-mono text-amber-600/80 dark:text-amber-500/80">
              Open / Testing
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-rose-50/80 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40 text-center">
            <div className="text-lg font-bold text-rose-700 dark:text-rose-400">{hotRisks.length}</div>
            <div className="text-[10px] uppercase font-mono text-rose-600/80 dark:text-rose-500/80">
              Hot (score ≥ 4)
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-center">
            <div className="text-lg font-bold text-emerald-700 dark:text-emerald-400">
              {risks.filter((r) => r.status === 'mitigated' || r.status === 'accepted').length}
            </div>
            <div className="text-[10px] uppercase font-mono text-emerald-600/80 dark:text-emerald-500/80">
              Mitigated / Accepted
            </div>
          </div>
        </div>
        {topOpenRisks.length > 0 ? (
          <div className="space-y-1.5">
            {topOpenRisks.map((risk) => {
              const score = riskScore(risk.probability, risk.impact);
              const label = scoreLabel(score);
              return (
                <button
                  key={risk.id}
                  type="button"
                  onClick={() => onSelectTab('risks')}
                  className="w-full flex items-center justify-between gap-2 p-2 rounded-lg border border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 text-left transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-[11px] font-medium text-zinc-900 dark:text-zinc-100 truncate">
                      {risk.title}
                    </div>
                    <div className="text-[10px] text-zinc-500 capitalize">
                      {risk.category} · {risk.status} · {risk.probability}/{risk.impact}
                    </div>
                  </div>
                  <span className={`text-[11px] shrink-0 ${label.className}`}>
                    {label.text} ({score})
                  </span>
                </button>
              );
            })}
          </div>
        ) : (
          <p className="text-[11px] text-zinc-400 italic">
            No open risks. Add items in the Risk Register as assumptions surface.
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs font-semibold text-zinc-900 dark:text-zinc-100">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>What We Know</span>
            </div>
            <button
              onClick={() => onSelectTab('evidence')}
              className="text-[11px] text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 underline"
            >
              Ledger
            </button>
          </div>
          <div className="space-y-1.5">
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              {confirmedEvidence.length}
            </div>
            <p className="text-[11px] text-zinc-500">Customer or experiment-confirmed claims</p>
          </div>
          <div className="space-y-1.5 pt-2 border-t border-zinc-100 dark:border-zinc-800 text-xs">
            {confirmedEvidence.slice(0, 2).map((ev) => (
              <div
                key={ev.id}
                className="p-2 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/50 rounded text-emerald-900 dark:text-emerald-300 text-[11px]"
              >
                ✓ {ev.claim}
              </div>
            ))}
            {confirmedEvidence.length === 0 && (
              <p className="text-[11px] text-zinc-400 italic">No verified proof recorded yet.</p>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs font-semibold text-zinc-900 dark:text-zinc-100">
              <Scale className="w-4 h-4 text-amber-500" />
              <span>What Is Uncertain</span>
            </div>
            <button
              onClick={() => onSelectTab('evidence')}
              className="text-[11px] text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 underline"
            >
              Audit
            </button>
          </div>
          <div className="space-y-1.5">
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {unverifiedAssumptions.length}
            </div>
            <p className="text-[11px] text-zinc-500">Unverified leaps of faith</p>
          </div>
          <div className="space-y-1.5 pt-2 border-t border-zinc-100 dark:border-zinc-800 text-xs">
            {unverifiedAssumptions.slice(0, 2).map((ev) => (
              <div
                key={ev.id}
                className="p-2 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/50 rounded text-amber-900 dark:text-amber-300 text-[11px]"
              >
                ? {ev.claim}
              </div>
            ))}
            {unverifiedAssumptions.length === 0 && (
              <p className="text-[11px] text-zinc-400 italic">No open assumptions recorded.</p>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs font-semibold text-zinc-900 dark:text-zinc-100">
              <FlaskConical className="w-4 h-4 text-purple-500" />
              <span>Validation Tests</span>
            </div>
            <button
              onClick={() => onSelectTab('validation')}
              className="text-[11px] text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 underline"
            >
              Manage
            </button>
          </div>
          <div className="space-y-1.5">
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              {passedExperiments.length} Passed · {runningExperiments.length} Active
            </div>
            <p className="text-[11px] text-zinc-500">
              {failedExperiments.length > 0 ? `${failedExperiments.length} failed · ` : ''}
              Falsifiable hypothesis tests
            </p>
          </div>
          <div className="space-y-1.5 pt-2 border-t border-zinc-100 dark:border-zinc-800 text-xs">
            {runningExperiments.slice(0, 2).map((exp) => (
              <div
                key={exp.id}
                className="p-2 bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/50 rounded text-purple-900 dark:text-purple-300 text-[11px]"
              >
                ⚗️ {exp.hypothesis}
              </div>
            ))}
            {runningExperiments.length === 0 && (
              <p className="text-[11px] text-zinc-400 italic">No active experiments in progress.</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: 'Evidence Ledger', count: `${evidence.length} claims`, tab: 'evidence' as WorkspaceTab },
          { label: 'Risk Register', count: `${openRisks.length} open`, tab: 'risks' as WorkspaceTab },
          { label: 'Research Sources', count: `${research.length} logged`, tab: 'research' as WorkspaceTab },
          { label: 'Competitor Matrix', count: `${competitors.length} analyzed`, tab: 'competitors' as WorkspaceTab },
          { label: 'MVP Backlog', count: `${features.length} features`, tab: 'mvp' as WorkspaceTab },
        ].map((item) => (
          <button
            key={item.tab}
            onClick={() => onSelectTab(item.tab)}
            className="p-3.5 bg-zinc-50 dark:bg-zinc-800/60 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/80 rounded-xl text-left transition-colors flex items-center justify-between"
          >
            <div>
              <div className="font-semibold text-xs text-zinc-900 dark:text-zinc-100">{item.label}</div>
              <div className="text-[11px] text-zinc-500">{item.count}</div>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
          </button>
        ))}
      </div>
    </div>
  );
};
