import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchWithTimeout, DEFAULT_AI_TIMEOUT_MS, AITimeoutError } from './http';

let originalFetch: typeof globalThis.fetch;
let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  originalFetch = globalThis.fetch;
  fetchMock = vi.fn();
  globalThis.fetch = fetchMock as unknown as typeof globalThis.fetch;
  vi.useFakeTimers();
});

afterEach(() => {
  globalThis.fetch = originalFetch;
  vi.useRealTimers();
});

describe('fetchWithTimeout', () => {
  it('returns the response for a fast request', async () => {
    fetchMock.mockResolvedValue(new Response('ok'));
    const promise = fetchWithTimeout('https://example.com/v1/chat');
    vi.advanceTimersByTime(100);
    const res = await promise;
    expect(res.ok).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('aborts with AITimeoutError when the request hangs past the timeout', async () => {
    fetchMock.mockImplementation(() => new Promise(() => {})); // never resolves
    const promise = fetchWithTimeout('https://example.com/v1/chat', {}, 1000);
    vi.advanceTimersByTime(1001);
    await expect(promise).rejects.toThrow(AITimeoutError);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('uses DEFAULT_AI_TIMEOUT_MS when no timeout is given', async () => {
    fetchMock.mockImplementation(() => new Promise(() => {}));
    const promise = fetchWithTimeout('https://example.com/v1/chat');
    vi.advanceTimersByTime(DEFAULT_AI_TIMEOUT_MS);
    await expect(promise).rejects.toThrow(AITimeoutError);
  });

  it('honours a caller-supplied AbortSignal', async () => {
    const controller = new AbortController();
    fetchMock.mockImplementation(() => new Promise(() => {}));
    const promise = fetchWithTimeout(
      'https://example.com/v1/chat',
      { signal: controller.signal },
      10_000
    );
    controller.abort();
    await expect(promise).rejects.toThrow(AITimeoutError);
  });
});
