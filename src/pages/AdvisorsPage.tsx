import React, { useMemo, useState } from 'react';
import {
  Users,
  Plus,
  Trash2,
  MessageSquareQuote,
  CircleDot,
  CalendarClock,
  X,
} from 'lucide-react';
import type { Advisor, AdvisorCommitment, AdvisorSession } from '../types';
import { db, generateId } from '../db';
import {
  URGENCY_LABELS,
  lastSessionDate,
  openCommitments,
  sortedSessions,
  summarizeAdvisorLog,
  toIsoDate,
  type AdvisorFollowUp,
} from '../utils/advisorLog';

interface AdvisorsPageProps {
  projectId: string;
  advisors?: Advisor[];
  onAdvisorsUpdated: () => void;
  onOpenAICofounderWithPrompt?: (prompt: string) => void;
}

interface CommitmentDraft {
  id: string;
  description: string;
  dueDate: string;
}

interface SessionDraft {
  id: string;
  date: string;
  duration: string;
  topic: string;
  adviceGiven: string;
  quotes: string;
  commitments: CommitmentDraft[];
}

function emptyCommitmentDraft(): CommitmentDraft {
  return { id: generateId('cmd'), description: '', dueDate: '' };
}

function emptySessionDraft(): SessionDraft {
  return {
    id: generateId('sd'),
    date: toIsoDate(new Date()),
    duration: '30',
    topic: '',
    adviceGiven: '',
    quotes: '',
    commitments: [],
  };
}

