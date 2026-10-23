import { describe, it, expect } from 'vitest';
import {
  directionFromKey,
  moveSpatialSelection,
  sortForTabOrder,
  type SpatialNode,
} from './spatialNavigation';

function node(id: string, x: number, y: number): SpatialNode {
  return { id, x, y, width: 100, height: 60 };
}

describe('sortForTabOrder', () => {
  it('orders by row, then by column', () => {
    const nodes = [node('c', 300, 0), node('a', 0, 0), node('b', 150, 0), node('d', 0, 120)];
    expect(sortForTabOrder(nodes).map((n) => n.id)).toEqual(['a', 'b', 'c', 'd']);
  });

  it('does not mutate the input', () => {
    const nodes = [node('b', 0, 0), node('a', 0, 0)];
    sortForTabOrder(nodes);
    expect(nodes.map((n) => n.id)).toEqual(['b', 'a']);
  });
});

describe('moveSpatialSelection', () => {
  const grid = [
    node('top-left', 0, 0),
    node('top-right', 220, 0),
    node('centre', 110, 110),
    node('bottom-right', 300, 260),
    node('far-away', 1200, 20),
  ];

  it('moves to the nearest node in each direction', () => {
    expect(moveSpatialSelection(grid, 'centre', 'up')).toBe('top-left');
    expect(moveSpatialSelection(grid, 'centre', 'right')).toBe('top-right');
    expect(moveSpatialSelection(grid, 'centre', 'down')).toBe('bottom-right');
    expect(moveSpatialSelection(grid, 'top-right', 'down')).toBe('bottom-right');
  });

  it('prefers the nearest node over a farther one in the same direction', () => {
    const nodes = [node('a', 0, 0), node('near', 0, 130), node('far', 0, 900)];
    expect(moveSpatialSelection(nodes, 'a', 'down')).toBe('near');
  });

  it('returns null when nothing lies in that direction', () => {
    expect(moveSpatialSelection(grid, 'top-left', 'up')).toBeNull();
    expect(moveSpatialSelection(grid, 'top-left', 'left')).toBeNull();
  });

  it('falls back to Tab order when there is no current selection', () => {
    expect(moveSpatialSelection(grid, null, 'right')).toBe('top-left');
  });

  it('handles an unknown current id by falling back to Tab order', () => {
    expect(moveSpatialSelection(grid, 'ghost', 'down')).toBe('top-left');
  });

  it('returns the only node when there is nothing else to move to', () => {
    expect(moveSpatialSelection([node('solo', 0, 0)], 'solo', 'down')).toBe('solo');
  });

  it('returns null for an empty canvas', () => {
    expect(moveSpatialSelection([], 'solo', 'down')).toBeNull();
  });
});

describe('directionFromKey', () => {
  it('maps arrow keys and ignores everything else', () => {
    expect(directionFromKey('ArrowUp')).toBe('up');
    expect(directionFromKey('ArrowDown')).toBe('down');
    expect(directionFromKey('ArrowLeft')).toBe('left');
    expect(directionFromKey('ArrowRight')).toBe('right');
    expect(directionFromKey('Enter')).toBeNull();
    expect(directionFromKey('a')).toBeNull();
  });
});
