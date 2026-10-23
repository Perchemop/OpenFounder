import { keyResultProgress } from './okr';
import type {
  Competitor,
  CustomerInterview,
  EvidenceItem,
  Experiment,
  FeatureItem,
  ResearchSource,
  RiskItem,
  RoadmapItem,
  Objective,
  Advisor,
} from '../types';

/**
 * Tabs a search result can open. Deliberately narrower than `WorkspaceTab`
 * so this module stays free of UI imports; every member is a valid
 * `WorkspaceTab`.
 */
export type SearchTab =
  | 'evidence'
  | 'research'
  | 'interviews'
  | 'risks'
  | 'roadmap'
  | 'goals'
  | 'advisors'
  | 'competitors'
  | 'validation'
  | 'mvp';

export type WorkspaceSearchKind =
  | 'evidence'
  | 'research'
  | 'interview'
  | 'risk'
  | 'roadmap'
  | 'objective'
  | 'advisor'
  | 'experiment'
  | 'competitor'
  | 'feature';

export interface WorkspaceSearchData {
  evidence?: readonly EvidenceItem[];
  research?: readonly ResearchSource[];
  interviews?: readonly CustomerInterview[];
  risks?: readonly RiskItem[];
  roadmap?: readonly RoadmapItem[];
  objectives?: readonly Objective[];
  advisors?: readonly Advisor[];
  experiments?: readonly Experiment[];
  competitors?: readonly Competitor[];
  features?: readonly FeatureItem[];
}

export interface WorkspaceSearchResult {
  id: string;
  kind: WorkspaceSearchKind;
  tab: SearchTab;
  /** Main line shown in the palette. */
  title: string;
  /** Secondary line: status, category, or a short excerpt. */
  detail: string;
  score: number;
}

export interface WorkspaceSearchGroup {
  kind: WorkspaceSearchKind;
  label: string;
  tab: SearchTab;
  items: WorkspaceSearchResult[];
}

interface Candidate {
  id: string;
  kind: WorkspaceSearchKind;
  tab: SearchTab;
  title: string;
  detail: string;
  body: string;
}

const GROUP_ORDER: ReadonlyArray<Pick<WorkspaceSearchGroup, 'kind' | 'label' | 'tab'>> = [
  { kind: 'evidence', label: 'Evidence claims', tab: 'evidence' },
  { kind: 'research', label: 'Research sources', tab: 'research' },
  { kind: 'interview', label: 'Interviews', tab: 'interviews' },
  { kind: 'risk', label: 'Risks', tab: 'risks' },
  { kind: 'roadmap', label: 'Roadmap', tab: 'roadmap' },
  { kind: 'objective', label: 'Objectives', tab: 'goals' },
  { kind: 'advisor', label: 'Advisors', tab: 'advisors' },
  { kind: 'experiment', label: 'Experiments', tab: 'validation' },
  { kind: 'competitor', label: 'Competitors', tab: 'competitors' },
  { kind: 'feature', label: 'Features', tab: 'mvp' },
];

const MIN_QUERY_LENGTH = 2;
const TITLE_TOKEN_WEIGHT = 3;
const BODY_TOKEN_WEIGHT = 1;
const FULL_TITLE_MATCH_BONUS = 4;

function normalise(value: string | undefined | null): string {
  return (value ?? '').toLowerCase();
}

function joinText(...parts: Array<string | string[] | undefined | null>): string {
  return parts
    .map((part) => (Array.isArray(part) ? part.join(' ') : (part ?? '')))
    .join(' ')
    .toLowerCase();
}

