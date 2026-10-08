/** Index of the current slide: the last whose top is at or above 40% of the viewport; the last slide at page bottom. */
export function currentSlide(tops: number[], viewportH: number, atBottom: boolean): number {
  if (atBottom) return tops.length - 1;
  const line = viewportH * 0.4;
  let current = 0;
  tops.forEach((top, i) => {
    if (top <= line) current = i;
  });
  return current;
}

export type NavKey = 'next' | 'prev' | 'first' | 'last';

interface KeyLike {
  key: string;
  shiftKey: boolean;
  ctrlKey: boolean;
  altKey: boolean;
  metaKey: boolean;
}

const NO_KEYS = new Set(['INPUT', 'TEXTAREA', 'SELECT', 'VIDEO', 'IFRAME']);
// Space activates these, so it stays theirs; arrows still navigate
const OWNS_SPACE = new Set(['A', 'BUTTON', 'SUMMARY']);

/** Map a key event to a slide action, or null when the browser should handle it. */
export function navKey(e: KeyLike, focus: { tag: string; dialogOpen: boolean }): NavKey | null {
  if (e.ctrlKey || e.altKey || e.metaKey || focus.dialogOpen || NO_KEYS.has(focus.tag)) return null;
  if (e.key === ' ') return OWNS_SPACE.has(focus.tag) ? null : e.shiftKey ? 'prev' : 'next';
  switch (e.key) {
    case 'ArrowDown':
    case 'PageDown':
      return 'next';
    case 'ArrowUp':
    case 'PageUp':
      return 'prev';
    case 'Home':
      return 'first';
    case 'End':
      return 'last';
    default:
      return null;
  }
}

/**
 * For next/prev: scroll within the current slide if it overflows that way (never further than the
 * overflow, so no content is skipped), else go to a neighbouring slide.
 */
export function stepTarget(
  action: 'next' | 'prev',
  slide: { top: number; bottom: number },
  viewportH: number,
  tabbarH: number,
  index: number,
  count: number,
): { scrollBy: number } | { goTo: number } {
  const step = viewportH - tabbarH;
  if (action === 'next') {
    if (slide.bottom > viewportH + 1) return { scrollBy: Math.min(step, slide.bottom - viewportH) };
    return { goTo: Math.min(index + 1, count - 1) };
  }
  if (slide.top < tabbarH - 1) return { scrollBy: -Math.min(step, tabbarH - slide.top) };
  return { goTo: Math.max(index - 1, 0) };
}

export function counterText(index: number, count: number): string {
  return `${String(index + 1).padStart(2, '0')} / ${count}`;
}
