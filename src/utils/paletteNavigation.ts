import type { WorkspaceSearchResult } from './workspaceSearch';

export interface PaletteEntry {
  /** Stable key used by React and by the selection index. */
  id: string;
  tab: string;
  /** Everything the row renders: title, detail, action label. */
  label: string;
}

/**
 * Flattens the palette's flat list (action, navigation, then search results)
 * into a single keyboard-navigable sequence, mirroring the render order.
 */
export function buildPaletteEntries(
  showCreateProject: boolean,
  navTabs: readonly string[],
  results: readonly WorkspaceSearchResult[]
): PaletteEntry[] {
  const entries: PaletteEntry[] = [];

  if (showCreateProject) {
    entries.push({ id: 'create-project', tab: '', label: 'Create New Project' });
  }

  for (const tab of navTabs) {
    entries.push({ id: `nav-${tab}`, tab, label: tab });
  }

  for (const result of results) {
    entries.push({
      id: `result-${result.kind}-${result.id}`,
      tab: result.tab,
      label: result.title,
    });
  }

  return entries;
}

/** Moves the selection with wraparound in both directions. */
export function moveSelection(
  count: number,
  current: number,
  direction: 'forward' | 'backward'
): number {
  if (count <= 0) return -1;
  if (current < 0 || current >= count) return direction === 'forward' ? 0 : count - 1;
  return direction === 'forward'
    ? (current + 1) % count
    : (current - 1 + count) % count;
}

export interface PaletteActivation {
  kind: 'project' | 'tab' | 'result' | 'none';
  tab?: string;
  resultId?: string;
}

/** Interprets an Enter/Space press on a given entry. */
export function activateEntry(entry: PaletteEntry | undefined): PaletteActivation {
  if (!entry) return { kind: 'none' };
  if (entry.id === 'create-project') return { kind: 'project' };
  if (entry.id.startsWith('nav-')) return { kind: 'tab', tab: entry.tab };
  if (entry.id.startsWith('result-')) {
    return { kind: 'result', tab: entry.tab, resultId: entry.id };
  }
  return { kind: 'none' };
}
