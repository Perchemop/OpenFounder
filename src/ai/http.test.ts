import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchWithTimeout, DEFAULT_AI_TIMEOUT_MS, AITimeoutError } from './http';

let originalFetch: typeof globalThis.fetch;
let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  originalFetch = globalThis.fetch;
  // Non-aborted calls resolve; aborted signals reject with an AbortError so the
  // timeout/abort path in fetchWithTimeout can be exercised without real timers.
  fetchMock = vi.fn((_url: string, init?: RequestInit) => {
    if (init?.signal?.aborted) {
      return Promise.reject(Object.assign(new Error('Aborted'), { name: 'AbortError' }));
    }
    return Promise.resolve(new Response('ok'));
  });
  globalThis.fetch = fetchMock as unknown as typeof globalThis.fetch;
});

afterEach(() => {
  globalThis.fetch = originalFetch;
  vi.restoreAllMocks();
});

describe('fetchWithTimeout', () => {
  it('returns the response for a fast request', async () => {
    const res = await fetchWithTimeout('https://example.com/v1/chat');
    expect(res.ok).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('aborts with AITimeoutError when the request is aborted', async () => {
    const controller = new AbortController();
    controller.abort();
    await expect(
      fetchWithTimeout('https://example.com/v1/chat', { signal: controller.signal })
    ).rejects.toThrow(AITimeoutError);
  });

  it('propagates non-abort fetch errors', async () => {
    fetchMock.mockRejectedValueOnce(new TypeError('network down'));
    await expect(fetchWithTimeout('https://example.com/v1/chat')).rejects.toThrow('network down');
  });

  it('uses the default timeout constant', () => {
    expect(DEFAULT_AI_TIMEOUT_MS).toBe(45_000);
  });
});
