import React, { useState } from 'react';
import {
  Users,
  Plus,
  ExternalLink,
  Trash2,
  Table,
  LayoutGrid,
  Sparkles,
  TrendingDown,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import type { Competitor } from '../types';
import { db } from '../db';

interface CompetitorsPageProps {
  projectId: string;
  competitors?: Competitor[];
  onCompetitorsUpdated: () => void;
  onOpenAICofounderWithPrompt: (prompt: string) => void;
}

export const CompetitorsPage: React.FC<CompetitorsPageProps> = ({
  projectId,
  competitors = [],
  onCompetitorsUpdated,
  onOpenAICofounderWithPrompt,
}) => {
  const [viewMode, setViewMode] = useState<'cards' | 'matrix'>('cards');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Add competitor form state
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [pricingModel, setPricingModel] = useState('Monthly Subscription');
  const [targetAudience, setTargetAudience] = useState('');
  const [positioning, setPositioning] = useState('');
  const [strengthsText, setStrengthsText] = useState('');
  const [weaknessesText, setWeaknessesText] = useState('');
  const [customerComplaintsText, setCustomerComplaintsText] = useState('');
  const [keyDifferentiatorsText, setKeyDifferentiatorsText] = useState('');
  const [evidenceNotes, setEvidenceNotes] = useState('');

  const handleAddCompetitor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const now = Date.now();
    const splitLines = (str: string) =>
      str
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);

    const newComp: Competitor = {
      id: `comp-${now}-${Math.random().toString(36).substring(2, 6)}`,
      projectId,
      name: name.trim(),
      url: url.trim(),
      productDescription: description,
      pricingModel,
      targetAudience,
      positioning,
      strengths: splitLines(strengthsText),
      weaknesses: splitLines(weaknessesText),
      customerComplaints: splitLines(customerComplaintsText),
      keyDifferentiators: keyDifferentiatorsText.trim(),
      evidenceNotes,
      createdAt: now,
      updatedAt: now,
    };

    await db.competitors.put(newComp);
    setName('');
    setUrl('');
    setDescription('');
    setTargetAudience('');
    setPositioning('');
    setStrengthsText('');
    setWeaknessesText('');
    setCustomerComplaintsText('');
    setKeyDifferentiatorsText('');
    setEvidenceNotes('');
    setIsAddModalOpen(false);
    onCompetitorsUpdated();
  };

  const handleDeleteCompetitor = async (id: string) => {
    if (confirm('Delete this competitor profile?')) {
      await db.competitors.delete(id);
      onCompetitorsUpdated();
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center space-x-2">
            <Users className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span>Competitor Matrix & Gaps</span>
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Identify how customers currently solve this problem, where incumbents fall short, and opportunities to differentiate.
          </p>
        </div>

        <div className="flex items-center space-x-2 self-start">
          <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg border border-zinc-200 dark:border-zinc-700">
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded text-xs font-medium transition-colors ${
                viewMode === 'cards'
                  ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-2xs'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('matrix')}
              className={`p-1.5 rounded text-xs font-medium transition-colors ${
                viewMode === 'matrix'
                  ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-2xs'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg text-xs font-semibold hover:opacity-90 transition-opacity shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Competitor</span>
          </button>
        </div>
      </div>

      {/* AI Co-founder gap audit prompt bar */}
      <div className="p-3.5 bg-zinc-100/70 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/80 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2 text-zinc-700 dark:text-zinc-300">
          <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
          <span>Need help finding customer complaints and unaddressed market niches?</span>
        </div>
        <button
          onClick={() =>
            onOpenAICofounderWithPrompt(
              'Analyze our competitors list. What are the common customer complaints and unmet needs that represent our sharpest wedge?'
            )
          }
          className="text-xs font-semibold underline text-zinc-900 dark:text-zinc-100 hover:text-emerald-600"
        >
          Audit Competitor Weaknesses →
        </button>
      </div>

      {/* CARDS VIEW */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {competitors.map((comp) => (
            <div
              key={comp.id}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-xs space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                        {comp.name}
                      </h3>
                      {comp.url && (
                        <a
                          href={comp.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-zinc-400 hover:text-zinc-600"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                    <p className="text-[11px] text-zinc-500 mt-0.5">
                      Target: {comp.targetAudience || 'General market'}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteCompetitor(comp.id)}
                    className="p-1 text-zinc-400 hover:text-rose-600 rounded"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
                  {comp.productDescription}
                </p>

                <div className="text-[11px] p-2 rounded bg-zinc-50 dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-400">
                  <strong>Pricing Model:</strong> {comp.pricingModel}
                </div>

                {/* Strengths & Weaknesses */}
                <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-semibold text-emerald-600 dark:text-emerald-400 flex items-center space-x-1">
                      <TrendingUp className="w-3 h-3" />
                      <span>Strengths</span>
                    </span>
                    <ul className="text-[11px] text-zinc-600 dark:text-zinc-400 space-y-1">
                      {(comp.strengths || []).map((st, i) => (
                        <li key={i}>• {st}</li>
                      ))}
                      {(!comp.strengths || comp.strengths.length === 0) && <li className="italic text-zinc-400">None logged</li>}
                    </ul>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-semibold text-rose-600 dark:text-rose-400 flex items-center space-x-1">
                      <TrendingDown className="w-3 h-3" />
                      <span>Weaknesses / Complaints</span>
                    </span>
                    <ul className="text-[11px] text-zinc-600 dark:text-zinc-400 space-y-1">
                      {(comp.weaknesses || []).map((wk, i) => (
                        <li key={i}>• {wk}</li>
                      ))}
                      {(comp.customerComplaints || []).map((cc, i) => (
                        <li key={`c-${i}`} className="text-rose-700 dark:text-rose-300">• "{cc}"</li>
                      ))}
                      {(!comp.weaknesses || comp.weaknesses.length === 0) && (!comp.customerComplaints || comp.customerComplaints.length === 0) && (
                        <li className="italic text-zinc-400">None logged</li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>

              {comp.evidenceNotes && (
                <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 text-[11px] text-zinc-500 italic">
                  Note: {comp.evidenceNotes}
                </div>
              )}
            </div>
          ))}

          {competitors.length === 0 && (
            <div className="col-span-2 p-12 text-center border border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl space-y-2">
              <Users className="w-8 h-8 text-zinc-400 mx-auto" />
              <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                No competitors or substitutes logged yet.
              </p>
              <p className="text-[11px] text-zinc-500">
                Map existing market solutions or manual hacks to find your unfair advantage.
              </p>
            </div>
          )}
        </div>
      )}

      {/* MATRIX VIEW */}
      {viewMode === 'matrix' && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 text-[11px] font-semibold text-zinc-500 uppercase">
                  <th className="p-3 pl-4">Competitor</th>
                  <th className="p-3">Pricing</th>
                  <th className="p-3">Target Audience</th>
                  <th className="p-3">Core Strengths</th>
                  <th className="p-3">Vulnerabilities & Complaints</th>
                  <th className="p-3 pr-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {competitors.map((comp) => (
                  <tr key={comp.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                    <td className="p-3 pl-4 font-semibold text-zinc-900 dark:text-zinc-100">
                      <div>{comp.name}</div>
                      <div className="text-[10px] text-zinc-400 font-normal">{comp.positioning}</div>
                    </td>
                    <td className="p-3 text-[11px] text-zinc-600 dark:text-zinc-400">
                      {comp.pricingModel}
                    </td>
                    <td className="p-3 text-[11px] text-zinc-600 dark:text-zinc-400">
                      {comp.targetAudience}
                    </td>
                    <td className="p-3 text-[11px] text-zinc-600 dark:text-zinc-400 max-w-xs">
                      {(comp.strengths || []).join(', ') || '—'}
                    </td>
                    <td className="p-3 text-[11px] text-rose-700 dark:text-rose-300 max-w-xs">
                      {[...(comp.weaknesses || []), ...(comp.customerComplaints || [])].join(', ') || '—'}
                    </td>
                    <td className="p-3 pr-4 text-right">
                      <button
                        onClick={() => handleDeleteCompetitor(comp.id)}
                        className="p-1 text-zinc-400 hover:text-rose-600 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Competitor Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl max-w-lg w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Add Competitor or Alternative
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddCompetitor} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Competitor / Alternative Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Angi, Thumbtack, Spreadsheets"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2 text-zinc-900 dark:text-zinc-100"
                  />
                </div>
                <div>
                  <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Website URL (Optional)
                  </label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Product / Service Overview
                </label>
                <textarea
                  rows={2}
                  placeholder="How does this competitor operate and what is their primary pitch?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Pricing Model
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Pay-per-lead ($40-$150/lead)"
                    value={pricingModel}
                    onChange={(e) => setPricingModel(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Target Audience
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Large contractors, homeowners"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Strengths (One per line)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="High brand awareness&#10;Massive SEO traffic"
                    value={strengthsText}
                    onChange={(e) => setStrengthsText(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Weaknesses & Customer Complaints
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Shared leads sell to 4+ competitors&#10;Auto-renew contracts"
                    value={weaknessesText}
                    onChange={(e) => setWeaknessesText(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2"
                  />
                </div>
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
                  Save Competitor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
