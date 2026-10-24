import { describe, it, expect } from 'vitest';
import {
  remapAdvisor,
  remapObjective,
  remapRiskItem,
  remapRoadmapItem,
  remapSkillRequirement,
  remapTeamMember,
} from './importRemap';
import type { Advisor, Objective, RiskItem, RoadmapItem, SkillRequirement, TeamMember } from '../types';

/** Deterministic mapper so tests can assert exact IDs. */
function mapper(ids: string[]): (id: string, prefix: string) => string {
  const queue = [...ids];
  return (id) => {
    const next = queue.shift();
    expect(next, `no mapped id left for incoming id "${id}"`).toBeDefined();
    return next!;
  };
}

const TARGET = 'proj_new';

describe('remapObjective', () => {
  const objective: Objective = {
    id: 'obj1',
    projectId: 'proj_old',
    title: 'Prove plumbers will pay',
    description: '',
    owner: 'founder',
    timeframe: 'Q4 2026',
    status: 'active',
    keyResults: [
      {
        id: 'kr1',
        title: '40 customers',
        unit: 'number',
        direction: 'increase',
        baseline: 0,
        target: 40,
        current: 8,
        updatedAt: 0,
      },
      {
        id: 'kr2',
        title: '£10 MRR',
        unit: 'currency',
        direction: 'increase',
        baseline: 0,
        target: 400,
        current: 80,
        updatedAt: 0,
      },
    ],
    createdAt: 0,
    updatedAt: 0,
  };

  it('rewrites the objective id, the project id, and every key result id', () => {
    const mapped = remapObjective(objective, TARGET, mapper(['obj_new', 'krA', 'krB']));
    expect(mapped.id).toBe('obj_new');
    expect(mapped.projectId).toBe(TARGET);
    expect(mapped.keyResults.map((keyResult) => keyResult.id)).toEqual(['krA', 'krB']);
  });

  it('leaves key result values untouched', () => {
    const mapped = remapObjective(objective, TARGET, mapper(['obj_new', 'krA', 'krB']));
    expect(mapped.keyResults[0]).toMatchObject({
      title: '40 customers',
      target: 40,
      current: 8,
      unit: 'number',
    });
  });

  it('does not mutate the input', () => {
    const original = structuredClone(objective);
    remapObjective(objective, TARGET, mapper(['obj_new', 'krA', 'krB']));
    expect(objective).toEqual(original);
  });
});

describe('remapAdvisor', () => {
  const advisor: Advisor = {
    id: 'adv1',
    projectId: 'proj_old',
    name: 'Dana Ruiz',
    role: 'Operator',
    expertise: ['pricing'],
    notes: '',
    createdAt: 0,
    updatedAt: 0,
    sessions: [
      {
        id: 'sess1',
        date: '2026-10-01',
        topic: 'Pricing',
        adviceGiven: 'Charge more.',
        quotes: ['Charge double'],
        commitments: [
          { id: 'com1', description: 'Raise the price', status: 'open' },
          { id: 'com2', description: 'Done thing', status: 'done' },
        ],
        createdAt: 0,
      },
      { id: 'sess2', date: '2026-10-10', topic: 'Hiring', adviceGiven: '', quotes: [], commitments: [], createdAt: 0 },
    ],
  };

  it('rewrites advisor, session, and commitment ids', () => {
    const mapped = remapAdvisor(advisor, TARGET, mapper(['adv_new', 'sessA', 'comA', 'comB', 'sessB']));
    expect(mapped.id).toBe('adv_new');
    expect(mapped.sessions.map((session) => session.id)).toEqual(['sessA', 'sessB']);
    expect(mapped.sessions[0].commitments.map((commitment) => commitment.id)).toEqual(['comA', 'comB']);
    expect(mapped.sessions[1].commitments).toEqual([]);
  });

  it('preserves narrative fields', () => {
    const mapped = remapAdvisor(advisor, TARGET, mapper(['adv_new', 'sessA', 'comA', 'comB', 'sessB']));
    expect(mapped.sessions[0]).toMatchObject({
      date: '2026-10-01',
      quotes: ['Charge double'],
      commitments: expect.arrayContaining([
        expect.objectContaining({ description: 'Raise the price', status: 'open' }),
      ]),
    });
  });

  it('does not mutate the input', () => {
    const original = structuredClone(advisor);
    remapAdvisor(advisor, TARGET, mapper(['adv_new', 'sessA', 'comA', 'comB', 'sessB']));
    expect(advisor).toEqual(original);
  });
});

describe('flat entities', () => {
  const member: TeamMember = {
    id: 'mem1',
    projectId: 'proj_old',
    name: 'Ana',
    role: 'Founder',
    commitment: 'full_time',
    skills: ['customer discovery'],
    focus: '',
    createdAt: 0,
  };
  const requirement: SkillRequirement = {
    id: 'sreq1',
    projectId: 'proj_old',
    skill: 'customer discovery',
    why: '',
    importance: 3,
    targetLevel: 'working',
    createdAt: 0,
  };
  const roadmap: RoadmapItem = {
    id: 'rm1',
    projectId: 'proj_old',
    title: 'Ship reminders',
    objective: '',
    status: 'in_progress',
    priority: 'high',
    owner: 'founder',
    evidenceRequired: '',
    estimatedEffort: '2 weeks',
    orderIndex: 1,
    createdAt: 0,
    updatedAt: 0,
  };
  const risk: RiskItem = {
    id: 'risk1',
    projectId: 'proj_old',
    title: 'No willingness to pay',
    category: 'pricing',
    probability: 'high',
    impact: 'high',
    mitigation: 'Pre-order test',
    status: 'open',
    createdAt: 0,
    updatedAt: 0,
  };

  it('rewrites each entity id and retargets the project', () => {
    expect(remapTeamMember(member, TARGET, mapper(['mem_new']))).toMatchObject({
      id: 'mem_new',
      projectId: TARGET,
      skills: ['customer discovery'],
    });
    expect(remapSkillRequirement(requirement, TARGET, mapper(['sreq_new']))).toMatchObject({
      id: 'sreq_new',
      projectId: TARGET,
      importance: 3,
    });
    expect(remapRoadmapItem(roadmap, TARGET, mapper(['rm_new']))).toMatchObject({
      id: 'rm_new',
      projectId: TARGET,
      orderIndex: 1,
    });
    expect(remapRiskItem(risk, TARGET, mapper(['risk_new']))).toMatchObject({
      id: 'risk_new',
      projectId: TARGET,
      category: 'pricing',
    });
  });
});
