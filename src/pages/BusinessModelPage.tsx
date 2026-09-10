import React, { useState } from 'react';
import {
  Receipt,
  Calculator,
  DollarSign,
  TrendingUp,
  Percent,
  Layers,
  Sparkles,
  HelpCircle,
} from 'lucide-react';
import type { Project } from '../types';

interface BusinessModelPageProps {
  project: Project | null;
  onOpenAICofounderWithPrompt: (prompt: string) => void;
}

export const BusinessModelPage: React.FC<BusinessModelPageProps> = ({
  project,
  onOpenAICofounderWithPrompt,
}) => {
  // Unit economics state
  const [monthlyPrice, setMonthlyPrice] = useState<number>(49);
  const [grossMarginPct, setGrossMarginPct] = useState<number>(85);
  const [monthlyChurnPct, setMonthlyChurnPct] = useState<number>(5);
  const [cac, setCac] = useState<number>(120);
  const [fixedMonthlyCost, setFixedMonthlyCost] = useState<number>(400);

  // Math
  const churnDecimal = Math.max(0.001, monthlyChurnPct / 100);
  const avgLifetimeMonths = 1 / churnDecimal;
  const grossProfitPerMonth = monthlyPrice * (grossMarginPct / 100);
  const ltv = grossProfitPerMonth * avgLifetimeMonths;
  const ltvCacRatio = cac > 0 ? ltv / cac : 0;
  const paybackMonths = grossProfitPerMonth > 0 ? cac / grossProfitPerMonth : 0;
  const breakEvenSubscribers = grossProfitPerMonth > 0 ? Math.ceil(fixedMonthlyCost / grossProfitPerMonth) : 0;

  // Lean Canvas quadrants
  const [leanCanvas, setLeanCanvas] = useState({
    problem: project?.problemStatement || 'Contractors waste $800/mo on shared leads that rarely convert.',
    customerSegments: project?.targetMarket || 'Solo plumbing and electrical contractors (1-3 crew).',
    uniqueValue: project?.oneSentenceIdea || 'Exclusive pay-per-booked-job alerts with zero upfront bidding costs.',
    solution: 'Direct SMS booking alerts with 1-click calendar reservation and verified client card on file.',
    channels: 'Direct cold SMS, local trade supply store partnerships, contractor subreddits.',
    revenueStreams: `$${monthlyPrice}/mo platform access + $25 fee per successfully completed appointment.`,
    costStructure: 'Hosting ($30/mo), Twilio SMS API ($0.0079/msg), Stripe transaction fees (2.9% + 30c).',
    keyMetrics: 'Monthly booked jobs per active contractor, 30-day retention, contractor weekly active rate.',
    unfairAdvantage: project?.founderSkills || 'Direct family relationships with 15 local Austin trade business owners.',
  });

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center space-x-2">
            <Receipt className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span>Business Model & Unit Economics</span>
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Model cash flow sustainability, unit margins, and Lean Canvas assumptions.
          </p>
        </div>

        <button
          onClick={() =>
            onOpenAICofounderWithPrompt(
              'Audit our unit economics and pricing model. Does an LTV:CAC ratio and payback period make sense for this customer type?'
            )
          }
          className="flex items-center space-x-1.5 px-3.5 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg text-xs font-semibold hover:opacity-90 transition-opacity shadow-xs self-start"
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Audit Economics with AI</span>
        </button>
      </div>

      {/* Unit Economics Interactive Calculator */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center space-x-2 text-xs font-semibold text-zinc-900 dark:text-zinc-100">
            <Calculator className="w-4 h-4 text-emerald-500" />
            <span>Unit Economics Simulator</span>
          </div>
          <span className="text-[11px] text-zinc-500">Live Mathematical Model</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* Inputs */}
          <div className="lg:col-span-2 space-y-3 text-xs">
            <div>
              <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Monthly Price per Customer ($)
              </label>
              <input
                type="number"
                min={1}
                value={monthlyPrice}
                onChange={(e) => setMonthlyPrice(Number(e.target.value))}
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2 font-mono text-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Gross Margin (%)
                </label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={grossMarginPct}
                  onChange={(e) => setGrossMarginPct(Number(e.target.value))}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2 font-mono"
                />
              </div>
              <div>
                <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Monthly Churn (%)
                </label>
                <input
                  type="number"
                  min={0.1}
                  max={100}
                  step={0.5}
                  value={monthlyChurnPct}
                  onChange={(e) => setMonthlyChurnPct(Number(e.target.value))}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Est. Acquisition Cost (CAC $)
                </label>
                <input
                  type="number"
                  min={1}
                  value={cac}
                  onChange={(e) => setCac(Number(e.target.value))}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2 font-mono"
                />
              </div>
              <div>
                <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Fixed Overhead ($/mo)
                </label>
                <input
                  type="number"
                  min={0}
                  value={fixedMonthlyCost}
                  onChange={(e) => setFixedMonthlyCost(Number(e.target.value))}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Computed Results */}
          <div className="lg:col-span-3 grid grid-cols-2 gap-3">
            <div className="p-3.5 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl border border-zinc-200 dark:border-zinc-700/80 flex flex-col justify-between">
              <span className="text-[10px] uppercase font-semibold text-zinc-400">
                Customer Lifetime Value (LTV)
              </span>
              <div className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mt-2">
                ${Math.round(ltv).toLocaleString()}
              </div>
              <span className="text-[10px] text-zinc-500">
                Avg lifetime: {avgLifetimeMonths.toFixed(1)} months
              </span>
            </div>

            <div className="p-3.5 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl border border-zinc-200 dark:border-zinc-700/80 flex flex-col justify-between">
              <span className="text-[10px] uppercase font-semibold text-zinc-400">
                LTV : CAC Ratio
              </span>
              <div
                className={`text-xl font-bold mt-2 ${
                  ltvCacRatio >= 3
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : ltvCacRatio >= 1
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {ltvCacRatio.toFixed(1)}x
              </div>
              <span className="text-[10px] text-zinc-500">
                {ltvCacRatio >= 3 ? 'Healthy (>3.0x standard)' : 'Danger (<3.0x)'}
              </span>
            </div>

            <div className="p-3.5 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl border border-zinc-200 dark:border-zinc-700/80 flex flex-col justify-between">
              <span className="text-[10px] uppercase font-semibold text-zinc-400">
                CAC Payback Period
              </span>
              <div className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mt-2">
                {paybackMonths.toFixed(1)} mos
              </div>
              <span className="text-[10px] text-zinc-500">
                {paybackMonths <= 12 ? 'Excellent (<12 mos)' : 'Slow (>12 mos)'}
              </span>
            </div>

            <div className="p-3.5 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl border border-zinc-200 dark:border-zinc-700/80 flex flex-col justify-between">
              <span className="text-[10px] uppercase font-semibold text-zinc-400">
                Break-Even Threshold
              </span>
              <div className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mt-2">
                {breakEvenSubscribers} subscribers
              </div>
              <span className="text-[10px] text-zinc-500">
                To cover ${fixedMonthlyCost}/mo fixed costs
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Lean Canvas 9-Block Grid */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Lean Business Canvas
          </h2>
          <span className="text-[11px] text-zinc-500">Interactive 9 Quadrants</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          {/* Block 1: Problem */}
          <div className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/40 space-y-1.5">
            <span className="text-[10px] font-bold uppercase text-zinc-400">1. Problem</span>
            <textarea
              rows={3}
              value={leanCanvas.problem}
              onChange={(e) => setLeanCanvas({ ...leanCanvas, problem: e.target.value })}
              className="w-full bg-transparent resize-none focus:outline-none text-zinc-800 dark:text-zinc-200"
            />
          </div>

          {/* Block 2: Solution */}
          <div className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/40 space-y-1.5">
            <span className="text-[10px] font-bold uppercase text-zinc-400">2. Solution</span>
            <textarea
              rows={3}
              value={leanCanvas.solution}
              onChange={(e) => setLeanCanvas({ ...leanCanvas, solution: e.target.value })}
              className="w-full bg-transparent resize-none focus:outline-none text-zinc-800 dark:text-zinc-200"
            />
          </div>

          {/* Block 3: Value Proposition */}
          <div className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/40 space-y-1.5">
            <span className="text-[10px] font-bold uppercase text-zinc-400">3. Unique Value Prop</span>
            <textarea
              rows={3}
              value={leanCanvas.uniqueValue}
              onChange={(e) => setLeanCanvas({ ...leanCanvas, uniqueValue: e.target.value })}
              className="w-full bg-transparent resize-none focus:outline-none text-zinc-800 dark:text-zinc-200"
            />
          </div>

          {/* Block 4: Customer Segments */}
          <div className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/40 space-y-1.5">
            <span className="text-[10px] font-bold uppercase text-zinc-400">4. Customer Segments</span>
            <textarea
              rows={3}
              value={leanCanvas.customerSegments}
              onChange={(e) => setLeanCanvas({ ...leanCanvas, customerSegments: e.target.value })}
              className="w-full bg-transparent resize-none focus:outline-none text-zinc-800 dark:text-zinc-200"
            />
          </div>

          {/* Block 5: Channels */}
          <div className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/40 space-y-1.5">
            <span className="text-[10px] font-bold uppercase text-zinc-400">5. Distribution Channels</span>
            <textarea
              rows={3}
              value={leanCanvas.channels}
              onChange={(e) => setLeanCanvas({ ...leanCanvas, channels: e.target.value })}
              className="w-full bg-transparent resize-none focus:outline-none text-zinc-800 dark:text-zinc-200"
            />
          </div>

          {/* Block 6: Unfair Advantage */}
          <div className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/40 space-y-1.5">
            <span className="text-[10px] font-bold uppercase text-zinc-400">6. Unfair Advantage</span>
            <textarea
              rows={3}
              value={leanCanvas.unfairAdvantage}
              onChange={(e) => setLeanCanvas({ ...leanCanvas, unfairAdvantage: e.target.value })}
              className="w-full bg-transparent resize-none focus:outline-none text-zinc-800 dark:text-zinc-200"
            />
          </div>

          {/* Block 7: Key Metrics */}
          <div className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/40 space-y-1.5">
            <span className="text-[10px] font-bold uppercase text-zinc-400">7. Key Metrics</span>
            <textarea
              rows={3}
              value={leanCanvas.keyMetrics}
              onChange={(e) => setLeanCanvas({ ...leanCanvas, keyMetrics: e.target.value })}
              className="w-full bg-transparent resize-none focus:outline-none text-zinc-800 dark:text-zinc-200"
            />
          </div>

          {/* Block 8: Cost Structure */}
          <div className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/40 space-y-1.5">
            <span className="text-[10px] font-bold uppercase text-zinc-400">8. Cost Structure</span>
            <textarea
              rows={3}
              value={leanCanvas.costStructure}
              onChange={(e) => setLeanCanvas({ ...leanCanvas, costStructure: e.target.value })}
              className="w-full bg-transparent resize-none focus:outline-none text-zinc-800 dark:text-zinc-200"
            />
          </div>

          {/* Block 9: Revenue Streams */}
          <div className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/40 space-y-1.5">
            <span className="text-[10px] font-bold uppercase text-zinc-400">9. Revenue Streams</span>
            <textarea
              rows={3}
              value={leanCanvas.revenueStreams}
              onChange={(e) => setLeanCanvas({ ...leanCanvas, revenueStreams: e.target.value })}
              className="w-full bg-transparent resize-none focus:outline-none text-zinc-800 dark:text-zinc-200"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
