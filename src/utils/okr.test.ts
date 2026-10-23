import { describe, it, expect } from 'vitest';
import {
  applyKeyResultValue,
  formatMetricValue,
  keyResultProgress,
  keyResultStatus,
  objectiveHealth,
  objectiveProgress,
  summarizeOkrs,
} from './okr';
import type { KeyResult, Objective } from '../types';

function keyResult(overrides: Partial<KeyResult> = {}): KeyResult {
  return {
    id: 'kr1',
    title: 'Reach 40 paying customers',
    unit: 'number',
    direction: 'increase',
    baseline: 0,
    target: 40,
    current: 0,
    updatedAt: 0,
    ...overrides,
  };
}

function objective(overrides: Partial<Objective> = {}): Objective {
  return {
    id: 'obj1',
    projectId: 'p1',
    title: 'Prove plumbers will pay',
    description: '',
    owner: 'founder',
    timeframe: 'Q4 2026',
    status: 'active',
    keyResults: [keyResult()],
    createdAt: 0,
    updatedAt: 0,
    ...overrides,
  };
}

describe('keyResultProgress', () => {
  it('measures increase metrics from baseline to target', () => {
    const base = { direction: 'increase' as const, baseline: 10, target: 50 };
    expect(keyResultProgress({ ...base, current: 10 })).toBe(0);
    expect(keyResultProgress({ ...base, current: 30 })).toBe(50);
    expect(keyResultProgress({ ...base, current: 50 })).toBe(100);
  });

  it('measures decrease metrics from baseline down to target', () => {
    const base = { direction: 'decrease' as const, baseline: 40, target: 10 };
    expect(keyResultProgress({ ...base, current: 40 })).toBe(0);
    expect(keyResultProgress({ ...base, current: 25 })).toBe(50);
    expect(keyResultProgress({ ...base, current: 10 })).toBe(100);
  });

  it('clamps values beyond the target and below the baseline', () => {
    expect(
      keyResultProgress({ direction: 'increase', baseline: 0, target: 10, current: 30 })
    ).toBe(100);
    expect(
      keyResultProgress({ direction: 'increase', baseline: 0, target: 10, current: -5 })
    ).toBe(0);
    expect(
      keyResultProgress({ direction: 'decrease', baseline: 10, target: 0, current: 20 })
    ).toBe(0);
  });

  it('never divides by zero when baseline equals target', () => {
    expect(
      keyResultProgress({ direction: 'increase', baseline: 5, target: 5, current: 5 })
    ).toBe(100);
    expect(
      keyResultProgress({ direction: 'increase', baseline: 5, target: 5, current: 4 })
    ).toBe(0);
  });
});

describe('keyResultStatus', () => {
  it('maps progress bands to statuses', () => {
    expect(keyResultStatus(keyResult({ current: 40 }))).toBe('met');
    expect(keyResultStatus(keyResult({ current: 30 }))).toBe('on_track');
    expect(keyResultStatus(keyResult({ current: 20 }))).toBe('at_risk');
    expect(keyResultStatus(keyResult({ current: 4 }))).toBe('off_track');
  });
});

describe('objectiveProgress and health', () => {
  it('averages key result progress', () => {
    const obj = objective({
      keyResults: [
        keyResult({ id: 'a', current: 40 }),
        keyResult({ id: 'b', current: 20 }),
      ],
    });
    expect(objectiveProgress(obj)).toBe(75);
  });

  it('reports zero progress for an objective without key results', () => {
    const obj = objective({ keyResults: [] });
    expect(objectiveProgress(obj)).toBe(0);
    expect(objectiveHealth(obj)).toBe('no_key_results');
  });

  it('is met only when every key result is met', () => {
    expect(
      objectiveHealth(objective({ keyResults: [keyResult({ current: 40 })] }))
    ).toBe('met');
    expect(
      objectiveHealth(
        objective({
          keyResults: [keyResult({ id: 'a', current: 40 }), keyResult({ id: 'b', current: 20 })],
        })
      )
    ).toBe('on_track');
  });

  it('derives at-risk and off-track health from the average', () => {
    expect(objectiveHealth(objective({ keyResults: [keyResult({ current: 17 })] }))).toBe('at_risk');
    expect(objectiveHealth(objective({ keyResults: [keyResult({ current: 4 })] }))).toBe('off_track');
  });
});

describe('summarizeOkrs', () => {
  it('counts only active objectives and key results', () => {
    const summary = summarizeOkrs([
      objective({ id: 'a', keyResults: [keyResult({ id: 'a1', current: 40 })] }),
      objective({
        id: 'b',
        keyResults: [
          keyResult({ id: 'b1', current: 20 }),
          keyResult({ id: 'b2', current: 4 }),
          keyResult({ id: 'b3', current: 40 }),
        ],
      }),
      objective({ id: 'c', status: 'archived', keyResults: [keyResult({ id: 'c1', current: 0 })] }),
    ]);

    expect(summary).toEqual({
      objectives: 3,
      activeObjectives: 2,
      averageProgress: 77,
      keyResults: 4,
      met: 2,
      atRisk: 1,
      offTrack: 1,
    });
  });

  it('returns an empty summary when there are no objectives', () => {
    expect(summarizeOkrs([])).toEqual({
      objectives: 0,
      activeObjectives: 0,
      averageProgress: 0,
      keyResults: 0,
      met: 0,
      atRisk: 0,
      offTrack: 0,
    });
  });

  it('ignores active objectives without key results when averaging', () => {
    const summary = summarizeOkrs([
      objective({ id: 'a', keyResults: [] }),
      objective({ id: 'b', keyResults: [keyResult({ id: 'b1', current: 20 })] }),
    ]);
    expect(summary.averageProgress).toBe(50);
  });
});

describe('applyKeyResultValue', () => {
  it('updates one key result without mutating the original', () => {
    const original = objective({
      keyResults: [keyResult({ id: 'a' }), keyResult({ id: 'b', current: 2 })],
    });

    const updated = applyKeyResultValue(original, 'b', 12, 'Stripe dashboard', 1234);

    expect(updated).not.toBe(original);
    expect(original.keyResults[1].current).toBe(2);
    expect(updated.keyResults[1]).toMatchObject({
      current: 12,
      source: 'Stripe dashboard',
      updatedAt: 1234,
    });
    expect(updated.keyResults[0]).toBe(original.keyResults[0]);
    expect(updated.updatedAt).toBe(1234);
  });

  it('keeps the existing source when none is provided', () => {
    const original = objective({ keyResults: [keyResult({ id: 'a', source: 'Sheet' })] });
    expect(applyKeyResultValue(original, 'a', 10).keyResults[0].source).toBe('Sheet');
  });
});

describe('formatMetricValue', () => {
  it('formats each unit', () => {
    expect(formatMetricValue(1234.5, 'number')).toBe('1,234.50');
    expect(formatMetricValue(1500, 'currency')).toBe('£1,500');
    expect(formatMetricValue(42, 'percent')).toBe('42%');
    expect(formatMetricValue(0.5, 'ratio')).toBe('0.50');
    expect(formatMetricValue(Number.NaN, 'number')).toBe('—');
  });
});
