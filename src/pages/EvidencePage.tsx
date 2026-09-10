import React, { useState } from 'react';
import {
  Scale,
  Plus,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Trash2,
  Edit2,
  ExternalLink,
  Filter,
} from 'lucide-react';
import type { EvidenceItem, EvidenceStatus, ClaimType } from '../types';
import { db } from '../db';

interface EvidencePageProps {
  projectId: string;
  evidence?: EvidenceItem[];
  onEvidenceUpdated: () => void;
  onOpenAICofounderWithPrompt?: (prompt: string) => void;
}

const STATUS_CONFIG: Record<
  EvidenceStatus,
  { label: string; badgeClass: string; description: string }
> = {
  unverified: {
    label: 'Unverified',
    badgeClass: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800',
    description: 'No evidence yet. High risk leap of faith.',
  },
  assumption: {
    label: 'Assumption',
    badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    description: 'Internal hypothesis without external validation.',
  },
  anecdotal: {
    label: 'Anecdotal',
    badgeClass: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950/60 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800',
    description: 'Heard from 1-2 casual chats, not systematically tested.',
  },
  research_backed: {
    label: 'Research-Backed',
    badgeClass: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    description: 'Supported by public data, industry studies, or benchmarks.',
  },
  customer_confirmed: {
    label: 'Customer-Confirmed',
    badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    description: 'Confirmed by target users in structured discovery interviews.',
  },
  experiment_confirmed: {
    label: 'Experiment-Confirmed',
    badgeClass: 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    description: 'Falsifiable quantitative test or smoke-test passed.',
  },
};

