import { describe, it, expect } from 'vitest';
import {
  coverageStatus,
  deriveSkillCoverage,
  proficiencyFromMember,
  proficiencyLabel,
  summarizeSkillCoverage,
  targetLevelToNumber,
} from './skillCoverage';
import type { SkillRequirement, TeamMember } from '../types';

function requirement(overrides: Partial<SkillRequirement> = {}): SkillRequirement {
  return {
    id: 'req1',
    projectId: 'p1',
    skill: 'customer discovery',
    why: 'Must run interviews weekly.',
    importance: 3,
    targetLevel: 'working',
    createdAt: 0,
    ...overrides,
  };
}

function member(overrides: Partial<TeamMember> = {}): TeamMember {
  return {
    id: 'm1',
    projectId: 'p1',
    name: 'Ana',
    role: 'Founder',
    commitment: 'full_time',
    skills: [],
    focus: '',
    createdAt: 0,
    ...overrides,
  };
}

describe('proficiency mapping', () => {
  it('maps numeric levels to labels and clamps', () => {
    expect(proficiencyLabel(0)).toBe('none');
    expect(proficiencyLabel(1)).toBe('aware');
    expect(proficiencyLabel(2)).toBe('working');
    expect(proficiencyLabel(3)).toBe('expert');
    expect(proficiencyLabel(9)).toBe('expert');
    expect(proficiencyLabel(-2)).toBe('none');
  });

  it('converts target levels to numbers', () => {
    expect(targetLevelToNumber('aware')).toBe(1);
    expect(targetLevelToNumber('working')).toBe(2);
    expect(targetLevelToNumber('expert')).toBe(3);
  });

  it('treats a listed skill as working level', () => {
    expect(proficiencyFromMember(member({ skills: ['react', 'sales'] }), 'Sales')).toBe(2);
    expect(proficiencyFromMember(member({ skills: [] }), 'Sales')).toBe(0);
  });
});

describe('coverageStatus', () => {
  it('is missing when nobody has the skill', () => {
    expect(coverageStatus(0, 2, false)).toBe('missing');
  });

  it('is covered when the level meets the target', () => {
    expect(coverageStatus(2, 2, false)).toBe('covered');
    expect(coverageStatus(3, 2, false)).toBe('covered');
  });

  it('is thin one step below the target or advisor-only', () => {
    expect(coverageStatus(1, 2, false)).toBe('thin');
    expect(coverageStatus(3, 2, true)).toBe('thin');
  });

  it('is a gap more than one step below the target', () => {
    expect(coverageStatus(0, 2, false)).toBe('missing');
    expect(coverageStatus(1, 3, false)).toBe('gap');
  });
});

describe('deriveSkillCoverage', () => {
  const members = [
    member({ id: 'm1', name: 'Ana', skills: ['customer discovery', 'pitch'], commitment: 'full_time' }),
    member({
      id: 'm2',
      name: 'Ben',
      role: 'CTO',
      skills: ['react', 'customer discovery'],
      commitment: 'full_time',
    }),
    member({ id: 'm3', name: 'Cleo', role: 'Advisor', skills: ['react'], commitment: 'advisor' }),
  ];

  it('picks the strongest carrier and marks covered', () => {
    const [entry] = deriveSkillCoverage([requirement()], members);
    expect(entry.bestLevel).toBe(2);
    expect(entry.status).toBe('covered');
    expect(entry.carriers.map((carrier) => carrier.member.name)).toEqual(['Ana', 'Ben']);
    expect(entry.note).toContain('Ana');
  });

  it('caps advisor-only coverage at thin', () => {
    const [entry] = deriveSkillCoverage(
      [requirement({ skill: 'react', targetLevel: 'expert' })],
      members
    );
    expect(entry.bestLevel).toBe(2);
    expect(entry.status).toBe('thin');
    expect(entry.note).toContain('advisor');
  });

  it('reports missing skills', () => {
    const [entry] = deriveSkillCoverage(
      [requirement({ skill: 'paid acquisition', targetLevel: 'aware' })],
      members
    );
    expect(entry.status).toBe('missing');
    expect(entry.note).toBe('Nobody on the team claims this skill.');
  });

  it('matches skills case-insensitively and ignores padding', () => {
    const [entry] = deriveSkillCoverage(
      [requirement({ skill: ' Customer Discovery ' })],
      [member({ skills: ['Customer  Discovery'] })]
    );
    expect(entry.status).toBe('covered');
  });
});

describe('summarizeSkillCoverage', () => {
  const coverage = deriveSkillCoverage(
    [
      requirement({ id: 'r1', skill: 'customer discovery', targetLevel: 'working' }),
      requirement({ id: 'r2', skill: 'react', targetLevel: 'expert', importance: 2 }),
      requirement({ id: 'r3', skill: 'paid acquisition', targetLevel: 'working', importance: 3 }),
      requirement({ id: 'r4', skill: 'bookkeeping', targetLevel: 'aware', importance: 1 }),
    ],
    [member({ skills: ['customer discovery', 'react'] })]
  );

  it('counts each status', () => {
    const summary = summarizeSkillCoverage(coverage);
    expect(summary).toMatchObject({
      requirements: 4,
      covered: 1,
      thin: 1,
      gap: 0,
      missing: 2,
    });
  });

  it('lists critical gaps most important first', () => {
    const summary = summarizeSkillCoverage(coverage);
    expect(summary.criticalGaps.map((gap) => gap.requirement.id)).toEqual(['r3', 'r4']);
  });

  it('returns an empty summary with no requirements', () => {
    expect(summarizeSkillCoverage([])).toEqual({
      requirements: 0,
      covered: 0,
      thin: 0,
      gap: 0,
      missing: 0,
      criticalGaps: [],
    });
  });
});
