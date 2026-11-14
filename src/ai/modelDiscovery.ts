import { fetchWithTimeout, DEFAULT_AI_TIMEOUT_MS } from './http';
import type { ProviderPreset } from './providerCatalog';

/**
 * Ask a provider which models the key can actually use.
 *
 * This is what removes the last "intricate detail" from setup: instead of
 * making someone copy a model id from a documentation page, the app lists the
 * models the key is entitled to and they pick one. It is strictly best-effort —
 * a failed lookup returns an empty list and the UI falls back to the curated
 * presets, so a network hiccup never blocks setup.
 */
export async function fetchProviderModels(
  preset: ProviderPreset,
  key: string,
  timeoutMs: number = DEFAULT_AI_TIMEOUT_MS
): Promise<string[]> {
  try {
    switch (preset.transport) {
      case 'openai': {
        if (!preset.baseUrl || !key) return [];
        const res = await fetchWithTimeout(
          `${preset.baseUrl.replace(/\/$/, '')}/models`,
          { headers: { Authorization: `Bearer ${key}` } },
          timeoutMs
        );
        if (!res.ok) return [];
        const data = (await res.json()) as { data?: Array<{ id?: string }> };
        return uniqueSorted(data.data?.map((m) => m.id).filter((id): id is string => Boolean(id)) ?? []);
      }

      case 'anthropic': {
        if (!key) return [];
        const res = await fetchWithTimeout(
          'https://api.anthropic.com/v1/models',
          {
            headers: {
              'x-api-key': key,
              'anthropic-version': '2023-06-01',
              'anthropic-dangerous-direct-browser-access': 'true',
            },
          },
          timeoutMs
        );
        if (!res.ok) return [];
        const data = (await res.json()) as { data?: Array<{ id?: string }> };
        return uniqueSorted(data.data?.map((m) => m.id).filter((id): id is string => Boolean(id)) ?? []);
      }

      case 'gemini': {
        if (!key) return [];
        const res = await fetchWithTimeout(
          `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(key)}&pageSize=200`,
          {},
          timeoutMs
        );
        if (!res.ok) return [];
        const data = (await res.json()) as {
          models?: Array<{ name?: string; supportedGenerationMethods?: string[] }>;
        };
        const ids = (data.models ?? [])
          .filter(
            (m) =>
              !m.supportedGenerationMethods ||
              m.supportedGenerationMethods.includes('generateContent')
          )
          .map((m) => (m.name || '').replace(/^models\//, ''))
          .filter(Boolean);
        return uniqueSorted(ids);
      }

      case 'ollama': {
        if (!preset.baseUrl) return [];
        const res = await fetchWithTimeout(
          `${preset.baseUrl.replace(/\/$/, '')}/api/tags`,
          {},
          timeoutMs
        );
        if (!res.ok) return [];
        const data = (await res.json()) as { models?: Array<{ name?: string }> };
        return uniqueSorted(
          data.models?.map((m) => m.name).filter((id): id is string => Boolean(id)) ?? []
        );
      }

      default:
        return [];
    }
  } catch {
    // Never surface a discovery failure as an error: setup must still work.
    return [];
  }
}

function uniqueSorted(ids: string[]): string[] {
  return Array.from(new Set(ids)).sort((a, b) => a.localeCompare(b));
}
