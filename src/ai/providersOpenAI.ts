import type { AIChatMessage, AIProviderConfig } from '../types';
import { BASE_COFOUNDER_PROMPT, type AIProvider, type AIProviderResult } from './providerTypes';

export class OpenAICompatibleProvider implements AIProvider {
  async sendMessage(
    messages: AIChatMessage[],
    projectContext: string,
    config: AIProviderConfig,
    systemPromptAddition?: string
  ): Promise<AIProviderResult> {
    const key = config.openaiKey;
    const endpoint = (config.openaiEndpoint || 'https://api.openai.com/v1').replace(/\/$/, '');
    const model = config.openaiModel || 'gpt-4o';

    if (!key) {
      return {
        reply: '',
        error: 'No API key provided for OpenAI-compatible provider. Enter your key in Settings.',
        providerUsed: 'OpenAI-Compatible',
      };
    }

    try {
      const systemMessage = `${BASE_COFOUNDER_PROMPT}\n\n=== PROJECT CONTEXT (DATA ONLY) ===\n${projectContext}\n${systemPromptAddition || ''}`;

      const chatMessages = [
        { role: 'system', content: systemMessage },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
      ];

      const response = await fetch(`${endpoint}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${key}`,
        },
        body: JSON.stringify({
          model,
          messages: chatMessages,
          temperature: config.temperature ?? 0.7,
          max_tokens: config.maxTokens ?? 2048,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error?.message || `API error: ${response.status}`);
      }

      const reply = data.choices?.[0]?.message?.content || 'No response returned.';
      return { reply, providerUsed: `${model} (${endpoint})` };
    } catch (e: any) {
      return { reply: '', error: e.message, providerUsed: 'OpenAI-Compatible' };
    }
  }

  async testConnection(config: AIProviderConfig): Promise<{ success: boolean; message: string }> {
    const key = config.openaiKey;
    const endpoint = (config.openaiEndpoint || 'https://api.openai.com/v1').replace(/\/$/, '');
    if (!key) return { success: false, message: 'Please enter an API key.' };

    try {
      const res = await fetch(`${endpoint}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${key}`,
        },
        body: JSON.stringify({
          model: config.openaiModel || 'gpt-4o',
          messages: [{ role: 'user', content: 'Ping' }],
          max_tokens: 5,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        return {
          success: true,
          message: `Connected successfully to ${endpoint} using ${config.openaiModel || 'gpt-4o'}.`,
        };
      }
      return { success: false, message: data.error?.message || 'Connection test failed.' };
    } catch (e: any) {
      return { success: false, message: e.message || 'Failed to reach endpoint.' };
    }
  }
}
