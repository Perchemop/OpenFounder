import type { EvidenceItem, Experiment, Objective, Project, RiskItem } from '../types';
import { summarizeEvidenceIntegrity } from './evidenceIntegrity';
import { summarizeOkrs } from './okr';
import { isOpenRisk, riskScore, sortRisksByScore } from './riskScoring';

export interface ValidationReportInput {
  project: Project;
  evidence?: readonly EvidenceItem[];
  experiments?: readonly Experiment[];
  objectives?: readonly Objective[];
  risks?: readonly RiskItem[];
  generatedAt?: Date;
}

const MAX_RISKIEST_CLAIMS = 5;
const MAX_DECISIONS = 5;

function formatTimestamp(date: Date): string {
  return date.toISOString();
}

function claimProvenance(claim: EvidenceItem): string {
  const parts: string[] = [];
  parts.push(`type: ${claim.type.replace(/_/g, ' ')}`);
  parts.push(`confidence: ${claim.confidence}`);
  if (claim.sourceTitle) parts.push(`source: ${claim.sourceTitle}`);
  if (claim.sourceUrl) parts.push(`url: ${claim.sourceUrl}`);
  parts.push(`recorded: ${new Date(claim.createdAt).toISOString()}`);
  return parts.join(' | ');
}

/**
 * One-page validation report: the problem, the riskiest assumptions, the
 * evidence behind them, and the decision this supports.
 *
 * Must stay honest. Every claim carries its provenance, claims without
 * evidence are listed as unsupported rather than omitted, and the decision
 * section only reports what an experiment or objective actually records.
 */
export function buildValidationReport(input: ValidationReportInput): string {
  const {
    project,
    evidence = [],
    experiments = [],
    objectives = [],
    risks = [],
    generatedAt = new Date(),
  } = input;

  const integrity = summarizeEvidenceIntegrity(evidence);
  const okrs = summarizeOkrs(objectives);
  const openRisks = sortRisksByScore(risks.filter(isOpenRisk));

  const unsupported = evidence.filter(
    (claim) => claim.status === 'unverified' || claim.status === 'assumption'
  );
  const decidedExperiments = experiments
    .filter((experiment) => experiment.decisionTaken && experiment.decisionTaken.trim())
    .slice(0, MAX_DECISIONS);

  const lines: string[] = [];
  lines.push(`# ${project.name} — Validation Report`);
  lines.push('');
  lines.push(`- Generated: ${formatTimestamp(generatedAt)}`);
  lines.push(`- Phase: ${project.currentPhaseIndex + 1} of 10 (${project.stage.replace(/_/g, ' ')})`);
  lines.push(
    `- Evidence coverage: ${integrity.supported}/${integrity.total} claims supported, ${integrity.verified} verified, ${integrity.unsupported} unsupported`
  );

  lines.push('');
  lines.push('## The problem');
  lines.push('');
  lines.push(project.problemStatement || '_Not recorded._');
  lines.push('');
  lines.push(`For ${project.targetUserGroup || '_an unnamed user_'}: ${project.currentAlternatives || 'no alternatives recorded'}.`);
  lines.push(
    `Frequency: ${project.problemFrequency}. Severity: ${project.problemSeverity}. Willingness-to-pay trigger: ${project.willingnessToPayTrigger || '_unstated_'}.`
  );

  lines.push('');
  lines.push('## Riskiest assumptions');
  lines.push('');
  if (unsupported.length === 0) {
    lines.push('_No unverified or assumed claims remain._');
  } else {
    for (const claim of unsupported.slice(0, MAX_RISKIEST_CLAIMS)) {
      lines.push(`- [UNSUPPORTED] ${claim.claim}`);
      lines.push(`  - ${claimProvenance(claim)}`);
      lines.push(`  - next falsification test: ${claim.nextTest || '_none recorded_'}`);
    }
    if (unsupported.length > MAX_RISKIEST_CLAIMS) {
      lines.push(`- …and ${unsupported.length - MAX_RISKIEST_CLAIMS} more unsupported claims.`);
    }
  }

  if (openRisks.length > 0) {
    lines.push('');
    lines.push('## Open risks (highest score first)');
    lines.push('');
    for (const risk of openRisks.slice(0, MAX_RISKIEST_CLAIMS)) {
      lines.push(
        `- [score ${riskScore(risk.probability, risk.impact)}] ${risk.title} — mitigation: ${risk.mitigation || '_none recorded_'}`
      );
    }
  }

  lines.push('');
  lines.push('## Evidence');
  lines.push('');
  if (evidence.length === 0) {
    lines.push(
      '_No claims recorded yet. Nothing here should be read as validated, and there are no customer- or experiment-verified claims either._'
    );
  } else {
    const strongest = evidence
      .filter((claim) => claim.status === 'customer_confirmed' || claim.status === 'experiment_confirmed')
      .slice(0, MAX_RISKIEST_CLAIMS);
    for (const claim of strongest) {
      lines.push(`- [${claim.status.toUpperCase()}] ${claim.claim}`);
      lines.push(`  - ${claimProvenance(claim)}`);
    }
    if (strongest.length === 0) {
      lines.push('_No customer- or experiment-verified claims yet._');
    }
  }

  lines.push('');
  lines.push('## Decision');
  lines.push('');
  const decisions: string[] = [];
  for (const experiment of decidedExperiments) {
    decisions.push(`- ${experiment.decisionTaken} (hypothesis: ${experiment.hypothesis})`);
  }
  if (objectives.length > 0) {
    decisions.push(
      `- Objectives: ${okrs.activeObjectives} active, average progress ${okrs.averageProgress}%, ${okrs.atRisk + okrs.offTrack} key results at risk or off track.`
    );
  }
  if (decisions.length === 0) {
    lines.push('_No recorded decision yet. No experiment outcome has been entered._');
  } else {
    lines.push(...decisions);
  }

  lines.push('');
  lines.push('## Next action');
  lines.push('');
  if (unsupported.length === 0 && openRisks.length === 0) {
    lines.push('- Clear the next objective\'s weakest key result, or record a new decision.');
  } else if (unsupported.length > 0) {
    lines.push(
      `- Test the top unsupported assumption: "${unsupported[0].claim}" — ${unsupported[0].nextTest || 'define the test first'}.`
    );
  } else {
    lines.push(`- Mitigate the highest-scoring open risk: ${openRisks[0].title}.`);
  }

  lines.push('');
  return lines.join('\n');
}
