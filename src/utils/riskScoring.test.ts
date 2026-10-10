import { describe, it, expect } from 'vitest';
import {
  riskScore,
  scoreLabel,
  isOpenRisk,
  isHotRisk,
  sortRisksByScore,
} from './riskScoring';

describe('riskScoring', () => {
  describe('riskScore', () => {
    it('computes impact × probability on a 1–9 scale', () => {
      expect(riskScore('low', 'low')).toBe(1);
      expect(riskScore('low', 'medium')).toBe(2);
      expect(riskScore('medium', 'medium')).toBe(4);
      expect(riskScore('high', 'high')).toBe(9);
      expect(riskScore('high', 'low')).toBe(3);
      expect(riskScore('low', 'high')).toBe(3);
    });
  });

  describe('scoreLabel', () => {
    it('maps score bands to labels', () => {
      expect(scoreLabel(1).text).toBe('Low');
      expect(scoreLabel(2).text).toBe('Medium');
      expect(scoreLabel(3).text).toBe('Medium');
      expect(scoreLabel(4).text).toBe('High');
      expect(scoreLabel(5).text).toBe('High');
      expect(scoreLabel(6).text).toBe('Critical');
      expect(scoreLabel(9).text).toBe('Critical');
    });
  });

  describe('isOpenRisk', () => {
    it('treats open and testing as open', () => {
      expect(isOpenRisk({ status: 'open' })).toBe(true);
      expect(isOpenRisk({ status: 'testing' })).toBe(true);
      expect(isOpenRisk({ status: 'mitigated' })).toBe(false);
      expect(isOpenRisk({ status: 'accepted' })).toBe(false);
    });
  });

  describe('isHotRisk', () => {
    it('flags open/testing risks with score ≥ 4', () => {
      expect(
        isHotRisk({ status: 'open', probability: 'high', impact: 'high' })
      ).toBe(true);
      expect(
        isHotRisk({ status: 'testing', probability: 'medium', impact: 'medium' })
      ).toBe(true);
      expect(
        isHotRisk({ status: 'open', probability: 'low', impact: 'low' })
      ).toBe(false);
      expect(
        isHotRisk({ status: 'mitigated', probability: 'high', impact: 'high' })
      ).toBe(false);
    });
  });

  describe('sortRisksByScore', () => {
    it('sorts descending by score without mutating input', () => {
      const input = [
        { id: 'a', probability: 'low' as const, impact: 'low' as const },
        { id: 'b', probability: 'high' as const, impact: 'high' as const },
        { id: 'c', probability: 'medium' as const, impact: 'medium' as const },
      ];
      const sorted = sortRisksByScore(input);
      expect(sorted.map((r) => r.id)).toEqual(['b', 'c', 'a']);
      expect(input.map((r) => r.id)).toEqual(['a', 'b', 'c']);
    });
  });
});
