import { describe, it, expect } from 'vitest';
import { buildProjectContext } from './contextBuilder';
import type { Project, EvidenceItem, RiskItem, Experiment } from '../types';

function baseProject(overrides: Partial<Project> = {}): Project {
  return {
    id: 'proj_1',
    name: 'TestCo',
    oneSentenceIdea: 'Help founders validate ideas with evidence',
    category: 'SaaS',
    stage: 'validating',
    targetMarket: 'Indie founders',
    location: 'Remote',
    problemStatement: 'Founders build before validating',
    targetUserGroup: 'Solo technical founders',
    problemFrequency: 'weekly',
    problemSeverity: 'severe',
    currentAlternatives: 'Spreadsheets and intuition',
    successDefinition: '10 paying pilot users',
    behavioralChange: 'Run experiments before coding',
    willingnessToPayTrigger: 'After 3 failed launches',
    startingPoint: 'idea_only',
    currentPhaseIndex: 0,
    completedTaskIds: ['def-1'],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    ...overrides,
  };
}

describe('buildProjectContext', () => {
  it('returns a clear message when no project is loaded', () => {
    expect(buildProjectContext({})).toBe('No project currently loaded.');
    expect(buildProjectContext({ project: null })).toBe('No project currently loaded.');
  });

  it('includes project profile and phase tasks', () => {
    const ctx = buildProjectContext({ project: baseProject() });
    expect(ctx).toContain('PROJECT PROFILE:');
    expect(ctx).toContain('TestCo');
    expect(ctx).toContain('Help founders validate ideas with evidence');
    expect(ctx).toContain('PHASE TASKS');
    expect(ctx).toContain('[COMPLETED]');
    expect(ctx).toContain('[PENDING]');
  });

  it('marks synthetic projects', () => {
    const ctx = buildProjectContext({
      project: baseProject({ isSynthetic: true }),
    });
    expect(ctx).toContain('[DEMO SYNTHETIC PROJECT]');
  });

  it('summarizes evidence status', () => {
    const evidence: EvidenceItem[] = [
      {
        id: 'ev1',
        projectId: 'proj_1',
        claim: 'Founders waste months building unvalidated products',
        type: 'problem',
        status: 'customer_confirmed',
        evidenceNotes: '',
        confidence: 'high',
        nextTest: '',
        createdAt: 1,
        updatedAt: 1,
      },
      {
        id: 'ev2',
        projectId: 'proj_1',
        claim: 'They will pay $29/mo',
        type: 'pricing',
        status: 'assumption',
        evidenceNotes: '',
        confidence: 'low',
        nextTest: 'Pricing interviews',
        createdAt: 2,
        updatedAt: 2,
      },
    ];

    const ctx = buildProjectContext({ project: baseProject(), evidence });
    expect(ctx).toContain('Total Claims: 2');
    expect(ctx).toContain('Confirmed (1)');
    expect(ctx).toContain('Top Untested Assumptions (1)');
    expect(ctx).toContain('They will pay $29/mo');
  });

  it('includes open risks in the risk ledger section', () => {
    const risks: RiskItem[] = [
      {
        id: 'r1',
        projectId: 'proj_1',
        title: 'No willingness to pay',
        category: 'pricing',
        probability: 'high',
        impact: 'high',
        mitigation: 'Pre-order test',
        status: 'open',
        createdAt: 1,
        updatedAt: 1,
      },
      {
        id: 'r2',
        projectId: 'proj_1',
        title: 'Old mitigated risk',
        category: 'technical',
        probability: 'low',
        impact: 'low',
        mitigation: 'Done',
        status: 'mitigated',
        createdAt: 2,
        updatedAt: 2,
      },
    ];

    const ctx = buildProjectContext({ project: baseProject(), risks });
    expect(ctx).toContain('RISK LEDGER (1 open risks)');
    expect(ctx).toContain('No willingness to pay');
    expect(ctx).not.toContain('Old mitigated risk');
  });

  it('summarizes experiments by status', () => {
    const experiments: Experiment[] = [
      {
        id: 'e1',
        projectId: 'proj_1',
        hypothesis: 'Landing page converts at 5%',
        method: 'smoke_landing_page',
        status: 'running',
        currentSampleSize: 12,
        targetSampleSize: 50,
        successCriteria: '>=5%',
        failureCriteria: '<1%',
        createdAt: 1,
        updatedAt: 1,
      },
      {
        id: 'e2',
        projectId: 'proj_1',
        hypothesis: 'Interview pain is severe',
        method: 'customer_interview',
        status: 'passed',
        currentSampleSize: 8,
        successCriteria: '6/8 severe',
        failureCriteria: '<3/8',
        decisionTaken: 'Proceed',
        createdAt: 2,
        updatedAt: 2,
      },
    ];

    const ctx = buildProjectContext({ project: baseProject(), experiments });
    expect(ctx).toContain('Passed/Validated (1)');
    expect(ctx).toContain('Active Tests (1)');
    expect(ctx).toContain('Landing page converts at 5%');
  });

  it('truncates when exceeding maxChars', () => {
    const ctx = buildProjectContext({
      project: baseProject({
        problemStatement: 'x'.repeat(5000),
        oneSentenceIdea: 'y'.repeat(2000),
      }),
      maxChars: 800,
    });
    expect(ctx.length).toBeLessThanOrEqual(850);
    expect(ctx).toContain('[Truncated to fit context window]');
  });
});
