import React, { useMemo, useState } from 'react';
import { Users, Plus, Trash2, UserPlus2, AlertTriangle, CheckCircle2, X } from 'lucide-react';
import type { SkillRequirement, TeamCommitment, TeamMember } from '../types';
import { db, generateId } from '../db';
import {
  COVERAGE_LABELS,
  deriveSkillCoverage,
  proficiencyLabel,
  summarizeSkillCoverage,
  targetLevelToNumber,
} from '../utils/skillCoverage';

interface TeamPageProps {
  projectId: string;
  members?: TeamMember[];
  requirements?: SkillRequirement[];
  onTeamUpdated: () => void;
  onOpenAICofounderWithPrompt?: (prompt: string) => void;
}

const COMMITMENT_LABELS: Record<TeamCommitment, string> = {
  full_time: 'Full time',
  part_time: 'Part time',
  advisor: 'Advisor',
  contractor: 'Contractor',
};

const COVERAGE_STYLES: Record<string, string> = {
  covered:
    'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
  thin: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800',
  gap: 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800',
  missing: 'bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700',
};

export const TeamPage: React.FC<TeamPageProps> = ({
  projectId,
  members = [],
  requirements = [],
  onTeamUpdated,
  onOpenAICofounderWithPrompt,
}) => {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [commitment, setCommitment] = useState<TeamCommitment>('full_time');
  const [skills, setSkills] = useState('');
  const [focus, setFocus] = useState('');
  const [memberError, setMemberError] = useState<string | null>(null);

  const [skillName, setSkillName] = useState('');
  const [skillWhy, setSkillWhy] = useState('');
  const [skillImportance, setSkillImportance] = useState<'1' | '2' | '3'>('2');
  const [skillTarget, setSkillTarget] = useState<'aware' | 'working' | 'expert'>('working');
  const [skillError, setSkillError] = useState<string | null>(null);

  const [expandedSkill, setExpandedSkill] = useState<string | null>(null);

  const coverage = useMemo(() => deriveSkillCoverage(requirements, members), [requirements, members]);
  const summary = useMemo(() => summarizeSkillCoverage(coverage), [coverage]);

  const addMember = async () => {
    if (!name.trim()) {
      setMemberError('A team member needs a name.');
      return;
    }
    setMemberError(null);
    await db.teamMembers.put({
      id: generateId('mem'),
      projectId,
      name: name.trim(),
      role: role.trim(),
      commitment,
      skills: skills
        .split(',')
        .map((skill) => skill.trim())
        .filter(Boolean),
      focus: focus.trim(),
      createdAt: Date.now(),
    });
    setName('');
    setRole('');
    setSkills('');
    setFocus('');
    onTeamUpdated();
  };

  const deleteMember = async (member: TeamMember) => {
    const confirmed = window.confirm(`Remove ${member.name} from the team?`);
    if (!confirmed) return;
    await db.teamMembers.delete(member.id);
    onTeamUpdated();
  };

  const addRequirement = async () => {
    if (!skillName.trim()) {
      setSkillError('A requirement needs a skill name.');
      return;
    }
    setSkillError(null);
    await db.skillRequirements.put({
      id: generateId('req'),
      projectId,
      skill: skillName.trim(),
      why: skillWhy.trim(),
      importance: Number(skillImportance) as 1 | 2 | 3,
      targetLevel: skillTarget,
      createdAt: Date.now(),
    });
    setSkillName('');
    setSkillWhy('');
    onTeamUpdated();
  };

  const deleteRequirement = async (requirement: SkillRequirement) => {
    const confirmed = window.confirm(`Delete "${requirement.skill}" from the requirements?`);
    if (!confirmed) return;
    await db.skillRequirements.delete(requirement.id);
    onTeamUpdated();
  };

  const askAIForHiringPlan = () => {
    const gaps = summary.criticalGaps.map((gap) => gap.requirement.skill);
    onOpenAICofounderWithPrompt?.(
      gaps.length > 0
        ? `Our uncovered skills are: ${gaps.join(', ')}. For the top two, say whether they should be learned, hired, contracted, or left out of the plan for now, given we are pre-seed.`
        : 'Our skills coverage is green. What is the first role we should hire, and what would prove we need it yet?'
    );
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center space-x-2">
            <Users className="w-5 h-5 text-sky-500" />
            <span>Team &amp; Skills</span>
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-2xl">
            Who is building, what they bring, and which skills the venture needs. Coverage is
            derived from this list — it is a planning aid, not a search engine: there is no
            cofounder or candidate matching here.
          </p>
        </div>
        {onOpenAICofounderWithPrompt && (
          <button
            onClick={askAIForHiringPlan}
            className="px-3 py-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-xs font-semibold"
          >
            Ask about the gaps
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <SummaryCard label="Team" value={`${members.length}`} />
        <SummaryCard label="Covered" value={`${summary.covered}`} tone="good" />
        <SummaryCard label="Thin" value={`${summary.thin}`} tone="warn" />
        <SummaryCard label="Gap" value={`${summary.gap}`} tone="bad" />
        <SummaryCard label="Missing" value={`${summary.missing}`} />
      </div>

      {coverage.length > 0 && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4">
          <h2 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
            Skills coverage
          </h2>
          <div className="space-y-1.5">
            {coverage.map((entry) => (
              <div key={entry.requirement.id} className="flex flex-wrap items-center gap-2 text-[11px]">
                <button
                  onClick={() =>
                    setExpandedSkill(expandedSkill === entry.requirement.id ? null : entry.requirement.id)
                  }
                  className="flex items-center space-x-2 min-w-0"
                  aria-expanded={expandedSkill === entry.requirement.id}
                >
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${
                      COVERAGE_STYLES[entry.status]
                    }`}
                  >
                    {COVERAGE_LABELS[entry.status]}
                  </span>
                  <span className="text-zinc-800 dark:text-zinc-200 truncate">
                    {entry.requirement.skill}
                  </span>
                  <span className="text-zinc-400">
                    importance {entry.requirement.importance} · target{' '}
                    {proficiencyLabel(targetLevelToNumber(entry.requirement.targetLevel))}
                  </span>
                </button>
                <span className="text-zinc-500">
                  best: {proficiencyLabel(entry.bestLevel)}
                  {entry.carriers.length > 0
                    ? ` (${entry.carriers.map((carrier) => carrier.member.name).join(', ')})`
                    : ''}
                </span>
              </div>
            ))}
            {expandedSkill && (
              <p className="text-[11px] text-zinc-500 pt-1">
                {coverage.find((entry) => entry.requirement.id === expandedSkill)?.note}
              </p>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4">
          <h2 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
            Who is building
          </h2>
          {members.length === 0 ? (
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              Add the people actually working on this, including yourself.
            </p>
          ) : (
            <ul className="space-y-2">
              {members.map((member) => (
                <li
                  key={member.id}
                  className="rounded-lg border border-zinc-100 dark:border-zinc-800 p-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-zinc-800 dark:text-zinc-200">
                        {member.name}
                        {member.role ? ` · ${member.role}` : ''}
                      </p>
                      <p className="text-[10px] text-zinc-500">{COMMITMENT_LABELS[member.commitment]}</p>
                    </div>
                    <button
                      onClick={() => deleteMember(member)}
                      className="p-1 rounded text-zinc-400 hover:text-rose-600"
                      aria-label={`Delete ${member.name}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {member.skills.length > 0 && (
                    <p className="text-[10px] text-zinc-400 mt-1">{member.skills.join(' · ')}</p>
                  )}
                  {member.focus && (
                    <p className="text-[11px] text-zinc-600 dark:text-zinc-400 mt-1">{member.focus}</p>
                  )}
                </li>
              ))}
            </ul>
          )}

          <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Name"
                className={inputClass}
                aria-label="Member name"
              />
              <input
                value={role}
                onChange={(event) => setRole(event.target.value)}
                placeholder="Role"
                className={inputClass}
                aria-label="Member role"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <select
                value={commitment}
                onChange={(event) => setCommitment(event.target.value as TeamCommitment)}
                className={inputClass}
                aria-label="Commitment"
              >
                {Object.entries(COMMITMENT_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              <button
                onClick={addMember}
                className="flex items-center justify-center space-x-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-semibold hover:opacity-90"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
            <input
              value={skills}
              onChange={(event) => setSkills(event.target.value)}
              placeholder="Skills, comma separated (e.g. customer discovery, React)"
              className={inputClass}
              aria-label="Skills"
            />
            <input
              value={focus}
              onChange={(event) => setFocus(event.target.value)}
              placeholder="What they own right now"
              className={inputClass}
              aria-label="Focus"
            />
            {memberError && <p className="text-[11px] text-rose-600">{memberError}</p>}
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4">
          <h2 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
            Skills the venture needs
          </h2>
          {requirements.length === 0 ? (
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              Name the skills this business cannot do without. Coverage is computed against the
              team list, so a gap is visible instead of a founder's hope.
            </p>
          ) : (
            <ul className="space-y-2">
              {requirements.map((requirement) => (
                <li
                  key={requirement.id}
                  className="rounded-lg border border-zinc-100 dark:border-zinc-800 p-2.5 flex items-start justify-between gap-2"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-zinc-800 dark:text-zinc-200">
                      {requirement.skill}
                      <span className="ml-2 text-[10px] text-zinc-400">
                        importance {requirement.importance} · target {requirement.targetLevel}
                      </span>
                    </p>
                    {requirement.why && (
                      <p className="text-[11px] text-zinc-500 mt-0.5">{requirement.why}</p>
                    )}
                  </div>
                  <button
                    onClick={() => deleteRequirement(requirement)}
                    className="p-1 rounded text-zinc-400 hover:text-rose-600"
                    aria-label={`Delete ${requirement.skill}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
            <input
              value={skillName}
              onChange={(event) => setSkillName(event.target.value)}
              placeholder="Skill (e.g. customer discovery)"
              className={inputClass}
              aria-label="Required skill"
            />
            <input
              value={skillWhy}
              onChange={(event) => setSkillWhy(event.target.value)}
              placeholder="Why the venture needs it"
              className={inputClass}
              aria-label="Why"
            />
            <div className="grid grid-cols-2 gap-2">
              <select
                value={skillImportance}
                onChange={(event) => setSkillImportance(event.target.value as '1' | '2' | '3')}
                className={inputClass}
                aria-label="Importance"
              >
                <option value="1">Importance 1 — helpful</option>
                <option value="2">Importance 2 — important</option>
                <option value="3">Importance 3 — venture fails without it</option>
              </select>
              <select
                value={skillTarget}
                onChange={(event) =>
                  setSkillTarget(event.target.value as 'aware' | 'working' | 'expert')
                }
                className={inputClass}
                aria-label="Target level"
              >
                <option value="aware">Aware</option>
                <option value="working">Working</option>
                <option value="expert">Expert</option>
              </select>
            </div>
            <button
              onClick={addRequirement}
              className="w-full flex items-center justify-center space-x-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-semibold hover:opacity-90"
            >
              <UserPlus2 className="w-3.5 h-3.5" />
              <span>Add requirement</span>
            </button>
            {skillError && <p className="text-[11px] text-rose-600">{skillError}</p>}
          </div>
        </div>
      </div>

      {summary.criticalGaps.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 rounded-xl p-4">
          <h2 className="text-xs font-semibold text-amber-900 dark:text-amber-200 flex items-center space-x-2">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Gaps worth naming out loud</span>
          </h2>
          <ul className="mt-2 space-y-1 text-[11px] text-amber-800 dark:text-amber-300">
            {summary.criticalGaps.map((gap) => (
              <li key={gap.requirement.id}>
                {gap.requirement.skill} — best current level{' '}
                {proficiencyLabel(gap.bestLevel)}. Decide: learn it, hire it, contract it, or
                drop it from the plan.
              </li>
            ))}
          </ul>
        </div>
      )}

      {coverage.length > 0 && summary.covered === summary.requirements && (
        <p className="text-[11px] text-emerald-700 dark:text-emerald-400 flex items-center space-x-1.5">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Every requirement is covered at the level you set.</span>
        </p>
      )}
    </div>
  );
};

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
