import type { Advisor, AdvisorCommitment, AdvisorSession } from '../types';

export type CommitmentUrgency = 'overdue' | 'due_today' | 'upcoming' | 'undated';

export interface AdvisorFollowUp {
  advisorId: string;
  advisorName: string;
  sessionId: string;
  sessionDate: string;
  commitment: AdvisorCommitment;
  urgency: CommitmentUrgency;
  /** Days until the due date; negative when overdue. Null when undated. */
  daysUntilDue: number | null;
}

export interface AdvisorLogSummary {
  advisors: number;
  sessions: number;
  openCommitments: number;
  overdueCommitments: number;
  /** Sessions in the last 90 days, using `today`. */
  recentSessions: number;
}

export const MS_PER_DAY = 24 * 60 * 60 * 1000;
export const RECENT_SESSION_WINDOW_DAYS = 90;

/** Parses an ISO date (yyyy-mm-dd) without timezone surprises. */
function parseIsoDate(value: string): number {
  const [year, month, day] = value.split('-').map(Number);
  return Date.UTC(year, (month ?? 1) - 1, day ?? 1);
}

export function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Whole days from `today` until `dueDate`; negative when the date has passed. */
export function daysUntil(dueDate: string, today: string): number {
  return Math.round((parseIsoDate(dueDate) - parseIsoDate(today)) / MS_PER_DAY);
}

export function commitmentUrgency(commitment: AdvisorCommitment, today: string): CommitmentUrgency {
  if (!commitment.dueDate) return 'undated';
  const delta = daysUntil(commitment.dueDate, today);
  if (delta < 0) return 'overdue';
  if (delta === 0) return 'due_today';
  return 'upcoming';
}

export const URGENCY_LABELS: Record<CommitmentUrgency, string> = {
  overdue: 'Overdue',
  due_today: 'Due today',
  upcoming: 'Upcoming',
  undated: 'No date',
};

/**
 * Every open commitment across every advisor, most urgent first, based on
 * `today` so the result is deterministic and testable.
 */
export function openCommitments(
  advisors: readonly Advisor[],
  today: string
): AdvisorFollowUp[] {
  const followUps: AdvisorFollowUp[] = [];

  for (const advisor of advisors) {
    for (const session of advisor.sessions) {
      for (const commitment of session.commitments) {
        if (commitment.status !== 'open') continue;
        followUps.push({
          advisorId: advisor.id,
          advisorName: advisor.name,
          sessionId: session.id,
          sessionDate: session.date,
          commitment,
          urgency: commitmentUrgency(commitment, today),
          daysUntilDue: commitment.dueDate ? daysUntil(commitment.dueDate, today) : null,
        });
      }
    }
  }

  return followUps.sort((a, b) => {
    const rank: Record<CommitmentUrgency, number> = {
      overdue: 0,
      due_today: 1,
      upcoming: 2,
      undated: 3,
    };
    if (rank[a.urgency] !== rank[b.urgency]) return rank[a.urgency] - rank[b.urgency];
    if (a.daysUntilDue !== b.daysUntilDue) {
      if (a.daysUntilDue === null) return 1;
      if (b.daysUntilDue === null) return -1;
      return a.daysUntilDue - b.daysUntilDue;
    }
    return b.sessionDate.localeCompare(a.sessionDate);
  });
}

export function summarizeAdvisorLog(
  advisors: readonly Advisor[],
  today: string
): AdvisorLogSummary {
  const sessions = advisors.flatMap((advisor) => advisor.sessions);
  const commitments = sessions.flatMap((session) => session.commitments);
  const recentCutoff = parseIsoDate(today) - RECENT_SESSION_WINDOW_DAYS * MS_PER_DAY;

  return {
    advisors: advisors.length,
    sessions: sessions.length,
    openCommitments: commitments.filter((commitment) => commitment.status === 'open').length,
    overdueCommitments: openCommitments(advisors, today).filter(
      (followUp) => followUp.urgency === 'overdue'
    ).length,
    recentSessions: sessions.filter((session) => parseIsoDate(session.date) >= recentCutoff)
      .length,
  };
}

/** Sessions for one advisor, newest first. */
export function sortedSessions(advisor: Advisor): AdvisorSession[] {
  return advisor.sessions
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt);
}

/** Last time the founder actually spoke to this advisor, or null. */
export function lastSessionDate(advisor: Advisor): string | null {
  const sessions = sortedSessions(advisor);
  return sessions.length > 0 ? sessions[0].date : null;
}
