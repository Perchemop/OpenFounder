import React, { useState, useMemo } from 'react';
import {
  ShieldAlert,
  Plus,
  Trash2,
  AlertTriangle,
  Filter,
} from 'lucide-react';
import type { RiskItem, RiskCategory } from '../types';
import { db, generateId } from '../db';
import { riskScore, scoreLabel, isOpenRisk, isHotRisk } from '../utils/riskScoring';

interface RisksPageProps {
  projectId: string;
  risks?: RiskItem[];
  onRisksUpdated: () => void;
  onOpenAICofounderWithPrompt?: (prompt: string) => void;
}

const CATEGORY_LABELS: Record<RiskCategory, string> = {
  desirability: 'Desirability',
  market: 'Market',
  customer: 'Customer',
  pricing: 'Pricing',
  distribution: 'Distribution',
  technical: 'Technical',
  operational: 'Operational',
  legal: 'Legal',
  financial: 'Financial',
};

const STATUS_CONFIG: Record<
  RiskItem['status'],
  { label: string; badgeClass: string }
> = {
  open: {
    label: 'Open',
    badgeClass:
      'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800',
  },
  testing: {
    label: 'Testing',
    badgeClass:
      'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800',
  },
  mitigated: {
    label: 'Mitigated',
    badgeClass:
      'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
  },
  accepted: {
    label: 'Accepted',
    badgeClass:
      'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700',
  },
};

