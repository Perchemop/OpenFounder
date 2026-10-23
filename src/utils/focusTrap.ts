/**
 * Focus-trap arithmetic, kept free of DOM APIs so it can be unit-tested in the
 * same runner as the rest of the domain rules.
 */

export type FocusDirection = 'forward' | 'backward';

export function isFocusableTag(tag: string): boolean {
  const normalised = tag.toLowerCase();
  return (
    normalised === 'a' ||
    normalised === 'button' ||
    normalised === 'input' ||
    normalised === 'select' ||
    normalised === 'textarea'
  );
}

/** The subset of element attributes the trap needs, so it stays DOM-free. */
export interface TabbableDescriptor {
  tag: string;
  disabled?: boolean;
  tabIndex?: number;
  type?: string;
  inert?: boolean;
}

/** True when an element is a tabbable candidate inside a modal. */
export function isTabbable(element: TabbableDescriptor): boolean {
  if (element.inert) return false;
  if (element.disabled) return false;
  if (!isFocusableTag(element.tag)) return false;
  if (element.tag.toLowerCase() === 'a' && element.tabIndex !== undefined && element.tabIndex < 0) {
    return false;
  }
  if (element.tabIndex !== undefined && element.tabIndex < 0) return false;
  return true;
}

/**
 * Index the focus should move to when Tab is pressed inside a modal.
 *
 * Forward wraps from the last element to the first; backward wraps from the
 * first to the last. With no tabbable elements, focus stays put (returns -1 so
 * the caller can leave the focus where it is).
 */
export function nextFocusIndex(
  count: number,
  currentIndex: number,
  direction: FocusDirection
): number {
  if (count <= 0) return -1;
  if (direction === 'forward') {
    return currentIndex >= count - 1 ? 0 : currentIndex + 1;
  }
  return currentIndex <= 0 ? count - 1 : currentIndex - 1;
}

/**
 * Collects tabbable elements from a modal, in DOM order. Passed a resolver so
 * the caller decides what "element" means; this keeps the module testable
 * without a DOM implementation.
 */
export function collectTabbable<T>(
  nodes: readonly T[],
  descriptor: (node: T) => TabbableDescriptor
): T[] {
  return nodes.filter((node) => isTabbable(descriptor(node)));
}
