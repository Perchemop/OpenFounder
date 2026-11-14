import { describe, expect, it } from 'vitest';
import type { AIProviderConfig } from '../types';
import {
  PROVIDER_PRESETS,
  applyPreset,
  detectProviderFromKey,
  getPreset,
  listPresets,
  resolvePresetForConfig,
  type ProviderPreset,
} from './providerCatalog';

function minimalConfig(overrides: Partial<AIProviderConfig> = {}): AIProviderConfig {
  return {
    activeProvider: 'offline_rules',
    providerId: 'offline_rules',
    temperature: 0.7,
    maxTokens: 2048,
    telemetryEnabled: false,
    storeKeysLocally: false,
    ...overrides,
  };
}

describe('provider catalogue', () => {
  it('lists offline rules plus at least the NVIDIA suite and OpenRouter', () => {
    const ids = PROVIDER_PRESETS.map((p) => p.id);
    expect(ids).toContain('offline_rules');
    expect(ids).toContain('nvidia');
    expect(ids).toContain('openrouter');
    expect(ids).toContain('groq');
    expect(ids).toContain('anthropic');
    expect(ids).toContain('gemini');
    expect(ids).toContain('ollama');
  });

  it('detects NVIDIA from an nvapi- key', () => {
    const preset = detectProviderFromKey('nvapi-xyz123...');
    expect(preset?.id).toBe('nvidia');
    expect(preset?.label).toContain('NVIDIA');
    expect(preset?.baseUrl).toBe('https://integrate.api.nvidia.com/v1');
  });

  it('detects Anthropic from sk-ant- and does not confuse it with generic sk-', () => {
    expect(detectProviderFromKey('sk-ant-abc123')?.id).toBe('anthropic');
    expect(detectProviderFromKey('sk-proj-abc123')?.id).toBe('openai');
    expect(detectProviderFromKey('sk-or-v1-abc123')?.id).toBe('openrouter');
    expect(detectProviderFromKey('gsk_abc123')?.id).toBe('groq');
    expect(detectProviderFromKey('AIzaSyABC123')?.id).toBe('gemini');
    expect(detectProviderFromKey('sk-abc123')?.id).toBe('openai'); // generic sk- falls to OpenAI
    expect(detectProviderFromKey('not-a-key-format')?.id).toBeNull();
    expect(detectProviderFromKey('abcd')).toBeNull();
    expect(detectProviderFromKey('')).toBeNull();
    expect(detectProviderFromKey(undefined)).toBeNull();
  });

  it('getPreset and listPresets are stable', () => {
    expect(getPreset('nvidia')?.id).toBe('nvidia');
    expect(getPreset('no-such-vendor')).toBeUndefined();
    expect(listPresets().length).toBeGreaterThan(10);
  });

  it('applyPreset seeds endpoint, model and key from a preset', () => {
    const preset = getPreset('nvidia')!;
    const config = applyPreset(minimalConfig(), preset, 'nvapi-secret');

    expect(config.providerId).toBe('nvidia');
    expect(config.activeProvider).toBe('openai');
    expect(config.openaiEndpoint).toBe(preset.baseUrl);
    expect(config.openaiModel).toBe(preset.defaultModel);
    expect(config.openaiKey).toBe('nvapi-secret');
  });

  it('applyPreset works for non-openai transports', () => {
    const config = applyPreset(minimalConfig(), getPreset('anthropic')!, 'sk-ant-secret');
    expect(config.activeProvider).toBe('anthropic');
    expect(config.anthropicKey).toBe('sk-ant-secret');

    const gemini = applyPreset(minimalConfig(), getPreset('gemini')!, 'AIza-secret');
    expect(gemini.activeProvider).toBe('direct_gemini');
    expect(gemini.directGeminiKey).toBe('AIza-secret');
  });

  it('resolvePresetForConfig recovers the vendor from a stored endpoint', () => {
    const config = minimalConfig();
    config.activeProvider = 'openai';
    config.providerId = undefined;
    config.openaiEndpoint = 'https://integrate.api.nvidia.com/v1/chat/completions';
    expect(resolvePresetForConfig(config)?.id).toBe('nvidia');

    const offline = minimalConfig();
    expect(resolvePresetForConfig(offline)?.id).toBe('offline_rules');
  });
});
