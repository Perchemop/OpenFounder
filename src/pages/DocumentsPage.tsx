import React, { useState } from 'react';
import {
  FileText,
  Download,
  Copy,
  Check,
  Sparkles,
  BookOpen,
  Printer,
} from 'lucide-react';
import type {
  Project,
  EvidenceItem,
  Experiment,
  Competitor,
  FeatureItem,
  ResearchSource,
} from '../types';

interface DocumentsPageProps {
  project: Project | null;
  evidence?: EvidenceItem[];
  experiments?: Experiment[];
  competitors?: Competitor[];
  features?: FeatureItem[];
  research?: ResearchSource[];
}

type DocTemplate =
  | 'executive_summary'
  | 'comprehensive_dossier'
  | 'validation_report'
  | 'product_prd'
  | 'competitor_brief'
  | 'pitch_deck_outline';

export const DocumentsPage: React.FC<DocumentsPageProps> = ({
  project,
  evidence = [],
  experiments = [],
  competitors = [],
  features = [],
  research = [],
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<DocTemplate>('executive_summary');
  const [copied, setCopied] = useState(false);

  if (!project) return null;

  const generateMarkdown = (template: DocTemplate): string => {
    const unverifiedCount = evidence.filter(
      (e) => e.status === 'unverified' || e.status === 'assumption' || e.status === 'anecdotal'
    ).length;
    const confirmedCount = evidence.filter(
      (e) => e.status === 'customer_confirmed' || e.status === 'experiment_confirmed'
    ).length;
    const passedExperiments = experiments.filter((e) => e.status === 'passed');
    const failedExperiments = experiments.filter((e) => e.status === 'failed');
    const runningExperiments = experiments.filter((e) => e.status === 'running');
    const mustFeatures = features.filter((f) => f.priority === 'must');

    const syntheticNotice = project.isSynthetic
      ? `> ⚠️ **DEMO MODE NOTICE**: This document was generated from a synthetic demo project. All research, customer interviews, statistics, and validation claims are illustrative examples for demonstration and do not represent empirical market evidence.\n\n`
      : '';

    if (template === 'comprehensive_dossier') {
      return `${syntheticNotice}# ${project.name} — Comprehensive Project Dossier
**Metadata:**
- Generated: ${new Date().toISOString()}
- Workspace Engine: OpenFounder v1.0.0 (Local-First FOSS)
- Current Stage: ${project.stage} (Phase ${project.currentPhaseIndex + 1} of 10)
- Category: ${project.category}
- Synthetic Demo Project: ${project.isSynthetic ? 'Yes' : 'No'}

---

## 1. Executive Summary
${project.oneSentenceIdea || 'Not specified'}

- **Target Market:** ${project.targetMarket || 'General market'}
- **Target User Group:** ${project.targetUserGroup || 'Unspecified'}
- **Location:** ${project.location || 'Remote'}
- **Website:** ${project.website || 'N/A'}

## 2. Problem Statement & Severity
${project.problemStatement || 'Not defined yet.'}

- **Severity Level:** ${project.problemSeverity}
- **Frequency:** ${project.problemFrequency}
- **Existing Workarounds / Substitutes:** ${project.currentAlternatives || 'Manual workarounds'}
- **Behavioral Change Required:** ${project.behavioralChange || 'N/A'}

## 3. Core Value Proposition & Pricing Trigger
- **Success Definition:** ${project.successDefinition || 'Solve the acute bottleneck'}
- **Willingness-to-Pay Trigger:** ${project.willingnessToPayTrigger || 'Demonstrable efficiency improvement'}

## 4. Evidence Ledger & Assumption Audit
**Overall Validation Ratio:** ${evidence.length > 0 ? Math.round((confirmedCount / evidence.length) * 100) : 0}% (${confirmedCount} confirmed out of ${evidence.length} total claims)
- **Customer / Experiment Confirmed:** ${confirmedCount} claims
- **Untested Leaps of Faith:** ${unverifiedCount} claims

### Detailed Claims Inventory:
${evidence.map((e) => `- **[${e.status.toUpperCase()}]** (${e.type} | Confidence: ${e.confidence}) "${e.claim}"
  *Notes:* ${e.evidenceNotes || 'None'}
  *Next Test:* ${e.nextTest || 'None'}`).join('\n\n') || 'No claims recorded in ledger.'}

## 5. Validation Experiments & Outcomes
- **Total Tests:** ${experiments.length}
- **Validated / Passed:** ${passedExperiments.length}
- **Falsified / Failed:** ${failedExperiments.length}
- **In Progress:** ${runningExperiments.length}

${experiments.map((exp) => `### [${exp.status.toUpperCase()}] Hypothesis: ${exp.hypothesis}
- **Dimension:** ${exp.dimension} | **Method:** ${exp.method}
- **Sample Progress:** ${exp.currentSampleSize || 0} / ${exp.targetSampleSize || 20} respondents
- **Success Threshold:** ${exp.successCriteria}
- **Failure Threshold:** ${exp.failureCriteria}
- **Recorded Results:** ${exp.results || 'Pending testing'}
- **Decision Taken:** ${exp.decisionTaken || 'Under evaluation'}`).join('\n\n') || 'No experiments configured.'}

## 6. Competitive Intelligence & Incumbent Gaps
Audited Incumbents: ${competitors.length}

${competitors.map((c) => `### ${c.name}
- **Pricing:** ${c.pricingModel || 'Not listed'}
- **Target Audience:** ${c.targetAudience || 'General'}
- **Key Differentiator:** ${c.keyDifferentiators || 'N/A'}
- **Strengths:** ${c.strengths?.join(', ') || 'None listed'}
- **Weaknesses:** ${c.weaknesses?.join(', ') || 'None listed'}`).join('\n\n') || 'No competitors cataloged.'}

## 7. MVP Scope & Backlog
- **Must-Have Features (${mustFeatures.length}):**
${mustFeatures.map((f) => `  - **${f.title}**: ${f.description}`).join('\n') || '  None defined'}
- **Deferred / Should Have:**
${features.filter((f) => f.priority === 'should').map((f) => `  - ${f.title}`).join('\n') || '  None'}

## 8. Founder Context & Resource Constraints
- **Founder Skills & Domain:** ${project.founderSkills || 'N/A'}
- **Validation Budget:** ${project.budget || 'N/A'}
- **Timeline:** ${project.timeline || 'N/A'}
- **Available Weekly Hours:** ${project.availableResources || 'N/A'}

---
*Exported locally from OpenFounder browser database. Zero third-party cloud data transmission.*
`;
    }

    if (template === 'executive_summary') {
      return `${syntheticNotice}# ${project.name} — Executive Summary
**Date:** ${new Date().toLocaleDateString()}
**Status:** Phase ${project.currentPhaseIndex + 1} of 10

## 1. The Proposition
${project.oneSentenceIdea || 'Not specified'}

**Target Market:** ${project.targetMarket || 'General market'}
**Industry Category:** ${project.category}

## 2. The Customer Problem
${project.problemStatement || 'Not defined yet.'}
- **Affected User:** ${project.targetUserGroup || 'Unspecified'}
- **Severity Level:** ${project.problemSeverity}
- **Frequency:** ${project.problemFrequency}
- **Current Substitutes & Workarounds:** ${project.currentAlternatives || 'Manual workarounds'}

## 3. Evidence & Validation Health
- **Verified Empirical Evidence:** ${confirmedCount} confirmed claims
- **Open Unverified Assumptions:** ${unverifiedCount} open assumptions
- **Validation Experiments:** ${experiments.length} logged (${passedExperiments.length} passed, ${failedExperiments.length} failed)

## 4. MVP Solution Scope
- **Core Value Proposition:** ${project.successDefinition || 'Solve the acute bottleneck'}
- **Must-Have Features (${mustFeatures.length}):**
${mustFeatures.map((f) => `  - **${f.title}** (Effort: ${f.estimatedDays ? `${f.estimatedDays} day${f.estimatedDays === 1 ? '' : 's'}` : 'Moderate'})`).join('\n') || '  - None defined yet'}

## 5. Founder Context & Unfair Advantage
- **Founder Background:** ${project.founderSkills || 'N/A'}
- **Validation Budget:** ${project.budget || 'N/A'}
- **Target Timeline:** ${project.timeline || 'N/A'}

---
*Generated by OpenFounder (FOSS local-first idea validation workspace).*
`;
    }

    if (template === 'validation_report') {
      return `# ${project.name} — Evidence & Falsification Report
**Generated:** ${new Date().toISOString()}

## I. Evidence Ledger Summary
Total Claims: ${evidence.length}
- Verified (Customer/Experiment): ${confirmedCount}
- Assumptions / Unverified: ${unverifiedCount}

### Detailed Claims Audit
${evidence
  .map(
    (e) => `### [${e.status.toUpperCase()}] ${e.claim}
- **Type:** ${e.type}
- **Confidence:** ${e.confidence}
- **Notes / Quotes:** ${e.evidenceNotes || 'None'}
- **Next Falsification Test:** ${e.nextTest || 'None'}
`
  )
  .join('\n')}

## II. Validation Experiments
${experiments
  .map(
    (exp) => `### Test: ${exp.hypothesis}
- **Dimension:** ${exp.dimension}
- **Method:** ${exp.method}
- **Status:** ${exp.status.toUpperCase()}
- **Progress:** ${exp.currentSampleSize}/${exp.targetSampleSize} respondents
- **Pass Threshold:** ${exp.successCriteria}
- **Fail Threshold:** ${exp.failureCriteria}
- **Findings:** ${exp.results || 'Pending'}
`
  )
  .join('\n')}
`;
    }

    if (template === 'competitor_brief') {
      return `# ${project.name} — Competitor Intelligence & Market Gaps
**Audited Competitors:** ${competitors.length}

${competitors
  .map(
    (c) => `## ${c.name}
- **URL:** ${c.url || 'N/A'}
- **Pricing:** ${c.pricingModel}
- **Target Audience:** ${c.targetAudience}
- **Description:** ${c.productDescription}
- **Strengths:**
${c.strengths.map((s) => `  + ${s}`).join('\n') || '  None'}
- **Weaknesses & Complaints:**
${[...c.weaknesses, ...c.customerComplaints].map((w) => `  - ${w}`).join('\n') || '  None'}
`
  )
  .join('\n')}
`;
    }

    if (template === 'product_prd') {
      return `# ${project.name} — Product Requirements Document (PRD)

## 1. Problem & Customer Persona
${project.problemStatement}

## 2. MoSCoW Feature Backlog
### Must Have (MVP Gate)
${mustFeatures.map((f) => `- **${f.title}**: ${f.solvesProblem || 'Essential for initial trial.'}`).join('\n') || 'None'}

### Should Have
${features.filter((f) => f.priority === 'should').map((f) => `- **${f.title}**`).join('\n') || 'None'}

### Won't Have in Initial MVP
${features.filter((f) => f.priority === 'wont').map((f) => `- **${f.title}** (Deferred to avoid scope creep)`).join('\n') || 'None'}
`;
    }

    // Pitch deck outline
    return `# ${project.name} — 10-Slide Pitch Outline

1. **Title:** ${project.name} — ${project.oneSentenceIdea}
2. **The Acute Problem:** ${project.problemStatement}
3. **The Target Customer:** ${project.targetUserGroup || project.targetMarket}
4. **Current Inadequate Solutions:** ${competitors.map((c) => c.name).join(', ') || 'Manual workarounds'}
5. **Our Solution:** ${project.successDefinition}
6. **Market & Evidence:** ${confirmedCount} customer interviews confirm pain severity
7. **Business Model:** Sustainable pricing with unit positive margins
8. **Go-To-Market:** Targeted direct wedge
9. **Competitive Advantage:** ${project.founderSkills || 'Domain expertise'}
10. **The Ask / Next Milestones:** Validation prototype completion
`;
  };

  const markdownContent = generateMarkdown(selectedTemplate);

  const handleCopy = () => {
    navigator.clipboard.writeText(markdownContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([markdownContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.name.toLowerCase().replace(/\s+/g, '_')}_${selectedTemplate}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center space-x-2">
            <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span>Document Generation & Reports</span>
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            One-click synthesis of your assumptions, interviews, and roadmap into clean Markdown documents.
          </p>
        </div>

        <div className="flex items-center space-x-2 self-start">
          <button
            onClick={handleCopy}
            className="flex items-center space-x-1.5 px-3 py-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-lg text-xs font-semibold hover:bg-zinc-200 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy Markdown'}</span>
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg text-xs font-semibold hover:opacity-90 transition-opacity shadow-xs"
          >
            <Download className="w-4 h-4" />
            <span>Download .md</span>
          </button>
        </div>
      </div>

      {/* Template Selector Tabs */}
      <div className="flex overflow-x-auto space-x-2 pb-1 text-xs">
        {[
          { id: 'executive_summary' as DocTemplate, label: 'Executive Summary' },
          { id: 'comprehensive_dossier' as DocTemplate, label: 'Complete Project Dossier' },
          { id: 'validation_report' as DocTemplate, label: 'Evidence & Falsification Report' },
          { id: 'product_prd' as DocTemplate, label: 'Product PRD & Scope' },
          { id: 'competitor_brief' as DocTemplate, label: 'Competitor Intelligence Brief' },
          { id: 'pitch_deck_outline' as DocTemplate, label: 'Pitch Deck 10-Slide Outline' },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setSelectedTemplate(t.id)}
            className={`px-3 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
              selectedTemplate === t.id
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs'
                : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Markdown Document Preview Box */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-xs">
        <pre className="font-mono text-xs text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap leading-relaxed overflow-x-auto selection:bg-emerald-500 selection:text-white">
          {markdownContent}
        </pre>
      </div>
    </div>
  );
};
