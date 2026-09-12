import type {
  Project,
  EvidenceItem,
  Competitor,
  Experiment,
  FeatureItem,
  ResearchSource,
  CustomerInterview,
  ProjectDecision,
  RiskItem,
  BusinessModelData,
  GTMPlan,
} from '../types';
import { FOUNDER_PHASES } from '../data/phases';

export interface ProjectContextParams {
  project?: Project | null;
  evidence?: EvidenceItem[];
  competitors?: Competitor[];
  experiments?: Experiment[];
  features?: FeatureItem[];
  research?: ResearchSource[];
  interviews?: CustomerInterview[];
  decisions?: ProjectDecision[];
  risks?: RiskItem[];
  businessModel?: BusinessModelData;
  gtmPlan?: GTMPlan;
  maxChars?: number; // token budget constraint, default ~12000 chars (~3000 tokens)
}

export function buildProjectContext(params: ProjectContextParams): string {
  const {
    project,
    evidence = [],
    competitors = [],
    experiments = [],
    features = [],
    research = [],
    interviews = [],
    decisions = [],
    risks = [],
    businessModel,
    gtmPlan,
    maxChars = 12000,
  } = params;

  if (!project) {
    return 'No project currently loaded.';
  }

  const currentPhase = FOUNDER_PHASES[project.currentPhaseIndex] || FOUNDER_PHASES[0];
  const completedTaskIds = new Set(project.completedTaskIds || []);

  const unverifiedAssumptions = evidence.filter(
    (e) => e.status === 'unverified' || e.status === 'assumption' || e.status === 'anecdotal'
  );
  const confirmedEvidence = evidence.filter(
    (e) => e.status === 'customer_confirmed' || e.status === 'experiment_confirmed'
  );

  const passedExp = experiments.filter((e) => e.status === 'passed');
  const failedExp = experiments.filter((e) => e.status === 'failed');
  const runningExp = experiments.filter((e) => e.status === 'running');
  const mustFeatures = features.filter((f) => f.priority === 'must');
  const openRisks = risks.filter((r) => r.status === 'open' || r.status === 'testing');

  const sections: string[] = [];

  // 1. Core Profile & Current Phase
  sections.push(`PROJECT PROFILE:
- Name: ${project.name} ${project.isSynthetic ? '[DEMO SYNTHETIC PROJECT]' : ''}
- Premise: ${project.oneSentenceIdea || 'Not specified'}
- Category: ${project.category} | Stage: ${project.stage}
- Current Phase: ${currentPhase.name} (Objective: ${currentPhase.objective})
- Target Market: ${project.targetMarket || 'General'}
- Target Users: ${project.targetUserGroup || 'Not defined'}
- Problem Statement: ${project.problemStatement || 'Not defined'}
- Problem Frequency: ${project.problemFrequency} | Severity: ${project.problemSeverity}
- Existing Workarounds: ${project.currentAlternatives || 'None noted'}
- Success Definition: ${project.successDefinition || 'Not defined'}
- Willingness To Pay Trigger: ${project.willingnessToPayTrigger || 'Not defined'}
- Constraints: ${project.founderSkills || 'N/A'} | Budget: ${project.budget || 'N/A'}`);

  // 2. Phase Progress
  sections.push(`PHASE TASKS (${currentPhase.name}):
${currentPhase.tasks
  .map(
    (t) =>
      `- [${completedTaskIds.has(t.id) ? 'COMPLETED' : 'PENDING'}] ${t.title}${t.required !== false ? ' (Required)' : ''}`
  )
  .join('\n')}`);

  // 3. Evidence Ledger
  sections.push(`EVIDENCE STATUS:
- Total Claims: ${evidence.length}
- Confirmed (${confirmedEvidence.length}): ${confirmedEvidence.slice(0, 5).map((c) => `"${c.claim}" [${c.status}]`).join('; ') || 'None'}
- Top Untested Assumptions (${unverifiedAssumptions.length}): ${unverifiedAssumptions.slice(0, 5).map((a) => `"${a.claim}" (Type: ${a.type})`).join('; ') || 'None'}`);

  // 4. Customer Discovery & Quotes
  if (interviews.length > 0) {
    const quotes = interviews.flatMap((inv) => inv.verbatimQuotes || []).slice(0, 5);
    sections.push(`CUSTOMER DISCOVERY (${interviews.length} interviews logged):
${interviews
  .slice(0, 3)
  .map(
    (inv) =>
      `- ${inv.intervieweeIdentifier} (${inv.participantRole}): Pain="${inv.recurringPainPoints.join(', ')}", Workaround="${inv.existingWorkarounds}"`
  )
  .join('\n')}
Key Customer Quotes:
${quotes.map((q) => `> "${q}"`).join('\n') || 'None recorded'}`);
  }

  // 5. Validation Experiments
  sections.push(`VALIDATION EXPERIMENTS:
- Passed/Validated (${passedExp.length}): ${passedExp.map((e) => `[${e.method}] "${e.hypothesis}" -> ${e.decisionTaken || 'Passed'}`).join('; ') || 'None'}
- Failed/Falsified (${failedExp.length}): ${failedExp.map((e) => `[${e.method}] "${e.hypothesis}"`).join('; ') || 'None'}
- Active Tests (${runningExp.length}): ${runningExp.map((e) => `[${e.method}] "${e.hypothesis}" (${e.currentSampleSize}/${e.targetSampleSize || e.requiredSampleSize || 20})`).join('; ') || 'None'}`);

  // 6. Risk Ledger
  if (risks.length > 0) {
    sections.push(`RISK LEDGER (${openRisks.length} open risks):
${openRisks.slice(0, 4).map((r) => `- [${r.impact.toUpperCase()} IMPACT / ${r.category}] ${r.title} (Mitigation: ${r.mitigation})`).join('\n')}`);
  }

  // 7. Decision Ledger
  if (decisions.length > 0) {
    sections.push(`STRATEGIC DECISIONS (${decisions.length} logged):
${decisions.slice(0, 3).map((d) => `- [${d.date}] ${d.title}: ${d.rationale} (Rejected: ${d.rejectedAlternatives})`).join('\n')}`);
  }

  // 8. Competitors & Substitutes
  if (competitors.length > 0) {
    sections.push(`COMPETITIVE LANDSCAPE (${competitors.length}):
${competitors.slice(0, 3).map((c) => `- ${c.name}: ${c.productDescription} (Pricing: ${c.pricingModel}). Weakness: ${c.weaknesses?.join(', ')}. Diff: ${c.keyDifferentiators}`).join('\n')}`);
  }

  // 9. MVP Features
  sections.push(`MVP SCOPE MUST-HAVES (${mustFeatures.length}):
${mustFeatures.slice(0, 5).map((f) => `- ${f.title}: ${f.description}`).join('\n') || 'No Must-Have features defined'}`);

  // 10. Unit Economics & GTM
  if (businessModel?.monthlyPrice || gtmPlan?.channels?.length) {
    sections.push(`BUSINESS MODEL & GTM:
- Price: $${businessModel?.monthlyPrice || 0}/mo | Gross Margin: ${businessModel?.grossMarginPct || 0}% | CAC: $${businessModel?.cac || 0}
- Channels: ${gtmPlan?.channels?.map((c) => `${c.name} (${c.status})`).join(', ') || 'None mapped'}`);
  }

  // Token budgeting constraint
  let combined = sections.join('\n\n');
  if (combined.length > maxChars) {
    combined = combined.substring(0, maxChars) + '\n\n...[Truncated to fit context window]';
  }

  return combined;
}
