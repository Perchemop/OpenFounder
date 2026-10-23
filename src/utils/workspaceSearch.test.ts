import { describe, it, expect } from 'vitest';
import { searchWorkspace, groupSearchResults } from './workspaceSearch';
import type {
  Competitor,
  CustomerInterview,
  EvidenceItem,
  Experiment,
  FeatureItem,
  ResearchSource,
  RiskItem,
  RoadmapItem,
} from '../types';

const stamps = { createdAt: 0, updatedAt: 0 };

const evidence: EvidenceItem[] = [
  {
    ...stamps,
    id: 'ev1',
    projectId: 'p1',
    claim: 'Plumbers lose two hours a week on invoicing',
    type: 'problem',
    status: 'customer_confirmed',
    evidenceNotes: 'Interview quote: "I lose half a day every week."',
    sourceTitle: 'Plumber interview #2',
    confidence: 'high',
    nextTest: 'Time a week of invoicing with three more plumbers',
  },
];

const research: ResearchSource[] = [
  {
    ...stamps,
    id: 'rs1',
    projectId: 'p1',
    title: 'State of trade invoicing 2025',
    category: 'market',
    dateAccessed: '2025-01-01',
    summary: 'Invoice software adoption is still low among sole traders.',
    keyFindings: ['Spreadsheets remain the default tool'],
    relevance: 'high',
    confidence: 'medium',
    publisherOrDomain: 'example.org',
  },
];

const interviews: CustomerInterview[] = [
  {
    ...stamps,
    id: 'in1',
    projectId: 'p1',
    intervieweeIdentifier: 'Independent plumber #1',
    participantRole: 'Owner-operator',
    date: '2025-01-05',
    objectives: 'Understand how invoices are produced today',
    notesOrTranscript: 'Uses a paper notebook and photographs pages.',
    recurringPainPoints: ['Chasing late payments'],
    severityRating: 'severe',
    existingWorkarounds: 'Paper notebook',
    willingnessToPayNotes: 'Would pay £10/month',
    verbatimQuotes: ['I chase invoices on Sunday evenings'],
  },
];

const risks: RiskItem[] = [
  {
    ...stamps,
    id: 'rk1',
    projectId: 'p1',
    title: 'Sole traders may not pay for an invoicing tool',
    category: 'commercial',
    probability: 'high',
    impact: 'high',
    mitigation: 'Run a pre-order test in two trade communities',
    status: 'open',
    nextTest: 'Landing page pre-orders',
  },
];

const roadmap: RoadmapItem[] = [
  {
    ...stamps,
    id: 'rm1',
    projectId: 'p1',
    title: 'Ship invoice reminder emails',
    objective: 'Cut late payments for pilot customers',
    status: 'in_progress',
    priority: 'high',
    owner: 'founder',
    evidenceRequired: 'Pilot churn data',
    estimatedEffort: '2 weeks',
    orderIndex: 1,
  },
];

const experiments: Experiment[] = [
  {
    ...stamps,
    id: 'ex1',
    projectId: 'p1',
    hypothesis: 'A reminder email cuts late payments by half',
    method: 'smoke_landing_page',
    currentSampleSize: 0,
    successCriteria: 'Ten pre-orders in two weeks',
    failureCriteria: 'Fewer than three pre-orders',
    status: 'planned',
  },
];

const competitors: Competitor[] = [
  {
    ...stamps,
    id: 'cp1',
    projectId: 'p1',
    name: 'InvoiceNow',
    productDescription: 'Mobile invoicing for trades',
    pricingModel: '£8/month',
    targetAudience: 'Sole traders',
    positioning: 'Cheapest invoicing app',
    strengths: [],
    weaknesses: [],
    customerComplaints: [],
    keyDifferentiators: '',
    evidenceNotes: '',
  },
];

