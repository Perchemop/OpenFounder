import React, { useState } from 'react';
import {
  Megaphone,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Send,
  Users,
  Target,
} from 'lucide-react';
import type { Project } from '../types';

interface GTMPageProps {
  project: Project | null;
  onOpenAICofounderWithPrompt: (prompt: string) => void;
}

interface ChannelItem {
  name: string;
  type: string;
  status: 'assumed' | 'testing' | 'validated' | 'abandoned';
  notes: string;
}

export const GTMPage: React.FC<GTMPageProps> = ({
  project,
  onOpenAICofounderWithPrompt,
}) => {
  // Positioning statement template: For [target], who [need], our [product] is a [category] that [benefit], unlike [competitor], our product [differentiator].
  const [targetUser, setTargetUser] = useState(project?.targetMarket || 'solo trade contractors (plumbers & HVAC)');
  const [need, setNeed] = useState(project?.problemStatement || 'waste hundreds of dollars on shared, stale leads');
  const [productName, setProductName] = useState(project?.name || 'OpenFounder');
  const [category, setCategory] = useState(project?.category || 'direct SMS job alert marketplace');
  const [benefit, setBenefit] = useState('guarantees exclusive, pre-booked appointments with no bidding fee');
  const [competitor, setCompetitor] = useState('Angi and Thumbtack');
  const [differentiator, setDifferentiator] = useState('charges only upon job completion with 100% customer ownership');

  // Distribution Channels
  const [channels, setChannels] = useState<ChannelItem[]>([
    {
      name: 'Direct Cold SMS / Phone Outreach',
      type: 'Outbound',
      status: 'testing',
      notes: 'Calling local trade license public registry holders to offer 2 free job bookings.',
    },
    {
      name: 'Trade Supply Store Flyer & Counter Partnerships',
      type: 'Partnerships',
      status: 'assumed',
      notes: 'Placing physical QR cards at local plumbing wholesale distributor trade counters.',
    },
    {
      name: 'Trade Subreddits & Facebook Groups',
      type: 'Community',
      status: 'assumed',
      notes: 'Answering pricing questions and sharing benchmark data without spamming.',
    },
    {
      name: 'Contractor Referral Bounties',
      type: 'Referral',
      status: 'assumed',
      notes: '$50 credit for introducing another licensed subcontractor.',
    },
  ]);

  const [checklist, setChecklist] = useState<{ [key: string]: boolean }>({
    icp_defined: true,
    five_interviews: true,
    smoke_test: false,
    onboarding_script: false,
    first_paid_user: false,
  });

  const toggleChecklist = (key: string) => {
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const positioningStatement = `For ${targetUser || '[target audience]'}, who ${need || '[suffer acute problem]'}, ${productName || '[product]'} is a ${category || '[market category]'} that ${benefit || '[core benefit]'}, unlike ${competitor || '[current alternative]'}, our product ${differentiator || '[primary differentiator]'}.`;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center space-x-2">
            <Megaphone className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span>Go-To-Market & Channel Strategy</span>
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Identify how you will win your first 10 and 100 customers. Distinguish between assumed and validated channels.
          </p>
        </div>

        <button
          onClick={() =>
            onOpenAICofounderWithPrompt(
              'Audit our go-to-market channels and positioning. What is the cheapest, most repeatable wedge to acquire our first 10 paying customers?'
            )
          }
          className="flex items-center space-x-1.5 px-3.5 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg text-xs font-semibold hover:opacity-90 transition-opacity shadow-xs self-start"
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Audit Wedge Strategy</span>
        </button>
      </div>

      {/* Positioning Statement Generator */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center space-x-2 text-xs font-semibold text-zinc-900 dark:text-zinc-100">
            <Target className="w-4 h-4 text-emerald-500" />
            <span>Positioning Statement Builder (Geoffrey Moore Framework)</span>
          </div>
        </div>

        <div className="p-4 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl border border-zinc-200 dark:border-zinc-700/80 text-xs font-serif leading-relaxed text-zinc-800 dark:text-zinc-200 italic shadow-2xs">
          "{positioningStatement}"
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              1. For [Target Audience]:
            </label>
            <input
              type="text"
              value={targetUser}
              onChange={(e) => setTargetUser(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2"
            />
          </div>

          <div>
            <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              2. Who [Has This Specific Pain]:
            </label>
            <input
              type="text"
              value={need}
              onChange={(e) => setNeed(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2"
            />
          </div>

          <div>
            <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              3. Is a [Market Category]:
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2"
            />
          </div>

          <div>
            <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              4. That [Delivers Core Benefit]:
            </label>
            <input
              type="text"
              value={benefit}
              onChange={(e) => setBenefit(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2"
            />
          </div>

          <div>
            <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              5. Unlike [Incumbents / Alternatives]:
            </label>
            <input
              type="text"
              value={competitor}
              onChange={(e) => setCompetitor(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2"
            />
          </div>

          <div>
            <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              6. Our Product [Key Differentiator]:
            </label>
            <input
              type="text"
              value={differentiator}
              onChange={(e) => setDifferentiator(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2"
            />
          </div>
        </div>
      </div>

      {/* Acquisition Channel Matrix */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Customer Acquisition Channels
            </h2>
            <p className="text-[11px] text-zinc-500">
              Do not spread yourself thin across 5 channels. Validate 1 repeatable path first.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {channels.map((ch, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-700/80 bg-zinc-50/50 dark:bg-zinc-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-zinc-900 dark:text-zinc-100">
                    {ch.name}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300">
                    {ch.type}
                  </span>
                </div>
                <p className="text-zinc-600 dark:text-zinc-400 text-[11px]">{ch.notes}</p>
              </div>

              <select
                value={ch.status}
                onChange={(e) => {
                  const updated = [...channels];
                  updated[idx].status = e.target.value as any;
                  setChannels(updated);
                }}
                className={`text-[11px] font-semibold px-2.5 py-1 rounded-md border focus:outline-none cursor-pointer self-start sm:self-center ${
                  ch.status === 'validated'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300'
                    : ch.status === 'testing'
                    ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border-purple-300'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300'
                }`}
              >
                <option value="assumed">Assumed (Untested)</option>
                <option value="testing">Currently Testing</option>
                <option value="validated">Validated (Converting)</option>
                <option value="abandoned">Abandoned (High CAC)</option>
              </select>
            </div>
          ))}
        </div>
      </div>

      {/* Pre-Launch Checklist */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-xs space-y-3">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          Pre-Launch Validation Checklist
        </h2>
        <div className="space-y-2 text-xs">
          {[
            { key: 'icp_defined', label: 'Narrow ICP defined: knows exactly who experiences the pain point' },
            { key: 'five_interviews', label: 'Completed 5 Mom Test interviews without pitching the product' },
            { key: 'smoke_test', label: 'Ran a smoke test or pre-sale test with measurable commitment' },
            { key: 'onboarding_script', label: 'Written 1-on-1 concierge onboarding script for first 5 users' },
            { key: 'first_paid_user', label: 'Secured at least 1 letter of intent or prepaid deposit' },
          ].map((item) => (
            <div
              key={item.key}
              onClick={() => toggleChecklist(item.key)}
              className="flex items-center space-x-2.5 p-2 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/60 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={checklist[item.key] || false}
                onChange={() => {}}
                className="rounded border-zinc-400 text-emerald-600 focus:ring-0 cursor-pointer"
              />
              <span
                className={`${
                  checklist[item.key]
                    ? 'line-through text-zinc-400 dark:text-zinc-500'
                    : 'text-zinc-800 dark:text-zinc-200'
                }`}
              >
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
