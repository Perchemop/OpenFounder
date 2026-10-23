import { useEffect, useRef } from 'react';
import { collectTabbable, nextFocusIndex } from '../utils/focusTrap';

/**
 * Traps Tab focus inside a dialog while it is open, moves focus to the first
 * tabbable element on open, and closes on Escape. Restores focus to the
 * previously focused element on close, which is the part screen-reader and
 * keyboard users notice most.
 *
 * The traversal arithmetic lives in `focusTrap.ts` and is unit-tested; this
 * hook is only the wiring.
 */
export function useFocusTrap<T extends HTMLElement>(isOpen: boolean, onClose: () => void) {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (!isOpen) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const dialog = ref.current;

    const tabbable = () =>
      dialog
        ? collectTabbable(Array.from(dialog.querySelectorAll<HTMLElement>('*')), (element) => ({
            tag: element.tagName,
            disabled: (element as HTMLButtonElement).disabled,
            tabIndex: element.getAttribute('tabindex')
              ? Number(element.getAttribute('tabindex'))
              : undefined,
            inert: element.hasAttribute('inert'),
          }))
        : [];

    const focusables = tabbable();
    if (focusables.length > 0) {
      focusables[0].focus();
    } else {
      dialog?.focus();
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onClose();
        return;
      }
      if (event.key !== 'Tab' || !dialog) return;

      const nodes = tabbable();
      if (nodes.length === 0) {
        event.preventDefault();
        return;
      }
      const index = nodes.findIndex((element) => element === document.activeElement);
      const next = nextFocusIndex(nodes.length, index, event.shiftKey ? 'backward' : 'forward');
      event.preventDefault();
      if (next >= 0) nodes[next].focus();
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
      previouslyFocused?.focus?.();
    };
  }, [isOpen, onClose]);

  return ref;
}
