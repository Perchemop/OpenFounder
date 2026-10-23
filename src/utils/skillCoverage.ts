import type { SkillRequirement, TeamMember } from '../types';

export const PROFICIENCY_LEVELS = ['none', 'aware', 'working', 'expert'] as const;

export type Proficiency = (typeof PROFICIENCY_LEVELS)[number];

/** Maps the UI's per-skill level (0–3) onto a proficiency label. */
export function proficiencyLabel(level: number): Proficiency {
  const clamped = Math.max(0, Math.min(PROFICIENCY_LEVELS.length - 1, Math.round(level)));
  return PROFICIENCY_LEVELS[clamped];
}

/** Converts a `targetLevel` string to the numeric level used everywhere else. */
export function targetLevelToNumber(target: SkillRequirement['targetLevel']): number {
  return PROFICIENCY_LEVELS.indexOf(target);
}

export type CoverageStatus = 'covered' | 'thin' | 'gap' | 'missing';

export interface SkillCoverage {
  requirement: SkillRequirement;
  /** Best level anyone on the team claims for this skill, 0–3. */
  bestLevel: number;
  /** Members who claim this skill, strongest first. */
  carriers: Array<{ member: TeamMember; level: number }>;
  status: CoverageStatus;
  /** Shortfalls: filled by advisors (level ≤ 1) count as thin at best. */
  note: string;
}

export interface SkillCoverageSummary {
  requirements: number;
  covered: number;
  thin: number;
  gap: number;
  missing: number;
  /** Skills where nobody on the team has any level, most important first. */
  criticalGaps: Array<{ requirement: SkillRequirement; bestLevel: number }>;
}

/**
 * Coverage status for one requirement.
 *
 * - `covered`: best level meets or exceeds the target.
 * - `thin`: best level is within one step of the target, or is only covered by
 *   an advisor rather than someone building.
 * - `gap`: best level exists but is more than one step below target.
 * - `missing`: nobody on the team has any level in this skill.
 */
export function coverageStatus(
  bestLevel: number,
  targetLevel: number,
  carriedByAdvisorOnly: boolean
): CoverageStatus {
  if (bestLevel === 0) return 'missing';
  if (bestLevel >= targetLevel) {
    return carriedByAdvisorOnly ? 'thin' : 'covered';
  }
  if (targetLevel - bestLevel === 1) return 'thin';
  return 'gap';
}

/**
 * Derives coverage for every requirement. A member's level for a skill is the
 * highest of their own claimed level; advisory coverage cannot lift a skill
 * past "thin", because advisors do not do the work.
 */
export function deriveSkillCoverage(
  requirements: readonly SkillRequirement[],
  members: readonly TeamMember[]
): SkillCoverage[] {
  const lower = (value: string) => value.trim().toLowerCase();

  return requirements.map((requirement) => {
    const targetLevel = targetLevelToNumber(requirement.targetLevel);

    const carriers = members
      .map((member) => {
        const match = member.skills.find((skill) => lower(skill) === lower(requirement.skill));
        const level = match ? proficiencyFromMember(member, requirement.skill) : 0;
        return { member, level };
      })
      .filter((carrier) => carrier.level > 0)
      .sort((a, b) => b.level - a.level || a.member.name.localeCompare(b.member.name));

    const bestLevel = carriers.length > 0 ? carriers[0].level : 0;
    const carriedByAdvisorOnly =
      carriers.length > 0 && carriers.every((carrier) => carrier.member.commitment === 'advisor');

    const status = coverageStatus(bestLevel, targetLevel, carriedByAdvisorOnly);

    let note: string;
    if (status === 'missing') {
      note = 'Nobody on the team claims this skill.';
    } else if (status === 'thin' && carriedByAdvisorOnly) {
      note = 'Only covered through an advisor; someone building it must learn it.';
    } else if (status === 'thin') {
      note = 'Close to the level needed, but not there yet.';
    } else if (status === 'covered') {
      note = `Covered by ${carriers[0].member.name}.`;
    } else {
      note = 'Covered below the level the venture needs.';
    }

    return { requirement, bestLevel, carriers, status, note };
  });
}

/**
 * Provisional member levels are stored in `SkillLevels` keyed by member id,
 * so a member can rate themselves per skill. Kept separate from the member
 * object so ratings do not leak into exports unless the user records them.
 */
export function proficiencyFromMember(member: TeamMember, skill: string): number {
  // Members carry skills as a plain list; a per-skill level is not stored, so
  // a listed skill means "working" until a level is recorded explicitly.
  const listed = member.skills.some((entry) => entry.trim().toLowerCase() === skill.trim().toLowerCase());
  return listed ? PROFICIENCY_LEVELS.indexOf('working') : 0;
}

export function summarizeSkillCoverage(coverage: readonly SkillCoverage[]): SkillCoverageSummary {
  const counts = { covered: 0, thin: 0, gap: 0, missing: 0 };
  for (const entry of coverage) {
    counts[entry.status] += 1;
  }

  const criticalGaps = coverage
    .filter((entry) => entry.status === 'missing' || entry.status === 'gap')
    .sort(
      (a, b) =>
        b.requirement.importance - a.requirement.importance ||
        a.bestLevel - b.bestLevel ||
        a.requirement.skill.localeCompare(b.requirement.skill)
    )
    .map((entry) => ({ requirement: entry.requirement, bestLevel: entry.bestLevel }));

  return {
    requirements: coverage.length,
    ...counts,
    criticalGaps,
  };
}

export const COVERAGE_LABELS: Record<CoverageStatus, string> = {
  covered: 'Covered',
  thin: 'Thin',
  gap: 'Gap',
  missing: 'Missing',
};
