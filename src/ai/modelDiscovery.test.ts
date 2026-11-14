import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchProviderModels } from './modelDiscovery';
import { PROVIDER_PRESETS } from './providerCatalog';

const nvidia = PROVIDER_PRESETS.find((p) => p.id === 'nvidia')!;
const gemini = PROVIDER_PRESETS.find((p) => p.id === 'gemini')!;
const ollama = PROVIDER_PRESETS.find((p) => p.id === 'ollama')!;
const anthropic = PROVIDER_PRESETS.find((p) => p.id === 'anthropic')!;

let originalFetch: typeof globalThis.fetch;
let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  originalFetch = globalThis.fetch;
  fetchMock = vi.fn();
  globalThis.fetch = fetchMock as unknown as typeof globalThis.fetch;
});

afterEach(() => {
  globalThis.fetch = originalFetch;
  vi.unstubAllMocks();
});

function okResponse(data: unknown): Response {
  return new Response(JSON.stringify(data), { status: 200, statusText: 'OK' });
}

function badResponse(): Response {
  return new Response('Unauthorized', { status: 401, statusText: 'Unauthorized' });
}

describe('model discovery', () => {
  it('lists NVIDIA models from /models with the bearer key', async () => {
    fetchMock.mockResolvedValueOnce(
      okResponse({ data: [{ id: 'meta/llama-3.3-70b-instruct' }, { id: 'nvidia/nemotron' }] })
    );

    const ids = await fetchProviderModels(nvidia, 'nvapi-secret');

    expect(ids).toEqual(['meta/llama-3.3-70b-instruct', 'nvidia/nemotron']);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('https://integrate.api.nvidia.com/v1/models');
    expect(init?.headers).toMatchObject({ Authorization: 'Bearer nvapi-secret' });
  });

  it('deduplicates and sorts', async () => {
    fetchMock.mockResolvedValueOnce(okResponse({ data: [{ id: 'b' }, { id: 'a' }, { id: 'a' }] }));
    const ids = await fetchProviderModels(nvidia, 'nvapi-secret');
    expect(ids).toEqual(['a', 'b']);
  });

  it('returns an empty list when the lookup fails', async () => {
    fetchMock.mockResolvedValueOnce(badResponse());
    const ids = await fetchProviderModels(nvidia, 'nvapi-secret');
    expect(ids).toEqual([]);

    fetchMock.mockRejectedValueOnce(new TypeError('network down'));
    const ids2 = await fetchProviderModels(nvidia, 'nvapi-secret');
    expect(ids2).toEqual([]);
  });

  it('Gemini queries the Google models endpoint with the key in the URL', async () => {
    fetchMock.mockResolvedValueOnce(
      okResponse({
        models: [{ name: 'models/gemini-2.0-flash' }, { name: 'models/gemini-1.5-pro' }],
      })
    );
    const ids = await fetchProviderModels(gemini, 'AIza-secret');
    expect(ids).toEqual(['gemini-1.5-pro', 'gemini-2.0-flash']);
    const [url] = fetchMock.mock.calls[0];
    expect(url).toContain('generativelanguage.googleapis.com/v1beta/models');
    expect(url).toContain('key=AIza-secret');
  });

  it('Anthropic uses x-api-key and the direct-browser header', async () => {
    fetchMock.mockResolvedValueOnce(okResponse({ data: [{ id: 'claude-3-5-sonnet-20241022' }] }));
    const ids = await fetchProviderModels(anthropic, 'sk-ant-secret');
    expect(ids).toEqual(['claude-3-5-sonnet-20241022']);
    const [, init] = fetchMock.mock.calls[0];
    expect(init?.headers).toMatchObject({
      'x-api-key': 'sk-ant-secret',
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    });
  });

  it('Ollama lists models from /api/tags', async () => {
    fetchMock.mockResolvedValueOnce(
      okResponse({ models: [{ name: 'llama3.2' }, { name: 'mistral:latest' }] })
    );
    const ids = await fetchProviderModels(ollama, 'no-key-needed');
    expect(ids).toEqual(['llama3.2', 'mistral:latest']);
    const [url] = fetchMock.mock.calls[0];
    expect(url).toBe('http://localhost:11434/api/tags');
  });
});
