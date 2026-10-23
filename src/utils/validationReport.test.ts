import { describe, it, expect } from 'vitest';
import { buildValidationReport } from './validationReport';
import type { EvidenceItem, Experiment, Objective, Project } from '../types';

const project = {
  id: 'p1',
  name: 'InvoicePilot',
  oneSentenceIdea: 'Invoicing for sole traders',
  category: 'software',
  stage: 'validating',
  targetMarket: 'UK sole traders',
  location: 'UK',
  problemStatement: 'Sole traders invoice on paper and lose half a day a week.',
  targetUserGroup: 'independent plumbers',
  problemFrequency: 'weekly',
  problemSeverity: 'moderate',
  currentAlternatives: 'Paper and photographs',
  successDefinition: '40 paying customers',
  behavioralChange: 'Switch from paper to app',
  willingnessToPayTrigger: 'Saves two hours a week',
  startingPoint: 'idea_only',
  currentPhaseIndex: 3,
  createdAt: 0,
  updatedAt: 0,
} as Project;

function claim(overrides: Partial<EvidenceItem> = {}): EvidenceItem {
  return {
    id: 'e1',
    projectId: 'p1',
    claim: 'Plumbers lose time on invoicing',
    type: 'problem',
    status: 'assumption',
    evidenceNotes: '',
    confidence: 'medium',
    nextTest: 'Interview ten plumbers',
    createdAt: 1_700_000_000_000,
    updatedAt: 1_700_000_000_000,
    ...overrides,
  };
}

function experiment(overrides: Partial<Experiment> = {}): Experiment {
  return {
    id: 'ex1',
    projectId: 'p1',
    hypothesis: 'A reminder email cuts late payments',
    method: 'smoke_landing_page',
    currentSampleSize: 0,
    successCriteria: 'Ten pre-orders',
    failureCriteria: 'Fewer than three',
    status: 'completed',
    createdAt: 0,
    updatedAt: 0,
    ...overrides,
  };
}

function objective(overrides: Partial<Objective> = {}): Objective {
  return {
    id: 'o1',
    projectId: 'p1',
    title: 'Prove plumbers will pay',
    description: '',
    owner: 'founder',
    timeframe: 'Q4 2026',
    status: 'active',
    keyResults: [],
    createdAt: 0,
    updatedAt: 0,
    ...overrides,
  };
}

describe('buildValidationReport', () => {
  const generatedAt = new Date('2026-10-23T09:00:00.000Z');

  it('includes the problem, phase, and generated timestamp', () => {
    const report = buildValidationReport({ project, generatedAt });
    expect(report).toContain('# InvoicePilot — Validation Report');
    expect(report).toContain('- Generated: 2026-10-23T09:00:00.000Z');
    expect(report).toContain('Phase: 4 of 10 (validating)');
    expect(report).toContain('Sole traders invoice on paper');
  });

  it('lists unsupported claims with provenance and their next test', () => {
    const report = buildValidationReport({
      project,
      generatedAt,
      evidence: [
        claim({ sourceTitle: 'Plumber interview #2', sourceUrl: 'https://example.org' }),
      ],
    });
    expect(report).toContain('[UNSUPPORTED] Plumbers lose time on invoicing');
    expect(report).toContain('source: Plumber interview #2');
    expect(report).toContain('url: https://example.org');
    expect(report).toContain('next falsification test: Interview ten plumbers');
  });

  it('says so plainly when no claim is supported', () => {
    const report = buildValidationReport({ project, generatedAt });
    expect(report).toContain('_No customer- or experiment-verified claims yet._');
    expect(report).toContain('_No recorded decision yet.');
    expect(report).toContain('_No unverified or assumed claims remain._');
  });

  it('reports verified claims with provenance and records decisions', () => {
    const report = buildValidationReport({
      project,
      generatedAt,
      evidence: [
        claim({ id: 'c1', status: 'customer_confirmed', claim: 'They pay £10/month' }),
      ],
      experiments: [
        experiment({
          status: 'passed',
          decisionTaken: 'Proceed to MVP with £10 price point',
        }),
      ],
    });
    expect(report).toContain('[CUSTOMER_CONFIRMED] They pay £10/month');
    expect(report).toContain('Proceed to MVP with £10 price point');
  });

  it('counts objective progress in the decision section', () => {
    const report = buildValidationReport({
      project,
      generatedAt,
      objectives: [
        objective({
          keyResults: [
            {
              id: 'k1',
              title: '40 customers',
              unit: 'number',
              direction: 'increase',
              baseline: 0,
              target: 40,
              current: 20,
              updatedAt: 0,
            },
          ],
        }),
      ],
    });
    expect(report).toContain('Objectives: 1 active, average progress 50%, 1 key results at risk');
  });

  it('caps the unsupported list and names the rest', () => {
    const many = Array.from({ length: 8 }, (_, index) =>
      claim({ id: `e${index}`, claim: `Assumption ${index}` })
    );
    const report = buildValidationReport({ project, generatedAt, evidence: many });
    expect(report).toContain('…and 3 more unsupported claims.');
  });

  it('never claims a decision that no experiment recorded', () => {
    const report = buildValidationReport({
      project,
      generatedAt,
      experiments: [experiment()],
    });
    expect(report).toContain('_No recorded decision yet. No experiment outcome has been entered._');
  });
});
