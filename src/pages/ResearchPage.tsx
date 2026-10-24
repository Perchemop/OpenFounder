import React, { useState } from 'react';
import {
  Search,
  Plus,
  ExternalLink,
  BookOpen,
  Trash2,
  Filter,
  CheckCircle2,
  ShieldCheck,
  MessageSquare,
} from 'lucide-react';
import type { ResearchSource, ResearchCategory } from '../types';
import { db } from '../db';

interface ResearchPageProps {
  projectId: string;
  research?: ResearchSource[];
  onResearchUpdated: () => void;
  onOpenAICofounderWithPrompt?: (prompt: string) => void;
}

const CATEGORIES: { id: ResearchCategory; label: string }[] = [
  { id: 'market', label: 'Market Dynamics' },
  { id: 'competitors', label: 'Competitor Intelligence' },
  { id: 'customers', label: 'Customer Discovery' },
  { id: 'trends', label: 'Industry Trends' },
  { id: 'pricing', label: 'Pricing Benchmarks' },
  { id: 'technology', label: 'Tech Stack & Feasibility' },
  { id: 'regulations', label: 'Compliance & Regulations' },
  { id: 'distribution', label: 'Acquisition Channels' },
  { id: 'substitutes', label: 'Workarounds & Substitutes' },
];

export const ResearchPage: React.FC<ResearchPageProps> = ({
  projectId,
  research = [],
  onResearchUpdated,
  onOpenAICofounderWithPrompt,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Add source form state
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [category, setCategory] = useState<ResearchCategory>('market');
  const [sourceType, setSourceType] = useState<any>('report');
  const [summary, setSummary] = useState('');
  const [keyFindingsText, setKeyFindingsText] = useState('');
  const [confidence, setConfidence] = useState<'low' | 'medium' | 'high'>('medium');
  const [relevance, setRelevance] = useState<'low' | 'medium' | 'high'>('high');

  const filtered = research.filter((item) => {
    if (selectedCategory === 'all') return true;
    return item.category === selectedCategory;
  });

  const handleAddSource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const now = Date.now();
    const findings = keyFindingsText
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

    const newSource: ResearchSource = {
      id: `src-${now}-${Math.random().toString(36).substring(2, 6)}`,
      projectId,
      title: title.trim(),
      url: url.trim(),
      category,
      dateAccessed: new Date().toISOString().split('T')[0],
      summary,
      keyFindings: findings,
      confidence,
      relevance,
      createdAt: now,
    };

    await db.research.put(newSource);
    setTitle('');
    setUrl('');
    setSummary('');
    setKeyFindingsText('');
    setIsAddModalOpen(false);
    onResearchUpdated();
  };

  const handleDeleteSource = async (id: string) => {
    if (confirm('Delete this research source?')) {
      await db.research.delete(id);
      onResearchUpdated();
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center space-x-2">
            <Search className="w-5 h-5 text-emerald-600 dark:text-emerald-400"  aria-hidden="true" />
            <span>Research & Knowledge Base</span>
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Document primary research, benchmark studies, regulatory constraints, and forum discussions.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center space-x-1.5 px-3.5 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg text-xs font-semibold hover:opacity-90 transition-opacity shadow-xs self-start"
        >
          <Plus className="w-4 h-4" />
          <span>Add Research Source</span>
        </button>
      </div>

      {/* Categories Filter */}
      <div className="flex items-center space-x-1 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
            selectedCategory === 'all'
              ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
          }`}
        >
          All Categories ({research.length})
        </button>
        {CATEGORIES.map((cat) => {
          const count = research.filter((r) => r.category === cat.id).length;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
                selectedCategory === cat.id
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
              }`}
            >
              {cat.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Sources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-xs flex flex-col justify-between space-y-3"
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-0.5">
                  <div className="flex items-center space-x-2">
                    <span className="capitalize text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                      {item.category}
                    </span>
                    <span className="text-[10px] text-zinc-400">
                      {item.dateAccessed}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 mt-1">
                    {item.title}
                  </h3>
                </div>
                <button
                  onClick={() => handleDeleteSource(item.id)}
                  className="p-1 text-zinc-400 hover:text-rose-600 rounded"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {item.summary && (
                <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                  {item.summary}
                </p>
              )}

              {item.keyFindings && item.keyFindings.length > 0 && (
                <div className="space-y-1 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                  <p className="text-[10px] uppercase font-semibold text-zinc-400 tracking-wider">
                    Key Findings
                  </p>
                  <ul className="space-y-1 text-xs text-zinc-700 dark:text-zinc-300">
                    {item.keyFindings.map((finding, idx) => (
                      <li key={idx} className="flex items-start space-x-1.5">
                        <span className="text-emerald-500 font-bold">•</span>
                        <span>{finding}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-[11px] text-zinc-500">
              <div className="flex items-center space-x-2">
                <span>Confidence: <strong className="capitalize text-zinc-700 dark:text-zinc-300">{item.confidence}</strong></span>
              </div>
              {item.url && (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 inline-flex items-center space-x-1 underline"
                >
                  <span>Visit Source</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-2 p-12 text-center border border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl space-y-2">
            <BookOpen className="w-8 h-8 text-zinc-400 mx-auto" />
            <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              No research sources logged for this category.
            </p>
            <p className="text-[11px] text-zinc-500">
              Click "Add Research Source" to document industry studies, articles, and benchmarks.
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
                Log New Research Source
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSource} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Source Title / Article Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. State of Trade Contracting Survey 2025"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
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
                    onChange={(e) => setCategory(e.target.value as ResearchCategory)}
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Source Link / URL (Optional)
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
                  Executive Summary
                </label>
                <textarea
                  rows={2}
                  placeholder="Brief high-level summary of what this source proves or suggests."
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Key Findings (One bullet per line)
                </label>
                <textarea
                  rows={3}
                  placeholder="68% of respondents reported dissatisfaction with Angi pricing.&#10;Average monthly lead spend exceeds $750.&#10;Only 12% conversion to paid work."
                  value={keyFindingsText}
                  onChange={(e) => setKeyFindingsText(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2 text-zinc-900 dark:text-zinc-100 font-mono text-[11px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Data Reliability
                  </label>
                  <select
                    value={confidence}
                    onChange={(e) => setConfidence(e.target.value as any)}
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2"
                  >
                    <option value="high">High (Official statistical report / primary survey)</option>
                    <option value="medium">Medium (Industry blog / established trade journal)</option>
                    <option value="low">Low (Casual blog post / forum speculation)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Strategic Relevance
                  </label>
                  <select
                    value={relevance}
                    onChange={(e) => setRelevance(e.target.value as any)}
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2"
                  >
                    <option value="high">High (Direct impact on go/no-go)</option>
                    <option value="medium">Medium (Helpful context)</option>
                    <option value="low">Low (Background reference)</option>
                  </select>
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
                  Save Source
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
