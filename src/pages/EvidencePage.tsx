import React, { useState } from 'react';
import {
  Scale,
  Plus,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  Trash2,
  Edit2,
  X,
} from 'lucide-react';
import type { EvidenceItem, EvidenceStatus, ClaimType } from '../types';
import { db } from '../db';
import { generateEvidenceMatrix, suggestProjectField } from '../ai/autoCompleteService';
import { AIAutoFillButton } from '../components/ai/AIAutoFillButton';
import {
  evaluateEvidencePromotion,
  summarizeEvidenceIntegrity,
  describeMissingEvidence,
  type PromotionBlocker,
} from '../utils/evidenceIntegrity';

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
  const [isGeneratingMatrix, setIsGeneratingMatrix] = useState(false);
  const [isSuggestingClaim, setIsSuggestingClaim] = useState(false);
  const [isSuggestingTest, setIsSuggestingTest] = useState(false);

  // New claim form state
  const [claim, setClaim] = useState('');
  const [type, setType] = useState<ClaimType>('problem');
  const [status, setStatus] = useState<EvidenceStatus>('assumption');
  const [evidenceNotes, setEvidenceNotes] = useState('');
  const [sourceTitle, setSourceTitle] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [confidence, setConfidence] = useState<'low' | 'medium' | 'high'>('medium');
  const [nextTest, setNextTest] = useState('');
  const [formError, setFormError] = useState<string[]>([]);

  // Edit flow for an existing claim
  const [editingItem, setEditingItem] = useState<EvidenceItem | null>(null);
  const [editError, setEditError] = useState<string[]>([]);

  // Blocked status promotion that needs more evidence
  const [pendingPromotion, setPendingPromotion] = useState<{
    item: EvidenceItem;
    target: EvidenceStatus;
    blockers: PromotionBlocker[];
  } | null>(null);

  const resetDraft = () => {
    setClaim('');
    setType('problem');
    setStatus('assumption');
    setEvidenceNotes('');
    setSourceTitle('');
    setSourceUrl('');
    setConfidence('medium');
    setNextTest('');
    setFormError([]);
  };

  const openCreateModal = () => {
    resetDraft();
    setIsAddModalOpen(true);
  };

  const openEditModal = (item: EvidenceItem) => {
    setEditingItem(item);
    setEditError([]);
    setClaim(item.claim);
    setType(item.type);
    setStatus(item.status);
    setEvidenceNotes(item.evidenceNotes ?? '');
    setSourceTitle(item.sourceTitle ?? '');
    setSourceUrl(item.sourceUrl ?? '');
    setConfidence(item.confidence);
    setNextTest(item.nextTest ?? '');
  };

  const closeEditModal = () => {
    setEditingItem(null);
    setEditError([]);
    resetDraft();
  };

  const integrity = summarizeEvidenceIntegrity(evidence);

  const handleGenerateMatrix = async () => {
    setIsGeneratingMatrix(true);
    try {
      const project = await db.projects.get(projectId);
      if (!project) return;
      const matrix = await generateEvidenceMatrix(project);
      const now = Date.now();
      for (let i = 0; i < matrix.length; i++) {
        const item = matrix[i];
        await db.evidence.put({
          id: `ev-${now}-${i}-${Math.random().toString(36).substring(2, 6)}`,
          projectId,
          claim: item.claim,
          type: (item.type as ClaimType) || 'problem',
          status: (item.status as EvidenceStatus) || 'assumption',
          evidenceNotes: item.evidenceNotes || 'Generated from AI foundational risk synthesis',
          confidence: (item.confidence as 'low' | 'medium' | 'high') || 'medium',
          nextTest: item.nextTest || 'Conduct targeted customer discovery',
          createdAt: now + i,
          updatedAt: now + i,
        });
      }
      onEvidenceUpdated();
    } catch (err) {
      console.error('Failed to generate evidence matrix:', err);
    } finally {
      setIsGeneratingMatrix(false);
    }
  };

  const handleSuggestClaim = async () => {
    setIsSuggestingClaim(true);
    try {
      const project = await db.projects.get(projectId);
      const suggestion = await suggestProjectField('problemStatement', {
        name: project?.name,
        oneSentenceIdea: project?.oneSentenceIdea,
        category: project?.category,
      });
      if (suggestion) {
        setClaim(`Target users struggle with: ${suggestion}`);
      }
    } catch (err) {
      console.error('Failed to suggest claim:', err);
    } finally {
      setIsSuggestingClaim(false);
    }
  };

  const handleSuggestFalsification = async () => {
    setIsSuggestingTest(true);
    try {
      const project = await db.projects.get(projectId);
      const suggestion = await suggestProjectField('willingnessToPayTrigger', {
        name: project?.name,
        oneSentenceIdea: project?.oneSentenceIdea,
        problemStatement: claim,
      });
      if (suggestion) {
        setNextTest(`Falsify with smoke-test: ask 5 prospective buyers if they would commit deposit based on: ${suggestion}`);
      }
    } catch (err) {
      console.error('Failed to suggest falsification test:', err);
    } finally {
      setIsSuggestingTest(false);
    }
  };

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

    const evaluation = evaluateEvidencePromotion(
      {
        claim: claim.trim(),
        status: 'unverified',
        evidenceNotes,
        sourceTitle,
        sourceUrl,
      },
      status
    );

    if (!evaluation.allowed) {
      setFormError(evaluation.blockers.map((blocker) => blocker.message));
      return;
    }

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
    resetDraft();
    setIsAddModalOpen(false);
    onEvidenceUpdated();
  };

  const handleUpdateStatus = async (item: EvidenceItem, newStatus: EvidenceStatus) => {
    const evaluation = evaluateEvidencePromotion(item, newStatus);

    if (!evaluation.allowed) {
      setPendingPromotion({
        item,
        target: newStatus,
        blockers: evaluation.blockers,
      });
      return;
    }

    await db.evidence.update(item.id, {
      status: newStatus,
      updatedAt: Date.now(),
    });
    onEvidenceUpdated();
  };

  const handleStartPromotion = () => {
    if (!pendingPromotion) return;
    const { item, target } = pendingPromotion;
    openEditModal(item);
    setStatus(target);
    setEditError([]);
    setPendingPromotion(null);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !claim.trim()) return;

    const evaluation = evaluateEvidencePromotion(
      {
        claim: claim.trim(),
        status: editingItem.status,
        evidenceNotes,
        sourceTitle,
        sourceUrl,
      },
      status
    );

    if (!evaluation.allowed) {
      setEditError(evaluation.blockers.map((blocker) => blocker.message));
      return;
    }

    await db.evidence.update(editingItem.id, {
      claim: claim.trim(),
      type,
      status,
      evidenceNotes,
      sourceTitle,
      sourceUrl,
      confidence,
      nextTest,
      updatedAt: Date.now(),
    });
    onEvidenceUpdated();
    closeEditModal();
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
            <Scale className="w-5 h-5 text-emerald-600 dark:text-emerald-400"  aria-hidden="true" />
            <span>Evidence Ledger</span>
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Audit beliefs vs verifiable customer truth. Unsupported assumptions are visually highlighted.
          </p>
        </div>

        <div className="flex items-center space-x-2 self-start">
          <AIAutoFillButton
            onClick={handleGenerateMatrix}
            isLoading={isGeneratingMatrix}
            label="⚡ AI Auto-Generate Evidence Matrix"
            loadingLabel="Synthesizing risk matrix..."
            size="sm"
            variant="subtle"
          />
          <button
            onClick={openCreateModal}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg text-xs font-semibold hover:opacity-90 transition-opacity shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Claim / Assumption</span>
          </button>
        </div>
      </div>

      {/* Evidence integrity summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3">
          <div className="text-[10px] uppercase tracking-wider font-semibold text-zinc-500">
            Claims
          </div>
          <div className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
            {integrity.total}
          </div>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3">
          <div className="text-[10px] uppercase tracking-wider font-semibold text-zinc-500 flex items-center space-x-1">
            <ShieldCheck className="w-3 h-3 text-emerald-500"  aria-hidden="true" />
            <span>Supported</span>
          </div>
          <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
            {integrity.supported}
            <span className="text-[11px] font-medium text-zinc-400 ml-1">
              ({integrity.coveragePct}%)
            </span>
          </div>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3">
          <div className="text-[10px] uppercase tracking-wider font-semibold text-zinc-500 flex items-center space-x-1">
            <ShieldAlert className="w-3 h-3 text-rose-500"  aria-hidden="true" />
            <span>Unsupported</span>
          </div>
          <div className="text-lg font-bold text-rose-600 dark:text-rose-400">
            {integrity.unsupported}
          </div>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3">
          <div className="text-[10px] uppercase tracking-wider font-semibold text-zinc-500">
            Customer / experiment verified
          </div>
          <div className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
            {integrity.verified}
          </div>
        </div>
      </div>

      {integrity.weakestType && integrity.unsupported > 0 && (
        <p className="text-[11px] text-zinc-500 -mt-1">
          Weakest area:{' '}
          <span className="font-semibold capitalize text-zinc-700 dark:text-zinc-300">
            {integrity.weakestType}
          </span>{' '}
          — {integrity.byType[0].unsupported} unsupported claim
          {integrity.byType[0].unsupported === 1 ? '' : 's'}. Promotion to a stronger status
          requires the matching evidence.
        </p>
      )}

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
            'anecdotal',
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
                          handleUpdateStatus(item, e.target.value as EvidenceStatus)
                        }
                        title="Promotions require supporting evidence; downgrades are always allowed."
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
                        onClick={() => openEditModal(item)}
                        className="p-1.5 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                        title="Edit claim and evidence"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
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
              {formError.length > 0 && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-lg text-rose-800 dark:text-rose-300 space-y-1">
                  <div className="font-semibold flex items-center space-x-1.5">
                    <ShieldAlert className="w-3.5 h-3.5"  aria-hidden="true" />
                    <span>This status needs more evidence</span>
                  </div>
                  <ul className="list-disc list-inside space-y-0.5">
                    {formError.map((message) => (
                      <li key={message}>{message}</li>
                    ))}
                  </ul>
                </div>
              )}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-medium text-zinc-700 dark:text-zinc-300">
                    Claim / Hypothesis Statement <span className="text-rose-500">*</span>
                  </label>
                  <AIAutoFillButton
                    onClick={handleSuggestClaim}
                    isLoading={isSuggestingClaim}
                    label="AI Suggest Hypothesis"
                    size="xs"
                  />
                </div>
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
                <div className="flex items-center justify-between mb-1">
                  <label className="font-medium text-zinc-700 dark:text-zinc-300">
                    Next Falsification Test
                  </label>
                  <AIAutoFillButton
                    onClick={handleSuggestFalsification}
                    isLoading={isSuggestingTest}
                    label="AI Suggest Test"
                    size="xs"
                  />
                </div>
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
      {/* Edit Claim Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl max-w-lg w-full p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Edit Claim & Evidence
              </h3>
              <button
                onClick={closeEditModal}
                className="text-zinc-400 hover:text-zinc-600"
                aria-label="Close edit claim dialog"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
              {editError.length > 0 && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-lg text-rose-800 dark:text-rose-300 space-y-1">
                  <div className="font-semibold flex items-center space-x-1.5">
                    <ShieldAlert className="w-3.5 h-3.5"  aria-hidden="true" />
                    <span>Promotion blocked — nothing was saved</span>
                  </div>
                  <ul className="list-disc list-inside space-y-0.5">
                    {editError.map((message) => (
                      <li key={message}>{message}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div>
                <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Claim / Hypothesis Statement <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  required
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
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => {
                      setStatus(e.target.value as EvidenceStatus);
                      setEditError([]);
                    }}
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
                  Evidence Notes / Verbatim Quote
                </label>
                <textarea
                  rows={3}
                  placeholder={'Research-backed: summarise the finding. Customer-confirmed: paste the quote, for example "I would cancel Angi tomorrow".'}
                  value={evidenceNotes}
                  onChange={(e) => setEvidenceNotes(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Confidence
                  </label>
                  <select
                    value={confidence}
                    onChange={(e) =>
                      setConfidence(e.target.value as 'low' | 'medium' | 'high')
                    }
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
                    placeholder="e.g. Plumber interview #2"
                    value={sourceTitle}
                    onChange={(e) => setSourceTitle(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Source URL
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={sourceUrl}
                  onChange={(e) => setSourceUrl(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2"
                />
              </div>

              <div>
                <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Next Falsification Test
                </label>
                <input
                  type="text"
                  placeholder="What specific test would prove this assumption false?"
                  value={nextTest}
                  onChange={(e) => setNextTest(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="px-3 py-1.5 text-zinc-600 hover:text-zinc-900 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg font-semibold hover:opacity-90 transition-opacity"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Blocked promotion dialog */}
      {pendingPromotion && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl max-w-md w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-start space-x-3">
              <ShieldAlert className="w-5 h-5 text-rose-500 shrink-0 mt-0.5"  aria-hidden="true" />
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  Evidence required
                </h3>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  “{pendingPromotion.item.claim}” cannot be marked{' '}
                  <strong className="capitalize">
                    {STATUS_CONFIG[pendingPromotion.target].label}
                  </strong>{' '}
                  yet. The claim stays{' '}
                  <strong className="capitalize">
                    {STATUS_CONFIG[pendingPromotion.item.status].label}
                  </strong>{' '}
                  until the following is recorded:
                </p>
              </div>
            </div>

            <ul className="text-xs text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-lg p-3 space-y-1 list-disc list-inside">
              {pendingPromotion.blockers.map((blocker) => (
                <li key={blocker.code}>{blocker.message}</li>
              ))}
            </ul>

            <p className="text-[11px] text-zinc-500 leading-relaxed">
              Next step: {describeMissingEvidence(pendingPromotion.item)}
            </p>

            <div className="flex justify-end space-x-2 text-xs">
              <button
                onClick={() => setPendingPromotion(null)}
                className="px-3 py-1.5 text-zinc-600 hover:text-zinc-900 rounded-lg"
              >
                Keep current status
              </button>
              <button
                onClick={handleStartPromotion}
                className="px-3.5 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg font-semibold hover:opacity-90 transition-opacity"
              >
                Add evidence & promote
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
