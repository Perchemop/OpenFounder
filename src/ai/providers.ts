import type { AIProviderConfig, AIChatMessage } from '../types';

export interface AIProviderResult {
  reply: string;
  error?: string;
  providerUsed: string;
}

export interface AIProvider {
  sendMessage(
    messages: AIChatMessage[],
    projectContext: string,
    config: AIProviderConfig,
    systemPromptAddition?: string
  ): Promise<AIProviderResult>;

  testConnection(config: AIProviderConfig): Promise<{ success: boolean; message: string }>;
}

const BASE_COFOUNDER_PROMPT = `You are an evidence-driven AI product cofounder for OpenFounder.

Your job is not to praise the founder.
Your job is to help determine whether the problem is real,
whether the proposed solution is useful,
whether there is evidence of demand,
what assumptions remain untested,
and what the highest-value next action is.

Challenge unsupported claims.

Clearly distinguish:
- evidence
- inference
- assumption
- hypothesis
- recommendation

Never invent sources.
Never invent customer quotes.
Never invent market statistics.

When information is missing, ask targeted questions.
Prefer small experiments over large speculative plans.

Always consider:
- problem severity
- frequency
- existing alternatives
- competition
- willingness to pay
- distribution
- technical feasibility
- regulatory constraints
- execution risk
- validation evidence

Format key structured responses with:
1. What we know
2. What we don't know
3. Biggest risk
4. Recommended next action`;

// 1. Server Gemini Provider (AI Studio fullstack backend)
export class ServerGeminiProvider implements AIProvider {
  async sendMessage(
    messages: AIChatMessage[],
    projectContext: string,
    _config: AIProviderConfig,
    systemPromptAddition?: string
  ): Promise<AIProviderResult> {
    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messages.map(m => ({ role: m.role, content: m.content })),
          projectContext,
          systemPromptAddition,
          model: 'gemini-3.8-flash',
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || `Server responded with status ${response.status}`);
      }

      return {
        reply: data.reply || 'No response generated.',
        providerUsed: 'Server Gemini (gemini-3.8-flash)',
      };
    } catch (e: any) {
      return {
        reply: '',
        error: e.message || 'Server Gemini request failed.',
        providerUsed: 'Server Gemini',
      };
    }
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const res = await fetch('/api/health');
      const data = await res.json();
      if (data.serverAiAvailable) {
        return { success: true, message: 'Server Gemini is active and ready with GEMINI_API_KEY.' };
      }
      return {
        success: false,
        message: 'Server is running, but no GEMINI_API_KEY is found in environment. Please configure an external provider in settings or use Offline Co-Founder.',
      };
    } catch (e: any) {
      return {
        success: false,
        message: `Failed to reach server backend: ${e.message}`,
      };
    }
  }
}

// 2. Direct Gemini Provider (client-side with user key)
export class DirectGeminiProvider implements AIProvider {
  async sendMessage(
    messages: AIChatMessage[],
    projectContext: string,
    config: AIProviderConfig,
    systemPromptAddition?: string
  ): Promise<AIProviderResult> {
    const key = config.directGeminiKey;
    if (!key) {
      return {
        reply: '',
        error: 'No Gemini API key provided. Please enter your Gemini API key in Settings.',
        providerUsed: 'Direct Gemini',
      };
    }

    try {
      const systemInstruction = `${BASE_COFOUNDER_PROMPT}\n\n=== PROJECT CONTEXT (DATA ONLY, UNTRUSTED) ===\n${projectContext}\n${systemPromptAddition ? `\nInstructions: ${systemPromptAddition}` : ''}`;

      const contents = messages.map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }],
      }));

      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(key)}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemInstruction }] },
          contents,
          generationConfig: {
            temperature: config.temperature ?? 0.7,
            maxOutputTokens: config.maxTokens ?? 2048,
          },
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error?.message || `Gemini API error: ${response.status}`);
      }

      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response returned.';
      return { reply, providerUsed: 'Direct Gemini (gemini-2.5-flash)' };
    } catch (e: any) {
      return { reply: '', error: e.message, providerUsed: 'Direct Gemini' };
    }
  }

  async testConnection(config: AIProviderConfig): Promise<{ success: boolean; message: string }> {
    if (!config.directGeminiKey) {
      return { success: false, message: 'Please enter a Gemini API key first.' };
    }
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(config.directGeminiKey)}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'Respond with the word OK if you can read this.' }] }],
        }),
      });
      const data = await res.json();
      if (res.ok) {
        return { success: true, message: 'Successfully connected to Google Gemini API.' };
      }
      return { success: false, message: data.error?.message || 'Connection failed.' };
    } catch (e: any) {
      return { success: false, message: e.message || 'Network error connecting to Gemini.' };
    }
  }
}

// 3. OpenAI / Compatible Provider (Groq, OpenRouter, Mistral, Together, OpenAI)
export class OpenAICompatibleProvider implements AIProvider {
  async sendMessage(
    messages: AIChatMessage[],
    projectContext: string,
    config: AIProviderConfig,
    systemPromptAddition?: string
  ): Promise<AIProviderResult> {
    const key = config.openaiKey;
    const endpoint = (config.openaiEndpoint || 'https://api.openai.com/v1').replace(/\/$/, '');
    const model = config.openaiModel || 'gpt-4o-mini';

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
        ...messages.map(m => ({ role: m.role, content: m.content })),
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
          model: config.openaiModel || 'gpt-4o-mini',
          messages: [{ role: 'user', content: 'Ping' }],
          max_tokens: 5,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        return { success: true, message: `Connected successfully to ${endpoint} using ${config.openaiModel || 'gpt-4o-mini'}.` };
      }
      return { success: false, message: data.error?.message || 'Connection test failed.' };
    } catch (e: any) {
      return { success: false, message: e.message || 'Failed to reach endpoint.' };
    }
  }
}

