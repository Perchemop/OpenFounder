/**
 * One HTTP helper for every AI call.
 *
 * Before this existed, no provider had a timeout or an abort path: an
 * unreachable host (or a stalled local Ollama) left the chat composer disabled
 * and every "AI Suggest" button spinning forever, with no way to cancel. Every
 * AI request now goes through `fetchWithTimeout`.
 */

/** Default ceiling for a single AI request. */
export const DEFAULT_AI_TIMEOUT_MS = 45_000;

export class AITimeoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AITimeoutError';
  }
}

/**
 * `fetch` with a hard timeout. If the caller already has an `AbortSignal`, both
 * signals are honoured (whichever fires first aborts the request).
 */
export async function fetchWithTimeout(
  url: string,
  init: RequestInit = {},
  timeoutMs: number = DEFAULT_AI_TIMEOUT_MS
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  const callerSignal = init.signal;
  let signal: AbortSignal = controller.signal;
  if (callerSignal) {
    // AbortSignal.any is available in every browser this app targets; fall back
    // to the timeout signal if it is not.
    const anyFn = (AbortSignal as unknown as { any?: (s: AbortSignal[]) => AbortSignal }).any;
    signal = typeof anyFn === 'function' ? anyFn([callerSignal, controller.signal]) : controller.signal;
  }

  try {
    return await fetch(url, { ...init, signal });
  } catch (err) {
    if ((err as { name?: string } | null)?.name === 'AbortError') {
      throw new AITimeoutError(
        `The request timed out after ${Math.round(timeoutMs / 1000)}s. Check the endpoint and try again.`
      );
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}
