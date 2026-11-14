import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { callServerAutocomplete } from './autoCompleteService';

const loadSettingsMock = vi.fn();
const getAIProviderMock = vi.fn();

import { OfflineRuleBasedProvider } from './providersOffline';

vi.mock('../db', () => ({ loadSettings: () => loadSettingsMock() }));
vi.mock('./providersDispatch', () => ({ getAIProvider: () => getAIProviderMock() }));

let originalFetch: typeof globalThis.fetch;
let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.resetAllMocks();
  originalFetch = globalThis.fetch;
  fetchMock = vi.fn();
  globalThis.fetch = fetchMock as unknown as typeof globalThis.fetch;
});

afterEach(() => {
  globalThis.fetch = originalFetch;
});

const defaultConfig = {
  activeProvider: 'offline_rules',
  providerId: 'offline_rules',
  temperature: 0.7,
  maxTokens: 2048,
  telemetryEnabled: false,
  storeKeysLocally: false,
};

describe('callServerAutocomplete', () => {
  it('offline provider: no network at all, returns null', async () => {
    loadSettingsMock.mockReturnValue(defaultConfig);
    getAIProviderMock.mockReturnValue(new OfflineRuleBasedProvider());

    const result = await callServerAutocomplete(
      'full_project_setup',
      'AI invoicing for plumbers',
      {},
      ['name', 'problemStatement']
    );

    expect(result).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('routes to the chosen provider and returns parsed JSON', async () => {
    loadSettingsMock.mockReturnValue({
      ...defaultConfig,
      activeProvider: 'openai',
      providerId: 'groq',
      openaiKey: 'gsk_secret',
      openaiEndpoint: 'https://api.groq.com/openai/v1',
      openaiModel: 'llama-3.3-70b-versatile',
    });
    getAIProviderMock.mockReturnValue({
      sendMessage: vi.fn().mockResolvedValue({
        reply: '{"name":"PipeDrip","problemStatement":"Plumbers chase late payments for weeks."}',
        error: undefined,
      }),
    });

    const result = await callServerAutocomplete(
      'full_project_setup',
      'plumbing invoicing',
      { name: 'PipeDrip' },
      ['name', 'problemStatement']
    );

    expect(result).toEqual({
      name: 'PipeDrip',
      problemStatement: 'Plumbers chase late payments for weeks.',
    });

    expect(getAIProviderMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('provider error → null, no crash', async () => {
    loadSettingsMock.mockReturnValue({
      ...defaultConfig,
      activeProvider: 'anthropic',
      providerId: 'anthropic',
      anthropicKey: 'sk-ant-secret',
    });
    getAIProviderMock.mockReturnValue({
      sendMessage: vi.fn().mockResolvedValue({ reply: '', error: 'rate limited' }),
    });

    expect(
      await callServerAutocomplete('suggest_field', 'seed', {}, ['suggestion'])
    ).toBeNull();
  });

  it('unparsable reply → null', async () => {
    loadSettingsMock.mockReturnValue(defaultConfig);
    getAIProviderMock.mockReturnValue({
      sendMessage: vi.fn().mockResolvedValue({ reply: 'Hello there!', error: undefined }),
    });
    expect(
      await callServerAutocomplete('suggest_field', 'seed', {}, ['suggestion'])
    ).toBeNull();
  });
});
