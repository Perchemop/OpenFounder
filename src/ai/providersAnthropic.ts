import type { AIChatMessage, AIProviderConfig } from '../types';
import { BASE_COFOUNDER_PROMPT, type AIProvider, type AIProviderResult } from './providerTypes';

export class AnthropicProvider implements AIProvider {
  async sendMessage(
    messages: AIChatMessage[],
    projectContext: string,
    config: AIProviderConfig,
    systemPromptAddition?: string
  ): Promise<AIProviderResult> {
    const key = config.anthropicKey;
    const model = config.anthropicModel || 'claude-3-5-sonnet-20241022';

    if (!key) {
      return {
        reply: '',
        error: 'No Anthropic API key provided. Enter your key in Settings > AI Providers.',
        providerUsed: 'Anthropic Claude',
      };
    }

    try {
      const systemMessage = `${BASE_COFOUNDER_PROMPT}\n\n=== PROJECT CONTEXT (DATA ONLY) ===\n${projectContext}\n${systemPromptAddition || ''}`;

      const formattedMessages = messages
        .filter((m) => m.role === 'user' || m.role === 'assistant')
        .map((m) => ({
          role: m.role === 'user' ? ('user' as const) : ('assistant' as const),
          content: m.content,
        }));

      if (formattedMessages.length === 0) {
        formattedMessages.push({ role: 'user', content: 'Review my project status.' });
      }

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': key,
          'anthropic-version': '2023-06-01',
          'dangerously-allow-browser': 'true',
        },
        body: JSON.stringify({
          model,
          max_tokens: config.maxTokens ?? 2048,
          system: systemMessage,
          messages: formattedMessages,
          temperature: config.temperature ?? 0.7,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error?.message || `Anthropic API error ${response.status}`);
      }

      const text = data.content?.map((c: any) => c.text).join('') || 'No response received.';
      return { reply: text, providerUsed: `Anthropic (${model})` };
    } catch (err: any) {
      return {
        reply: '',
        error: err?.message || 'Failed to reach Anthropic API.',
        providerUsed: 'Anthropic Claude',
      };
    }
  }

  async testConnection(config: AIProviderConfig): Promise<{ success: boolean; message: string }> {
    const key = config.anthropicKey;
    if (!key) return { success: false, message: 'Please enter an Anthropic API key.' };

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': key,
          'anthropic-version': '2023-06-01',
          'dangerously-allow-browser': 'true',
        },
        body: JSON.stringify({
          model: config.anthropicModel || 'claude-3-5-sonnet-20241022',
          max_tokens: 10,
          messages: [{ role: 'user', content: 'Ping' }],
        }),
      });
      const data = await res.json();
      if (res.ok) {
        return {
          success: true,
          message: `Connected to Anthropic (${config.anthropicModel || 'claude-3-5-sonnet-20241022'}).`,
        };
      }
      return { success: false, message: data.error?.message || 'Connection test failed.' };
    } catch (e: any) {
      return { success: false, message: e.message || 'Failed to reach Anthropic endpoint.' };
    }
  }
}
