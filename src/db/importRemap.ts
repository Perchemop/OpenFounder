import type {
  Advisor,
  Candidate,
  HiringRole,
  Objective,
  RiskItem,
  RoadmapItem,
  SkillRequirement,
  TeamMember,
} from '../types';

/**
 * Pure ID remapping for "import as new". Keeping it out of `db/index.ts` means
 * the interesting part of an import — every nested ID being rewritten without
 * collisions — is testable in CI without a database.
 */

export type IdMapper = (id: string, prefix: string) => string;

export function remapObjective(objective: Objective, targetProjectId: string, remapId: IdMapper): Objective {
  return {
    ...objective,
    id: remapId(objective.id, 'obj'),
    projectId: targetProjectId,
    keyResults: objective.keyResults.map((keyResult, index) => ({
      ...keyResult,
      id: remapId(keyResult.id, `kr${index}`),
    })),
  };
}

export function remapAdvisor(advisor: Advisor, targetProjectId: string, remapId: IdMapper): Advisor {
  return {
    ...advisor,
    id: remapId(advisor.id, 'adv'),
    projectId: targetProjectId,
    sessions: advisor.sessions.map((session, index) => ({
      ...session,
      id: remapId(session.id, `sess${index}`),
      commitments: session.commitments.map((commitment, cIndex) => ({
        ...commitment,
        id: remapId(commitment.id, `com${cIndex}`),
      })),
    })),
  };
}

export function remapTeamMember(member: TeamMember, targetProjectId: string, remapId: IdMapper): TeamMember {
  return { ...member, id: remapId(member.id, 'mem'), projectId: targetProjectId };
}

export function remapSkillRequirement(
  requirement: SkillRequirement,
  targetProjectId: string,
  remapId: IdMapper
): SkillRequirement {
  return { ...requirement, id: remapId(requirement.id, 'sreq'), projectId: targetProjectId };
}

export function remapRoadmapItem(item: RoadmapItem, targetProjectId: string, remapId: IdMapper): RoadmapItem {
  return { ...item, id: remapId(item.id, 'rm'), projectId: targetProjectId };
}

export function remapRiskItem(item: RiskItem, targetProjectId: string, remapId: IdMapper): RiskItem {
  return { ...item, id: remapId(item.id, 'risk'), projectId: targetProjectId };
}

export function remapHiringRole(
  role: HiringRole,
  targetProjectId: string,
  remapId: IdMapper
): HiringRole {
  return { ...role, id: remapId(role.id, 'role'), projectId: targetProjectId };
}

/**
 * Roles and candidates are rewritten together, so a candidate cannot end up
 * pointing at a role id that was remapped out from under it. A candidate whose
 * `roleId` matches no role in the package keeps its original reference (a
 * dangling link is preserved rather than silently re-pointed).
 */
export function remapHiringPipeline(
  roles: HiringRole[],
  candidates: Candidate[],
  targetProjectId: string,
  remapId: IdMapper
): { roles: HiringRole[]; candidates: Candidate[] } {
  const roleIdMap: Record<string, string> = {};
  const remappedRoles = roles.map((role) => {
    const mapped = remapHiringRole(role, targetProjectId, remapId);
    roleIdMap[role.id] = mapped.id;
    return mapped;
  });

  const remappedCandidates = candidates.map((candidate) => ({
    ...candidate,
    id: remapId(candidate.id, 'cand'),
    projectId: targetProjectId,
    roleId: roleIdMap[candidate.roleId] ?? candidate.roleId,
  }));

  return { roles: remappedRoles, candidates: remappedCandidates };
}
