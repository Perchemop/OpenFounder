import React, { useMemo, useState } from 'react';
import { UserPlus, Users, Plus, Trash2, AlertTriangle } from 'lucide-react';
import type { Candidate, HiringRole, HiringRoleKind, HiringStage } from '../types';
import { db, generateId } from '../db';
import { FilterChip } from '../components/ui/FilterChip';
import {
  HIRING_STAGES,
  STAGE_LABELS,
  allowedNextStages,
  roleFillState,
  roleNextAction,
  summarizePipeline,
} from '../utils/hiringPipeline';

interface HiringPageProps {
  projectId: string;
  roles?: HiringRole[];
  candidates?: Candidate[];
  onHiringUpdated: () => void;
  onOpenAICofounderWithPrompt?: (prompt: string) => void;
}

const KIND_LABELS: Record<HiringRoleKind, string> = {
  full_time: 'Full time',
  part_time: 'Part time',
  contract: 'Contract',
  advisor: 'Advisor',
  intern: 'Intern',
};

const FILL_LABELS: Record<ReturnType<typeof roleFillState>, string> = {
  empty: 'Nobody yet',
  sourcing: 'Sourcing',
  in_progress: 'Interviewing',
  offer_out: 'Offer out',
  filled: 'Filled',
};

const FILL_STYLES: Record<ReturnType<typeof roleFillState>, string> = {
  empty: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300',
  sourcing: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300',
  in_progress: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
  offer_out: 'bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300',
  filled: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
};

const splitList = (value: string): string[] =>
  value
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);

