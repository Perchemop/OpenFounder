import { describe, expect, it } from 'vitest';
import type { Candidate, HiringRole, HiringStage } from '../types';
import {
  allowedNextStages,
  canMoveToStage,
  roleFillState,
  roleNextAction,
  summarizePipeline,
} from './hiringPipeline';

function role(overrides: Partial<HiringRole> = {}): HiringRole {
  return {
    id: 'role-1',
    projectId: 'p1',
    title: 'Founding engineer',
    kind: 'full_time',
    mustHaveSkills: ['TypeScript'],
    niceToHaveSkills: [],
    budgetNote: '',
    notes: '',
    createdAt: 1,
    updatedAt: 1,
    ...overrides,
  };
}

function candidate(stage: HiringStage, overrides: Partial<Candidate> = {}): Candidate {
  return {
    id: `cand-${stage}-${overrides.id ?? ''}`,
    projectId: 'p1',
    roleId: 'role-1',
    name: 'Alex',
    source: 'referral',
    stage,
    strengths: [],
    concerns: [],
    evidenceNotes: '',
    nextStep: '',
    createdAt: 1,
    updatedAt: 1,
    ...overrides,
  };
}

describe('canMoveToStage', () => {
  it('allows one recorded step at a time', () => {
    expect(canMoveToStage('identified', 'contacted')).toBe(true);
    expect(canMoveToStage('contacted', 'screening')).toBe(true);
    expect(canMoveToStage('screening', 'interviewing')).toBe(true);
    expect(canMoveToStage('interviewing', 'offer')).toBe(true);
    expect(canMoveToStage('offer', 'hired')).toBe(true);
  });

  it('blocks skipping straight to hired', () => {
    expect(canMoveToStage('identified', 'hired')).toBe(false);
    expect(canMoveToStage('contacted', 'offer')).toBe(false);
    expect(canMoveToStage('screening', 'hired')).toBe(false);
  });

  it('allows an early exit to rejected or withdrawn', () => {
    expect(canMoveToStage('identified', 'withdrawn')).toBe(true);
    expect(canMoveToStage('interviewing', 'rejected')).toBe(true);
    expect(canMoveToStage('offer', 'withdrawn')).toBe(true);
  });

  it('treats a no-op as allowed and a terminal stage as final', () => {
    expect(canMoveToStage('screening', 'screening')).toBe(true);
    expect(allowedNextStages('hired')).toEqual([]);
    expect(allowedNextStages('rejected')).toEqual([]);
    expect(canMoveToStage('hired', 'offer')).toBe(false);
    expect(canMoveToStage('withdrawn', 'contacted')).toBe(false);
  });
});

describe('summarizePipeline', () => {
  it('counts roles, candidates, and the per-stage funnel', () => {
    const roles = [role(), role({ id: 'role-2', title: 'Designer' })];
    const candidates = [
      candidate('contacted'),
      candidate('interviewing', { id: '2' }),
      candidate('hired', { id: '3' }),
    ];

    const summary = summarizePipeline(roles, candidates);

    expect(summary.roles).toBe(2);
    expect(summary.candidates).toBe(3);
    expect(summary.activeCandidates).toBe(2);
    expect(summary.hired).toBe(1);
    expect(summary.byStage.find((entry) => entry.stage === 'contacted')?.candidates).toBe(1);
    expect(summary.byStage.find((entry) => entry.stage === 'screening')?.candidates).toBe(0);
  });

  it('lists roles nobody is recorded against and roles still unfilled', () => {
    const roles = [role(), role({ id: 'role-2', title: 'Designer' })];
    const candidates = [candidate('hired', { roleId: 'role-1' })];

    const summary = summarizePipeline(roles, candidates);

    expect(summary.rolesWithoutCandidates.map((r) => r.id)).toEqual(['role-2']);
    expect(summary.unfilledRoles.map((r) => r.id)).toEqual(['role-2']);
  });

  it('treats an outstanding offer as an unfilled role but not an empty one', () => {
    const roles = [role()];
    const summary = summarizePipeline(roles, [candidate('offer')]);

    expect(summary.offersOut).toBe(1);
    expect(summary.unfilledRoles.map((r) => r.id)).toEqual(['role-1']);
    expect(summary.rolesWithoutCandidates).toEqual([]);
  });

  it('handles an empty workspace', () => {
    const summary = summarizePipeline([], []);
    expect(summary).toMatchObject({
      roles: 0,
      candidates: 0,
      activeCandidates: 0,
      hired: 0,
      offersOut: 0,
      rolesWithoutCandidates: [],
      unfilledRoles: [],
    });
    expect(summary.byStage).toHaveLength(8);
  });
});

describe('roleFillState', () => {
  it('derives the furthest state reached across candidates', () => {
    expect(roleFillState('role-1', [])).toBe('empty');
    expect(roleFillState('role-1', [candidate('identified')])).toBe('sourcing');
    expect(roleFillState('role-1', [candidate('screening')])).toBe('in_progress');
    expect(roleFillState('role-1', [candidate('offer')])).toBe('offer_out');
    expect(roleFillState('role-1', [candidate('hired')])).toBe('filled');
  });

  it('a hired candidate outweighs others still in progress', () => {
    expect(roleFillState('role-1', [candidate('interviewing'), candidate('hired', { id: '2' })])).toBe(
      'filled',
    );
  });

  it('ignores candidates belonging to another role', () => {
    expect(roleFillState('role-9', [candidate('hired')])).toBe('empty');
  });
});

describe('roleNextAction', () => {
  it('names the control to use next and stays quiet when the role is filled', () => {
    const subject = role();
    expect(roleNextAction(subject, [])).toContain('Nobody is recorded');
    expect(roleNextAction(subject, [candidate('contacted')])).toContain('first call');
    expect(roleNextAction(subject, [candidate('interviewing')])).toContain('work-sample');
    expect(roleNextAction(subject, [candidate('offer')])).toContain('decision date');
    expect(roleNextAction(subject, [candidate('hired')])).toBeNull();
  });
});
