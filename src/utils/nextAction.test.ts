import { describe, expect, it } from 'vitest';
import type { Competitor, EvidenceItem, Experiment, FeatureItem, RiskItem } from '../types';
import { deriveNextAction } from './nextAction';

const base = { projectId: 'p1' };

function risk(overrides: Partial<RiskItem> = {}): RiskItem {
  return {
    id: 'risk-1',
    ...base,
    title: 'Founders will not pay',
    category: 'pricing',
    probability: 'high',
    impact: 'high',
    mitigation: 'Pricing test',
    status: 'open',
    createdAt: 1,
    updatedAt: 1,
    ...overrides,
  };
}

function evidence(status: EvidenceItem['status'] = 'assumption'): EvidenceItem {
  return {
    id: `ev-${status}`,
    ...base,
    claim: 'Customers want this',
    type: 'problem',
    status,
    evidenceNotes: '',
    confidence: 'low',
    nextTest: 'Interview five customers',
    createdAt: 1,
    updatedAt: 1,
  };
}

function experiment(status: Experiment['status'] = 'running'): Experiment {
  return {
    id: `exp-${status}`,
    ...base,
    hypothesis: 'Teams will pre-pay for a pilot',
    method: 'pricing_test',
    currentSampleSize: 3,
    successCriteria: '2 pre-pay',
    failureCriteria: '0 pre-pay',
    status,
    createdAt: 1,
    updatedAt: 1,
  };
}

function feature(priority: FeatureItem['priority']): FeatureItem {
  return {
    id: `feat-${priority}`,
    ...base,
    title: 'Evidence ledger',
    description: 'Log claims',
    priority,
    solvesProblem: 'Unsupported claims',
    technicalComplexity: 'medium',
    status: 'planned',
    createdAt: 1,
  };
}

function competitor(id: string): Competitor {
  return {
    id,
    ...base,
    name: `Rival ${id}`,
    productDescription: 'Spreadsheet workflow',
    pricingModel: 'Seat licence',
    targetAudience: 'Founders',
    positioning: 'Cheap and generic',
    strengths: [],
    weaknesses: [],
    customerComplaints: [],
    keyDifferentiators: '',
    evidenceNotes: '',
    createdAt: 1,
    updatedAt: 1,
  };
}

describe('deriveNextAction', () => {
  it('puts an unmitigated hot risk ahead of an untested assumption', () => {
    const action = deriveNextAction({ risks: [risk()], evidence: [evidence()] });
    expect(action.tab).toBe('risks');
    expect(action.title).toBe('Address Your Highest Risk');
    expect(action.description).toContain('9/9');
  });

  it('ignores mitigated risks and low-scoring open risks', () => {
    const action = deriveNextAction({
      risks: [
        risk({ status: 'mitigated' }),
        risk({ id: 'risk-2', probability: 'low', impact: 'low' }),
      ],
      evidence: [evidence()],
    });
    expect(action.tab).toBe('validation');
  });

  it('asks for an experiment when assumptions are untested', () => {
    const action = deriveNextAction({ evidence: [evidence('unverified')] });
    expect(action.title).toBe('Test Your Riskiest Assumption');
    expect(action.description).toContain('1 untested');
  });

  it('prioritises collecting data from a running experiment', () => {
    const action = deriveNextAction({
      risks: [risk()],
      evidence: [evidence()],
      experiments: [experiment('running')],
    });
    expect(action.tab).toBe('validation');
    expect(action.title).toBe('Collect Experiment Results');
  });

  it('moves to the competitor gap once nothing is running or untested', () => {
    const action = deriveNextAction({
      evidence: [evidence('customer_confirmed')],
      competitors: [competitor('a')],
    });
    expect(action.title).toBe('Map Competitor Landscape');
  });

  it('only asks for MVP scoping after the competitive picture exists', () => {
    const action = deriveNextAction({
      evidence: [evidence('experiment_confirmed')],
      competitors: [competitor('a'), competitor('b')],
      features: [feature('should')],
    });
    expect(action.title).toBe('Scope Your MVP Backlog');
    expect(action.tab).toBe('mvp');
  });

  it('falls back to foundational assumptions when everything above is covered', () => {
    const action = deriveNextAction({
      evidence: [evidence('research_backed')],
      competitors: [competitor('a'), competitor('b')],
      features: [feature('must')],
    });
    expect(action.title).toBe('Define Foundational Assumptions');
    expect(action.tab).toBe('evidence');
  });
});