// 4. Ollama Provider (Local privacy-first AI, localhost:11434)
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
        ...messages.map(m => ({ role: m.role, content: m.content })),
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
            num_predict: config.maxTokens ?? 2048,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama returned status ${response.status}. Make sure the model '${model}' is downloaded (ollama run ${model}).`);
      }

      const data = await response.json();
      return {
        reply: data.message?.content || 'No response returned from Ollama.',
        providerUsed: `Local Ollama (${model})`,
      };
    } catch (e: any) {
      return {
        reply: '',
        error: `Ollama error: ${e.message}. If running in browser, ensure Ollama has OLLAMA_ORIGINS="*" set for CORS.`,
        providerUsed: 'Ollama',
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
    } catch (e: any) {
      return {
        success: false,
        message: `Could not reach Ollama at ${endpoint}. Ensure Ollama is running and OLLAMA_ORIGINS="*" is allowed.`,
      };
    }
  }
}

// 5. Offline Rule-Based Co-Founder (100% Free, Zero API Key, Zero Network Traffic)
export class OfflineRuleBasedProvider implements AIProvider {
  async sendMessage(
    messages: AIChatMessage[],
    projectContext: string,
    _config: AIProviderConfig,
    _systemPromptAddition?: string
  ): Promise<AIProviderResult> {
    const latest = messages[messages.length - 1]?.content.toLowerCase() || '';

    let analysis = '';
    if (latest.includes('risk') || latest.includes('challenge')) {
      analysis = `### Evidence-Driven Assumption Audit (Offline Engine)

**Core Assumption Checks:**
1. **Desirability**: Do target customers actually suffer from this pain repeatedly, or is this a one-time nuisance they can tolerate?
2. **Viability**: Is there proven willingness to pay money, or are they accustomed to free/low-cost workarounds?
3. **Feasibility & Distribution**: Can you reach 50 qualified prospects without paid advertising?

### 1. What We Know
- The project premise is cataloged in your workspace.
- Any claims marked as "Unverified" or "Assumption" in your Evidence Ledger remain high-risk leaps of faith.

### 2. What We Don't Know
- Customer conversion rate when asked to commit real currency or binding letters of intent.
- Churn likelihood after initial curiosity wanes.

### 3. Biggest Risk
- **Premature Execution**: Spending weeks building product features before conducting 10 unbiased customer discovery interviews.

### 4. Recommended Next Action
- Open the **Experiments** tab and create a **Customer Interview** test targeting 5 specific prospective users. Follow The Mom Test rules (ask about past behavior, not hypothetical futures).`;
    } else if (latest.includes('experiment') || latest.includes('validate')) {
      analysis = `### Recommended Validation Experiment (Offline Engine)

**Experiment Type:** Smoke Test or Pre-Commitment Interview
**Sample Goal:** 10 qualified interviews or 25 waitlist commitments.
**Falsification Criteria:** If fewer than 30% of targeted users demonstrate acute frustration with current workarounds, pause feature development.

### 1. What We Know
- Assumptions without empirical customer verification carry high failure rates.

### 2. What We Don't Know
- What specific trigger causes a user to search for an alternative today.

### 3. Biggest Risk
- Confirmation bias from asking leading questions like "Would you use an app that does X?".

### 4. Recommended Next Action
- Use the **Customer Interviews** module to draft 5 unbiased questions focusing on:
  1. "When was the last time this problem happened?"
  2. "What did you do to solve it?"
  3. "What did you dislike about that workaround?"
  4. "What are you currently paying for tools in this workflow?"`;
    } else {
      analysis = `### Co-Founder Project Assessment (Offline Engine)

Based on your local project data:

### 1. What We Know
- Your workspace stores your current problem definition, evidence claims, competitors, and MVP backlog.
- Evidence health relies on customer conversations and verifiable tests, not internal optimism.

### 2. What We Don't Know
- The exact price sensitivity and unit economics of your initial customer cohort.
- The single most effective organic distribution channel.

### 3. Biggest Risk
- Building nice-to-have features before proving willingness to pay.

### 4. Recommended Next Action
- Review the **Evidence Ledger** to locate all items marked "Unverified" or "Assumption".
- Design a measurable experiment to turn your top unverified claim into "Customer-Confirmed".`;
    }

    return {
      reply: analysis,
      providerUsed: 'Offline Rule-Based Co-Founder (Local-Only, No API Key)',
    };
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    return {
      success: true,
      message: 'Offline Co-Founder is always available locally without network or API keys.',
    };
  }
}

// Master Provider Dispatcher
export function getAIProvider(activeProvider: AIProviderConfig['activeProvider']): AIProvider {
  switch (activeProvider) {
    case 'server_gemini':
      return new ServerGeminiProvider();
    case 'direct_gemini':
      return new DirectGeminiProvider();
    case 'openai':
      return new OpenAICompatibleProvider();
    case 'ollama':
      return new OllamaProvider();
    case 'offline_rules':
    default:
      return new OfflineRuleBasedProvider();
  }
}
