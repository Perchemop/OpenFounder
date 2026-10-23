import { describe, it, expect } from 'vitest';
import {
  collectTabbable,
  isTabbable,
  isFocusableTag,
  nextFocusIndex,
} from './focusTrap';

describe('isFocusableTag', () => {
  it('accepts the interactive form tags', () => {
    expect(isFocusableTag('button')).toBe(true);
    expect(isFocusableTag('INPUT')).toBe(true);
    expect(isFocusableTag('a')).toBe(true);
    expect(isFocusableTag('select')).toBe(true);
    expect(isFocusableTag('textarea')).toBe(true);
  });

  it('rejects structural and inert tags', () => {
    expect(isFocusableTag('div')).toBe(false);
    expect(isFocusableTag('svg')).toBe(false);
    expect(isFocusableTag('path')).toBe(false);
  });
});

describe('isTabbable', () => {
  it('rejects disabled, inert, and non-interactive elements', () => {
    expect(isTabbable({ tag: 'button', disabled: true })).toBe(false);
    expect(isTabbable({ tag: 'button', inert: true })).toBe(false);
    expect(isTabbable({ tag: 'div' })).toBe(false);
  });

  it('accepts ordinary interactive elements', () => {
    expect(isTabbable({ tag: 'button' })).toBe(true);
    expect(isTabbable({ tag: 'input', type: 'text' })).toBe(true);
  });

  it('rejects negative tabindex, including on links', () => {
    expect(isTabbable({ tag: 'button', tabIndex: -1 })).toBe(false);
    expect(isTabbable({ tag: 'a', tabIndex: -1 })).toBe(false);
    expect(isTabbable({ tag: 'a', tabIndex: 0 })).toBe(true);
  });
});

describe('nextFocusIndex', () => {
  it('moves forward and wraps at the end', () => {
    expect(nextFocusIndex(3, 0, 'forward')).toBe(1);
    expect(nextFocusIndex(3, 1, 'forward')).toBe(2);
    expect(nextFocusIndex(3, 2, 'forward')).toBe(0);
  });

  it('moves backward and wraps at the start', () => {
    expect(nextFocusIndex(3, 2, 'backward')).toBe(1);
    expect(nextFocusIndex(3, 1, 'backward')).toBe(0);
    expect(nextFocusIndex(3, 0, 'backward')).toBe(2);
  });

  it('stays put with no tabbable elements', () => {
    expect(nextFocusIndex(0, 0, 'forward')).toBe(-1);
    expect(nextFocusIndex(0, 0, 'backward')).toBe(-1);
  });

  it('handles a single element without moving', () => {
    expect(nextFocusIndex(1, 0, 'forward')).toBe(0);
    expect(nextFocusIndex(1, 0, 'backward')).toBe(0);
  });

  it('does not escape the range when the index is out of bounds', () => {
    expect(nextFocusIndex(3, 4, 'forward')).toBe(0);
    expect(nextFocusIndex(3, -2, 'backward')).toBe(2);
  });
});

describe('collectTabbable', () => {
  it('filters to tabbable nodes in DOM order', () => {
    const nodes = [
      { tag: 'div' },
      { tag: 'button' },
      { tag: 'input', disabled: true },
      { tag: 'a', tabIndex: 0 },
    ];
    expect(collectTabbable(nodes, (node) => node)).toEqual([nodes[1], nodes[3]]);
  });

  it('returns nothing when nothing is tabbable', () => {
    expect(collectTabbable([{ tag: 'div' }, { tag: 'span' }], (node) => node)).toEqual([]);
  });
});