function buildCandidates(data: WorkspaceSearchData): Candidate[] {
  const candidates: Candidate[] = [];

  for (const item of data.evidence ?? []) {
    candidates.push({
      id: item.id,
      kind: 'evidence',
      tab: 'evidence',
      title: item.claim,
      detail: `${item.status.replace(/_/g, ' ')} · ${item.type.replace(/_/g, ' ')}`,
      body: joinText(item.evidenceNotes, item.sourceTitle, item.sourceUrl, item.nextTest),
    });
  }

  for (const item of data.research ?? []) {
    candidates.push({
      id: item.id,
      kind: 'research',
      tab: 'research',
      title: item.title,
      detail: [item.publisherOrDomain, item.category.replace(/_/g, ' ')]
        .filter(Boolean)
        .join(' · '),
      body: joinText(item.summary, item.keyFindings, item.notes, item.publisherOrDomain),
    });
  }

  for (const item of data.interviews ?? []) {
    candidates.push({
      id: item.id,
      kind: 'interview',
      tab: 'interviews',
      title: item.intervieweeIdentifier,
      detail: [item.participantRole, item.severityRating].filter(Boolean).join(' · '),
      body: joinText(
        item.objectives,
        item.notesOrTranscript,
        item.recurringPainPoints,
        item.verbatimQuotes,
        item.existingWorkarounds,
        item.willingnessToPayNotes,
        item.surprisesOrObjections
      ),
    });
  }

  for (const item of data.risks ?? []) {
    candidates.push({
      id: item.id,
      kind: 'risk',
      tab: 'risks',
      title: item.title,
      detail: `${item.status} · ${item.probability} probability × ${item.impact} impact`,
      body: joinText(item.mitigation, item.evidenceNotes, item.nextTest, item.category),
    });
  }

  for (const item of data.roadmap ?? []) {
    candidates.push({
      id: item.id,
      kind: 'roadmap',
      tab: 'roadmap',
      title: item.title,
      detail: `${item.status.replace(/_/g, ' ')} · ${item.priority} priority`,
      body: joinText(item.objective, item.evidenceRequired, item.owner),
    });
  }

  for (const item of data.objectives ?? []) {
    const met = item.keyResults.filter((keyResult) => keyResultProgress(keyResult) >= 100).length;
    candidates.push({
      id: item.id,
      kind: 'objective',
      tab: 'goals',
      title: item.title,
      detail: `${item.status} · ${met}/${item.keyResults.length} key results met`,
      body: joinText(item.description, item.owner, item.timeframe, item.keyResults.map((keyResult) => keyResult.title)),
    });
  }

  for (const item of data.advisors ?? []) {
    const sessionCount = item.sessions.length;
    const open = item.sessions
      .flatMap((session) => session.commitments)
      .filter((commitment) => commitment.status === 'open').length;
    candidates.push({
      id: item.id,
      kind: 'advisor',
      tab: 'advisors',
      title: item.name,
      detail: [item.role, `${sessionCount} sessions`, open > 0 ? `${open} open` : undefined]
        .filter(Boolean)
        .join(' · '),
      body: joinText(
        item.organisation,
        item.contact,
        item.expertise,
        item.notes,
        item.sessions.map((session) => `${session.topic} ${session.adviceGiven}`)
      ),
    });
  }

  for (const item of data.experiments ?? []) {
    candidates.push({
      id: item.id,
      kind: 'experiment',
      tab: 'validation',
      title: item.hypothesis,
      detail: `${item.status} · ${item.method.replace(/_/g, ' ')}`,
      body: joinText(
        item.successCriteria,
        item.failureCriteria,
        item.resultSummary,
        item.results,
        item.decisionTaken
      ),
    });
  }

  for (const item of data.competitors ?? []) {
    candidates.push({
      id: item.id,
      kind: 'competitor',
      tab: 'competitors',
      title: item.name,
      detail: item.pricingModel,
      body: joinText(
        item.productDescription,
        item.positioning,
        item.targetAudience,
        item.strengths,
        item.weaknesses,
        item.customerComplaints
      ),
    });
  }

  for (const item of data.features ?? []) {
    candidates.push({
      id: item.id,
      kind: 'feature',
      tab: 'mvp',
      title: item.title,
      detail: `${item.priority.toUpperCase()} · ${item.status.replace(/_/g, ' ')}`,
      body: joinText(item.description, item.solvesProblem),
    });
  }

  return candidates;
}

function scoreCandidate(candidate: Candidate, query: string, tokens: string[]): number {
  const title = normalise(candidate.title);
  const body = candidate.body;
  let score = title.includes(query) ? FULL_TITLE_MATCH_BONUS : 0;

  for (const token of tokens) {
    if (title.includes(token)) score += TITLE_TOKEN_WEIGHT;
    if (body.includes(token)) score += BODY_TOKEN_WEIGHT;
  }

  return score;
}

function matchesAllTokens(candidate: Candidate, tokens: string[]): boolean {
  const haystack = `${normalise(candidate.title)} ${normalise(candidate.detail)} ${candidate.body}`;
  return tokens.every((token) => haystack.includes(token));
}

/**
 * Full-text search across the workspace entities that are not pages.
 *
 * Rules:
 * - Queries shorter than two characters return nothing (avoids noise while
 *   the founder is still typing).
 * - Matching is case-insensitive and tokenised: every whitespace-separated
 *   token must appear in the title, detail, or body.
 * - Title matches rank above body matches.
 * - At most `limitPerKind` results are returned per entity type, so one large
 *   table cannot crowd out the others in the command palette.
 */
export function searchWorkspace(
  query: string,
  data: WorkspaceSearchData,
  limitPerKind = 3
): WorkspaceSearchResult[] {
  const trimmed = query.trim().toLowerCase();
  if (trimmed.length < MIN_QUERY_LENGTH) return [];

  const tokens = trimmed.split(/\s+/).filter(Boolean);
  const candidates = buildCandidates(data).filter((candidate) =>
    matchesAllTokens(candidate, tokens)
  );

  const scored: WorkspaceSearchResult[] = candidates.map((candidate) => ({
    id: candidate.id,
    kind: candidate.kind,
    tab: candidate.tab,
    title: candidate.title,
    detail: candidate.detail,
    score: scoreCandidate(candidate, trimmed, tokens),
  }));

  const perKind = new Map<WorkspaceSearchKind, WorkspaceSearchResult[]>();
  for (const result of scored.sort((a, b) => b.score - a.score || a.title.localeCompare(b.title))) {
    const bucket = perKind.get(result.kind) ?? [];
    if (bucket.length < limitPerKind) {
      bucket.push(result);
      perKind.set(result.kind, bucket);
    }
  }

  return GROUP_ORDER.flatMap((group) => perKind.get(group.kind) ?? []);
}

/** Groups results for display, in a stable order, dropping empty groups. */
export function groupSearchResults(results: readonly WorkspaceSearchResult[]): WorkspaceSearchGroup[] {
  return GROUP_ORDER.map((group) => ({
    ...group,
    items: results.filter((result) => result.kind === group.kind),
  })).filter((group) => group.items.length > 0);
}
