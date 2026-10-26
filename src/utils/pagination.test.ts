import { describe, expect, it } from 'vitest';
import { DEFAULT_PAGE_SIZE, nextVisibleCount, pageItems } from './pagination';

const items = (count: number) => Array.from({ length: count }, (_, index) => `row-${index}`);

describe('pageItems', () => {
  it('returns everything when the list is shorter than the window', () => {
    const slice = pageItems(items(3), DEFAULT_PAGE_SIZE);
    expect(slice.visible).toHaveLength(3);
    expect(slice.total).toBe(3);
    expect(slice.hiddenCount).toBe(0);
    expect(slice.hasMore).toBe(false);
  });

  it('bounds a 500-row table to the window and reports the remainder', () => {
    const slice = pageItems(items(500), DEFAULT_PAGE_SIZE);
    expect(slice.visible).toHaveLength(DEFAULT_PAGE_SIZE);
    expect(slice.visible[0]).toBe('row-0');
    expect(slice.total).toBe(500);
    expect(slice.hiddenCount).toBe(475);
    expect(slice.hasMore).toBe(true);
  });

  it('handles an empty list and a zero window', () => {
    expect(pageItems([], DEFAULT_PAGE_SIZE)).toEqual({
      visible: [],
      total: 0,
      hiddenCount: 0,
      hasMore: false,
    });
    expect(pageItems(items(5), 0).visible).toHaveLength(0);
  });

  it('clamps a window larger than the list and ignores a non-finite window', () => {
    expect(pageItems(items(4), 99).visible).toHaveLength(4);
    expect(pageItems(items(4), Number.NaN).visible).toHaveLength(0);
  });

  it('does not mutate the input list', () => {
    const source = items(30);
    pageItems(source, 10);
    expect(source).toHaveLength(30);
  });
});

describe('nextVisibleCount', () => {
  it('grows by one page', () => {
    expect(nextVisibleCount(items(500), 25)).toBe(50);
  });

  it('never exceeds the list length', () => {
    expect(nextVisibleCount(items(30), 25)).toBe(30);
    expect(nextVisibleCount(items(10), 25)).toBe(10);
  });

  it('falls back to the default page size for an invalid step', () => {
    expect(nextVisibleCount(items(500), 25, 0)).toBe(50);
  });
});
