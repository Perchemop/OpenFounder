/**
 * Bounded list rendering.
 *
 * Dense workspace tables can hold hundreds of rows; rendering every row on each
 * update is the main avoidable cost. Callers render `visible` and grow it with
 * `nextVisibleCount`, so the rendered work stays proportional to what is on
 * screen.
 */
export const DEFAULT_PAGE_SIZE = 25;

export interface PageSlice<T> {
  visible: T[];
  total: number;
  hiddenCount: number;
  hasMore: boolean;
}

export function pageItems<T>(items: T[], visibleCount: number): PageSlice<T> {
  const total = items.length;
  const requested = Number.isFinite(visibleCount) ? Math.floor(visibleCount) : 0;
  const effective = Math.max(0, Math.min(requested, total));

  return {
    visible: items.slice(0, effective),
    total,
    hiddenCount: total - effective,
    hasMore: effective < total,
  };
}

export function nextVisibleCount<T>(
  items: T[],
  visibleCount: number,
  pageSize: number = DEFAULT_PAGE_SIZE,
): number {
  const step = pageSize > 0 ? pageSize : DEFAULT_PAGE_SIZE;
  const requested = Number.isFinite(visibleCount) ? Math.floor(visibleCount) : 0;
  return Math.min(items.length, Math.max(0, requested) + step);
}
