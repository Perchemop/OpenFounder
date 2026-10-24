import { describe, it, expect, vi } from 'vitest';
import {
  CURRENT_APP_VERSION,
  checkForUpdate,
  compareVersions,
  evaluateUpdate,
  parseVersion,
  releaseFromJson,
  selectLatestStable,
  type ReleaseInfo,
} from './updateCheck';

function release(overrides: Partial<ReleaseInfo> = {}): ReleaseInfo {
  const tagName = overrides.tagName ?? 'v1.0.0';
  return {
    tagName,
    htmlUrl: `https://github.com/Perchemop/OpenFounder/releases/tag/${tagName}`,
    prerelease: false,
    ...overrides,
  };
}

describe('parseVersion', () => {
  it('accepts semver with or without a leading v and with build metadata', () => {
    expect(parseVersion('v1.2.3')).toEqual([1, 2, 3]);
    expect(parseVersion('1.2.3')).toEqual([1, 2, 3]);
    expect(parseVersion('2.0.0-rc.1')).toEqual([2, 0, 0]);
  });

  it('rejects non-semver tags', () => {
    expect(parseVersion('nightly')).toBeNull();
    expect(parseVersion('1.2')).toBeNull();
    expect(parseVersion('')).toBeNull();
  });
});

describe('compareVersions', () => {
  it('orders by major, then minor, then patch', () => {
    expect(compareVersions('v1.0.0', 'v1.0.1')).toBeLessThan(0);
    expect(compareVersions('v1.2.0', 'v1.1.9')).toBeGreaterThan(0);
    expect(compareVersions('v2.0.0', 'v1.9.9')).toBeGreaterThan(0);
    expect(compareVersions('v1.0.0', 'v1.0.0')).toBe(0);
  });

  it('returns null when either side is not semver', () => {
    expect(compareVersions('v1.0.0', 'latest')).toBeNull();
  });
});

describe('selectLatestStable', () => {
  it('picks the newest stable release', () => {
    const releases = [
      release({ tagName: 'v0.9.0' }),
      release({ tagName: 'v1.1.0' }),
      release({ tagName: 'v1.0.0' }),
    ];
    expect(selectLatestStable(releases)?.tagName).toBe('v1.1.0');
  });

  it('ignores pre-releases and non-semver tags', () => {
    const releases = [
      release({ tagName: 'v2.0.0-rc.1', prerelease: true }),
      release({ tagName: 'nightly-build', prerelease: true }),
      release({ tagName: 'nonsense' }),
      release({ tagName: 'v1.0.0' }),
    ];
    expect(selectLatestStable(releases)?.tagName).toBe('v1.0.0');
  });

  it('returns null when there is nothing usable', () => {
    expect(selectLatestStable([])).toBeNull();
    expect(selectLatestStable([release({ tagName: 'v1.0.0-rc.1', prerelease: true })])).toBeNull();
  });
});

describe('evaluateUpdate', () => {
  it('reports up to date when current matches or exceeds latest', () => {
    expect(evaluateUpdate('v1.0.0', release())).toMatchObject({ status: 'up_to_date' });
    expect(evaluateUpdate('v1.2.0', release({ tagName: 'v1.0.0' }))).toMatchObject({
      status: 'up_to_date',
    });
  });

  it('reports an available update with the release URL', () => {
    const state = evaluateUpdate('v1.0.0', release({ tagName: 'v1.3.0', body: 'Notes' }));
    expect(state).toMatchObject({
      status: 'update_available',
      latest: 'v1.3.0',
      url: 'https://github.com/Perchemop/OpenFounder/releases/tag/v1.3.0',
      notes: 'Notes',
    });
  });

  it('fails to unknown rather than guessing', () => {
    expect(evaluateUpdate('1.0.0', null)).toMatchObject({ status: 'unknown' });
    expect(evaluateUpdate(CURRENT_APP_VERSION, release({ tagName: 'not-a-version' }))).toMatchObject({
      status: 'unknown',
    });
  });
});

describe('releaseFromJson', () => {
  it('maps the fields the checker needs', () => {
    expect(
      releaseFromJson({ tag_name: 'v1.1.0', html_url: 'https://x', body: 'b', prerelease: true })
    ).toEqual({ tagName: 'v1.1.0', htmlUrl: 'https://x', body: 'b', prerelease: true });
  });

  it('returns null for malformed payloads', () => {
    expect(releaseFromJson({ tag_name: 5 })).toBeNull();
    expect(releaseFromJson(null)).toBeNull();
    expect(releaseFromJson({ html_url: 'x' })).toBeNull();
  });
});

describe('checkForUpdate', () => {
  const payload = [
    { tag_name: 'v1.0.0', html_url: 'https://github.com/x/releases/tag/v1.0.0', prerelease: false },
    { tag_name: 'v1.2.0', html_url: 'https://github.com/x/releases/tag/v1.2.0', prerelease: false },
  ];

  it('resolves up to date from a real fetch', async () => {
    const fetchImpl = vi.fn(async () =>
      new Response(JSON.stringify(payload), { status: 200, headers: { 'Content-Type': 'application/json' } })
    ) as unknown as typeof fetch;

    await expect(checkForUpdate({ current: 'v1.2.0', fetchImpl })).resolves.toMatchObject({
      status: 'up_to_date',
    });
  });

  it('reports an available update', async () => {
    const fetchImpl = vi.fn(async () =>
      new Response(JSON.stringify(payload), { status: 200 })
    ) as unknown as typeof fetch;

    await expect(checkForUpdate({ current: 'v1.0.0', fetchImpl })).resolves.toMatchObject({
      status: 'update_available',
      latest: 'v1.2.0',
    });
  });

  it('fails soft on a non-OK response', async () => {
    const fetchImpl = vi.fn(async () => new Response('forbidden', { status: 403 })) as unknown as typeof fetch;
    await expect(checkForUpdate({ fetchImpl })).resolves.toMatchObject({
      status: 'unknown',
      reason: 'error',
    });
  });

  it('fails soft on a network error', async () => {
    const fetchImpl = vi.fn(async () => {
      throw new Error('offline');
    }) as unknown as typeof fetch;
    await expect(checkForUpdate({ fetchImpl })).resolves.toMatchObject({
      status: 'unknown',
      reason: 'error',
      detail: 'offline',
    });
  });

  it('fails soft on a non-array payload', async () => {
    const fetchImpl = vi.fn(async () =>
      new Response(JSON.stringify({ message: 'nope' }), { status: 200 })
    ) as unknown as typeof fetch;
    await expect(checkForUpdate({ fetchImpl })).resolves.toMatchObject({
      status: 'unknown',
      reason: 'error',
    });
  });

  it('asks for the releases endpoint and accepts GitHub JSON', async () => {
    const fetchImpl = vi.fn(async () => new Response('[]', { status: 200 })) as unknown as typeof fetch;
    await checkForUpdate({ fetchImpl });
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    const [url, init] = (fetchImpl as unknown as { mock: { calls: unknown[] } }).mock.calls[0] as [
      string,
      RequestInit
    ];
    expect(url).toContain('/releases');
    expect((init.headers as Record<string, string>).Accept).toBe('application/vnd.github+json');
  });
});