const features: FeatureItem[] = [
  {
    ...stamps,
    id: 'ft1',
    projectId: 'p1',
    title: 'Automatic invoice reminders',
    description: 'Send a polite follow-up after 14 days',
    priority: 'must',
    solvesProblem: 'Late payments',
    technicalComplexity: 'low',
    status: 'planned',
  },
];

const data = {
  evidence,
  research,
  interviews,
  risks,
  roadmap,
  experiments,
  competitors,
  features,
};

describe('searchWorkspace', () => {
  it('returns nothing for empty or single-character queries', () => {
    expect(searchWorkspace('', data)).toEqual([]);
    expect(searchWorkspace(' a ', data)).toEqual([]);
  });

  it('is case-insensitive', () => {
    expect(searchWorkspace('PLUMBERS', data).map((result) => result.id)).toContain('ev1');
  });

  it('searches every entity type', () => {
    const ids = (query: string) => searchWorkspace(query, data).map((result) => result.id);

    expect(ids('plumber')).toEqual(expect.arrayContaining(['ev1', 'in1']));
    expect(ids('adoption')).toEqual(['rs1']);
    expect(ids('pre-order')).toEqual(expect.arrayContaining(['rk1', 'ex1']));
    expect(ids('reminder')).toEqual(expect.arrayContaining(['rm1', 'ft1']));
    expect(ids('invoicenow')).toEqual(['cp1']);
  });

  it('searches body text as well as titles', () => {
    const results = searchWorkspace('spreadsheets', data);
    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({ id: 'rs1', tab: 'research' });
  });

  it('requires every token to match, in any order', () => {
    expect(searchWorkspace('quantum tunnelling', data)).toEqual([]);
    expect(searchWorkspace('invoices quantum', data)).toEqual([]);
    expect(searchWorkspace('payments late', data).map((result) => result.id)).toEqual(
      expect.arrayContaining(['rm1', 'ft1'])
    );
  });

  it('maps each entity to the tab that owns it', () => {
    const tabFor = (query: string) => searchWorkspace(query, data)[0].tab;
    expect(tabFor('adoption')).toBe('research');
    expect(tabFor('owner-operator')).toBe('interviews');
    expect(tabFor('pre-order')).toBe('risks');
    expect(tabFor('invoice reminder')).toBe('roadmap');
    expect(tabFor('smoke')).toBe('validation');
    expect(tabFor('invoicenow')).toBe('competitors');
    expect(tabFor('automatic')).toBe('mvp');
    expect(tabFor('plumbers lose')).toBe('evidence');
  });

  it('ranks title matches above body matches', () => {
    const ranking = {
      features: [
        {
          ...features[0],
          id: 'body-only',
          title: 'Payments',
          description: 'Bulk invoice export',
        },
        {
          ...features[0],
          id: 'title-match',
          title: 'Invoice export',
          description: 'Bulk CSV download',
        },
      ],
    };
    expect(searchWorkspace('invoice', ranking)[0].id).toBe('title-match');
  });

  it('caps results per entity kind', () => {
    const manyEvidence: EvidenceItem[] = Array.from({ length: 10 }, (_, index) => ({
      ...evidence[0],
      id: `ev-${index}`,
      claim: `Invoice claim ${index}`,
    }));
    const results = searchWorkspace('invoice', { ...data, evidence: manyEvidence }, 3);
    expect(results.filter((result) => result.kind === 'evidence')).toHaveLength(3);
  });

  it('returns no results when nothing matches', () => {
    expect(searchWorkspace('quantum tunnelling', data)).toEqual([]);
  });
});

describe('groupSearchResults', () => {
  it('groups by kind in a stable order and drops empty groups', () => {
    const groups = groupSearchResults(searchWorkspace('late payments', data));
    expect(groups.map((group) => group.kind)).toEqual(['interview', 'roadmap', 'feature']);
    expect(groups[1]).toMatchObject({ label: 'Roadmap', tab: 'roadmap' });
  });

  it('returns an empty list for no results', () => {
    expect(groupSearchResults([])).toEqual([]);
  });
});