export const RisksPage: React.FC<RisksPageProps> = ({
  projectId,
  risks = [],
  onRisksUpdated,
  onOpenAICofounderWithPrompt,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<RiskCategory>('desirability');
  const [probability, setProbability] = useState<RiskItem['probability']>('medium');
  const [impact, setImpact] = useState<RiskItem['impact']>('medium');
  const [mitigation, setMitigation] = useState('');
  const [nextTest, setNextTest] = useState('');
  const [evidenceNotes, setEvidenceNotes] = useState('');
  const [status, setStatus] = useState<RiskItem['status']>('open');

  const filteredRisks = useMemo(() => {
    return risks
      .filter((r) => {
        if (filterStatus !== 'all' && r.status !== filterStatus) return false;
        if (filterCategory !== 'all' && r.category !== filterCategory) return false;
        return true;
      })
      .sort((a, b) => riskScore(b.probability, b.impact) - riskScore(a.probability, a.impact));
  }, [risks, filterStatus, filterCategory]);

  const openCount = risks.filter(isOpenRisk).length;
  const criticalCount = risks.filter(
    (r) => isOpenRisk(r) && riskScore(r.probability, r.impact) >= 6
  ).length;

  const resetForm = () => {
    setTitle('');
    setCategory('desirability');
    setProbability('medium');
    setImpact('medium');
    setMitigation('');
    setNextTest('');
    setEvidenceNotes('');
    setStatus('open');
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const now = Date.now();
    const newRisk: RiskItem = {
      id: generateId('risk'),
      projectId,
      title: title.trim(),
      category,
      probability,
      impact,
      mitigation: mitigation.trim(),
      nextTest: nextTest.trim() || undefined,
      evidenceNotes: evidenceNotes.trim() || undefined,
      status,
      createdAt: now,
      updatedAt: now,
    };

    await db.risks.put(newRisk);
    resetForm();
    setIsAddModalOpen(false);
    onRisksUpdated();
  };

  const handleUpdateStatus = async (id: string, newStatus: RiskItem['status']) => {
    await db.risks.update(id, { status: newStatus, updatedAt: Date.now() });
    onRisksUpdated();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this risk from the register?')) {
      await db.risks.delete(id);
      onRisksUpdated();
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-rose-600 dark:text-rose-400"  aria-hidden="true" />
            <span>Risk Register</span>
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Track desirability, market, technical, and execution risks. Prioritize by impact × probability.
          </p>
        </div>

        <div className="flex items-center space-x-2 self-start">
          {onOpenAICofounderWithPrompt && (
            <button
              onClick={() =>
                onOpenAICofounderWithPrompt(
                  'Audit my risk register. Which open risks are most likely to kill the project if left untested? What is the cheapest experiment I can run this week to reduce the highest-scoring risk?'
                )
              }
              className="px-3 py-2 text-xs font-medium rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              Ask AI about risks
            </button>
          )}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg text-xs font-semibold hover:opacity-90 transition-opacity shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Risk</span>
          </button>
        </div>
      </div>

      {/* Warning banner */}
      {openCount > 0 && (
        <div className="p-4 bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/60 rounded-xl flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          <div className="text-xs text-rose-900 dark:text-rose-200 space-y-1">
            <div className="font-semibold">
              {openCount} Open Risk{openCount > 1 ? 's' : ''}
              {criticalCount > 0 && (
                <span className="ml-1.5 text-rose-700 dark:text-rose-300">
                  · {criticalCount} Critical
                </span>
              )}
            </div>
            <p className="text-rose-800/80 dark:text-rose-300/80 leading-relaxed">
              High-impact open risks should be tested or explicitly accepted before major build investment.
              Pair each risk with a falsifiable next test when possible.
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <Filter className="w-3.5 h-3.5 text-zinc-400" />
        <button
          onClick={() => setFilterStatus('all')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
            filterStatus === 'all'
              ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
          }`}
        >
          All ({risks.length})
        </button>
        {(['open', 'testing', 'mitigated', 'accepted'] as const).map((st) => {
          const count = risks.filter((r) => r.status === st).length;
          return (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
                filterStatus === st
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
              }`}
            >
              {STATUS_CONFIG[st].label} ({count})
            </button>
          );
        })}

        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="ml-2 px-2 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 border-0 text-xs text-zinc-700 dark:text-zinc-300"
        >
          <option value="all">All categories</option>
          {(Object.keys(CATEGORY_LABELS) as RiskCategory[]).map((c) => (
            <option key={c} value={c}>
              {CATEGORY_LABELS[c]}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                <th className="p-3.5 pl-4">Risk</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Prob × Impact</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Mitigation / Next Test</th>
                <th className="p-3.5 pr-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-zinc-800 dark:text-zinc-200">
              {filteredRisks.map((risk) => {
                const score = riskScore(risk.probability, risk.impact);
                const scoreInfo = scoreLabel(score);
                const isHot = isHotRisk(risk);

                return (
                  <tr
                    key={risk.id}
                    className={`hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors ${
                      isHot ? 'bg-rose-50/30 dark:bg-rose-950/10' : ''
                    }`}
                  >
                    <td className="p-3.5 pl-4 max-w-xs">
                      <div className="font-semibold text-zinc-900 dark:text-zinc-100 leading-snug">
                        {risk.title}
                      </div>
                      {risk.evidenceNotes && (
                        <div className="text-[11px] text-zinc-500 mt-0.5 line-clamp-2">
                          {risk.evidenceNotes}
                        </div>
                      )}
                    </td>

                    <td className="p-3.5 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-[10px] font-mono">
                        {CATEGORY_LABELS[risk.category]}
                      </span>
                    </td>

                    <td className="p-3.5 whitespace-nowrap">
                      <div className="flex items-center space-x-1.5">
                        <span className="capitalize text-[11px]">
                          {risk.probability} × {risk.impact}
                        </span>
                        <span className={`text-[11px] ${scoreInfo.className}`}>
                          ({scoreInfo.text})
                        </span>
                      </div>
                    </td>

                    <td className="p-3.5 whitespace-nowrap">
                      <select
                        value={risk.status}
                        onChange={(e) =>
                          handleUpdateStatus(risk.id, e.target.value as RiskItem['status'])
                        }
                        className={`text-[11px] font-semibold px-2 py-1 rounded-md border cursor-pointer focus:outline-none ${
                          STATUS_CONFIG[risk.status].badgeClass
                        }`}
                      >
                        {Object.entries(STATUS_CONFIG).map(([val, cfg]) => (
                          <option key={val} value={val}>
                            {cfg.label}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="p-3.5 max-w-xs text-[11px] text-zinc-600 dark:text-zinc-400">
                      <div>{risk.mitigation || <em className="text-zinc-400">No mitigation</em>}</div>
                      {risk.nextTest && (
                        <div className="text-[10px] text-zinc-400 mt-0.5">
                          Next test: {risk.nextTest}
                        </div>
                      )}
                    </td>

                    <td className="p-3.5 pr-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleDelete(risk.id)}
                        className="p-1.5 text-zinc-400 hover:text-rose-600 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                        title="Delete Risk"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}

              {filteredRisks.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-zinc-400">
                    No risks match this filter. Add risks that could kill or stall the project.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Risk Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl max-w-lg w-full p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Log New Risk
              </h3>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  resetForm();
                }}
                className="text-zinc-400 hover:text-zinc-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Risk title <span className="text-rose-500">*</span>
                </label>
                <input
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Customers will not pay enough to cover CAC"
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as RiskCategory)}
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2"
                  >
                    {(Object.keys(CATEGORY_LABELS) as RiskCategory[]).map((c) => (
                      <option key={c} value={c}>
                        {CATEGORY_LABELS[c]}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as RiskItem['status'])}
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2"
                  >
                    <option value="open">Open</option>
                    <option value="testing">Testing</option>
                    <option value="mitigated">Mitigated</option>
                    <option value="accepted">Accepted</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Probability
                  </label>
                  <select
                    value={probability}
                    onChange={(e) => setProbability(e.target.value as RiskItem['probability'])}
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Impact
                  </label>
                  <select
                    value={impact}
                    onChange={(e) => setImpact(e.target.value as RiskItem['impact'])}
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Mitigation plan
                </label>
                <textarea
                  rows={2}
                  value={mitigation}
                  onChange={(e) => setMitigation(e.target.value)}
                  placeholder="How will you reduce or eliminate this risk?"
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Next falsification test
                </label>
                <input
                  value={nextTest}
                  onChange={(e) => setNextTest(e.target.value)}
                  placeholder="e.g. 10 Mom-Test interviews focused on willingness to pay"
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Evidence / notes
                </label>
                <textarea
                  rows={2}
                  value={evidenceNotes}
                  onChange={(e) => setEvidenceNotes(e.target.value)}
                  placeholder="Any supporting signals or observations"
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    resetForm();
                  }}
                  className="px-3 py-2 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg text-xs font-semibold hover:opacity-90"
                >
                  Save Risk
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
