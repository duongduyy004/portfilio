/** Index of the slide filling most of a vertical deck. */
export function currentSlideY(scrollTop: number, deckHeight: number, count: number): number {
  if (deckHeight <= 0) return 0;
  return Math.max(0, Math.min(count - 1, Math.round(scrollTop / deckHeight)));
}

/** page-next / page-prev only act at the current slide's bottom / top edge; the caller checks. */
export type NavAction = 'next' | 'prev' | 'first' | 'last' | 'page-next' | 'page-prev';

interface KeyLike {
  key: string;
  shiftKey: boolean;
  ctrlKey: boolean;
  altKey: boolean;
  metaKey: boolean;
}

const NO_KEYS = new Set(['INPUT', 'TEXTAREA', 'SELECT', 'VIDEO', 'IFRAME']);
// Space toggles summaries and presses buttons, so it stays theirs; arrows still navigate
const OWNS_SPACE = new Set(['A', 'BUTTON', 'SUMMARY']);

/** Map a key event to a deck action, or null when the browser should handle it. */
export function navKey(e: KeyLike, focus: { tag: string; dialogOpen: boolean }): NavAction | null {
  if (e.ctrlKey || e.altKey || e.metaKey || focus.dialogOpen || NO_KEYS.has(focus.tag)) return null;
  if (e.key === ' ') return OWNS_SPACE.has(focus.tag) ? null : e.shiftKey ? 'page-prev' : 'page-next';
  switch (e.key) {
    case 'ArrowDown':
      return 'next';
    case 'ArrowUp':
      return 'prev';
    case 'Home':
      return 'first';
    case 'End':
      return 'last';
    case 'PageDown':
      return 'page-next';
    case 'PageUp':
      return 'page-prev';
    default:
      return null;
  }
}

const WHEEL_THRESHOLD = 50;

/**
 * Decide what a vertical wheel delta does: scroll the slide natively while it can move that way,
 * otherwise accumulate and move one slide once the threshold is passed.
 */
export function wheelStep(
  deltaY: number,
  canScrollDown: boolean,
  canScrollUp: boolean,
  accumulated: number,
): { consume: false; accumulated: 0 } | { consume: true; accumulated: number; move: -1 | 0 | 1 } {
  if ((deltaY > 0 && canScrollDown) || (deltaY < 0 && canScrollUp)) return { consume: false, accumulated: 0 };
  const total = accumulated + deltaY;
  if (Math.abs(total) >= WHEEL_THRESHOLD) return { consume: true, accumulated: 0, move: total > 0 ? 1 : -1 };
  return { consume: true, accumulated: total, move: 0 };
}

export function counterText(index: number, count: number): string {
  return `${String(index + 1).padStart(2, '0')} / ${count}`;
}
