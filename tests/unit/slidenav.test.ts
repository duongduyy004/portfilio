import { describe, expect, it } from 'vitest';
import { counterText, currentSlide, navKey, stepTarget } from '../../src/lib/slidenav';

const key = (k: string, mods: Partial<{ shiftKey: boolean; ctrlKey: boolean; altKey: boolean; metaKey: boolean }> = {}) => ({
  key: k, shiftKey: false, ctrlKey: false, altKey: false, metaKey: false, ...mods,
});
const body = { tag: 'BODY', dialogOpen: false };

describe('currentSlide', () => {
  it('picks the last slide whose top is at or above 40% of the viewport', () => {
    expect(currentSlide([-900, -100, 300, 1200], 800, false)).toBe(2);
    expect(currentSlide([0, 900], 800, false)).toBe(0);
  });
  it('picks the last slide at the bottom of the page', () => {
    expect(currentSlide([-2000, -900], 800, true)).toBe(1);
  });
});

describe('navKey', () => {
  it('maps navigation keys', () => {
    expect(navKey(key('ArrowDown'), body)).toBe('next');
    expect(navKey(key('PageDown'), body)).toBe('next');
    expect(navKey(key(' '), body)).toBe('next');
    expect(navKey(key('ArrowUp'), body)).toBe('prev');
    expect(navKey(key('PageUp'), body)).toBe('prev');
    expect(navKey(key(' ', { shiftKey: true }), body)).toBe('prev');
    expect(navKey(key('Home'), body)).toBe('first');
    expect(navKey(key('End'), body)).toBe('last');
  });
  it('ignores modifier combinations and unrelated keys', () => {
    for (const m of ['ctrlKey', 'altKey', 'metaKey'] as const) expect(navKey(key('ArrowDown', { [m]: true }), body)).toBeNull();
    expect(navKey(key('a'), body)).toBeNull();
  });
  it('ignores everything while a dialog is open', () => {
    expect(navKey(key('ArrowDown'), { tag: 'BODY', dialogOpen: true })).toBeNull();
  });
  it('ignores everything in form fields and media', () => {
    for (const tag of ['INPUT', 'TEXTAREA', 'SELECT', 'VIDEO', 'IFRAME']) {
      expect(navKey(key('ArrowDown'), { tag, dialogOpen: false })).toBeNull();
      expect(navKey(key(' '), { tag, dialogOpen: false })).toBeNull();
    }
  });
  it('leaves Space to links, buttons and summaries but keeps arrows', () => {
    for (const tag of ['A', 'BUTTON', 'SUMMARY']) {
      expect(navKey(key(' '), { tag, dialogOpen: false })).toBeNull();
      expect(navKey(key(' ', { shiftKey: true }), { tag, dialogOpen: false })).toBeNull();
      expect(navKey(key('ArrowDown'), { tag, dialogOpen: false })).toBe('next');
    }
  });
});

describe('stepTarget', () => {
  const vh = 800;
  const bar = 60;
  it('scrolls within a slide whose bottom is below the viewport', () => {
    expect(stepTarget('next', { top: 60, bottom: 2000 }, vh, bar, 3, 10)).toEqual({ scrollBy: 740 });
  });
  it('scrolls only as far as the remaining content, so nothing is skipped', () => {
    // 300px of the slide is below the viewport: show exactly that, don't overshoot into the next slide
    expect(stepTarget('next', { top: 60, bottom: 1100 }, vh, bar, 3, 10)).toEqual({ scrollBy: 300 });
  });
  it('goes to the next slide when the current one fits', () => {
    expect(stepTarget('next', { top: 60, bottom: 790 }, vh, bar, 3, 10)).toEqual({ goTo: 4 });
  });
  it('clamps at the last slide', () => {
    expect(stepTarget('next', { top: 60, bottom: 790 }, vh, bar, 9, 10)).toEqual({ goTo: 9 });
  });
  it('scrolls back within a slide whose top is above the snap line', () => {
    expect(stepTarget('prev', { top: -1000, bottom: 700 }, vh, bar, 3, 10)).toEqual({ scrollBy: -740 });
  });
  it('scrolls back only as far as the slide top', () => {
    expect(stepTarget('prev', { top: -200, bottom: 700 }, vh, bar, 3, 10)).toEqual({ scrollBy: -260 });
  });
  it('goes to the previous slide when the top is at the snap line', () => {
    expect(stepTarget('prev', { top: 60, bottom: 790 }, vh, bar, 3, 10)).toEqual({ goTo: 2 });
  });
  it('clamps at the first slide', () => {
    expect(stepTarget('prev', { top: 60, bottom: 790 }, vh, bar, 0, 10)).toEqual({ goTo: 0 });
  });
});

describe('counterText', () => {
  it('zero-pads', () => {
    expect(counterText(0, 10)).toBe('01 / 10');
    expect(counterText(3, 10)).toBe('04 / 10');
    expect(counterText(9, 10)).toBe('10 / 10');
  });
});
