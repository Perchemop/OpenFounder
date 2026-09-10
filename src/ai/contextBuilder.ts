import type {
  Project,
  EvidenceItem,
  Competitor,
  Experiment,
  FeatureItem,
  ResearchSource,
} from '../types';

export function buildProjectContext(params: {
  project?: Project | null;
  evidence?: EvidenceItem[];
  competitors?: Competitor[];
  experiments?: Experiment[];
  features?: FeatureItem[];
  research?: ResearchSource[];
}): string {
  const { project, evidence = [], competitors = [], experiments = [], features = [], research = [] } = params;

  if (!project) {
    return 'No project currently loaded.';
  }

  const unverifiedAssumptions = evidence.filter(
    e => e.status === 'unverified' || e.status === 'assumption'
  );
  const confirmedEvidence = evidence.filter(
    e => e.status === 'customer_confirmed' || e.status === 'experiment_confirmed'
  );

  const mustFeatures = features.filter(f => f.priority === 'must');
  const runningExperiments = experiments.filter(e => e.status === 'running');
  const completedExperiments = experiments.filter(e => e.status === 'completed' || e.status === 'passed');

  return `
PROJECT CORE:
- Name: ${project.name}
- One-Sentence Idea: ${project.oneSentenceIdea || 'Not specified'}
- Category: ${project.category} | Stage: ${project.stage}
- Target Market: ${project.targetMarket || 'General'}
- Problem Statement: ${project.problemStatement || 'Not defined'}
- Target Users: ${project.targetUserGroup || 'Not defined'}
- Problem Frequency: ${project.problemFrequency} | Severity: ${project.problemSeverity}
- Current Alternatives / Workarounds: ${project.currentAlternatives || 'None noted'}
- Success Definition: ${project.successDefinition || 'Not defined'}
- Willingness To Pay Trigger: ${project.willingnessToPayTrigger || 'Not defined'}
- Founder Constraints / Skills: ${project.founderSkills || 'N/A'} | Budget: ${project.budget || 'N/A'}

EVIDENCE HEALTH:
- Total Claims: ${evidence.length}
- Unverified Assumptions (${unverifiedAssumptions.length}): ${unverifiedAssumptions.map(a => `"${a.claim}" (Type: ${a.type})`).join('; ') || 'None recorded'}
- Confirmed Evidence (${confirmedEvidence.length}): ${confirmedEvidence.map(c => `"${c.claim}" [Status: ${c.status}]`).join('; ') || 'None yet'}

COMPETITIVE LANDSCAPE (${competitors.length}):
${competitors.map(c => `- ${c.name}: ${c.productDescription} (Pricing: ${c.pricingModel}). Diff: ${c.keyDifferentiators}`).join('\n') || 'No competitors cataloged'}

EXPERIMENTS STATUS (${experiments.length}):
- Active/Running: ${runningExperiments.map(e => `[${e.method}] "${e.hypothesis}" (Sample: ${e.currentSampleSize}/${e.requiredSampleSize})`).join('; ') || 'None'}
- Completed/Passed: ${completedExperiments.map(e => `"${e.hypothesis}" -> Outcome: ${e.decisionTaken || 'Recorded'}`).join('; ') || 'None'}

MVP SCOPE MUST-HAVES (${mustFeatures.length}):
${mustFeatures.map(f => `- ${f.title}: ${f.description}`).join('\n') || 'No Must-have features defined'}

VERIFIED RESEARCH SOURCES (${research.length}):
${research.slice(0, 5).map(r => `- [${r.category}] ${r.title}: ${r.summary}`).join('\n') || 'No research sources logged'}
`.trim();
}
