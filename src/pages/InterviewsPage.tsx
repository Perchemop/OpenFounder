import React, { useState } from 'react';
import {
  MessageSquareQuote,
  Plus,
  Trash2,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import type { CustomerInterview } from '../types';
import { db } from '../db';
import { generateInterviewSample, suggestProjectField } from '../ai/autoCompleteService';
import { AIAutoFillButton } from '../components/ai/AIAutoFillButton';

interface InterviewsPageProps {
  projectId: string;
  interviews?: CustomerInterview[];
  onInterviewsUpdated: () => void;
  onOpenAICofounderWithPrompt?: (prompt: string) => void;
}

export const InterviewsPage: React.FC<InterviewsPageProps> = ({
  projectId,
  interviews = [],
  onInterviewsUpdated,
  onOpenAICofounderWithPrompt,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [isFillingModal, setIsFillingModal] = useState(false);
  const [isSuggestingWorkaround, setIsSuggestingWorkaround] = useState(false);
  const [isSuggestingQuotes, setIsSuggestingQuotes] = useState(false);

  // Form state
  const [intervieweeIdentifier, setIntervieweeIdentifier] = useState('');
  const [participantRole, setParticipantRole] = useState('');
  const [severityRating, setSeverityRating] = useState<'mild' | 'moderate' | 'severe' | 'dealbreaker'>('severe');
  const [existingWorkarounds, setExistingWorkarounds] = useState('');
  const [willingnessToPayNotes, setWillingnessToPayNotes] = useState('');
  const [keyQuotesText, setKeyQuotesText] = useState('');
  const [notesOrTranscript, setNotesOrTranscript] = useState('');
  const [surprisesOrObjections, setSurprisesOrObjections] = useState('');

  const handleSynthesizeInterview = async () => {
    setIsSynthesizing(true);
    try {
      const project = await db.projects.get(projectId);
      if (!project) return;
      const sample = await generateInterviewSample(project);
      const now = Date.now();
      await db.interviews.put({
        id: `int-${now}-${Math.random().toString(36).substring(2, 6)}`,
        projectId,
        intervieweeIdentifier: sample.intervieweeIdentifier || 'Lead Target Customer Discovery',
        participantRole: sample.participantRole || 'Domain Specialist / Key Decision Maker',
        date: sample.date || new Date().toISOString().split('T')[0],
        objectives: 'Customer discovery & past behavioral patterns (The Mom Test)',
        severityRating: sample.severityRating || 'severe',
        existingWorkarounds: sample.existingWorkarounds || 'Manual spreadsheets and daily manual reconciliation',
        willingnessToPayNotes: sample.willingnessToPayNotes || 'Already paying for suboptimal point tools',
        verbatimQuotes: sample.verbatimQuotes || [
          '“We waste 5+ hours every week dealing with this breakdown manually.”',
          '“If you can guarantee reliability, we would gladly sign up immediately.”'
        ],
        notesOrTranscript: sample.notesOrTranscript || 'Detailed Mom Test discovery conversation focused purely on historical habits.',
        recurringPainPoints: [],
        surprisesOrObjections: sample.surprisesOrObjections || 'Prioritizes seamless local reliability over cloud connectivity.',
        createdAt: now,
      });
      onInterviewsUpdated();
    } catch (err) {
      console.error('Failed to synthesize interview:', err);
    } finally {
      setIsSynthesizing(false);
    }
  };

  const handleAutoFillModal = async () => {
    setIsFillingModal(true);
    try {
      const project = await db.projects.get(projectId);
      if (!project) return;
      const sample = await generateInterviewSample(project);
      if (sample.intervieweeIdentifier) setIntervieweeIdentifier(sample.intervieweeIdentifier);
      if (sample.participantRole) setParticipantRole(sample.participantRole);
      if (sample.severityRating) setSeverityRating(sample.severityRating);
      if (sample.existingWorkarounds) setExistingWorkarounds(sample.existingWorkarounds);
      if (sample.willingnessToPayNotes) setWillingnessToPayNotes(sample.willingnessToPayNotes);
      if (sample.verbatimQuotes) setKeyQuotesText(sample.verbatimQuotes.join('\n'));
      if (sample.notesOrTranscript) setNotesOrTranscript(sample.notesOrTranscript);
      if (sample.surprisesOrObjections) setSurprisesOrObjections(sample.surprisesOrObjections);
    } catch (err) {
      console.error('Failed to auto-fill interview modal:', err);
    } finally {
      setIsFillingModal(false);
    }
  };

  const handleSuggestWorkaround = async () => {
    setIsSuggestingWorkaround(true);
    try {
      const project = await db.projects.get(projectId);
      const res = await suggestProjectField('currentAlternatives', {
        name: project?.name,
        problemStatement: project?.problemStatement,
        targetMarket: project?.targetMarket,
      });
      if (res) {
        setExistingWorkarounds(`Currently relies on: ${res}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSuggestingWorkaround(false);
    }
  };

  const handleSuggestQuotes = async () => {
    setIsSuggestingQuotes(true);
    try {
      const project = await db.projects.get(projectId);
      const sample = await generateInterviewSample(project || {});
      if (sample.verbatimQuotes && sample.verbatimQuotes.length > 0) {
        setKeyQuotesText(sample.verbatimQuotes.join('\n'));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSuggestingQuotes(false);
    }
  };

  const handleAddInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!intervieweeIdentifier.trim()) return;

    const now = Date.now();
    const quotes = keyQuotesText
      .split('\n')
      .map((q) => q.trim())
      .filter(Boolean);

    const newInterview: CustomerInterview = {
      id: `int-${now}-${Math.random().toString(36).substring(2, 6)}`,
      projectId,
      intervieweeIdentifier: intervieweeIdentifier.trim(),
      participantRole: participantRole.trim(),
      date: new Date().toISOString().split('T')[0],
      objectives: 'Customer discovery & past behavioral patterns (The Mom Test)',
      severityRating,
      existingWorkarounds,
      willingnessToPayNotes,
      verbatimQuotes: quotes,
      notesOrTranscript,
      recurringPainPoints: [],
      surprisesOrObjections,
      createdAt: now,
    };

    await db.interviews.put(newInterview);
    setIntervieweeIdentifier('');
    setParticipantRole('');
    setExistingWorkarounds('');
    setWillingnessToPayNotes('');
    setKeyQuotesText('');
    setNotesOrTranscript('');
    setSurprisesOrObjections('');
    setIsAddModalOpen(false);
    onInterviewsUpdated();
  };

  const handleDeleteInterview = async (id: string) => {
    if (confirm('Delete this interview record?')) {
      await db.interviews.delete(id);
      onInterviewsUpdated();
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center space-x-2">
            <MessageSquareQuote className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span>Customer Discovery (The Mom Test)</span>
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Collect unbiased evidence of past customer behavior without pitching or asking for speculative opinions.
          </p>
        </div>

        <div className="flex items-center space-x-2 self-start">
          <AIAutoFillButton
            onClick={handleSynthesizeInterview}
            isLoading={isSynthesizing}
            label="⚡ AI Synthesize Mom Test Interview"
            loadingLabel="Synthesizing interview..."
            size="sm"
            variant="subtle"
          />
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg text-xs font-semibold hover:opacity-90 transition-opacity shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Record Interview</span>
          </button>
        </div>
      </div>

      {/* The Mom Test Golden Rules Warning */}
      <div className="bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60 rounded-xl p-4 space-y-3">
        <div className="flex items-center space-x-2 text-xs font-semibold text-amber-900 dark:text-amber-200">
          <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          <span>The Mom Test: 3 Unbreakable Principles</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-amber-900/90 dark:text-amber-200/80">
          <div className="p-2.5 bg-white/60 dark:bg-zinc-900/50 rounded-lg border border-amber-200/40">
            <strong>1. Talk about their life, not your idea</strong>
            <p className="text-[11px] text-zinc-600 dark:text-zinc-400 mt-1">
              Ask how they currently solve the problem. Never describe your product during discovery.
            </p>
          </div>
          <div className="p-2.5 bg-white/60 dark:bg-zinc-900/50 rounded-lg border border-amber-200/40">
            <strong>2. Ask about specific past facts</strong>
            <p className="text-[11px] text-zinc-600 dark:text-zinc-400 mt-1">
              "When was the last time this happened?" instead of "Would you ever use a tool that...?"
            </p>
          </div>
          <div className="p-2.5 bg-white/60 dark:bg-zinc-900/50 rounded-lg border border-amber-200/40">
            <strong>3. Talk less, listen more</strong>
            <p className="text-[11px] text-zinc-600 dark:text-zinc-400 mt-1">
              If you speak more than 20% of the time, you are pitching, not discovering.
            </p>
          </div>
        </div>

        <div className="pt-2 border-t border-amber-200/60 flex items-center justify-between text-[11px]">
          <span className="text-amber-800 dark:text-amber-300">
            Need tailored questions for your specific target customer?
          </span>
          <button
            onClick={() =>
              onOpenAICofounderWithPrompt(
                'Generate 5 Mom Test discovery questions specifically designed for our target customer without giving away our solution.'
              )
            }
            className="font-semibold underline text-amber-900 dark:text-amber-100 hover:text-amber-700"
          >
            Generate Mom Test Questions →
          </button>
        </div>
      </div>

      {/* Interviews List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {interviews.map((item) => (
          <div
            key={item.id}
            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-xs space-y-3 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                    {item.intervieweeIdentifier}
                  </h3>
                  <div className="text-[11px] text-zinc-500">
                    {item.participantRole} · {item.date}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded capitalize ${
                      item.severityRating === 'dealbreaker'
                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        : item.severityRating === 'severe'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300'
                    }`}
                  >
                    Pain: {item.severityRating}
                  </span>
                  <button
                    onClick={() => handleDeleteInterview(item.id)}
                    className="p-1 text-zinc-400 hover:text-rose-600 rounded"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Workarounds */}
              <div className="text-xs text-zinc-700 dark:text-zinc-300">
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                  Current Workaround:{' '}
                </span>
                <span>{item.existingWorkarounds || 'None recorded'}</span>
              </div>

              {/* Willingness to pay */}
              <div className="text-xs text-zinc-700 dark:text-zinc-300">
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                  Willingness to Pay Trigger:{' '}
                </span>
                <span>{item.willingnessToPayNotes || 'Uncertain'}</span>
              </div>

              {/* Verbatim Quotes */}
              {item.verbatimQuotes && item.verbatimQuotes.length > 0 && (
                <div className="space-y-1.5 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                  <p className="text-[10px] uppercase font-semibold text-zinc-400 tracking-wider">
                    Verbatim Customer Quotes
                  </p>
                  {item.verbatimQuotes.map((q, idx) => (
                    <blockquote
                      key={idx}
                      className="p-2 bg-zinc-50 dark:bg-zinc-800/60 rounded text-xs text-zinc-700 dark:text-zinc-300 italic border-l-2 border-emerald-500"
                    >
                      "{q}"
                    </blockquote>
                  ))}
                </div>
              )}

              {item.notesOrTranscript && (
                <p className="text-[11px] text-zinc-500 italic mt-2">
                  Notes: {item.notesOrTranscript}
                </p>
              )}
            </div>
          </div>
        ))}

        {interviews.length === 0 && (
          <div className="col-span-2 p-12 text-center border border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl space-y-2">
            <MessageSquareQuote className="w-8 h-8 text-zinc-400 mx-auto" />
            <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              No customer discovery interviews recorded.
            </p>
            <p className="text-[11px] text-zinc-500">
              Conduct at least 5 discovery sessions to gather concrete quotes and verify willingness to pay.
            </p>
          </div>
        )}
      </div>

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl max-w-lg w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  Log Customer Discovery Interview
                </h3>
                <AIAutoFillButton
                  onClick={handleAutoFillModal}
                  isLoading={isFillingModal}
                  label="AI Auto-Fill Form"
                  size="xs"
                />
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddInterview} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Customer Identifier (No PII needed) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Independent Plumber #1 (Austin)"
                    value={intervieweeIdentifier}
                    onChange={(e) => setIntervieweeIdentifier(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Role / Context
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Solo plumbing contractor, 8 yrs"
                    value={participantRole}
                    onChange={(e) => setParticipantRole(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Observed Problem Severity
                </label>
                <select
                  value={severityRating}
                  onChange={(e) => setSeverityRating(e.target.value as any)}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2"
                >
                  <option value="dealbreaker">Dealbreaker / Critical (Actively bleeding money/time right now)</option>
                  <option value="severe">Severe (Causes high stress or lost business weekly)</option>
                  <option value="moderate">Moderate (Annoying but tolerated)</option>
                  <option value="mild">Mild (Nice to have / not urgent)</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-medium text-zinc-700 dark:text-zinc-300">
                    How are they currently solving or hacking around this?
                  </label>
                  <AIAutoFillButton
                    onClick={handleSuggestWorkaround}
                    isLoading={isSuggestingWorkaround}
                    label="AI Suggest Workaround"
                    size="xs"
                  />
                </div>
                <input
                  type="text"
                  placeholder="e.g. Spends $800/mo on Angi leads, plus manual text messages"
                  value={existingWorkarounds}
                  onChange={(e) => setExistingWorkarounds(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2"
                />
              </div>

              <div>
                <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Willingness to Pay Signals (Past spend / commitments)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Willing to pay 10% per booked job; previously cancelled Angi"
                  value={willingnessToPayNotes}
                  onChange={(e) => setWillingnessToPayNotes(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-medium text-zinc-700 dark:text-zinc-300">
                    Verbatim Quotes (One per line)
                  </label>
                  <AIAutoFillButton
                    onClick={handleSuggestQuotes}
                    isLoading={isSuggestingQuotes}
                    label="AI Generate Quotes"
                    size="xs"
                  />
                </div>
                <textarea
                  rows={3}
                  placeholder="&quot;If you send me a job that's already booked, I'll pay you on the spot.&quot;&#10;&quot;I hate paying for tire-kickers who don't answer their phones.&quot;"
                  value={keyQuotesText}
                  onChange={(e) => setKeyQuotesText(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2 font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Notes & Transcript Summary
                </label>
                <textarea
                  rows={2}
                  placeholder="Detailed notes from the conversation..."
                  value={notesOrTranscript}
                  onChange={(e) => setNotesOrTranscript(e.target.value)}
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
                  Save Interview
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
