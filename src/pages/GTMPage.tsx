import React, { useState, useEffect, useRef } from 'react';
import {
  Megaphone,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Send,
  Users,
  Target,
  Clock,
  HelpCircle,
} from 'lucide-react';
import type { Project, GTMPlan } from '../types';
import { db } from '../db';
import { generateGTMStrategy } from '../ai/autoCompleteService';
import { AIAutoFillButton } from '../components/ai/AIAutoFillButton';

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
  const [isGeneratingGTM, setIsGeneratingGTM] = useState(false);

  // Positioning statement template: For [target], who [need], our [product] is a [category] that [benefit], unlike [competitor], our product [differentiator].
  const [targetUser, setTargetUser] = useState(project?.targetMarket || 'ideal customer profile');
  const [need, setNeed] = useState(project?.problemStatement || 'suffer from an acute unaddressed pain');
  const [productName, setProductName] = useState(project?.name || 'My Product');
  const [category, setCategory] = useState(project?.category || 'workflow software');
  const [benefit, setBenefit] = useState('delivers measurable time/money savings');
  const [competitor, setCompetitor] = useState('existing manual workarounds');
  const [differentiator, setDifferentiator] = useState('charges only for verified value');

  // Distribution Channels
  const [channels, setChannels] = useState<ChannelItem[]>([
    {
      name: 'Direct Cold Email / LinkedIn / Phone Outreach',
      type: 'Outbound',
      status: 'testing',
      notes: 'Reaching out directly to 25 target prospective users for feedback.',
    },
    {
      name: 'Target Community & Forum Discussions',
      type: 'Community',
      status: 'assumed',
      notes: 'Answering high-intent questions and sharing actionable frameworks.',
    },
    {
      name: 'Strategic Niche Partnerships',
      type: 'Partnerships',
      status: 'assumed',
      notes: 'Partnering with existing service providers who already serve this customer.',
    },
  ]);

  const handleAutoGenerateGTM = async () => {
    if (!project) return;
    setIsGeneratingGTM(true);
    try {
      const generated = await generateGTMStrategy(project);
      if (generated.targetUser) setTargetUser(generated.targetUser);
      if (generated.need) setNeed(generated.need);
      if (generated.productName) setProductName(generated.productName);
      if (generated.category) setCategory(generated.category);
      if (generated.benefit) setBenefit(generated.benefit);
      if (generated.competitor) setCompetitor(generated.competitor);
      if (generated.differentiator) setDifferentiator(generated.differentiator);
      if (generated.channels && generated.channels.length > 0) {
        setChannels(generated.channels);
      }
    } catch (err) {
      console.error('Failed to auto-generate GTM:', err);
    } finally {
      setIsGeneratingGTM(false);
    }
  };

  const [checklist, setChecklist] = useState<{ [key: string]: boolean }>({
    icp_defined: false,
    five_interviews: false,
    smoke_test: false,
    onboarding_script: false,
    first_paid_user: false,
  });

  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'idle'>('idle');
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const isLoadedRef = useRef(false);
  const saveTimeoutRef = useRef<any>(null);

  // Load from IndexedDB
  useEffect(() => {
    if (!project?.id) return;
    isLoadedRef.current = false;

    async function loadData() {
      try {
        const stored = await db.gtmPlan.where('projectId').equals(project!.id).first();
        if (stored) {
          if (stored.targetUser) setTargetUser(stored.targetUser);
          if (stored.need) setNeed(stored.need);
          if (stored.productName) setProductName(stored.productName);
          if (stored.category) setCategory(stored.category);
          if (stored.benefit) setBenefit(stored.benefit);
          if (stored.competitor) setCompetitor(stored.competitor);
          if (stored.differentiator) setDifferentiator(stored.differentiator);
          if (stored.channels?.length) setChannels(stored.channels);
          if (stored.checklist?.length) {
            const map: { [key: string]: boolean } = {};
            stored.checklist.forEach(item => { map[item.id] = item.done; });
            setChecklist(prev => ({ ...prev, ...map }));
          }
          setLastSaved(new Date(stored.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        }
      } catch (err) {
        console.error('Failed to load GTM plan from database:', err);
      } finally {
        isLoadedRef.current = true;
      }
    }

    loadData();
  }, [project?.id]);

  // Debounced autosave
  useEffect(() => {
    if (!project?.id || !isLoadedRef.current) return;

    setSaveStatus('saving');
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        const now = Date.now();
        const checklistArray = Object.entries(checklist).map(([id, done]) => ({
          id,
          title: id,
          desc: '',
          done: Boolean(done),
        }));

        const dataToSave: GTMPlan = {
          id: `gtm_${project.id}`,
          projectId: project.id,
          targetUser,
          need,
          productName,
          category,
          benefit,
          competitor,
          differentiator,
          channels,
          checklist: checklistArray,
          updatedAt: now,
        };

        await db.gtmPlan.put(dataToSave);
        setSaveStatus('saved');
        setLastSaved(new Date(now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      } catch (err) {
        console.error('Failed to autosave GTM plan:', err);
        setSaveStatus('idle');
      }
    }, 600);

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [
    project?.id,
    targetUser,
    need,
    productName,
    category,
    benefit,
    competitor,
    differentiator,
    channels,
    checklist,
  ]);

  const toggleChecklist = (key: string) => {
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const positioningStatement = `For ${targetUser || '[target audience]'}, who ${need || '[suffer acute problem]'}, ${productName || '[product]'} is a ${category || '[market category]'} that ${benefit || '[core benefit]'}, unlike ${competitor || '[current alternative]'}, our product ${differentiator || '[primary differentiator]'}.`;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center space-x-2">
              <Megaphone className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span>Go-To-Market & Channel Strategy</span>
            </h1>
            {saveStatus === 'saving' && (
              <span className="flex items-center space-x-1 text-[11px] text-amber-500 font-medium px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                <Clock className="w-3 h-3 animate-spin" />
                <span>Saving...</span>
              </span>
            )}
            {saveStatus === 'saved' && (
              <span className="flex items-center space-x-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 className="w-3 h-3" />
                <span>Autosaved {lastSaved ? `at ${lastSaved}` : 'locally'}</span>
              </span>
            )}
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">
            Identify how you will win your first 10 and 100 customers. Distinguish between assumed and validated channels.
          </p>
        </div>

        <div className="flex items-center space-x-2 self-start">
          <AIAutoFillButton
            onClick={handleAutoGenerateGTM}
            isLoading={isGeneratingGTM}
            label="⚡ AI Auto-Generate GTM & Channels"
            loadingLabel="Formulating GTM plan..."
            size="sm"
            variant="subtle"
          />

          <button
            onClick={() =>
              onOpenAICofounderWithPrompt(
                'Audit our go-to-market channels and positioning. What is the cheapest, most repeatable wedge to acquire our first 10 paying customers?'
              )
            }
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg text-xs font-semibold hover:opacity-90 transition-opacity shadow-xs"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Audit Wedge Strategy</span>
          </button>
        </div>
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
