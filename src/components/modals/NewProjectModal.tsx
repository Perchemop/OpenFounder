import React, { useState } from 'react';
import { X, ArrowRight, ArrowLeft, Check, Sparkles, FolderPlus } from 'lucide-react';
import type { Project, FounderStartingPoint, ProjectStage } from '../../types';
import { db, setActiveProjectId } from '../../db';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated: (project: Project) => void;
}

export const NewProjectModal: React.FC<NewProjectModalProps> = ({
  isOpen,
  onClose,
  onProjectCreated,
}) => {
  const [step, setStep] = useState(1);

  // Step 1: Idea
  const [name, setName] = useState('');
  const [oneSentenceIdea, setOneSentenceIdea] = useState('');
  const [category, setCategory] = useState('B2B SaaS / Workflow');
  const [stage, setStage] = useState<ProjectStage>('idea');
  const [targetMarket, setTargetMarket] = useState('');
  const [location, setLocation] = useState('Global / Remote');
  const [website, setWebsite] = useState('');
  const [existingResearch, setExistingResearch] = useState('');

  // Step 2: Problem
  const [problemStatement, setProblemStatement] = useState('');
  const [targetUserGroup, setTargetUserGroup] = useState('');
  const [problemFrequency, setProblemFrequency] = useState<'hourly' | 'daily' | 'weekly' | 'monthly' | 'rarely' | 'unknown'>('weekly');
  const [problemSeverity, setProblemSeverity] = useState<'mild' | 'moderate' | 'severe' | 'critical' | 'unknown'>('severe');
  const [currentAlternatives, setCurrentAlternatives] = useState('');

  // Step 3: Desired Outcome
  const [successDefinition, setSuccessDefinition] = useState('');
  const [behavioralChange, setBehavioralChange] = useState('');
  const [willingnessToPayTrigger, setWillingnessToPayTrigger] = useState('');

  // Step 4: Founder Context
  const [founderSkills, setFounderSkills] = useState('');
  const [availableResources, setAvailableResources] = useState('');
  const [budget, setBudget] = useState('$500 - $2,000');
  const [timeline, setTimeline] = useState('4-8 weeks to MVP test');
  const [existingAudience, setExistingAudience] = useState('');
  const [constraints, setConstraints] = useState('');

  // Step 5: Starting Point
  const [startingPoint, setStartingPoint] = useState<FounderStartingPoint>('idea_only');

  if (!isOpen) return null;

  const handleNext = () => {
    if (step === 1 && !name.trim()) return;
    if (step < 5) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleFinish = async () => {
    const now = Date.now();
    const newProject: Project = {
      id: `proj_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: name.trim() || 'Untitled Project',
      oneSentenceIdea,
      category,
      stage,
      targetMarket,
      location,
      website,
      existingResearch,
      problemStatement,
      targetUserGroup,
      problemFrequency,
      problemSeverity,
      currentAlternatives,
      successDefinition,
      behavioralChange,
      willingnessToPayTrigger,
      founderSkills,
      availableResources,
      budget,
      timeline,
      existingAudience,
      constraints,
      startingPoint,
      currentPhaseIndex: 0,
      createdAt: now,
      updatedAt: now,
    };

    await db.projects.put(newProject);

    // Seed 1 initial assumption from the problem definition if provided
    if (problemStatement) {
      await db.evidence.put({
        id: `ev-${Date.now()}`,
        projectId: newProject.id,
        claim: `Target users (${targetUserGroup || 'customers'}) experience: ${problemStatement.slice(0, 100)}...`,
        type: 'problem',
        status: 'assumption',
        evidenceNotes: 'Initial foundational assumption logged during project setup.',
        confidence: 'medium',
        nextTest: 'Conduct 5 exploratory discovery interviews with target users.',
        createdAt: now,
        updatedAt: now,
      });
    }

    setActiveProjectId(newProject.id);
    onProjectCreated(newProject);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl max-w-xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-950">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 flex items-center justify-center">
              <FolderPlus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                New Project Setup
              </h2>
              <p className="text-[11px] text-zinc-500">
                Step {step} of 5 — {step === 1 && 'Your Idea'}
                {step === 2 && 'The Problem'}
                {step === 3 && 'Desired Outcome'}
                {step === 4 && 'Founder Context'}
                {step === 5 && 'Starting Point'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="grid grid-cols-5 h-1 bg-zinc-200 dark:bg-zinc-800">
          {[1, 2, 3, 4, 5].map((s) => (
            <div
              key={s}
              className={`h-full transition-all ${
                s <= step ? 'bg-zinc-900 dark:bg-zinc-100' : ''
              }`}
            />
          ))}
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4 text-xs">
          {/* STEP 1: IDEA */}
          {step === 1 && (
            <div className="space-y-3">
              <div>
                <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Project Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Local Contractor Marketplace, InvoiceSync, CleanAir Tracker"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-400"
                  autoFocus
                />
              </div>

              <div>
                <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  One-Sentence Value Hypothesis
                </label>
                <input
                  type="text"
                  placeholder="e.g. Direct booking platform connecting trade contractors with local property owners without pay-per-lead markups."
                  value={oneSentenceIdea}
                  onChange={(e) => setOneSentenceIdea(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Industry Category
                  </label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2 text-zinc-900 dark:text-zinc-100"
                  />
                </div>
                <div>
                  <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Target Geography / Market
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. North America, Austin TX, EU Remote"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2 text-zinc-900 dark:text-zinc-100"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Target Customer Group
                </label>
                <input
                  type="text"
                  placeholder="e.g. Independent plumbing & HVAC contractors with 1-3 employees"
                  value={targetMarket}
                  onChange={(e) => setTargetMarket(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2 text-zinc-900 dark:text-zinc-100"
                />
              </div>
            </div>
          )}

          {/* STEP 2: PROBLEM */}
          {step === 2 && (
            <div className="space-y-3">
              <div>
                <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  What acute problem are you solving?
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe the painful reality: what goes wrong, what causes stress, or what wastes time or capital?"
                  value={problemStatement}
                  onChange={(e) => setProblemStatement(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-400"
                />
              </div>

              <div>
                <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Who experiences this problem most acutely?
                </label>
                <input
                  type="text"
                  placeholder="e.g. Solo trade operators without dedicated admin or marketing staff"
                  value={targetUserGroup}
                  onChange={(e) => setTargetUserGroup(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Frequency of Occurrence
                  </label>
                  <select
                    value={problemFrequency}
                    onChange={(e) => setProblemFrequency(e.target.value as any)}
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2 text-zinc-900 dark:text-zinc-100"
                  >
                    <option value="daily">Multiple times daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="rarely">Occasionally / Annually</option>
                    <option value="unknown">Unknown / Needs research</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Pain Severity
                  </label>
                  <select
                    value={problemSeverity}
                    onChange={(e) => setProblemSeverity(e.target.value as any)}
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2 text-zinc-900 dark:text-zinc-100"
                  >
                    <option value="critical">Critical (business stops / severe financial bleed)</option>
                    <option value="severe">Severe (frustration, frequent wasted hours)</option>
                    <option value="moderate">Moderate (annoyance but tolerated)</option>
                    <option value="mild">Mild (aspirational nice-to-have)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  How is it currently solved / worked around?
                </label>
                <input
                  type="text"
                  placeholder="e.g. Buying leads on Angi/Thumbtack, messy text messages, paper pads"
                  value={currentAlternatives}
                  onChange={(e) => setCurrentAlternatives(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2 text-zinc-900 dark:text-zinc-100"
                />
              </div>
            </div>
          )}

          {/* STEP 3: DESIRED OUTCOME */}
          {step === 3 && (
            <div className="space-y-3">
              <div>
                <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  What does tangible success look like for the customer?
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Contractor fills 3 open schedule slots per month with zero speculative ad spend."
                  value={successDefinition}
                  onChange={(e) => setSuccessDefinition(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2.5 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  What do users do differently when using your solution?
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Instead of bidding on shared leads, they receive exclusive SMS alerts with 1-click job acceptance."
                  value={behavioralChange}
                  onChange={(e) => setBehavioralChange(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2.5 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  What would make them pay real money?
                </label>
                <input
                  type="text"
                  placeholder="e.g. Guarantee of paid completed job rather than paying for unqualified inquiries"
                  value={willingnessToPayTrigger}
                  onChange={(e) => setWillingnessToPayTrigger(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2.5 text-zinc-900 dark:text-zinc-100"
                />
              </div>
            </div>
          )}

          {/* STEP 4: FOUNDER CONTEXT */}
          {step === 4 && (
            <div className="space-y-3">
              <div>
                <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Existing Skills & Unfair Advantage
                </label>
                <input
                  type="text"
                  placeholder="e.g. Full-stack React developer, past family plumbing business, domain expertise"
                  value={founderSkills}
                  onChange={(e) => setFounderSkills(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Validation Budget
                  </label>
                  <input
                    type="text"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2 text-zinc-900 dark:text-zinc-100"
                  />
                </div>
                <div>
                  <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Timeline Target
                  </label>
                  <input
                    type="text"
                    value={timeline}
                    onChange={(e) => setTimeline(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2 text-zinc-900 dark:text-zinc-100"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Existing Network / Access to Customers
                </label>
                <input
                  type="text"
                  placeholder="e.g. 10 personal contractor contacts; active in local Chamber of Commerce"
                  value={existingAudience}
                  onChange={(e) => setExistingAudience(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Known Constraints & Blind Spots
                </label>
                <input
                  type="text"
                  placeholder="e.g. 15 hours/week max, limited knowledge of Texas trade licensing statutes"
                  value={constraints}
                  onChange={(e) => setConstraints(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2 text-zinc-900 dark:text-zinc-100"
                />
              </div>
            </div>
          )}

          {/* STEP 5: STARTING POINT */}
          {step === 5 && (
            <div className="space-y-2">
              <p className="font-medium text-zinc-800 dark:text-zinc-200 mb-2">
                Select your starting maturity level:
              </p>
              {[
                {
                  id: 'idea_only' as FounderStartingPoint,
                  title: 'Idea Only',
                  desc: 'Just an initial spark. Need to define assumptions and find early interview candidates.',
                },
                {
                  id: 'problem_identified' as FounderStartingPoint,
                  title: 'Problem Identified',
                  desc: 'Clear understanding of the pain; need to conduct competitor research & validation experiments.',
                },
                {
                  id: 'research_completed' as FounderStartingPoint,
                  title: 'Research Completed',
                  desc: 'Already mapped competitors and customer quotes; ready to shape solution & test MVP.',
                },
                {
                  id: 'mvp_started' as FounderStartingPoint,
                  title: 'MVP in Progress',
                  desc: 'Prototype in development; need go-to-market plan and customer feedback loops.',
                },
                {
                  id: 'existing_business' as FounderStartingPoint,
                  title: 'Existing Business / Expansion',
                  desc: 'Already generating revenue; validating a new product line or business model pivot.',
                },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setStartingPoint(opt.id)}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${
                    startingPoint === opt.id
                      ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-100 dark:bg-zinc-800 ring-1 ring-zinc-900 dark:ring-zinc-100'
                      : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500'
                  }`}
                >
                  <div className="font-semibold text-zinc-900 dark:text-zinc-100">
                    {opt.title}
                  </div>
                  <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    {opt.desc}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-950">
          <button
            onClick={handleBack}
            disabled={step === 1}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 disabled:opacity-30 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>

          {step < 5 ? (
            <button
              onClick={handleNext}
              disabled={step === 1 && !name.trim()}
              className="flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg hover:opacity-90 disabled:opacity-40 transition-opacity"
            >
              <span>Continue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Create Project Workspace</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
