import { describe, it, expect } from 'vitest';
import {
  commitmentUrgency,
  daysUntil,
  lastSessionDate,
  openCommitments,
  sortedSessions,
  summarizeAdvisorLog,
  toIsoDate,
} from './advisorLog';
import type { Advisor, AdvisorSession } from '../types';

const TODAY = '2026-10-23';

function session(overrides: Partial<AdvisorSession> = {}): AdvisorSession {
  return {
    id: 'sess1',
    date: TODAY,
    topic: 'Pricing',
    adviceGiven: 'Test two price points.',
    quotes: [],
    commitments: [],
    createdAt: 0,
    ...overrides,
  };
}

function advisor(overrides: Partial<Advisor> = {}): Advisor {
  return {
    id: 'adv1',
    projectId: 'p1',
    name: 'Dana Ruiz',
    role: 'Operator',
    expertise: ['pricing'],
    notes: '',
    createdAt: 0,
    updatedAt: 0,
    sessions: [session()],
    ...overrides,
  };
}

describe('daysUntil', () => {
  it('counts whole days to a future date and back-past dates', () => {
    expect(daysUntil('2026-10-30', TODAY)).toBe(7);
    expect(daysUntil('2026-10-23', TODAY)).toBe(0);
    expect(daysUntil('2026-10-16', TODAY)).toBe(-7);
  });
});

describe('commitmentUrgency', () => {
  it('classifies by due date', () => {
    expect(commitmentUrgency({ id: 'c', description: '', status: 'open' }, TODAY)).toBe('undated');
    expect(commitmentUrgency({ id: 'c', description: '', status: 'open', dueDate: '2026-10-16' }, TODAY)).toBe('overdue');
    expect(commitmentUrgency({ id: 'c', description: '', status: 'open', dueDate: TODAY }, TODAY)).toBe('due_today');
    expect(commitmentUrgency({ id: 'c', description: '', status: 'open', dueDate: '2026-11-01' }, TODAY)).toBe('upcoming');
  });
});

describe('openCommitments', () => {
  const advisors = [
    advisor({
      id: 'a',
      name: 'Ada',
      sessions: [
        session({
          id: 's1',
          date: '2026-10-01',
          commitments: [
            { id: 'c1', description: 'Call five plumbers', dueDate: '2026-10-12', status: 'open' },
            { id: 'c2', description: 'Already done thing', status: 'done' },
          ],
        }),
        session({
          id: 's2',
          date: '2026-10-20',
          commitments: [
            { id: 'c3', description: 'Raise the price', dueDate: '2026-10-30', status: 'open' },
            { id: 'c4', description: 'Ship today', dueDate: TODAY, status: 'open' },
            { id: 'c5', description: 'No date yet', status: 'open' },
          ],
        }),
      ],
    }),
    advisor({
      id: 'b',
      name: 'Bea',
      sessions: [
        session({
          id: 's3',
          date: '2026-10-22',
          commitments: [{ id: 'c6', description: 'Write the pitch', dueDate: '2026-11-05', status: 'open' }],
        }),
      ],
    }),
  ];

  it('returns open commitments only, most urgent first', () => {
    const followUps = openCommitments(advisors, TODAY);
    expect(followUps.map((followUp) => followUp.commitment.id)).toEqual(['c1', 'c4', 'c3', 'c6', 'c5']);
    expect(followUps[0]).toMatchObject({ advisorName: 'Ada', daysUntilDue: -11, urgency: 'overdue' });
    expect(followUps.at(-1)).toMatchObject({ urgency: 'undated', daysUntilDue: null });
  });

  it('returns nothing when every commitment is done', () => {
    expect(
      openCommitments(
        [advisor({ sessions: [session({ commitments: [{ id: 'c', description: 'done', status: 'done' }] })] })],
        TODAY
      )
    ).toEqual([]);
  });
});

describe('summarizeAdvisorLog', () => {
  it('counts advisors, sessions, and commitment state', () => {
    const advisors = [
      advisor({
        sessions: [
          session({
            date: '2026-10-01',
            commitments: [
              { id: 'c1', description: 'overdue', dueDate: '2026-10-01', status: 'open' },
              { id: 'c2', description: 'done', dueDate: '2026-10-02', status: 'done' },
            ],
          }),
          session({ id: 's2', date: '2026-01-01' }),
          session({ id: 's3', date: '2026-10-22' }),
        ],
      }),
      advisor({ id: 'a2', name: 'Bea', sessions: [] }),
    ];

    expect(summarizeAdvisorLog(advisors, TODAY)).toEqual({
      advisors: 2,
      sessions: 3,
      openCommitments: 1,
      overdueCommitments: 1,
      recentSessions: 2,
    });
  });

  it('returns zeroes for an empty log', () => {
    expect(summarizeAdvisorLog([], TODAY)).toEqual({
      advisors: 0,
      sessions: 0,
      openCommitments: 0,
      overdueCommitments: 0,
      recentSessions: 0,
    });
  });
});

describe('session ordering', () => {
  it('sorts sessions newest first', () => {
    const s = [session({ id: 'old', date: '2026-01-01' }), session({ id: 'new', date: '2026-10-01' })];
    expect(sortedSessions(advisor({ sessions: s })).map((item) => item.id)).toEqual(['new', 'old']);
  });

  it('reports the last session date or null', () => {
    expect(lastSessionDate(advisor({ sessions: [] }))).toBeNull();
    expect(
      lastSessionDate(
        advisor({ sessions: [session({ date: '2026-09-01' }), session({ id: 's2', date: '2026-10-09' })] })
      )
    ).toBe('2026-10-09');
  });
});

describe('toIsoDate', () => {
  it('formats a date as yyyy-mm-dd', () => {
    expect(toIsoDate(new Date('2026-10-23T12:00:00Z'))).toBe('2026-10-23');
  });
});
