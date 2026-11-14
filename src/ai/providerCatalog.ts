import type { AIProviderConfig } from '../types';

/**
 * The catalogue of AI providers the app can talk to, and the rules that let a
 * person set one up by pasting a single key.
 *
 * Design goal (owner request): a user should never have to know a base URL, a
 * model id, or the difference between an "OpenAI-compatible" and a "native"
 * API. They paste a key; the app recognises the vendor from the key's prefix,
 * fills in the endpoint and a sensible model, and offers the vendor's live
 * model list. That is the pattern Cline, VS Code's BYOK picker and LibreChat
 * all converged on.
 *
 * Almost every vendor exposes the same wire format as OpenAI, so they all share
 * one transport (`openai`) and differ only by base URL and model ids. Gemini,
 * Anthropic and Ollama keep their own transports because their APIs differ.
 */

export type ProviderTransport = 'openai' | 'anthropic' | 'gemini' | 'ollama' | 'server' | 'offline';

export interface ModelOption {
  value: string;
  label: string;
}

export interface ProviderPreset {
  /** Stable id stored in settings. */
  id: string;
  /** What the user sees. */
  label: string;
  transport: ProviderTransport;
  /** Which provider implementation dispatches the request. */
  activeProvider: AIProviderConfig['activeProvider'];
  /** Base URL for OpenAI-compatible / Ollama transports. */
  baseUrl?: string;
  /** A good starting model id. */
  defaultModel?: string;
  /** A short, curated model list shown before (or instead of) a live fetch. */
  modelPresets: ModelOption[];
  /**
   * Key prefixes that identify this vendor. Longest match wins, so `sk-ant-`
   * beats `sk-`.
   */
  keyPrefixes: string[];
  /** Where the user gets a key. */
  keyUrl?: string;
  /** A one-line, human explanation shown under the field. */
  note?: string;
  /** False only for the offline engine and the self-hosted server. */
  needsKey: boolean;
  /** Whether the key is sent from the browser straight to the vendor. */
  browserDirect: boolean;
}

