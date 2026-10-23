/**
 * Spatial navigation for the canvas. The canvas is a free-form layout, so Tab
 * order alone is a poor way to move between nodes: a user expects the arrow
 * keys to go to the nearest node in that direction.
 */

export interface SpatialNode {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export type SpatialDirection = 'up' | 'down' | 'left' | 'right';

export const SPATIAL_KEYS: Record<string, SpatialDirection> = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
};

function centre(node: SpatialNode): { x: number; y: number } {
  return { x: node.x + node.width / 2, y: node.y + node.height / 2 };
}

function isInDirection(node: SpatialNode, from: SpatialNode, direction: SpatialDirection): boolean {
  const target = centre(node);
  const origin = centre(from);
  // A small bias keeps diagonal neighbours from counting as "in" a direction.
  const overlap = 4;

  switch (direction) {
    case 'up':
      return target.y < origin.y - overlap;
    case 'down':
      return target.y > origin.y + overlap;
    case 'left':
      return target.x < origin.x - overlap;
    default:
      return target.x > origin.x + overlap;
  }
}

/**
 * Distance used to rank candidates: how far you travel in the requested
 * direction, penalised by the sideways drift, so the node you land on is the
 * one the user would consider "nearest".
 */
function directionalDistance(node: SpatialNode, from: SpatialNode, direction: SpatialDirection): number {
  const target = centre(node);
  const origin = centre(from);
  const along =
    direction === 'up' || direction === 'down' ? Math.abs(target.y - origin.y) : Math.abs(target.x - origin.x);
  const across =
    direction === 'up' || direction === 'down' ? Math.abs(target.x - origin.x) : Math.abs(target.y - origin.y);
  return along + across * 2;
}

/** Reading order for Tab: top-to-bottom, then left-to-right. */
export function sortForTabOrder(nodes: readonly SpatialNode[]): SpatialNode[] {
  return nodes
    .slice()
    .sort((a, b) => a.y - b.y || a.x - b.x || a.id.localeCompare(b.id));
}

/**
 * The node the arrow key should select, or null when nothing lies that way.
 * Returns the current node's id when it is the only node, and null when there
 * is no current selection (callers fall back to the first node in Tab order).
 */
export function moveSpatialSelection(
  nodes: readonly SpatialNode[],
  currentId: string | null,
  direction: SpatialDirection
): string | null {
  if (nodes.length === 0) return null;

  const ordered = sortForTabOrder(nodes);
  if (!currentId) return ordered[0].id;

  const from = nodes.find((node) => node.id === currentId);
  if (!from) return ordered[0].id;
  if (nodes.length === 1) return from.id;

  const candidates = nodes.filter(
    (node) => node.id !== currentId && isInDirection(node, from, direction)
  );
  if (candidates.length === 0) return null;

  const best = candidates.reduce((winner, candidate) =>
    directionalDistance(candidate, from, direction) < directionalDistance(winner, from, direction)
      ? candidate
      : winner
  );

  return best.id;
}

export function directionFromKey(key: string): SpatialDirection | null {
  return SPATIAL_KEYS[key] ?? null;
}
