import type { RiskItem } from '../types';

const LEVEL_ORDER = { low: 1, medium: 2, high: 3 } as const;

/** Impact × probability score (1–9). */
export function riskScore(
  probability: RiskItem['probability'],
  impact: RiskItem['impact']
): number {
  return LEVEL_ORDER[probability] * LEVEL_ORDER[impact];
}

export function scoreLabel(score: number): { text: string; className: string } {
  if (score >= 6)
    return { text: 'Critical', className: 'text-rose-600 dark:text-rose-400 font-bold' };
  if (score >= 4)
    return { text: 'High', className: 'text-amber-600 dark:text-amber-400 font-semibold' };
  if (score >= 2)
    return { text: 'Medium', className: 'text-yellow-600 dark:text-yellow-400' };
  return { text: 'Low', className: 'text-zinc-500' };
}

/** Open or actively being tested. */
export function isOpenRisk(risk: Pick<RiskItem, 'status'>): boolean {
  return risk.status === 'open' || risk.status === 'testing';
}

/** Open/testing and score ≥ 4. */
export function isHotRisk(risk: Pick<RiskItem, 'status' | 'probability' | 'impact'>): boolean {
  return isOpenRisk(risk) && riskScore(risk.probability, risk.impact) >= 4;
}

export function sortRisksByScore<T extends Pick<RiskItem, 'probability' | 'impact'>>(risks: T[]): T[] {
  return [...risks].sort(
    (a, b) => riskScore(b.probability, b.impact) - riskScore(a.probability, a.impact)
  );
}
