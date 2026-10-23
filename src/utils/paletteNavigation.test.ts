import { describe, it, expect } from 'vitest';
import {
  activateEntry,
  buildPaletteEntries,
  moveSelection,
} from './paletteNavigation';
import type { WorkspaceSearchResult } from './workspaceSearch';

function result(overrides: Partial<WorkspaceSearchResult> = {}): WorkspaceSearchResult {
  return {
    id: 'e1',
    kind: 'evidence',
    tab: 'evidence',
    title: 'Plumbers lose time on invoicing',
    detail: '',
    score: 5,
    ...overrides,
  };
}

describe('buildPaletteEntries', () => {
  it('orders action, navigation, then results', () => {
    const entries = buildPaletteEntries(true, ['dashboard', 'evidence'], [
      result({ id: 'a', kind: 'evidence' }),
      result({ id: 'b', kind: 'risk', tab: 'risks' }),
    ]);
    expect(entries.map((entry) => entry.id)).toEqual([
      'create-project',
      'nav-dashboard',
      'nav-evidence',
      'result-evidence-a',
      'result-risk-b',
    ]);
  });

  it('omits the create action when the caller has no new-project flow', () => {
    const entries = buildPaletteEntries(false, [], []);
    expect(entries).toEqual([]);
  });

  it('keys results by kind and id so duplicates cannot collide', () => {
    const entries = buildPaletteEntries(false, [], [
      result({ id: 'dup', kind: 'evidence' }),
      result({ id: 'dup', kind: 'advisor', tab: 'advisors' }),
    ]);
    expect(entries.map((entry) => entry.id)).toEqual(['result-evidence-dup', 'result-advisor-dup']);
  });
});

describe('moveSelection', () => {
  it('wraps forward and backward', () => {
    expect(moveSelection(3, 2, 'forward')).toBe(0);
    expect(moveSelection(3, 0, 'backward')).toBe(2);
  });

  it('clamps an out-of-range selection to an end rather than escaping', () => {
    expect(moveSelection(3, 99, 'forward')).toBe(0);
    expect(moveSelection(3, -1, 'backward')).toBe(2);
  });

  it('has no selection when the list is empty', () => {
    expect(moveSelection(0, 0, 'forward')).toBe(-1);
  });
});

describe('activateEntry', () => {
  const entries = buildPaletteEntries(true, ['dashboard'], [result()]);

  it('maps each entry type to its action', () => {
    expect(activateEntry(entries[0])).toEqual({ kind: 'project' });
    expect(activateEntry(entries[1])).toEqual({ kind: 'tab', tab: 'dashboard' });
    expect(activateEntry(entries[2])).toEqual({
      kind: 'result',
      tab: 'evidence',
      resultId: 'result-evidence-e1',
    });
  });

  it('treats a missing entry as a no-op', () => {
    expect(activateEntry(undefined)).toEqual({ kind: 'none' });
  });
});