export const EvidencePage: React.FC<EvidencePageProps> = ({
  projectId,
  evidence = [],
  onEvidenceUpdated,
  onOpenAICofounderWithPrompt,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New claim form state
  const [claim, setClaim] = useState('');
  const [type, setType] = useState<ClaimType>('problem');
  const [status, setStatus] = useState<EvidenceStatus>('assumption');
  const [evidenceNotes, setEvidenceNotes] = useState('');
  const [sourceTitle, setSourceTitle] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [confidence, setConfidence] = useState<'low' | 'medium' | 'high'>('medium');
  const [nextTest, setNextTest] = useState('');

  const filteredEvidence = evidence.filter((item) => {
    if (filterStatus === 'all') return true;
    return item.status === filterStatus;
  });

  const unverifiedCount = evidence.filter(
    (e) => e.status === 'unverified' || e.status === 'assumption'
  ).length;

  const handleCreateClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!claim.trim()) return;

    const now = Date.now();
    const newItem: EvidenceItem = {
      id: `ev-${now}-${Math.random().toString(36).substring(2, 6)}`,
      projectId,
      claim: claim.trim(),
      type,
      status,
      evidenceNotes,
      sourceTitle,
      sourceUrl,
      confidence,
      nextTest,
      createdAt: now,
      updatedAt: now,
    };

    await db.evidence.put(newItem);
    setClaim('');
    setEvidenceNotes('');
    setSourceTitle('');
    setSourceUrl('');
    setNextTest('');
    setIsAddModalOpen(false);
    onEvidenceUpdated();
  };

  const handleUpdateStatus = async (id: string, newStatus: EvidenceStatus) => {
    await db.evidence.update(id, {
      status: newStatus,
      updatedAt: Date.now(),
    });
    onEvidenceUpdated();
  };

  const handleDeleteClaim = async (id: string) => {
    if (confirm('Delete this claim from the Evidence Ledger?')) {
      await db.evidence.delete(id);
      onEvidenceUpdated();
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center space-x-2">
            <Scale className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span>Evidence Ledger</span>
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Audit beliefs vs verifiable customer truth. Unsupported assumptions are visually highlighted.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center space-x-1.5 px-3.5 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg text-xs font-semibold hover:opacity-90 transition-opacity shadow-xs self-start"
        >
          <Plus className="w-4 h-4" />
          <span>Add Claim / Assumption</span>
        </button>
      </div>

      {/* Assumption Health Warning Banner if unverified count > 0 */}
      {unverifiedCount > 0 && (
        <div className="p-4 bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60 rounded-xl flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900 dark:text-amber-200 space-y-1">
            <div className="font-semibold">
              {unverifiedCount} Unsupported Assumption{unverifiedCount > 1 ? 's' : ''} Detected
            </div>
            <p className="text-amber-800/80 dark:text-amber-300/80 leading-relaxed">
              These claims underpin your business strategy but have not yet been validated by customers or quantitative tests. Prioritize designing an experiment before building software.
            </p>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center space-x-1 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setFilterStatus('all')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
            filterStatus === 'all'
              ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
          }`}
        >
          All ({evidence.length})
        </button>
        {(
          [
            'unverified',
            'assumption',
            'customer_confirmed',
            'experiment_confirmed',
            'research_backed',
          ] as EvidenceStatus[]
        ).map((st) => {
          const count = evidence.filter((e) => e.status === st).length;
          return (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
                filterStatus === st
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
              }`}
            >
              {STATUS_CONFIG[st].label} ({count})
            </button>
          );
        })}
      </div>

      {/* Ledger Table */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                <th className="p-3.5 pl-4">Claim & Foundational Belief</th>
                <th className="p-3.5">Type</th>
                <th className="p-3.5">Status & Confidence</th>
                <th className="p-3.5">Evidence / Source</th>
                <th className="p-3.5">Next Falsification Test</th>
                <th className="p-3.5 pr-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-zinc-800 dark:text-zinc-200">
              {filteredEvidence.map((item) => {
                const isRisky =
                  item.status === 'unverified' || item.status === 'assumption';
                return (
                  <tr
                    key={item.id}
                    className={`hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors ${
                      isRisky ? 'bg-amber-50/20 dark:bg-amber-950/10' : ''
                    }`}
                  >
                    <td className="p-3.5 pl-4 max-w-xs">
                      <div className="font-semibold text-zinc-900 dark:text-zinc-100 leading-snug">
                        {item.claim}
                      </div>
                    </td>

                    <td className="p-3.5 whitespace-nowrap">
                      <span className="capitalize px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-[10px] font-mono">
                        {item.type}
                      </span>
                    </td>

                    <td className="p-3.5 whitespace-nowrap space-y-1">
                      <select
                        value={item.status}
                        onChange={(e) =>
                          handleUpdateStatus(item.id, e.target.value as EvidenceStatus)
                        }
                        className={`text-[11px] font-semibold px-2 py-1 rounded-md border cursor-pointer focus:outline-none ${
                          STATUS_CONFIG[item.status].badgeClass
                        }`}
                      >
                        {Object.entries(STATUS_CONFIG).map(([val, cfg]) => (
                          <option key={val} value={val}>
                            {cfg.label}
                          </option>
                        ))}
                      </select>
                      <div className="text-[10px] text-zinc-400">
                        Confidence: <strong className="capitalize">{item.confidence}</strong>
                      </div>
                    </td>

                    <td className="p-3.5 max-w-xs text-[11px] text-zinc-600 dark:text-zinc-400">
                      <div>{item.evidenceNotes || <em className="text-zinc-400">No notes recorded</em>}</div>
                      {item.sourceTitle && (
                        <div className="text-[10px] text-zinc-400 mt-0.5">
                          Source: {item.sourceTitle}
                        </div>
                      )}
                    </td>

                    <td className="p-3.5 max-w-xs text-[11px] text-zinc-600 dark:text-zinc-400">
                      {item.nextTest || <em className="text-zinc-400">None specified</em>}
                    </td>

                    <td className="p-3.5 pr-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleDeleteClaim(item.id)}
                        className="p-1.5 text-zinc-400 hover:text-rose-600 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                        title="Delete Claim"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}

              {filteredEvidence.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-zinc-400">
                    No evidence claims found matching this filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Claim Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl max-w-lg w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Log New Claim or Assumption
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateClaim} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Claim / Hypothesis Statement <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. Solo contractors waste $600+/month buying stale leads."
                  value={claim}
                  onChange={(e) => setClaim(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Claim Type
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as ClaimType)}
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2"
                  >
                    <option value="problem">Problem Severity / Existence</option>
                    <option value="customer">Customer Segment / Reach</option>
                    <option value="pricing">Willingness to Pay / Price</option>
                    <option value="market">Market Size / Demand</option>
                    <option value="feasibility">Technical Feasibility</option>
                    <option value="distribution">Distribution / Channel</option>
                    <option value="retention">Retention / Habituation</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Current Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as EvidenceStatus)}
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2"
                  >
                    <option value="unverified">Unverified (Leap of faith)</option>
                    <option value="assumption">Assumption (Internal belief)</option>
                    <option value="anecdotal">Anecdotal</option>
                    <option value="research_backed">Research-Backed</option>
                    <option value="customer_confirmed">Customer-Confirmed</option>
                    <option value="experiment_confirmed">Experiment-Confirmed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Evidence Notes / Quotes
                </label>
                <textarea
                  rows={2}
                  placeholder="What empirical observation or interview quote supports or questions this claim?"
                  value={evidenceNotes}
                  onChange={(e) => setEvidenceNotes(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Confidence Level
                  </label>
                  <select
                    value={confidence}
                    onChange={(e) => setConfidence(e.target.value as any)}
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2"
                  >
                    <option value="low">Low Confidence</option>
                    <option value="medium">Medium Confidence</option>
                    <option value="high">High Confidence</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Source Reference Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Contractor Interview #1"
                    value={sourceTitle}
                    onChange={(e) => setSourceTitle(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Next Falsification Test
                </label>
                <input
                  type="text"
                  placeholder="What specific test or question would prove this assumption false?"
                  value={nextTest}
                  onChange={(e) => setNextTest(e.target.value)}
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
                  Save Claim to Ledger
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
