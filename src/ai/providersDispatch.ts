import type { AIProviderConfig } from '../types';
import type { AIProvider } from './providerTypes';
import { ServerGeminiProvider, DirectGeminiProvider } from './providersGemini';
import { OpenAICompatibleProvider } from './providersOpenAI';
import { AnthropicProvider } from './providersAnthropic';
import { OllamaProvider } from './providersOllama';
import { OfflineRuleBasedProvider } from './providersOffline';

export function getAIProvider(activeProvider: AIProviderConfig['activeProvider']): AIProvider {
  switch (activeProvider) {
    case 'server_gemini':
      return new ServerGeminiProvider();
    case 'direct_gemini':
      return new DirectGeminiProvider();
    case 'openai':
      return new OpenAICompatibleProvider();
    case 'anthropic':
      return new AnthropicProvider();
    case 'ollama':
      return new OllamaProvider();
    case 'offline_rules':
    default:
      return new OfflineRuleBasedProvider();
  }
}
