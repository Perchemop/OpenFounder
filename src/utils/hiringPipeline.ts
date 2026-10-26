import type { Candidate, HiringRole, HiringStage } from '../types';

/**
 * First-hire pipeline rules.
 *
 * Hiring runs on a guarded progression, the same way the evidence ledger does:
 * a candidate cannot jump from "identified" to "hired", and the illegal moves
 * are blocked in the UI rather than silently accepted. Everything here is pure
 * so the rules are testable without a database.
 */

export const HIRING_STAGES: HiringStage[] = [
  'identified',
  'contacted',
  'screening',
  'interviewing',
  'offer',
  'hired',
  'rejected',
  'withdrawn',
];

export const ACTIVE_STAGES: HiringStage[] = [
  'identified',
  'contacted',
  'screening',
  'interviewing',
  'offer',
];

export const TERMINAL_STAGES: HiringStage[] = ['hired', 'rejected', 'withdrawn'];

export const STAGE_LABELS: Record<HiringStage, string> = {
  identified: 'Identified',
  contacted: 'Contacted',
  screening: 'Screening',
  interviewing: 'Interviewing',
  offer: 'Offer out',
  hired: 'Hired',
  rejected: 'Rejected',
  withdrawn: 'Withdrawn',
};

const FORWARD: Record<HiringStage, HiringStage[]> = {
  identified: ['contacted'],
  contacted: ['screening'],
  screening: ['interviewing'],
  interviewing: ['offer'],
  offer: ['hired'],
  hired: [],
  rejected: [],
  withdrawn: [],
};

/** Any active stage can end early. A terminal stage is final. */
export function allowedNextStages(from: HiringStage): HiringStage[] {
  if (TERMINAL_STAGES.includes(from)) return [];
  const exits: HiringStage[] = ['rejected', 'withdrawn'].filter((stage) => stage !== from) as HiringStage[];
  return [...FORWARD[from], ...exits];
}

/**
 * `true` when the move is a recorded step forward, an early exit, or a no-op
 * (selecting the stage the candidate is already in).
 */
export function canMoveToStage(from: HiringStage, to: HiringStage): boolean {
  if (from === to) return true;
  return allowedNextStages(from).includes(to);
}

export interface StageCount {
  stage: HiringStage;
  candidates: number;
}

export interface PipelineSummary {
  roles: number;
  candidates: number;
  activeCandidates: number;
  hired: number;
  offersOut: number;
  byStage: StageCount[];
  /** Roles that nobody has been recorded against yet. */
  rolesWithoutCandidates: HiringRole[];
  /**
   * Roles with no hired candidate. An outstanding offer counts as unfilled:
   * the decision is not made until someone has accepted.
   */
  unfilledRoles: HiringRole[];
}

export function summarizePipeline(roles: HiringRole[], candidates: Candidate[]): PipelineSummary {
  const activeCandidates = candidates.filter((c) => !TERMINAL_STAGES.includes(c.stage));
  const byStage = HIRING_STAGES.map((stage) => ({
    stage,
    candidates: candidates.filter((c) => c.stage === stage).length,
  }));

  const rolesWithCandidates = new Set(candidates.map((c) => c.roleId));

  return {
    roles: roles.length,
    candidates: candidates.length,
    activeCandidates: activeCandidates.length,
    hired: candidates.filter((c) => c.stage === 'hired').length,
    offersOut: candidates.filter((c) => c.stage === 'offer').length,
    byStage,
    rolesWithoutCandidates: roles.filter((role) => !rolesWithCandidates.has(role.id)),
    unfilledRoles: roles.filter(
      (role) => !candidates.some((c) => c.roleId === role.id && c.stage === 'hired'),
    ),
  };
}

export type RoleFillState = 'empty' | 'sourcing' | 'in_progress' | 'offer_out' | 'filled';

/** How far along a single role is, derived from its candidates. */
export function roleFillState(roleId: string, candidates: Candidate[]): RoleFillState {
  const stages = candidates.filter((c) => c.roleId === roleId).map((c) => c.stage);

  if (stages.includes('hired')) return 'filled';
  if (stages.includes('offer')) return 'offer_out';
  if (stages.includes('screening') || stages.includes('interviewing')) return 'in_progress';
  if (stages.includes('identified') || stages.includes('contacted')) return 'sourcing';
  return 'empty';
}

/**
 * The single next thing to do for a role, phrased as an action. Returns null
 * for a filled role so the UI shows nothing rather than a busywork prompt.
 */
export function roleNextAction(role: HiringRole, candidates: Candidate[]): string | null {
  switch (roleFillState(role.id, candidates)) {
    case 'filled':
      return null;
    case 'empty':
      return `Nobody is recorded against "${role.title}" yet. List who you already know, or where you will look.`;
    case 'sourcing':
      return `Move the conversation forward: book a first call with a candidate for "${role.title}".`;
    case 'in_progress':
      return `Run the work-sample or reference check, then record what you observed for "${role.title}".`;
    case 'offer_out':
      return `An offer is outstanding for "${role.title}". Set a decision date instead of letting it drift.`;
  }
}