export const PROVIDER_PRESETS: ProviderPreset[] = [
  {
    id: 'offline_rules',
    label: 'Built-in offline assistant (no key)',
    transport: 'offline',
    activeProvider: 'offline_rules',
    modelPresets: [],
    keyPrefixes: [],
    needsKey: false,
    browserDirect: false,
    note: 'Deterministic templates that run entirely in your browser. Nothing is sent anywhere. This is the default.',
  },
  {
    id: 'nvidia',
    label: 'NVIDIA NIM',
    transport: 'openai',
    activeProvider: 'openai',
    baseUrl: 'https://integrate.api.nvidia.com/v1',
    defaultModel: 'meta/llama-3.3-70b-instruct',
    modelPresets: [
      { value: 'meta/llama-3.3-70b-instruct', label: 'Llama 3.3 70B Instruct' },
      { value: 'nvidia/llama-3.3-nemotron-super-49b-v1', label: 'Nemotron Super 49B (NVIDIA)' },
      { value: 'meta/llama-3.1-8b-instruct', label: 'Llama 3.1 8B (fast)' },
      { value: 'deepseek-ai/deepseek-r1', label: 'DeepSeek R1 (reasoning)' },
      { value: 'mistralai/mistral-nemo-12b-instruct', label: 'Mistral NeMo 12B' },
    ],
    keyPrefixes: ['nvapi-'],
    keyUrl: 'https://build.nvidia.com/',
    note: 'NVIDIA hosts 100+ models behind one key, with a free developer tier.',
    needsKey: true,
    browserDirect: true,
  },
  {
    id: 'openrouter',
    label: 'OpenRouter',
    transport: 'openai',
    activeProvider: 'openai',
    baseUrl: 'https://openrouter.ai/api/v1',
    defaultModel: 'meta-llama/llama-3.3-70b-instruct',
    modelPresets: [
      { value: 'meta-llama/llama-3.3-70b-instruct', label: 'Llama 3.3 70B' },
      { value: 'anthropic/claude-3.5-sonnet', label: 'Claude 3.5 Sonnet' },
      { value: 'openai/gpt-4o-mini', label: 'GPT-4o mini' },
      { value: 'google/gemini-flash-1.5', label: 'Gemini Flash 1.5' },
      { value: 'deepseek/deepseek-chat', label: 'DeepSeek Chat' },
    ],
    keyPrefixes: ['sk-or-v1-', 'sk-or-'],
    keyUrl: 'https://openrouter.ai/keys',
    note: 'One key reaches models from most labs. Routes and bills through OpenRouter.',
    needsKey: true,
    browserDirect: true,
  },
  {
    id: 'groq',
    label: 'Groq',
    transport: 'openai',
    activeProvider: 'openai',
    baseUrl: 'https://api.groq.com/openai/v1',
    defaultModel: 'llama-3.3-70b-versatile',
    modelPresets: [
      { value: 'llama-3.3-70b-versatile', label: 'Llama 3.3 70B Versatile' },
      { value: 'llama-3.1-8b-instant', label: 'Llama 3.1 8B Instant (very fast)' },
      { value: 'mixtral-8x7b-32768', label: 'Mixtral 8x7B' },
    ],
    keyPrefixes: ['gsk_'],
    keyUrl: 'https://console.groq.com/keys',
    note: 'Very fast inference with a generous free tier.',
    needsKey: true,
    browserDirect: true,
  },
  {
    id: 'together',
    label: 'Together AI',
    transport: 'openai',
    activeProvider: 'openai',
    baseUrl: 'https://api.together.xyz/v1',
    defaultModel: 'meta-llama/Llama-3.3-70B-Instruct-Turbo',
    modelPresets: [
      { value: 'meta-llama/Llama-3.3-70B-Instruct-Turbo', label: 'Llama 3.3 70B Turbo' },
      { value: 'Qwen/Qwen2.5-72B-Instruct-Turbo', label: 'Qwen 2.5 72B Turbo' },
      { value: 'mistralai/Mixtral-8x7B-Instruct-v0.1', label: 'Mixtral 8x7B' },
    ],
    keyPrefixes: ['tgp_v1_'],
    keyUrl: 'https://api.together.xyz/settings/api-keys',
    note: 'Open-weight models, OpenAI-compatible.',
    needsKey: true,
    browserDirect: true,
  },
  {
    id: 'fireworks',
    label: 'Fireworks AI',
    transport: 'openai',
    activeProvider: 'openai',
    baseUrl: 'https://api.fireworks.ai/inference/v1',
    defaultModel: 'accounts/fireworks/models/llama-v3p3-70b-instruct',
    modelPresets: [
      {
        value: 'accounts/fireworks/models/llama-v3p3-70b-instruct',
        label: 'Llama 3.3 70B Instruct',
      },
      { value: 'accounts/fireworks/models/deepseek-r1', label: 'DeepSeek R1' },
      { value: 'accounts/fireworks/models/qwen2p5-72b-instruct', label: 'Qwen 2.5 72B' },
    ],
    keyPrefixes: ['fw_'],
    keyUrl: 'https://fireworks.ai/account/api-keys',
    note: 'Open-weight models with a fast inference stack.',
    needsKey: true,
    browserDirect: true,
  },
  {
    id: 'cerebras',
    label: 'Cerebras',
    transport: 'openai',
    activeProvider: 'openai',
    baseUrl: 'https://api.cerebras.ai/v1',
    defaultModel: 'llama-3.3-70b',
    modelPresets: [
      { value: 'llama-3.3-70b', label: 'Llama 3.3 70B' },
      { value: 'llama3.1-8b', label: 'Llama 3.1 8B' },
      { value: 'qwen-3-32b', label: 'Qwen 3 32B' },
    ],
    keyPrefixes: ['csk-'],
    keyUrl: 'https://cloud.cerebras.ai/',
    note: 'Extremely fast inference, OpenAI-compatible.',
    needsKey: true,
    browserDirect: true,
  },
  {
    id: 'mistral',
    label: 'Mistral AI',
    transport: 'openai',
    activeProvider: 'openai',
    baseUrl: 'https://api.mistral.ai/v1',
    defaultModel: 'mistral-large-latest',
    modelPresets: [
      { value: 'mistral-large-latest', label: 'Mistral Large' },
      { value: 'mistral-small-latest', label: 'Mistral Small' },
      { value: 'open-mistral-nemo', label: 'Mistral NeMo' },
    ],
    keyPrefixes: [],
    keyUrl: 'https://console.mistral.ai/api-keys/',
    note: 'EU-hosted models, OpenAI-compatible.',
    needsKey: true,
    browserDirect: true,
  },
  {
    id: 'deepseek',
    label: 'DeepSeek',
    transport: 'openai',
    activeProvider: 'openai',
    baseUrl: 'https://api.deepseek.com/v1',
    defaultModel: 'deepseek-chat',
    modelPresets: [
      { value: 'deepseek-chat', label: 'DeepSeek Chat (V3)' },
      { value: 'deepseek-reasoner', label: 'DeepSeek Reasoner (R1)' },
    ],
    keyPrefixes: [],
    keyUrl: 'https://platform.deepseek.com/api_keys',
    note: 'Low-cost general and reasoning models.',
    needsKey: true,
    browserDirect: true,
  },
  {
    id: 'xai',
    label: 'xAI (Grok)',
    transport: 'openai',
    activeProvider: 'openai',
    baseUrl: 'https://api.x.ai/v1',
    defaultModel: 'grok-2-latest',
    modelPresets: [
      { value: 'grok-2-latest', label: 'Grok 2' },
      { value: 'grok-beta', label: 'Grok Beta' },
    ],
    keyPrefixes: ['xai-'],
    keyUrl: 'https://console.x.ai/',
    note: 'xAI Grok models, OpenAI-compatible.',
    needsKey: true,
    browserDirect: true,
  },
  {
    id: 'perplexity',
    label: 'Perplexity',
    transport: 'openai',
    activeProvider: 'openai',
    baseUrl: 'https://api.perplexity.ai',
    defaultModel: 'sonar',
    modelPresets: [
      { value: 'sonar', label: 'Sonar' },
      { value: 'sonar-pro', label: 'Sonar Pro' },
    ],
    keyPrefixes: ['pplx-'],
    keyUrl: 'https://www.perplexity.ai/settings/api',
    note: 'Answers with web citations.',
    needsKey: true,
    browserDirect: true,
  },
  {
    id: 'openai',
    label: 'OpenAI',
    transport: 'openai',
    activeProvider: 'openai',
    baseUrl: 'https://api.openai.com/v1',
    defaultModel: 'gpt-4o-mini',
    modelPresets: [
      { value: 'gpt-4o-mini', label: 'GPT-4o mini' },
      { value: 'gpt-4o', label: 'GPT-4o' },
      { value: 'gpt-4.1', label: 'GPT-4.1' },
      { value: 'gpt-4.1-mini', label: 'GPT-4.1 mini' },
      { value: 'o4-mini', label: 'o4-mini (reasoning)' },
    ],
    keyPrefixes: ['sk-proj-', 'sk-svcacct-', 'sk-'],
    keyUrl: 'https://platform.openai.com/api-keys',
    note: 'The original OpenAI API.',
    needsKey: true,
    browserDirect: true,
  },
  {
    id: 'anthropic',
    label: 'Anthropic (Claude)',
    transport: 'anthropic',
    activeProvider: 'anthropic',
    defaultModel: 'claude-3-5-sonnet-20241022',
    modelPresets: [
      { value: 'claude-3-5-sonnet-20241022', label: 'Claude 3.5 Sonnet' },
      { value: 'claude-3-5-haiku-20241022', label: 'Claude 3.5 Haiku' },
      { value: 'claude-3-opus-20240229', label: 'Claude 3 Opus' },
      { value: 'claude-sonnet-4-20250514', label: 'Claude Sonnet 4' },
    ],
    keyPrefixes: ['sk-ant-'],
    keyUrl: 'https://console.anthropic.com/settings/keys',
    note: 'Claude models. Browser use requires the direct-browser-access header.',
    needsKey: true,
    browserDirect: true,
  },
  {
    id: 'gemini',
    label: 'Google Gemini (AI Studio)',
    transport: 'gemini',
    activeProvider: 'direct_gemini',
    defaultModel: 'gemini-2.0-flash',
    modelPresets: [
      { value: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash' },
      { value: 'gemini-2.0-flash-lite', label: 'Gemini 2.0 Flash Lite' },
      { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro' },
      { value: 'gemini-flash-latest', label: 'Gemini Flash (latest)' },
    ],
    keyPrefixes: ['AIza'],
    keyUrl: 'https://aistudio.google.com/app/apikey',
    note: 'Free tier available with a Google account.',
    needsKey: true,
    browserDirect: true,
  },
  {
    id: 'ollama',
    label: 'Ollama (local, 100% offline)',
    transport: 'ollama',
    activeProvider: 'ollama',
    baseUrl: 'http://localhost:11434',
    defaultModel: 'llama3.2',
    modelPresets: [
      { value: 'llama3.2', label: 'Llama 3.2' },
      { value: 'llama3.1', label: 'Llama 3.1' },
      { value: 'mistral', label: 'Mistral' },
      { value: 'qwen2.5', label: 'Qwen 2.5' },
      { value: 'phi3', label: 'Phi-3' },
      { value: 'gemma2', label: 'Gemma 2' },
    ],
    keyPrefixes: [],
    keyUrl: 'https://ollama.com/download',
    note: 'Runs on your machine. Needs no key and never touches the network.',
    needsKey: false,
    browserDirect: true,
  },
  {
    id: 'server_gemini',
    label: 'This app’s own server (self-hosted)',
    transport: 'server',
    activeProvider: 'server_gemini',
    defaultModel: 'gemini-2.0-flash',
    modelPresets: [
      { value: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash' },
      { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro' },
    ],
    keyPrefixes: [],
    keyUrl: 'https://aistudio.google.com/app/apikey',
    note: 'Only for the optional self-hosted server, which holds the key as GEMINI_API_KEY. Not available on the static build.',
    needsKey: false,
    browserDirect: false,
  },
  {
    id: 'custom',
    label: 'Custom OpenAI-compatible endpoint',
    transport: 'openai',
    activeProvider: 'openai',
    baseUrl: '',
    defaultModel: '',
    modelPresets: [],
    keyPrefixes: [],
    note: 'Any server that speaks the OpenAI chat-completions API. Enter its base URL and model.',
    needsKey: true,
    browserDirect: true,
  },
];

const PRESETS_BY_ID = new Map(PROVIDER_PRESETS.map((p) => [p.id, p]));

export function getPreset(id: string | undefined | null): ProviderPreset | undefined {
  if (!id) return undefined;
  return PRESETS_BY_ID.get(id);
}

/** Presets that make sense to show in a provider picker, in catalogue order. */
export function listPresets(): ProviderPreset[] {
  return PROVIDER_PRESETS;
}

/**
 * Prefixes sorted longest-first, so a specific prefix always wins over a
 * generic one (`sk-ant-` before `sk-`).
 */
const SORTED_PREFIXES: Array<{ prefix: string; preset: ProviderPreset }> = PROVIDER_PRESETS.flatMap(
  (preset) => preset.keyPrefixes.map((prefix) => ({ prefix, preset }))
).sort((a, b) => b.prefix.length - a.prefix.length);

/**
 * Work out which vendor a pasted key belongs to.
 *
 * Returns `null` for anything unrecognised — an unknown key is not an error,
 * the user can still choose a provider by hand. This is convenience detection,
 * never a security decision: the key is only ever sent to the vendor the user
 * selects.
 */
export function detectProviderFromKey(rawKey: string | undefined | null): ProviderPreset | null {
  const key = (rawKey || '').trim();
  if (key.length < 8) return null;
  for (const { prefix, preset } of SORTED_PREFIXES) {
    if (key.startsWith(prefix)) return preset;
  }
  return null;
}

/**
 * The preset a saved config is currently using. Falls back to matching the
 * stored endpoint, so configs saved before the catalogue existed still show the
 * right vendor.
 */
export function resolvePresetForConfig(config: AIProviderConfig): ProviderPreset | undefined {
  const explicit = getPreset(config.providerId);
  if (explicit) return explicit;

  if (config.activeProvider === 'openai' && config.openaiEndpoint) {
    const endpoint = config.openaiEndpoint.replace(/\/$/, '').toLowerCase();
    const byEndpoint = PROVIDER_PRESETS.find(
      (p) => p.transport === 'openai' && p.baseUrl && endpoint.startsWith(p.baseUrl.toLowerCase())
    );
    if (byEndpoint) return byEndpoint;
  }

  return PROVIDER_PRESETS.find((p) => p.activeProvider === config.activeProvider);
}

/** The key the preset expects, read from a config. */
export function getKeyForPreset(config: AIProviderConfig, preset: ProviderPreset): string {
  switch (preset.transport) {
    case 'openai':
      return config.openaiKey || '';
    case 'anthropic':
      return config.anthropicKey || '';
    case 'gemini':
      return config.directGeminiKey || '';
    default:
      return '';
  }
}

/**
 * Apply a preset to a config: pick the transport, seed the endpoint and a
 * working default model, and remember which vendor it is. This is what makes
 * "paste a key" enough — the user never types a base URL or a model id.
 */
export function applyPreset(config: AIProviderConfig, preset: ProviderPreset, key?: string): AIProviderConfig {
  const next: AIProviderConfig = {
    ...config,
    providerId: preset.id,
    activeProvider: preset.activeProvider,
  };

  switch (preset.transport) {
    case 'openai':
      if (preset.baseUrl) next.openaiEndpoint = preset.baseUrl;
      if (preset.defaultModel) next.openaiModel = preset.defaultModel;
      if (key !== undefined) next.openaiKey = key;
      break;
    case 'anthropic':
      if (preset.defaultModel) next.anthropicModel = preset.defaultModel;
      if (key !== undefined) next.anthropicKey = key;
      break;
    case 'gemini':
      if (preset.defaultModel) next.geminiModel = preset.defaultModel;
      if (key !== undefined) next.directGeminiKey = key;
      break;
    case 'ollama':
      if (preset.baseUrl) next.ollamaEndpoint = preset.baseUrl;
      if (preset.defaultModel) next.ollamaModel = preset.defaultModel;
      break;
    default:
      break;
  }

  return next;
}

/** Store a pasted key in whichever field this preset uses. */
export function applyKey(config: AIProviderConfig, preset: ProviderPreset, key: string): AIProviderConfig {
  return applyPreset(config, preset, key);
}