export const HiringPage: React.FC<HiringPageProps> = ({
  projectId,
  roles = [],
  candidates = [],
  onHiringUpdated,
  onOpenAICofounderWithPrompt,
}) => {
  const [stageFilter, setStageFilter] = useState<'all' | HiringStage>('all');
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [candidateForRole, setCandidateForRole] = useState<HiringRole | null>(null);

  // Role form
  const [title, setTitle] = useState('');
  const [kind, setKind] = useState<HiringRoleKind>('full_time');
  const [mustHave, setMustHave] = useState('');
  const [niceToHave, setNiceToHave] = useState('');
  const [budgetNote, setBudgetNote] = useState('');
  const [roleError, setRoleError] = useState<string | null>(null);

  // Candidate form
  const [candidateName, setCandidateName] = useState('');
  const [candidateSource, setCandidateSource] = useState('');
  const [candidateStrengths, setCandidateStrengths] = useState('');
  const [candidateConcerns, setCandidateConcerns] = useState('');
  const [candidateEvidence, setCandidateEvidence] = useState('');
  const [candidateNextStep, setCandidateNextStep] = useState('');
  const [candidateError, setCandidateError] = useState<string | null>(null);

  const summary = useMemo(() => summarizePipeline(roles, candidates), [roles, candidates]);

  const visibleCandidates = useMemo(
    () =>
      stageFilter === 'all'
        ? candidates
        : candidates.filter((candidate) => candidate.stage === stageFilter),
    [candidates, stageFilter],
  );

  const addRole = async () => {
    if (!title.trim()) {
      setRoleError('A role needs a title.');
      return;
    }
    setRoleError(null);
    const now = Date.now();
    await db.hiringRoles.put({
      id: generateId('role'),
      projectId,
      title: title.trim(),
      kind,
      mustHaveSkills: splitList(mustHave),
      niceToHaveSkills: splitList(niceToHave),
      budgetNote: budgetNote.trim(),
      notes: '',
      createdAt: now,
      updatedAt: now,
    });
    setTitle('');
    setMustHave('');
    setNiceToHave('');
    setBudgetNote('');
    setIsRoleModalOpen(false);
    onHiringUpdated();
  };

  const addCandidate = async () => {
    if (!candidateForRole) return;
    if (!candidateName.trim()) {
      setCandidateError('A candidate needs a name.');
      return;
    }
    setCandidateError(null);
    const now = Date.now();
    await db.candidates.put({
      id: generateId('cand'),
      projectId,
      roleId: candidateForRole.id,
      name: candidateName.trim(),
      source: candidateSource.trim(),
      stage: 'identified',
      strengths: splitList(candidateStrengths),
      concerns: splitList(candidateConcerns),
      evidenceNotes: candidateEvidence.trim(),
      nextStep: candidateNextStep.trim(),
      createdAt: now,
      updatedAt: now,
    });
    setCandidateName('');
    setCandidateSource('');
    setCandidateStrengths('');
    setCandidateConcerns('');
    setCandidateEvidence('');
    setCandidateNextStep('');
    setCandidateForRole(null);
    onHiringUpdated();
  };

  const moveStage = async (candidate: Candidate, stage: HiringStage) => {
    if (stage === candidate.stage) return;
    if (!allowedNextStages(candidate.stage).includes(stage)) return;
    await db.candidates.put({ ...candidate, stage, updatedAt: Date.now() });
    onHiringUpdated();
  };

  const deleteCandidate = async (candidate: Candidate) => {
    await db.candidates.delete(candidate.id);
    onHiringUpdated();
  };

  const deleteRole = async (role: HiringRole) => {
    await db.transaction('rw', [db.hiringRoles, db.candidates], async () => {
      await db.candidates.where('roleId').equals(role.id).delete();
      await db.hiringRoles.delete(role.id);
    });
    onHiringUpdated();
  };

  const rolesToShow =
    stageFilter === 'all'
      ? roles
      : roles.filter((role) => visibleCandidates.some((candidate) => candidate.roleId === role.id));

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center space-x-2">
            <Users className="w-5 h-5 text-sky-500" aria-hidden="true" />
            <span>Hiring Pipeline</span>
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-2xl">
            A local decision log for your first hires: the roles you are trying to fill and who you
            have actually spoken to. Nothing is shared and no profile is fetched — this is your own
            record of what you observed.
          </p>
        </div>
        <button
          onClick={() => setIsRoleModalOpen(true)}
          className="flex items-center space-x-1.5 px-3.5 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg text-xs font-semibold hover:opacity-90 transition-opacity shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          <span>Add Role</span>
        </button>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Roles', value: summary.roles },
          { label: 'Active candidates', value: summary.activeCandidates },
          { label: 'Offers out', value: summary.offersOut },
          { label: 'Hired', value: summary.hired },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-3"
          >
            <div className="text-[10px] uppercase tracking-wide text-zinc-500">{stat.label}</div>
            <div className="text-lg font-bold text-zinc-800 dark:text-zinc-100">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Stage filter */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs">
        <FilterChip
          label="All"
          value="all"
          count={candidates.length}
          isActive={stageFilter === 'all'}
          onSelect={(value) => setStageFilter(value as 'all' | HiringStage)}
        />
        {HIRING_STAGES.map((stage) => (
          <FilterChip
            key={stage}
            label={STAGE_LABELS[stage]}
            value={stage}
            count={candidates.filter((candidate) => candidate.stage === stage).length}
            isActive={stageFilter === stage}
            onSelect={(value) => setStageFilter(value as HiringStage)}
          />
        ))}
      </div>

      {/* Roles */}
      {roles.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl space-y-2">
          <Users className="w-8 h-8 text-zinc-400 mx-auto" aria-hidden="true" />
          <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            No open roles recorded yet.
          </p>
          <p className="text-[11px] text-zinc-500">
            Click "Add Role" to describe the first gap you need to close. If a skill gap is already
            listed under Team &amp; Skills, use the same wording so the two views line up.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {rolesToShow.map((role) => {
            const fill = roleFillState(role.id, candidates);
            const nextAction = roleNextAction(role, candidates);
            const roleCandidates = visibleCandidates.filter(
              (candidate) => candidate.roleId === role.id,
            );

            return (
              <div
                key={role.id}
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                        {role.title}
                      </h2>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                        {KIND_LABELS[role.kind]}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded ${FILL_STYLES[fill]}`}>
                        {FILL_LABELS[fill]}
                      </span>
                    </div>
                    {role.mustHaveSkills.length > 0 && (
                      <p className="text-[11px] text-zinc-500 mt-1">
                        Must have: {role.mustHaveSkills.join(' · ')}
                      </p>
                    )}
                    {role.budgetNote && (
                      <p className="text-[11px] text-zinc-500 mt-0.5">{role.budgetNote}</p>
                    )}
                  </div>
                  <button
                    onClick={() => deleteRole(role)}
                    className="p-1 rounded text-zinc-400 hover:text-rose-600 shrink-0"
                    aria-label={`Delete role ${role.title}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                </div>

                {nextAction && (
                  <p className="text-[11px] text-amber-800 dark:text-amber-300 bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/60 rounded-lg px-3 py-2">
                    {nextAction}
                  </p>
                )}

                <div className="space-y-2">
                  {roleCandidates.length === 0 ? (
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      {candidates.some((candidate) => candidate.roleId === role.id)
                        ? 'No candidates for this role match the stage filter. Choose another stage or "All".'
                        : 'Nobody is recorded against this role yet. Add who you have spoken to, with what you observed.'}
                    </p>
                  ) : (
                    roleCandidates.map((candidate) => (
                      <div
                        key={candidate.id}
                        className="rounded-lg border border-zinc-100 dark:border-zinc-800 p-3 space-y-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-zinc-800 dark:text-zinc-200">
                              {candidate.name}
                              {candidate.source ? ` · ${candidate.source}` : ''}
                            </p>
                            {candidate.strengths.length > 0 && (
                              <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-0.5">
                                Strengths: {candidate.strengths.join(' · ')}
                              </p>
                            )}
                            {candidate.concerns.length > 0 && (
                              <p className="text-[11px] text-rose-700 dark:text-rose-400 mt-0.5">
                                Concerns: {candidate.concerns.join(' · ')}
                              </p>
                            )}
                            {candidate.evidenceNotes && (
                              <p className="text-[11px] text-zinc-600 dark:text-zinc-400 mt-0.5">
                                Observed: {candidate.evidenceNotes}
                              </p>
                            )}
                            {candidate.nextStep && (
                              <p className="text-[11px] text-zinc-500 mt-0.5">
                                Next step: {candidate.nextStep}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <label className="sr-only" htmlFor={`stage-${candidate.id}`}>
                              Stage for {candidate.name}
                            </label>
                            <select
                              id={`stage-${candidate.id}`}
                              value={candidate.stage}
                              onChange={(event) =>
                                moveStage(candidate, event.target.value as HiringStage)
                              }
                              className="text-[11px] px-2 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200"
                            >
                              <option value={candidate.stage}>
                                {STAGE_LABELS[candidate.stage]}
                              </option>
                              {allowedNextStages(candidate.stage).map((stage) => (
                                <option key={stage} value={stage}>
                                  {STAGE_LABELS[stage]}
                                </option>
                              ))}
                            </select>
                            <button
                              onClick={() => deleteCandidate(candidate)}
                              className="p-1 rounded text-zinc-400 hover:text-rose-600"
                              aria-label={`Delete candidate ${candidate.name}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                            </button>
                          </div>
                        </div>
                        <p className="text-[10px] text-zinc-400">
                          Moves are one step at a time; a candidate cannot jump straight to Hired.
                        </p>
                      </div>
                    ))
                  )}
                </div>

                <div className="flex items-center justify-between gap-2 pt-1">
                  <button
                    onClick={() => setCandidateForRole(role)}
                    className="flex items-center space-x-1.5 text-[11px] font-semibold text-sky-700 dark:text-sky-400 hover:underline"
                  >
                    <UserPlus className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Add candidate</span>
                  </button>
                  {onOpenAICofounderWithPrompt && (
                    <button
                      onClick={() =>
                        onOpenAICofounderWithPrompt(
                          `We are hiring for "${role.title}" (${KIND_LABELS[role.kind]}), requiring ${role.mustHaveSkills.join(', ') || 'no specific skills listed yet'}. List the questions we must ask to test those must-haves, and the red flags that should stop the process.`
                        )
                      }
                      className="text-[11px] text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                    >
                      Ask the co-founder for interview questions →
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {rolesToShow.length === 0 && (
            <div className="p-8 text-center border border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl text-[11px] text-zinc-500">
              No roles have a candidate in that stage. Choose another stage or "All".
            </div>
          )}
        </div>
      )}

      {/* Add role modal */}
      {isRoleModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl max-w-lg w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Add a role
              </h3>
              <button
                onClick={() => setIsRoleModalOpen(false)}
                className="p-1 rounded text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                aria-label="Close add role dialog"
              >
                ×
              </button>
            </div>

            {roleError && (
              <p role="alert" className="text-[11px] text-rose-600 dark:text-rose-400">
                {roleError}
              </p>
            )}

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Role title
                </label>
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                  placeholder="Founding engineer"
                />
              </div>
              <div>
                <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Engagement
                </label>
                <select
                  value={kind}
                  onChange={(event) => setKind(event.target.value as HiringRoleKind)}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                >
                  {(Object.keys(KIND_LABELS) as HiringRoleKind[]).map((option) => (
                    <option key={option} value={option}>
                      {KIND_LABELS[option]}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Must-have skills (comma separated)
                </label>
                <input
                  value={mustHave}
                  onChange={(event) => setMustHave(event.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                  placeholder="TypeScript, customer discovery"
                />
              </div>
              <div>
                <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Nice-to-have skills (comma separated)
                </label>
                <input
                  value={niceToHave}
                  onChange={(event) => setNiceToHave(event.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                  placeholder="Design systems, B2B sales"
                />
              </div>
              <div>
                <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  What you can pay or trade
                </label>
                <input
                  value={budgetNote}
                  onChange={(event) => setBudgetNote(event.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                  placeholder="Contract for 3 months, then review"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                onClick={() => setIsRoleModalOpen(false)}
                className="px-3 py-2 text-xs rounded-lg text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100"
              >
                Cancel
              </button>
              <button
                onClick={addRole}
                className="px-3.5 py-2 text-xs rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-semibold hover:opacity-90"
              >
                Save role
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add candidate modal */}
      {candidateForRole && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl max-w-lg w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Add a candidate for {candidateForRole.title}
              </h3>
              <button
                onClick={() => setCandidateForRole(null)}
                className="p-1 rounded text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                aria-label="Close add candidate dialog"
              >
                ×
              </button>
            </div>

            {candidateError && (
              <p role="alert" className="text-[11px] text-rose-600 dark:text-rose-400">
                {candidateError}
              </p>
            )}

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Name or handle
                </label>
                <input
                  value={candidateName}
                  onChange={(event) => setCandidateName(event.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                  placeholder="Alex"
                />
              </div>
              <div>
                <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  How you found them
                </label>
                <input
                  value={candidateSource}
                  onChange={(event) => setCandidateSource(event.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                  placeholder="Referral from Dana"
                />
              </div>
              <div>
                <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Strengths (comma separated)
                </label>
                <input
                  value={candidateStrengths}
                  onChange={(event) => setCandidateStrengths(event.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                  placeholder="Shipped a similar product"
                />
              </div>
              <div>
                <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Concerns (comma separated)
                </label>
                <input
                  value={candidateConcerns}
                  onChange={(event) => setCandidateConcerns(event.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                  placeholder="Wants a larger salary than we can pay"
                />
              </div>
              <div>
                <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  What you actually observed
                </label>
                <textarea
                  value={candidateEvidence}
                  onChange={(event) => setCandidateEvidence(event.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                  placeholder="Trial task delivered in two days; reference call confirmed the claim"
                />
                <p className="text-[10px] text-zinc-500 mt-1 flex items-start gap-1">
                  <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" aria-hidden="true" />
                  <span>Leave blank rather than guess. An unverified impression is worth recording as a concern, not as evidence.</span>
                </p>
              </div>
              <div>
                <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Next step
                </label>
                <input
                  value={candidateNextStep}
                  onChange={(event) => setCandidateNextStep(event.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                  placeholder="Reference call on Thursday"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                onClick={() => setCandidateForRole(null)}
                className="px-3 py-2 text-xs rounded-lg text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100"
              >
                Cancel
              </button>
              <button
                onClick={addCandidate}
                className="px-3.5 py-2 text-xs rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-semibold hover:opacity-90"
              >
                Save candidate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
