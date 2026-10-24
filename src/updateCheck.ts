/**
 * Update check against GitHub Releases. The app is a static site, so this
 * must fail soft: offline, rate-limited, or malformed responses all mean
 * "we do not know", never "up to date" and never an error dialog.
 */

export const CURRENT_APP_VERSION = '1.0.0';
export const RELEASE_REPOSITORY = 'Perchemop/OpenFounder';
export const RELEASES_URL = `https://api.github.com/repos/${RELEASE_REPOSITORY}/releases`;

export type UpdateState =
  | { status: 'unknown'; reason: 'not_checked' | 'offline' | 'error'; detail?: string }
  | { status: 'checking' }
  | { status: 'up_to_date'; current: string; latest: string }
  | { status: 'update_available'; current: string; latest: string; url: string; notes?: string };

export interface ReleaseInfo {
  tagName: string;
  htmlUrl: string;
  body?: string;
  prerelease: boolean;
}

/** Parses `v1.2.3` (or `1.2.3`) into numbers. Returns null for non-semver tags. */
export function parseVersion(tag: string): [number, number, number] | null {
  const match = tag.trim().replace(/^v/i, '').match(/^(\d+)\.(\d+)\.(\d+)(?:[-+].*)?$/);
  if (!match) return null;
  return [Number(match[1]), Number(match[2]), Number(match[3])];
}

/** Negative when a is older, 0 when equal, positive when a is newer. */
export function compareVersions(a: string, b: string): number | null {
  const left = parseVersion(a);
  const right = parseVersion(b);
  if (!left || !right) return null;
  for (let index = 0; index < 3; index += 1) {
    if (left[index] !== right[index]) return left[index] - right[index];
  }
  return 0;
}

/** Picks the newest stable release, ignoring drafts and pre-releases. */
export function selectLatestStable(releases: readonly ReleaseInfo[]): ReleaseInfo | null {
  let best: { info: ReleaseInfo; version: [number, number, number] } | null = null;

  for (const info of releases) {
    if (info.prerelease) continue;
    const version = parseVersion(info.tagName);
    if (!version) continue;

    if (!best) {
      best = { info, version };
      continue;
    }
    if (compareVersions(info.tagName, best.info.tagName)! > 0) {
      best = { info, version };
    }
  }

  return best?.info ?? null;
}

export function evaluateUpdate(current: string, release: ReleaseInfo | null): UpdateState {
  if (!release) return { status: 'unknown', reason: 'error', detail: 'No stable release published yet.' };

  const comparison = compareVersions(current, release.tagName);
  if (comparison === null) {
    return { status: 'unknown', reason: 'error', detail: `Unreadable version in ${release.tagName}.` };
  }
  if (comparison >= 0) return { status: 'up_to_date', current, latest: release.tagName };
  return {
    status: 'update_available',
    current,
    latest: release.tagName,
    url: release.htmlUrl,
    notes: release.body,
  };
}

/** Maps a raw fetch into the shape the rest of the app consumes. */
export function releaseFromJson(raw: unknown): ReleaseInfo | null {
  if (!raw || typeof raw !== 'object') return null;
  const record = raw as Record<string, unknown>;
  if (typeof record.tag_name !== 'string' || typeof record.html_url !== 'string') return null;
  return {
    tagName: record.tag_name,
    htmlUrl: record.html_url,
    body: typeof record.body === 'string' ? record.body : undefined,
    prerelease: record.prerelease === true,
  };
}

export const UPDATE_CACHE_KEY = 'openfounder_update_check_v1';
const CACHE_TTL_MS = 60 * 60 * 1000;

export interface CachedCheck {
  latestTag: string | null;
  checkedAt: number;
}

export function readCache(now: number): CachedCheck | null {
  try {
    const raw = localStorage.getItem(UPDATE_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedCheck;
    if (typeof parsed?.checkedAt !== 'number') return null;
    if (now - parsed.checkedAt > CACHE_TTL_MS) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeCache(latestTag: string | null, now: number): void {
  try {
    const payload: CachedCheck = { latestTag, checkedAt: now };
    localStorage.setItem(UPDATE_CACHE_KEY, JSON.stringify(payload));
  } catch {
    // A full or unavailable localStorage must never break the app.
  }
}

export interface UpdateCheckerOptions {
  current?: string;
  fetchImpl?: typeof fetch;
  now?: () => number;
}

/**
 * Checks for an update, failing soft. Network failures, non-JSON responses, and
 * API errors all resolve to `unknown`, which callers render as "could not check".
 */
export async function checkForUpdate(options: UpdateCheckerOptions = {}): Promise<UpdateState> {
  const { current = CURRENT_APP_VERSION, fetchImpl = fetch, now = () => Date.now() } = options;

  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    return { status: 'unknown', reason: 'offline', detail: 'You are offline.' };
  }

  try {
    const response = await fetchImpl(`${RELEASES_URL}?per_page=10`, {
      headers: { Accept: 'application/vnd.github+json' },
    });
    if (!response.ok) {
      return { status: 'unknown', reason: 'error', detail: `GitHub responded ${response.status}.` };
    }

    const releases = (await response.json()) as unknown;
    if (!Array.isArray(releases)) {
      return { status: 'unknown', reason: 'error', detail: 'Unexpected response shape.' };
    }

    const latest = selectLatestStable(
      releases.map(releaseFromJson).filter((release): release is ReleaseInfo => release !== null)
    );
    const state = evaluateUpdate(current, latest);
    writeCache(latest?.tagName ?? null, now());
    return state;
  } catch (error) {
    return {
      status: 'unknown',
      reason: 'error',
      detail: error instanceof Error ? error.message : 'Unknown failure.',
    };
  }
}

export function describeUpdateState(state: UpdateState): string {
  switch (state.status) {
    case 'up_to_date':
      return `Up to date (${state.latest})`;
    case 'update_available':
      return `${state.latest} available`;
    case 'checking':
      return 'Checking…';
    default:
      return 'Update check unavailable';
  }
}
