/**
 * Central model defaults and UI presets.
 * Users can override via Settings → AI Providers; values persist in localStorage.
 */

export const DEFAULT_GEMINI_MODEL = 'gemini-2.0-flash';

/** Ordered fallback list when the primary Gemini model is unavailable (429/503). */
export const DEFAULT_GEMINI_FALLBACK_MODELS = [
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
  'gemini-flash-latest',
  'gemini-1.5-flash',
] as const;

export const GEMINI_MODEL_PRESETS = [
  { value: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash (recommended)' },
  { value: 'gemini-2.0-flash-lite', label: 'Gemini 2.0 Flash Lite (faster/cheaper)' },
  { value: 'gemini-flash-latest', label: 'Gemini Flash (latest alias)' },
  { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash' },
  { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro' },
  { value: 'gemini-2.5-flash-preview-05-20', label: 'Gemini 2.5 Flash Preview' },
] as const;

export const OPENAI_MODEL_PRESETS = [
  { value: 'gpt-4o', label: 'GPT-4o' },
  { value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
  { value: 'gpt-4.1', label: 'GPT-4.1' },
  { value: 'gpt-4.1-mini', label: 'GPT-4.1 Mini' },
  { value: 'o4-mini', label: 'o4-mini' },
] as const;

export const ANTHROPIC_MODEL_PRESETS = [
  { value: 'claude-3-5-sonnet-20241022', label: 'Claude 3.5 Sonnet' },
  { value: 'claude-3-5-haiku-20241022', label: 'Claude 3.5 Haiku' },
  { value: 'claude-3-opus-20240229', label: 'Claude 3 Opus' },
  { value: 'claude-sonnet-4-20250514', label: 'Claude Sonnet 4' },
] as const;

export const OLLAMA_MODEL_PRESETS = [
  { value: 'llama3.2', label: 'Llama 3.2' },
  { value: 'llama3.1', label: 'Llama 3.1' },
  { value: 'mistral', label: 'Mistral' },
  { value: 'qwen2.5', label: 'Qwen 2.5' },
  { value: 'phi3', label: 'Phi-3' },
  { value: 'gemma2', label: 'Gemma 2' },
] as const;

/**
 * Build ordered list of Gemini models to try: preferred first, then configured
 * fallbacks, then system defaults — de-duplicated.
 */
export function buildGeminiModelCandidates(
  preferred?: string | null,
  fallbackModels?: string[] | null
): string[] {
  const primary = (preferred || DEFAULT_GEMINI_MODEL).trim();
  const extras = (fallbackModels || []).map((m) => m.trim()).filter(Boolean);
  const defaults = [...DEFAULT_GEMINI_FALLBACK_MODELS];

  const seen = new Set<string>();
  const ordered: string[] = [];
  for (const m of [primary, ...extras, ...defaults]) {
    if (m && !seen.has(m)) {
      seen.add(m);
      ordered.push(m);
    }
  }
  return ordered;
}

/** Parse comma/newline-separated fallback model string from settings UI. */
export function parseFallbackModels(raw: string | undefined | null): string[] {
  if (!raw || !raw.trim()) return [];
  return raw
    .split(/[,\n]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function formatFallbackModels(models: string[] | undefined | null): string {
  if (!models || models.length === 0) return '';
  return models.join(', ');
}
