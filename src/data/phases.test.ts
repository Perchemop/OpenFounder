import { describe, it, expect } from 'vitest';
import { FOUNDER_PHASES } from './phases';

describe('FOUNDER_PHASES', () => {
  it('defines exactly 10 phases with sequential indices', () => {
    expect(FOUNDER_PHASES).toHaveLength(10);
    FOUNDER_PHASES.forEach((phase, idx) => {
      expect(phase.index).toBe(idx);
      expect(phase.key).toBeTruthy();
      expect(phase.name).toBeTruthy();
      expect(phase.objective).toBeTruthy();
      expect(phase.tasks.length).toBeGreaterThan(0);
    });
  });

  it('has unique phase keys', () => {
    const keys = FOUNDER_PHASES.map((p) => p.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('has unique task IDs across all phases', () => {
    const taskIds = FOUNDER_PHASES.flatMap((p) => p.tasks.map((t) => t.id));
    expect(new Set(taskIds).size).toBe(taskIds.length);
  });

  it('marks requiredTaskIds that exist in phase tasks', () => {
    for (const phase of FOUNDER_PHASES) {
      const taskIdSet = new Set(phase.tasks.map((t) => t.id));
      for (const requiredId of phase.requiredTaskIds || []) {
        expect(taskIdSet.has(requiredId)).toBe(true);
      }
    }
  });

  it('includes required tasks where required flag is true', () => {
    const hasRequired = FOUNDER_PHASES.some((p) =>
      p.tasks.some((t) => t.required === true)
    );
    expect(hasRequired).toBe(true);
  });
});
