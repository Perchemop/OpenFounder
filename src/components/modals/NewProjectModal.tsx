import React, { useState } from 'react';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { X, ArrowRight, ArrowLeft, Check, Sparkles, FolderPlus, Wand2 } from 'lucide-react';
import type { Project, FounderStartingPoint, ProjectStage } from '../../types';
import { db, setActiveProjectId } from '../../db';
import { autoCompleteFullProject, suggestProjectField } from '../../ai/autoCompleteService';
import { AIAutoFillButton } from '../ai/AIAutoFillButton';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated: (project: Project) => void;
}

const IDEA_SPARKS = [
  { label: '🛠️ Solo Dev AI Reviewer', prompt: 'Automated pull-request code reviewer for solo founders and micro-startups' },
  { label: '💼 Subcontractor Lien SaaS', prompt: 'Automated lien-waiver and milestone progress billing for trade subcontractors' },
  { label: '🩺 PT Ambient Clinical Notes', prompt: 'Ambient voice-to-SOAP clinical documentation for solo physical therapists' },
  { label: '🌿 Farm-to-Table Wholesale', prompt: 'Wholesale aggregate ordering and morning logistics for local farms and chefs' },
];

export const NewProjectModal: React.FC<NewProjectModalProps> = ({
  isOpen,
  onClose,
  onProjectCreated,
}) => {
  const dialogRef = useFocusTrap<HTMLDivElement>(isOpen, onClose);
  const [step, setStep] = useState(1);
  const [isMagicLoading, setIsMagicLoading] = useState(false);
  const [magicSeed, setMagicSeed] = useState('');
  const [magicSuccessMessage, setMagicSuccessMessage] = useState<string | null>(null);

  // Field loading states
  const [loadingField, setLoadingField] = useState<string | null>(null);

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

  // Master 1-Click AI Autocompletion
  const handleAutoFillEntireProject = async (overrideSeed?: string) => {
    const seed = overrideSeed || magicSeed || name || oneSentenceIdea || 'AI productivity workflow';
    setIsMagicLoading(true);
    setMagicSuccessMessage(null);

    try {
      const generated = await autoCompleteFullProject(seed, category);

      if (generated.name) setName(generated.name);
      if (generated.oneSentenceIdea) setOneSentenceIdea(generated.oneSentenceIdea);
      if (generated.category) setCategory(generated.category);
      if (generated.stage) setStage(generated.stage);
      if (generated.targetMarket) setTargetMarket(generated.targetMarket);
      if (generated.location) setLocation(generated.location);
      if (generated.problemStatement) setProblemStatement(generated.problemStatement);
      if (generated.targetUserGroup) setTargetUserGroup(generated.targetUserGroup);
      if (generated.problemFrequency) setProblemFrequency(generated.problemFrequency);
      if (generated.problemSeverity) setProblemSeverity(generated.problemSeverity);
      if (generated.currentAlternatives) setCurrentAlternatives(generated.currentAlternatives);
      if (generated.successDefinition) setSuccessDefinition(generated.successDefinition);
      if (generated.behavioralChange) setBehavioralChange(generated.behavioralChange);
      if (generated.willingnessToPayTrigger) setWillingnessToPayTrigger(generated.willingnessToPayTrigger);
      if (generated.founderSkills) setFounderSkills(generated.founderSkills);
      if (generated.budget) setBudget(generated.budget);
      if (generated.timeline) setTimeline(generated.timeline);
      if (generated.startingPoint) setStartingPoint(generated.startingPoint);

      setMagicSuccessMessage(`✨ Project auto-generated with rigorous hypotheses! You can review the 5 steps or launch directly.`);
    } catch (err) {
      console.error('Failed to auto-complete project:', err);
    } finally {
      setIsMagicLoading(false);
    }
  };

  // Single field AI suggestion
  const handleSuggestField = async (fieldName: string, setter: (val: string) => void) => {
    setLoadingField(fieldName);
    try {
      const suggestion = await suggestProjectField(fieldName, {
        name,
        oneSentenceIdea,
        category,
        problemStatement,
        targetMarket,
      });
      if (suggestion) setter(suggestion);
    } catch (err) {
      console.error('Failed to suggest field:', err);
    } finally {
      setLoadingField(null);
    }
  };

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
    <div
      ref={dialogRef}
      tabIndex={-1}
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
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

        {/* 1-Click AI Auto-Complete Master Banner */}
        <div className="p-3.5 bg-gradient-to-r from-indigo-50 via-purple-50 to-blue-50 dark:from-indigo-950/40 dark:via-purple-950/30 dark:to-blue-950/40 border-b border-indigo-100 dark:border-indigo-900/60 space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center space-x-1.5">
              <Wand2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span className="text-xs font-semibold text-indigo-950 dark:text-indigo-200">
                Instant AI Project Automation
              </span>
              <span className="text-[10px] text-indigo-600/80 dark:text-indigo-400/80 font-medium">
                (Type an idea, pick a starter, or auto-complete all 5 steps)
              </span>
            </div>
            <AIAutoFillButton
              onClick={() => handleAutoFillEntireProject()}
              isLoading={isMagicLoading}
              label="⚡ Auto-Complete Entire Project"
              loadingLabel="Synthesizing project..."
              size="sm"
              variant="primary"
              className="shrink-0"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              placeholder="Rough concept (e.g. AI bookkeeping for freelancers, EV charging locator, coffee subscription)..."
              value={magicSeed}
              onChange={(e) => setMagicSeed(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAutoFillEntireProject();
                }
              }}
              className="flex-1 bg-white dark:bg-zinc-900 border border-indigo-200 dark:border-indigo-800 rounded-lg px-2.5 py-1 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-400 placeholder:text-zinc-400"
            />
          </div>

          {/* Preset Quick Sparks */}
          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
            <span className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400 mr-1">Quick ideas:</span>
            {IDEA_SPARKS.map((spark) => (
              <button
                key={spark.label}
                type="button"
                onClick={() => {
                  setMagicSeed(spark.prompt);
                  handleAutoFillEntireProject(spark.prompt);
                }}
                className="text-[11px] px-2 py-0.5 rounded-md bg-white/80 dark:bg-zinc-800/80 hover:bg-white dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 border border-indigo-100 dark:border-indigo-900/60 transition-colors shadow-2xs"
              >
                {spark.label}
              </button>
            ))}
          </div>

          {magicSuccessMessage && (
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-[11px] text-emerald-800 dark:text-emerald-300 font-medium flex items-center justify-between">
              <span>{magicSuccessMessage}</span>
              <button
                type="button"
                onClick={handleFinish}
                className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-semibold transition-colors shrink-0 ml-2"
              >
                Launch Now →
              </button>
            </div>
          )}
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
                <div className="flex items-center justify-between mb-1">
                  <label className="font-medium text-zinc-700 dark:text-zinc-300">
                    Project Name <span className="text-rose-500">*</span>
                  </label>
                  <AIAutoFillButton
                    onClick={() => handleSuggestField('name', setName)}
                    isLoading={loadingField === 'name'}
                    label="AI Suggest Name"
                  />
                </div>
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
                <div className="flex items-center justify-between mb-1">
                  <label className="font-medium text-zinc-700 dark:text-zinc-300">
                    One-Sentence Value Hypothesis
                  </label>
                  <AIAutoFillButton
                    onClick={() => handleSuggestField('oneSentenceIdea', setOneSentenceIdea)}
                    isLoading={loadingField === 'oneSentenceIdea'}
                    label="AI Suggest Value Pitch"
                  />
                </div>
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
                <div className="flex items-center justify-between mb-1">
                  <label className="font-medium text-zinc-700 dark:text-zinc-300">
                    Target Customer Group
                  </label>
                  <AIAutoFillButton
                    onClick={() => handleSuggestField('targetUserGroup', setTargetMarket)}
                    isLoading={loadingField === 'targetUserGroup'}
                    label="AI Suggest Persona"
                  />
                </div>
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
                <div className="flex items-center justify-between mb-1">
                  <label className="font-medium text-zinc-700 dark:text-zinc-300">
                    What acute problem are you solving?
                  </label>
                  <AIAutoFillButton
                    onClick={() => handleSuggestField('problemStatement', setProblemStatement)}
                    isLoading={loadingField === 'problemStatement'}
                    label="AI Formulate Problem"
                  />
                </div>
                <textarea
                  rows={3}
                  placeholder="Describe the painful reality: what goes wrong, what causes stress, or what wastes time or capital?"
                  value={problemStatement}
                  onChange={(e) => setProblemStatement(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-400"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-medium text-zinc-700 dark:text-zinc-300">
                    Who experiences this problem most acutely?
                  </label>
                  <AIAutoFillButton
                    onClick={() => handleSuggestField('targetUserGroup', setTargetUserGroup)}
                    isLoading={loadingField === 'targetUserGroup'}
                    label="AI Refine Segment"
                  />
                </div>
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
                <div className="flex items-center justify-between mb-1">
                  <label className="font-medium text-zinc-700 dark:text-zinc-300">
                    How is it currently solved / worked around?
                  </label>
                  <AIAutoFillButton
                    onClick={() => handleSuggestField('currentAlternatives', setCurrentAlternatives)}
                    isLoading={loadingField === 'currentAlternatives'}
                    label="AI Suggest Alternatives"
                  />
                </div>
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
                <div className="flex items-center justify-between mb-1">
                  <label className="font-medium text-zinc-700 dark:text-zinc-300">
                    What does tangible success look like for the customer?
                  </label>
                  <AIAutoFillButton
                    onClick={() => handleSuggestField('successDefinition', setSuccessDefinition)}
                    isLoading={loadingField === 'successDefinition'}
                    label="AI Suggest Metrics"
                  />
                </div>
                <textarea
                  rows={2}
                  placeholder="e.g. Contractor fills 3 open schedule slots per month with zero speculative ad spend."
                  value={successDefinition}
                  onChange={(e) => setSuccessDefinition(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2.5 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-medium text-zinc-700 dark:text-zinc-300">
                    What do users do differently when using your solution?
                  </label>
                  <AIAutoFillButton
                    onClick={() => handleSuggestField('behavioralChange', setBehavioralChange)}
                    isLoading={loadingField === 'behavioralChange'}
                    label="AI Suggest Behavior"
                  />
                </div>
                <textarea
                  rows={2}
                  placeholder="e.g. Instead of bidding on shared leads, they receive exclusive SMS alerts with 1-click job acceptance."
                  value={behavioralChange}
                  onChange={(e) => setBehavioralChange(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2.5 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-medium text-zinc-700 dark:text-zinc-300">
                    What would make them pay real money?
                  </label>
                  <AIAutoFillButton
                    onClick={() => handleSuggestField('willingnessToPayTrigger', setWillingnessToPayTrigger)}
                    isLoading={loadingField === 'willingnessToPayTrigger'}
                    label="AI Suggest Pricing Trigger"
                  />
                </div>
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
            <div className="space-y-3">
              <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Where are you starting from today?
              </label>
              <div className="grid grid-cols-1 gap-2">
                {[
                  {
                    id: 'idea_only',
                    title: 'Fresh Idea Only',
                    desc: 'No code, no customer interviews yet. Need to rigorously test foundational assumptions first.',
                  },
                  {
                    id: 'problem_identified',
                    title: 'Specific Pain Observed',
                    desc: 'Witnessed this painful problem repeatedly, but have not validated willingness to pay.',
                  },
                  {
                    id: 'existing_interviews',
                    title: 'Spoken With Customers',
                    desc: 'Already conducted 5+ customer discovery calls and have initial notes to catalog.',
                  },
                  {
                    id: 'competitor_dissatisfaction',
                    title: 'Exploiting Incumbent Churn',
                    desc: 'Current competitors have acute flaws, angry users on Reddit/G2, or abusive pricing.',
                  },
                  {
                    id: 'existing_prototype',
                    title: 'Prototype / Working Code Ready',
                    desc: 'Have a working MVP or demo and need an evidence-based launch and feedback strategy.',
                  },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setStartingPoint(item.id as FounderStartingPoint)}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      startingPoint === item.id
                        ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 border-zinc-900 dark:border-zinc-100 shadow-xs'
                        : 'bg-zinc-50 dark:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                    }`}
                  >
                    <div className="font-semibold text-xs">{item.title}</div>
                    <div
                      className={`text-[11px] mt-0.5 ${
                        startingPoint === item.id
                          ? 'text-zinc-300 dark:text-zinc-600'
                          : 'text-zinc-500'
                      }`}
                    >
                      {item.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-950">
          <div>
            {step > 1 ? (
              <button
                onClick={handleBack}
                className="flex items-center space-x-1 px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleAutoFillEntireProject()}
                disabled={isMagicLoading}
                className="flex items-center space-x-1.5 px-3 py-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-lg text-xs font-semibold transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Auto-Fill With AI</span>
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {step < 5 ? (
              <button
                onClick={handleNext}
                disabled={step === 1 && !name.trim()}
                className="flex items-center space-x-1 px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg text-xs font-semibold hover:opacity-90 transition-opacity disabled:opacity-40"
              >
                <span>Next Step</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={handleFinish}
                className="flex items-center space-x-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Create Project & Launch Workspace</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
