import type { KeyResult, Objective } from '../types';

export type KeyResultStatus = 'met' | 'on_track' | 'at_risk' | 'off_track';

export interface OkrSummary {
  objectives: number;
  activeObjectives: number;
  /** Average of active objectives that have at least one key result, 0–100. */
  averageProgress: number;
  keyResults: number;
  met: number;
  atRisk: number;
  offTrack: number;
}

export const KEY_RESULT_THRESHOLDS = {
  met: 100,
  onTrack: 70,
  atRisk: 40,
} as const;

function clampPercentage(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(100, Math.max(0, Math.round(value)));
}

/**
 * Progress of one key result, 0–100.
 *
 * `increase` measures movement from baseline towards target; `decrease` is the
 * mirror image (for churn, cost, time-to-value). A key result whose baseline
 * and target are identical is treated as met once the value reaches the target
 * and not met otherwise, so the calculation never divides by zero.
 */
export function keyResultProgress(keyResult: Pick<KeyResult, 'direction' | 'baseline' | 'target' | 'current'>): number {
  const { direction, baseline, target, current } = keyResult;
  const span = direction === 'increase' ? target - baseline : baseline - target;
  const moved = direction === 'increase' ? current - baseline : baseline - current;

  if (span === 0) {
    return moved >= 0 ? KEY_RESULT_THRESHOLDS.met : 0;
  }

  return clampPercentage((moved / span) * 100);
}

export function keyResultStatus(keyResult: Parameters<typeof keyResultProgress>[0]): KeyResultStatus {
  const progress = keyResultProgress(keyResult);
  if (progress >= KEY_RESULT_THRESHOLDS.met) return 'met';
  if (progress >= KEY_RESULT_THRESHOLDS.onTrack) return 'on_track';
  if (progress >= KEY_RESULT_THRESHOLDS.atRisk) return 'at_risk';
  return 'off_track';
}

export function objectiveProgress(objective: Pick<Objective, 'keyResults'>): number {
  if (objective.keyResults.length === 0) return 0;
  const total = objective.keyResults.reduce((sum, keyResult) => sum + keyResultProgress(keyResult), 0);
  return clampPercentage(total / objective.keyResults.length);
}

export type ObjectiveHealth = KeyResultStatus | 'no_key_results';

export function objectiveHealth(objective: Pick<Objective, 'keyResults'>): ObjectiveHealth {
  if (objective.keyResults.length === 0) return 'no_key_results';
  if (objective.keyResults.every((keyResult) => keyResultStatus(keyResult) === 'met')) return 'met';
  const progress = objectiveProgress(objective);
  if (progress >= KEY_RESULT_THRESHOLDS.onTrack) return 'on_track';
  if (progress >= KEY_RESULT_THRESHOLDS.atRisk) return 'at_risk';
  return 'off_track';
}

/** Rolls the whole scorecard up for the dashboard and the goals header. */
export function summarizeOkrs(objectives: readonly Objective[]): OkrSummary {
  const active = objectives.filter((objective) => objective.status === 'active');
  const withKeyResults = active.filter((objective) => objective.keyResults.length > 0);
  const keyResults = active.flatMap((objective) => objective.keyResults);
  const statuses = keyResults.map(keyResultStatus);

  return {
    objectives: objectives.length,
    activeObjectives: active.length,
    averageProgress:
      withKeyResults.length === 0
        ? 0
        : clampPercentage(
            withKeyResults.reduce((sum, objective) => sum + objectiveProgress(objective), 0) /
              withKeyResults.length
          ),
    keyResults: keyResults.length,
    met: statuses.filter((status) => status === 'met').length,
    atRisk: statuses.filter((status) => status === 'at_risk').length,
    offTrack: statuses.filter((status) => status === 'off_track').length,
  };
}

/**
 * Applies a measured value to one key result and returns a new objective.
 * Pure, so the page can update state and the database from the same object and
 * the test suite can assert that nothing is mutated in place.
 */
export function applyKeyResultValue(
  objective: Objective,
  keyResultId: string,
  current: number,
  source?: string,
  now = Date.now()
): Objective {
  return {
    ...objective,
    keyResults: objective.keyResults.map((keyResult) =>
      keyResult.id === keyResultId
        ? { ...keyResult, current, source: source ?? keyResult.source, updatedAt: now }
        : keyResult
    ),
    updatedAt: now,
  };
}

/** Thousands-separated number formatting, independent of the host locale data. */
function groupDigits(value: number, fractionDigits: number): string {
  const fixed = value.toFixed(fractionDigits);
  const [integer, fraction] = fixed.split('.');
  const grouped = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return fraction ? `${grouped}.${fraction}` : grouped;
}

/**
 * Human-readable unit formatting. Deliberately not `Intl.NumberFormat`: locale
 * data was slow enough on one CI runner to exceed the test timeout.
 */
export function formatMetricValue(value: number, unit: KeyResult['unit']): string {
  if (!Number.isFinite(value)) return '—';
  switch (unit) {
    case 'currency':
      return `£${groupDigits(Math.round(value), 0)}`;
    case 'percent':
      return `${value}%`;
    case 'ratio':
      return value.toFixed(2);
    default:
      return groupDigits(value, 2);
  }
}
