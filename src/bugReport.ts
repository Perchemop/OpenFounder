/**
 * Bug-report payload construction. The app has no backend, so a report leaves
 * the machine only as a URL the user opens (or copies) — which means the text
 * has to be scrubbed and bounded *before* it is shown to them.
 */

export interface BugReportPayload {
  title: string;
  body: string;
}

export interface BugReportInput {
  appVersion: string;
  /** Error message, or a short description typed by the user. */
  summary: string;
  /** Free-form notes typed by the user. */
  userNotes?: string;
  /** Stack trace or component stack, if the report came from an error boundary. */
  technicalDetail?: string;
  /** Recent user actions, newest last, as they should be pruned before use. */
  stepsToReproduce?: readonly string[];
  /** Where the error came from, so a maintainer triages faster. */
  origin?: 'error_boundary' | 'manual';
  includeDiagnostics?: boolean;
  diagnostics?: Readonly<Record<string, string>>;
}

const MAX_BODY_LENGTH = 6000;
const MAX_STACK_LINES = 12;

/** Environment lines that never carry user data, so they are safe by default. */
function environmentDiagnostics(input: BugReportInput): Record<string, string> {
  if (input.includeDiagnostics === false) return {};

  const diagnostics: Record<string, string> = {
    'App version': input.appVersion,
    UserAgent: typeof navigator === 'undefined' ? 'unknown' : navigator.userAgent,
    Language: typeof navigator === 'undefined' ? 'unknown' : navigator.language,
    Online: typeof navigator === 'undefined' ? 'unknown' : String(navigator.onLine),
    Timezone: (() => {
      try {
        return Intl.DateTimeFormat().resolvedOptions().timeZone || 'unknown';
      } catch {
        return 'unknown';
      }
    })(),
  };

  for (const [key, value] of Object.entries(input.diagnostics ?? {})) {
    diagnostics[key] = value;
  }

  return diagnostics;
}

/** Drops paths and long numbers from a stack trace, keeping the shape useful. */
function scrubTechnicalDetail(detail: string | undefined): string {
  if (!detail) return '';
  const lines = detail
    .split('\n')
    .filter((line) => line.trim().length > 0)
    .slice(0, MAX_STACK_LINES)
    // Collapse user-specific prefixes while keeping the file and line the
    // maintainer needs.
    .map((line) => line.replace(/\/home\/[^/]+/g, '~').replace(/\b[0-9a-f]{16,}\b/gi, '<id>'))
    .map((line) => (line.length > 200 ? `${line.slice(0, 200)}…` : line));
  return lines.join('\n');
}

function truncateBody(value: string): string {
  const trimmed = value.trimEnd();
  if (trimmed.length <= MAX_BODY_LENGTH) return trimmed;
  return `${trimmed.slice(0, MAX_BODY_LENGTH - 1)}…`;
}

/** One-line title, safe to use as an issue title. */
export function buildBugReportTitle(input: BugReportInput): string {
  const summary = input.summary.trim().replace(/\s+/g, ' ');
  if (!summary) return 'Unexpected problem in OpenFounder';
  const short = summary.length > 80 ? `${summary.slice(0, 79)}…` : summary;
  const origin = input.origin === 'error_boundary' ? 'Crash' : 'Bug';
  return `${origin}: ${short}`;
}

/**
 * Builds the Markdown body of the report, in the order a maintainer reads it:
 * what happened, how to reproduce, what the app environment was, and the
 * technical detail last so it never crowds the human part.
 */
export function buildBugReportBody(input: BugReportInput): string {
  const sections: string[] = [];

  const description = input.userNotes?.trim()
    ? `${input.summary.trim()}\n\n${input.userNotes.trim()}`
    : input.summary.trim() || 'The user did not describe the problem.';
  sections.push(`### What happened\n\n${description}`);

  const steps = (input.stepsToReproduce ?? []).filter((step) => step.trim().length > 0);
  sections.push(
    steps.length > 0
      ? `### Steps to reproduce\n\n${steps.map((step, index) => `${index + 1}. ${step}`).join('\n')}`
      : '### Steps to reproduce\n\n_Not recorded._'
  );

  const diagnostics = environmentDiagnostics(input);
  const diagnosticsLines = Object.entries(diagnostics).map(([key, value]) => `- **${key}:** ${value}`);
  if (diagnosticsLines.length > 0) {
    sections.push(`### Environment\n\n${diagnosticsLines.join('\n')}`);
  }

  const technical = scrubTechnicalDetail(input.technicalDetail);
  if (technical) {
    sections.push(`### Technical detail\n\n\`\`\`\n${technical}\n\`\`\``);
  }

  return truncateBody(sections.join('\n\n'));
}

export function buildBugReport(input: BugReportInput): BugReportPayload {
  return { title: buildBugReportTitle(input), body: buildBugReportBody(input) };
}

/**
 * A pre-filled issue URL. No token is used and none is embedded: the user
 * opens it in their own signed-in session, which keeps the app free of
 * privileged credentials and lets them read the payload before sending.
 */
export function buildIssueUrl(
  payload: BugReportPayload,
  repository: string,
  labels?: readonly string[]
): string {
  const params = new URLSearchParams();
  params.set('title', payload.title);
  params.set('body', payload.body);
  if (labels && labels.length > 0) params.set('labels', labels.join(','));
  return `https://github.com/${repository}/issues/new?${params.toString()}`;
}

export function extractRepository(remoteUrl: string): string | null {
  const match = remoteUrl.match(/github\.com[:/]([\w.-]+)\/([\w.-]+?)(?:\.git)?\/?$/);
  if (!match) return null;
  return `${match[1]}/${match[2]}`;
}
