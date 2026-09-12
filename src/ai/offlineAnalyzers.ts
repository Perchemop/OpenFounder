import type {
  Project,
  EvidenceItem,
  ResearchSource,
  Competitor,
  Experiment,
  CustomerInterview,
  FeatureItem,
  RoadmapItem,
  ProjectDecision,
  RiskItem,
  BusinessModelData,
  GTMPlan,
} from '../types';
import { FOUNDER_PHASES } from '../data/phases';

export interface ProjectAuditMetrics {
  totalClaims: number;
  unverifiedCount: number;
  confirmedCount: number;
  validationRatioPct: number;
  runningExperiments: number;
  passedExperiments: number;
  failedExperiments: number;
  interviewsCount: number;
  competitorsCount: number;
  researchCount: number;
  mustHaveFeatures: number;
  openRisksCount: number;
  criticalRisksCount: number;
  decisionsCount: number;
  phaseName: string;
  phaseRequiredTasksTotal: number;
  phaseRequiredTasksCompleted: number;
  phaseReadinessPct: number;
  gaps: string[];
  recommendations: string[];
}

export function analyzeProjectState(data: {
  project: Project;
  evidence: EvidenceItem[];
  research?: ResearchSource[];
  competitors?: Competitor[];
  experiments?: Experiment[];
  interviews?: CustomerInterview[];
  features?: FeatureItem[];
  roadmap?: RoadmapItem[];
  decisions?: ProjectDecision[];
  risks?: RiskItem[];
  businessModel?: BusinessModelData;
  gtmPlan?: GTMPlan;
}): ProjectAuditMetrics {
  const {
    project,
    evidence = [],
    research = [],
    competitors = [],
    experiments = [],
    interviews = [],
    features = [],
    decisions = [],
    risks = [],
  } = data;

  const totalClaims = evidence.length;
  const unverified = evidence.filter(
    (e) => e.status === 'unverified' || e.status === 'assumption' || e.status === 'anecdotal'
  );
  const confirmed = evidence.filter(
    (e) => e.status === 'customer_confirmed' || e.status === 'experiment_confirmed'
  );
  const validationRatioPct = totalClaims > 0 ? Math.round((confirmed.length / totalClaims) * 100) : 0;

  const runningExp = experiments.filter((e) => e.status === 'running');
  const passedExp = experiments.filter((e) => e.status === 'passed');
  const failedExp = experiments.filter((e) => e.status === 'failed');

  const mustFeatures = features.filter((f) => f.priority === 'must');
  const openRisks = risks.filter((r) => r.status === 'open' || r.status === 'testing');
  const criticalRisks = risks.filter((r) => r.impact === 'high' && r.status !== 'mitigated');

  const currentPhaseDef = FOUNDER_PHASES[project.currentPhaseIndex] || FOUNDER_PHASES[0];
  const requiredTasks = currentPhaseDef.tasks.filter((t) => t.required !== false);
  const completedTaskIds = new Set(project.completedTaskIds || []);
  const completedRequired = requiredTasks.filter((t) => completedTaskIds.has(t.id));
  const phaseReadinessPct =
    requiredTasks.length > 0 ? Math.round((completedRequired.length / requiredTasks.length) * 100) : 100;

  const gaps: string[] = [];
  const recommendations: string[] = [];

  // 1. Evidence Gaps
  if (totalClaims === 0) {
    gaps.push('Zero claims recorded in the Evidence Ledger.');
    recommendations.push('Log your top 3 foundational assumptions into the Evidence Ledger immediately.');
  } else if (unverified.length > 0 && runningExp.length === 0 && interviews.length === 0) {
    gaps.push(`${unverified.length} assumptions remain completely unverified with no tests in flight.`);
    recommendations.push(
      `Pick your riskiest unverified claim ("${unverified[0].claim.substring(0, 45)}...") and launch a validation experiment.`
    );
  }

  // 2. Discovery Gaps
  if (interviews.length < 5) {
    gaps.push(`Only ${interviews.length} customer discovery interviews recorded (target: 5-10 for early signal).`);
    recommendations.push('Conduct customer discovery interviews focused on past behavior and current workarounds (The Mom Test).');
  }

  // 3. Competitive Landscape Gaps
  if (competitors.length < 2) {
    gaps.push(`Only ${competitors.length} competitor or substitute analyzed.`);
    recommendations.push('Map at least 2 competitors or existing manual workarounds in the Market Research tab.');
  }

  // 4. MVP Scoping Gaps
  if (mustFeatures.length > 5) {
    gaps.push(`MVP contains ${mustFeatures.length} "Must-Have" features (recommended: <= 4 for rapid validation).`);
    recommendations.push('Demote non-critical features to "Should" or "Could" to shorten build time to launch.');
  }

  // 5. Critical Risks
  if (criticalRisks.length > 0) {
    gaps.push(`${criticalRisks.length} high-impact risks remain unmitigated.`);
    recommendations.push(`Define a direct test or mitigation plan for: "${criticalRisks[0].title}".`);
  }

  if (recommendations.length === 0) {
    recommendations.push('Advance to the next milestone and test customer adoption.');
  }

  return {
    totalClaims,
    unverifiedCount: unverified.length,
    confirmedCount: confirmed.length,
    validationRatioPct,
    runningExperiments: runningExp.length,
    passedExperiments: passedExp.length,
    failedExperiments: failedExp.length,
    interviewsCount: interviews.length,
    competitorsCount: competitors.length,
    researchCount: research.length,
    mustHaveFeatures: mustFeatures.length,
    openRisksCount: openRisks.length,
    criticalRisksCount: criticalRisks.length,
    decisionsCount: decisions.length,
    phaseName: currentPhaseDef.name,
    phaseRequiredTasksTotal: requiredTasks.length,
    phaseRequiredTasksCompleted: completedRequired.length,
    phaseReadinessPct,
    gaps,
    recommendations,
  };
}

export function generateOfflineAuditReport(data: Parameters<typeof analyzeProjectState>[0]): string {
  const m = analyzeProjectState(data);

  return `### OpenFounder Deterministic Project Audit

**Phase:** ${m.phaseName} (${m.phaseReadinessPct}% required criteria fulfilled — ${m.phaseRequiredTasksCompleted}/${m.phaseRequiredTasksTotal} tasks)

**Evidence & Validation Health:**
- Total Recorded Claims: **${m.totalClaims}**
- Confirmed with Customers/Experiments: **${m.confirmedCount}** (${m.validationRatioPct}%)
- Untested Assumptions: **${m.unverifiedCount}**
- Experiments: **${m.passedExperiments} passed**, **${m.failedExperiments} failed**, **${m.runningExperiments} active**
- Customer Discovery Interviews: **${m.interviewsCount} logged**
- Competitor Landscape: **${m.competitorsCount} analyzed**
- MVP Scope: **${m.mustHaveFeatures} Must-Have features**
- Active Risks: **${m.openRisksCount} open** (${m.criticalRisksCount} high impact)
- Logged Strategic Decisions: **${m.decisionsCount}**

**Identified Strategic Gaps:**
${m.gaps.length > 0 ? m.gaps.map((g) => `- ⚠️ ${g}`).join('\n') : '- ✅ No immediate structural gaps detected.'}

**Recommended Immediate Next Actions:**
${m.recommendations.map((r, i) => `${i + 1}. ${r}`).join('\n')}

---
*Generated deterministically from your local browser database. Zero third-party network requests.*`;
}