export const AdvisorsPage: React.FC<AdvisorsPageProps> = ({
  projectId,
  advisors = [],
  onAdvisorsUpdated,
  onOpenAICofounderWithPrompt,
}) => {
  const today = toIsoDate(new Date());
  const [openAdvisorId, setOpenAdvisorId] = useState<string | null>(null);

  const [advisorName, setAdvisorName] = useState('');
  const [advisorRole, setAdvisorRole] = useState('');
  const [advisorOrg, setAdvisorOrg] = useState('');
  const [advisorContact, setAdvisorContact] = useState('');
  const [advisorExpertise, setAdvisorExpertise] = useState('');
  const [advisorError, setAdvisorError] = useState<string | null>(null);

  const [sessionDrafts, setSessionDrafts] = useState<Record<string, SessionDraft>>({});
  const [isSessionFormOpen, setIsSessionFormOpen] = useState<string | null>(null);

  const summary = useMemo(() => summarizeAdvisorLog(advisors, today), [advisors, today]);
  const followUps = useMemo(() => openCommitments(advisors, today), [advisors, today]);

  const draftFor = (advisorId: string): SessionDraft =>
    sessionDrafts[advisorId] ?? emptySessionDraft();

  const setDraft = (advisorId: string, patch: Partial<SessionDraft>) => {
    setSessionDrafts((current) => {
      const base = current[advisorId] ?? emptySessionDraft();
      return { ...current, [advisorId]: { ...base, ...patch } };
    });
  };

  const closeSessionForm = () => {
    setIsSessionFormOpen(null);
  };

  const createAdvisor = async () => {
    if (!advisorName.trim()) {
      setAdvisorError('An advisor needs a name.');
      return;
    }

    const now = Date.now();
    await db.advisors.put({
      id: generateId('adv'),
      projectId,
      name: advisorName.trim(),
      role: advisorRole.trim(),
      organisation: advisorOrg.trim() || undefined,
      contact: advisorContact.trim() || undefined,
      expertise: advisorExpertise
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
      notes: '',
      sessions: [],
      createdAt: now,
      updatedAt: now,
    });

    setAdvisorName('');
    setAdvisorRole('');
    setAdvisorOrg('');
    setAdvisorContact('');
    setAdvisorExpertise('');
    setAdvisorError(null);
    onAdvisorsUpdated();
  };

  const deleteAdvisor = async (advisor: Advisor) => {
    const confirmed = window.confirm(
      `Delete ${advisor.name} and their ${advisor.sessions.length} logged session(s)?`
    );
    if (!confirmed) return;
    await db.advisors.delete(advisor.id);
    onAdvisorsUpdated();
  };

  const saveSession = async (advisor: Advisor) => {
    const draft = draftFor(advisor.id);
    if (!draft.topic.trim() && !draft.adviceGiven.trim()) {
      return;
    }

    const now = Date.now();
    const commitments: AdvisorCommitment[] = draft.commitments
      .filter((commitment) => commitment.description.trim())
      .map((commitment) => ({
        id: commitment.id,
        description: commitment.description.trim(),
        dueDate: commitment.dueDate || undefined,
        status: 'open',
      }));

    const session: AdvisorSession = {
      id: generateId('sess'),
      date: draft.date || today,
      durationMinutes: draft.duration ? Number(draft.duration) : undefined,
      topic: draft.topic.trim(),
      adviceGiven: draft.adviceGiven.trim(),
      quotes: draft.quotes
        .split('\n')
        .map((quote) => quote.trim())
        .filter(Boolean),
      commitments,
      createdAt: now,
    };

    await db.advisors.put({
      ...advisor,
      sessions: [...advisor.sessions, session],
      updatedAt: now,
    });

    setSessionDrafts(({ [advisor.id]: _removed, ...rest }) => rest);
    onAdvisorsUpdated();
    closeSessionForm();
  };

  const toggleCommitment = async (advisor: Advisor, session: AdvisorSession, commitment: AdvisorCommitment) => {
    const now = Date.now();
    await db.advisors.put({
      ...advisor,
      sessions: advisor.sessions.map((item) =>
        item.id !== session.id
          ? item
          : {
              ...item,
              commitments: item.commitments.map((entry) =>
                entry.id !== commitment.id
                  ? entry
                  : { ...entry, status: entry.status === 'done' ? 'open' : 'done' }
              ),
            }
      ),
      updatedAt: now,
    });
    onAdvisorsUpdated();
  };

  const askAIForAngle = (advisor: Advisor) => {
    onOpenAICofounderWithPrompt?.(
      `I have an advisor called ${advisor.name}${advisor.role ? ` (${advisor.role})` : ''} with expertise in ${
        advisor.expertise.join(', ') || 'general business'
      }. Suggest three specific questions I should ask at the next session, based on our current evidence and tests.`
    );
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center space-x-2">
            <Users className="w-5 h-5 text-sky-500"  aria-hidden="true" />
            <span>Advisors &amp; Mentors</span>
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-2xl">
            Local log of who gives you advice, what they said, and what you promised to do.
            Nothing here is shared: there is no network, so no contact is discovered for you.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <SummaryCard label="Advisors" value={`${summary.advisors}`} />
        <SummaryCard label="Logged sessions" value={`${summary.sessions}`} />
        <SummaryCard label="Sessions (90 days)" value={`${summary.recentSessions}`} />
        <SummaryCard
          label="Open commitments"
          value={`${summary.openCommitments}`}
          tone={summary.overdueCommitments > 0 ? 'bad' : summary.openCommitments > 0 ? 'warn' : undefined}
        />
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4">
        <h2 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
          Outstanding commitments
        </h2>
        {followUps.length === 0 ? (
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
            Nothing outstanding. Log a session and record what you promised to do.
          </p>
        ) : (
          <ul className="space-y-1.5">
            {followUps.map((followUp) => (
              <FollowUpRow key={followUp.commitment.id} followUp={followUp} />
            ))}
          </ul>
        )}
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4">
        <h2 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 mb-2">Add an advisor</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
          <input
            value={advisorName}
            onChange={(event) => setAdvisorName(event.target.value)}
            placeholder="Name"
            className={inputClass}
            aria-label="Advisor name"
          />
          <input
            value={advisorRole}
            onChange={(event) => setAdvisorRole(event.target.value)}
            placeholder="Role"
            className={inputClass}
            aria-label="Advisor role"
          />
          <input
            value={advisorOrg}
            onChange={(event) => setAdvisorOrg(event.target.value)}
            placeholder="Organisation"
            className={inputClass}
            aria-label="Advisor organisation"
          />
          <input
            value={advisorContact}
            onChange={(event) => setAdvisorContact(event.target.value)}
            placeholder="Contact (email or handle)"
            className={inputClass}
            aria-label="Advisor contact"
          />
          <input
            value={advisorExpertise}
            onChange={(event) => setAdvisorExpertise(event.target.value)}
            placeholder="Expertise, comma separated"
            className={inputClass}
            aria-label="Advisor expertise"
          />
        </div>
        {advisorError && (
          <p role="alert" className="mt-2 text-[11px] text-rose-600">
            {advisorError}
          </p>
        )}
        <button
          onClick={createAdvisor}
          className="mt-3 inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-semibold hover:opacity-90"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add advisor</span>
        </button>
      </div>

      {advisors.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl p-8 text-center">
          <Users className="w-8 h-8 text-zinc-300 dark:text-zinc-600 mx-auto mb-3"  aria-hidden="true" />
          <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">No advisors yet</h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-md mx-auto">
            Add the people who already help you — a former founder, a paid coach, a customer
            with domain expertise — and log what you learned.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {advisors.map((advisor) => {
            const sessions = sortedSessions(advisor);
            const last = lastSessionDate(advisor);
            const expanded = openAdvisorId === advisor.id;
            const advisorOpen = sessions
              .flatMap((session) => session.commitments)
              .filter((commitment) => commitment.status === 'open').length;

            return (
              <div
                key={advisor.id}
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <button
                    onClick={() => setOpenAdvisorId(expanded ? null : advisor.id)}
                    className="text-left min-w-0"
                    aria-expanded={expanded}
                  >
                    <div className="flex items-center space-x-2">
                      <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        {advisor.name}
                      </h2>
                      <span className="text-[10px] text-zinc-500">
                        {advisorOpen > 0 ? `${advisorOpen} open commitment(s)` : 'no open commitments'}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                      {[advisor.role, advisor.organisation].filter(Boolean).join(' · ')}
                      {last ? ` · last session ${last}` : ' · no sessions logged'}
                    </p>
                    {advisor.expertise.length > 0 && (
                      <p className="text-[10px] text-zinc-400 mt-1">
                        {advisor.expertise.join(' · ')}
                      </p>
                    )}
                  </button>

                  <div className="flex items-center space-x-1.5 shrink-0">
                    {onOpenAICofounderWithPrompt && (
                      <button
                        onClick={() => askAIForAngle(advisor)}
                        className="text-[11px] px-2 py-1 rounded border border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:text-amber-600"
                      >
                        Prepare session
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setIsSessionFormOpen(isSessionFormOpen === advisor.id ? null : advisor.id);
                        setOpenAdvisorId(advisor.id);
                      }}
                      className="text-[11px] px-2 py-1 rounded border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                    >
                      Log session
                    </button>
                    <button
                      onClick={() => deleteAdvisor(advisor)}
                      className="p-1.5 rounded text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                      aria-label={`Delete ${advisor.name}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {isSessionFormOpen === advisor.id && (
                  <div className="mt-3 rounded-lg border border-zinc-200 dark:border-zinc-800 p-3 space-y-2">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <label className="text-[10px] text-zinc-500">
                        Date
                        <input
                          type="date"
                          value={draftFor(advisor.id).date}
                          onChange={(event) => setDraft(advisor.id, { date: event.target.value })}
                          className={`${inputClass} mt-0.5`}
                        />
                      </label>
                      <label className="text-[10px] text-zinc-500">
                        Minutes
                        <input
                          type="number"
                          value={draftFor(advisor.id).duration}
                          onChange={(event) => setDraft(advisor.id, { duration: event.target.value })}
                          className={`${inputClass} mt-0.5`}
                        />
                      </label>
                      <label className="text-[10px] text-zinc-500 col-span-2">
                        Topic
                        <input
                          value={draftFor(advisor.id).topic}
                          onChange={(event) => setDraft(advisor.id, { topic: event.target.value })}
                          placeholder="Pricing model"
                          className={`${inputClass} mt-0.5`}
                        />
                      </label>
                    </div>

                    <label className="block text-[10px] text-zinc-500">
                      Advice given
                      <textarea
                        rows={3}
                        value={draftFor(advisor.id).adviceGiven}
                        onChange={(event) => setDraft(advisor.id, { adviceGiven: event.target.value })}
                        placeholder="What they actually told you"
                        className={`${inputClass} mt-0.5`}
                      />
                    </label>

                    <label className="block text-[10px] text-zinc-500">
                      Verbatim quotes (one per line)
                      <textarea
                        rows={2}
                        value={draftFor(advisor.id).quotes}
                        onChange={(event) => setDraft(advisor.id, { quotes: event.target.value })}
                        placeholder={'I would charge double\nDo not build the app yet'}
                        className={`${inputClass} mt-0.5`}
                      />
                    </label>

                    <div>
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] uppercase tracking-wider text-zinc-500">
                          Commitments you made
                        </p>
                        <button
                          onClick={() =>
                            setDraft(advisor.id, {
                              commitments: [
                                ...draftFor(advisor.id).commitments,
                                emptyCommitmentDraft(),
                              ],
                            })
                          }
                          className="text-[11px] text-emerald-700 dark:text-emerald-400 hover:underline"
                        >
                          + Add
                        </button>
                      </div>
                      <div className="mt-1.5 space-y-1.5">
                        {draftFor(advisor.id).commitments.map((commitment) => (
                          <div key={commitment.id} className="flex items-center gap-2">
                            <input
                              value={commitment.description}
                              onChange={(event) =>
                                setDraft(advisor.id, {
                                  commitments: draftFor(advisor.id).commitments.map((item) =>
                                    item.id === commitment.id
                                      ? { ...item, description: event.target.value }
                                      : item
                                  ),
                                })
                              }
                              placeholder="Call five more plumbers"
                              className={`${inputClass} flex-1`}
                            />
                            <input
                              type="date"
                              value={commitment.dueDate}
                              onChange={(event) =>
                                setDraft(advisor.id, {
                                  commitments: draftFor(advisor.id).commitments.map((item) =>
                                    item.id === commitment.id
                                      ? { ...item, dueDate: event.target.value }
                                      : item
                                  ),
                                })
                              }
                              className={`${inputClass} w-36`}
                            />
                            <button
                              onClick={() =>
                                setDraft(advisor.id, {
                                  commitments: draftFor(advisor.id).commitments.filter(
                                    (item) => item.id !== commitment.id
                                  ),
                                })
                              }
                              className="text-zinc-400 hover:text-rose-600"
                              aria-label="Remove commitment"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-end space-x-2 pt-1">
                      <button
                        onClick={closeSessionForm}
                        className="px-3 py-1.5 rounded-lg text-xs text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => saveSession(advisor)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700"
                      >
                        Save session
                      </button>
                    </div>
                  </div>
                )}

                {expanded && sessions.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {sessions.map((session) => (
                      <div
                        key={session.id}
                        className="rounded-lg border border-zinc-100 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-950/40 p-2.5"
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-medium text-zinc-800 dark:text-zinc-200">
                            {session.date}
                            {session.durationMinutes ? ` · ${session.durationMinutes} min` : ''}
                          </p>
                          {session.topic && (
                            <p className="text-[10px] uppercase tracking-wider text-zinc-500">
                              {session.topic}
                            </p>
                          )}
                        </div>
                        {session.adviceGiven && (
                          <p className="text-xs text-zinc-700 dark:text-zinc-300 mt-1.5">
                            {session.adviceGiven}
                          </p>
                        )}
                        {session.quotes.map((quote, index) => (
                          <p
                            key={`${session.id}-q${index}`}
                            className="mt-1.5 text-[11px] italic text-zinc-500 dark:text-zinc-400 flex space-x-1"
                          >
                            <MessageSquareQuote className="w-3 h-3 shrink-0 mt-0.5"  aria-hidden="true" />
                            <span>“{quote}”</span>
                          </p>
                        ))}
                        {session.commitments.length > 0 && (
                          <ul className="mt-2 space-y-1">
                            {session.commitments.map((commitment) => (
                              <li key={commitment.id} className="flex items-center space-x-2">
                                <button
                                  onClick={() => toggleCommitment(advisor, session, commitment)}
                                  className="shrink-0"
                                  aria-label={
                                    commitment.status === 'done'
                                      ? `Reopen "${commitment.description}"`
                                      : `Mark "${commitment.description}" done`
                                  }
                                >
                                  <CircleDot
                                    className={`w-3.5 h-3.5 ${
                                      commitment.status === 'done'
                                        ? 'text-emerald-500'
                                        : 'text-zinc-400'
                                    }`}
                                  />
                                </button>
                                <span
                                  className={`text-[11px] ${
                                    commitment.status === 'done'
                                      ? 'line-through text-zinc-400'
                                      : 'text-zinc-700 dark:text-zinc-300'
                                  }`}
                                >
                                  {commitment.description}
                                </span>
                                {commitment.dueDate && (
                                  <span className="text-[10px] text-zinc-400 flex items-center space-x-0.5">
                                    <CalendarClock className="w-3 h-3" />
                                    <span>{commitment.dueDate}</span>
                                  </span>
                                )}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function FollowUpRow({ followUp }: { followUp: AdvisorFollowUp }) {
  const urgencyStyle =
    followUp.urgency === 'overdue'
      ? 'text-rose-600 dark:text-rose-400'
      : followUp.urgency === 'due_today'
        ? 'text-amber-600 dark:text-amber-400'
        : 'text-zinc-500';

  return (
    <li className="flex flex-wrap items-center gap-x-2 text-[11px]">
      <span className="font-medium text-zinc-700 dark:text-zinc-300">{followUp.advisorName}</span>
      <span className="text-zinc-500">{followUp.commitment.description}</span>
      <span className="text-zinc-400">({followUp.sessionDate})</span>
      <span className={urgencyStyle}>
        {URGENCY_LABELS[followUp.urgency]}
        {followUp.commitment.dueDate ? ` · ${followUp.commitment.dueDate}` : ''}
      </span>
    </li>
  );
}

function SummaryCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: 'good' | 'bad' | 'warn';
}) {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3">
      <p className="text-[10px] uppercase tracking-wider text-zinc-400 font-medium">{label}</p>
      <p
        className={`text-xl font-bold mt-1 ${
          tone === 'good'
            ? 'text-emerald-600 dark:text-emerald-400'
            : tone === 'bad'
              ? 'text-rose-600 dark:text-rose-400'
              : tone === 'warn'
                ? 'text-amber-600 dark:text-amber-400'
                : 'text-zinc-900 dark:text-zinc-100'
        }`}
      >
        {value}
      </p>
    </div>
  );
}

const inputClass =
  'w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded px-2 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-emerald-500';
