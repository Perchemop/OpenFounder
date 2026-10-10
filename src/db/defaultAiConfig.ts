import type { AIProviderConfig } from '../types';
import {
  DEFAULT_GEMINI_MODEL,
  DEFAULT_GEMINI_FALLBACK_MODELS,
} from '../ai/modelDefaults';

export const DEFAULT_AI_CONFIG: AIProviderConfig = {
  activeProvider: 'offline_rules',
  geminiModel: DEFAULT_GEMINI_MODEL,
  geminiFallbackModels: [...DEFAULT_GEMINI_FALLBACK_MODELS],
  openaiEndpoint: 'https://api.openai.com/v1',
  openaiModel: 'gpt-4o',
  anthropicModel: 'claude-3-5-sonnet-20241022',
  ollamaEndpoint: 'http://localhost:11434',
  ollamaModel: 'llama3.2',
  temperature: 0.7,
  maxTokens: 2048,
  telemetryEnabled: false,
  storeKeysLocally: false,
};
