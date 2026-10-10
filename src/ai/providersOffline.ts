import type { AIChatMessage, AIProviderConfig } from '../types';
import type { AIProvider, AIProviderResult } from './providerTypes';

export class OfflineRuleBasedProvider implements AIProvider {
  async sendMessage(
    messages: AIChatMessage[],
    projectContext: string,
    _config: AIProviderConfig,
    _systemPromptAddition?: string
  ): Promise<AIProviderResult> {
    const latest = messages[messages.length - 1]?.content.toLowerCase() || '';

    const claimsMatch = projectContext.match(/Total Claims:\s*(\d+)/i);
    const totalClaims = claimsMatch ? parseInt(claimsMatch[1], 10) : 0;
    const unverifiedMatch = projectContext.match(/Top Untested Assumptions \((\d+)\)/i);
    const unverifiedCount = unverifiedMatch ? parseInt(unverifiedMatch[1], 10) : 0;
    const passedMatch = projectContext.match(/Passed\/Validated \((\d+)\)/i);
    const passedCount = passedMatch ? parseInt(passedMatch[1], 10) : 0;

    let analysis = '';

    if (latest.includes('risk') || latest.includes('challenge') || latest.includes('audit')) {
      analysis = `### Evidence-Driven Assumption Audit (Deterministic Offline Engine)\n\n**Current Status Computed from Local Workspace:**\n- Total Recorded Claims: **${totalClaims}**\n- Untested Assumptions: **${unverifiedCount}**\n- Validated Experiments: **${passedCount} passed**\n\n**Critical Verification Checks:**\n1. **Desirability**: Do target customers actually suffer from this pain repeatedly, or is this a one-time nuisance they tolerate?\n2. **Viability**: Is there proven willingness to pay money, or are they accustomed to free/low-cost workarounds?\n3. **Distribution**: Can you reach 50 qualified prospects without paid advertising?\n\n### 1. What We Know\n- The project premise is cataloged in your local browser database.\n- Any claims marked "Unverified" or "Assumption" in your Evidence Ledger remain high-risk leaps of faith.\n\n### 2. What We Don't Know\n- Customer conversion rate when asked to commit real currency or binding letters of intent.\n- Churn likelihood after initial curiosity wanes.\n\n### 3. Biggest Risk\n- **Premature Execution**: Spending weeks building product features before conducting 10 unbiased customer discovery interviews.\n\n### 4. Recommended Next Action\n- Open the **Experiments** tab and create a **Customer Interview** or **Smoke Test** targeting 5 specific prospective users. Follow The Mom Test rules (ask about past behavior, not hypothetical futures).`;
    } else if (latest.includes('experiment') || latest.includes('validate') || latest.includes('test')) {
      analysis = `### Recommended Validation Experiment (Deterministic Offline Engine)\n\n**Experiment Type:** Smoke Test or Pre-Commitment Customer Interview\n**Sample Goal:** 10 qualified interviews or 25 waitlist commitments.\n**Falsification Criteria:** If fewer than 30% of targeted users demonstrate acute frustration with current workarounds, pause feature development.\n\n### 1. What We Know\n- Assumptions without empirical customer verification carry high failure rates.\n- Current unverified claims in your ledger: **${unverifiedCount}**.\n\n### 2. What We Don't Know\n- What specific trigger causes a user to search for an alternative today.\n\n### 3. Biggest Risk\n- Confirmation bias from asking leading questions like "Would you use an app that does X?".\n\n### 4. Recommended Next Action\n- Use the **Customer Interviews** module to draft 5 unbiased questions focusing on:\n  1. "When was the last time this problem happened?"\n  2. "What did you do to solve it?"\n  3. "What did you dislike about that workaround?"\n  4. "What are you currently paying for tools in this workflow?"`;
    } else {
      analysis = `### Co-Founder Project Assessment (Deterministic Offline Engine)\n\nBased on your local project data:\n\n### 1. What We Know\n- Your workspace stores your current problem definition, evidence claims (${totalClaims} items), competitors, and MVP backlog.\n- Evidence health relies on customer conversations and verifiable tests, not internal optimism.\n\n### 2. What We Don't Know\n- The exact price sensitivity and unit economics of your initial customer cohort.\n- The single most effective organic distribution channel.\n\n### 3. Biggest Risk\n- Building nice-to-have features before proving willingness to pay.\n\n### 4. Recommended Next Action\n- Review the **Evidence Ledger** to locate all items marked "Unverified" or "Assumption".\n- Design a measurable experiment to turn your top unverified claim into "Customer-Confirmed".`;
    }

    return {
      reply: analysis,
      providerUsed: 'Offline Rule-Based Co-Founder (Local-Only, No API Key, Zero Network)',
    };
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    return {
      success: true,
      message: 'Offline Co-Founder is always available locally without network or API keys.',
    };
  }
}
