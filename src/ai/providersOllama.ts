import type { AIChatMessage, AIProviderConfig } from '../types';
import { BASE_COFOUNDER_PROMPT, type AIProvider, type AIProviderResult } from './providerTypes';

export class OllamaProvider implements AIProvider {
  async sendMessage(
    messages: AIChatMessage[],
    projectContext: string,
    config: AIProviderConfig,
    systemPromptAddition?: string
  ): Promise<AIProviderResult> {
    const endpoint = (config.ollamaEndpoint || 'http://localhost:11434').replace(/\/$/, '');
    const model = config.ollamaModel || 'llama3.2';

    try {
      const systemMessage = `${BASE_COFOUNDER_PROMPT}\n\n=== PROJECT CONTEXT (DATA ONLY) ===\n${projectContext}\n${systemPromptAddition || ''}`;

      const chatMessages = [
        { role: 'system', content: systemMessage },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
      ];

      const response = await fetch(`${endpoint}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          messages: chatMessages,
          stream: false,
          options: {
            temperature: config.temperature ?? 0.7,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama returned status ${response.status}`);
      }

      const data = await response.json();
      const reply = data.message?.content || 'No response returned.';

      return { reply, providerUsed: `Ollama (${model})` };
    } catch (err: any) {
      return {
        reply: '',
        error: `Could not connect to Ollama at ${endpoint}. Make sure Ollama is running and OLLAMA_ORIGINS="*" is set. (${err.message})`,
        providerUsed: 'Ollama (Local)',
      };
    }
  }

  async testConnection(config: AIProviderConfig): Promise<{ success: boolean; message: string }> {
    const endpoint = (config.ollamaEndpoint || 'http://localhost:11434').replace(/\/$/, '');
    try {
      const res = await fetch(`${endpoint}/api/tags`);
      if (res.ok) {
        const data = await res.json();
        const models = (data.models || []).map((m: any) => m.name).join(', ') || 'none';
        return { success: true, message: `Ollama is running at ${endpoint}! Available models: ${models}` };
      }
      return { success: false, message: `Ollama responded with HTTP ${res.status}.` };
    } catch {
      return {
        success: false,
        message: `Could not reach Ollama at ${endpoint}. Ensure Ollama is running and OLLAMA_ORIGINS="*" is allowed.`,
      };
    }
  }
}
