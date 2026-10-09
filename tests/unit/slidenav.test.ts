import { describe, expect, it } from 'vitest';
import { counterText, currentSlideY, navKey, wheelStep } from '../../src/lib/slidenav';

const key = (k: string, mods: Partial<{ shiftKey: boolean; ctrlKey: boolean; altKey: boolean; metaKey: boolean }> = {}) => ({
  key: k, shiftKey: false, ctrlKey: false, altKey: false, metaKey: false, ...mods,
});
const body = { tag: 'BODY', dialogOpen: false };

describe('currentSlideY', () => {
  it('rounds to the nearest slide and clamps', () => {
    expect(currentSlideY(0, 400, 10)).toBe(0);
    expect(currentSlideY(390, 400, 10)).toBe(1);
    expect(currentSlideY(4100, 400, 10)).toBe(9);
  });
  it('handles a zero-height deck', () => {
    expect(currentSlideY(0, 0, 10)).toBe(0);
  });
});

describe('navKey', () => {
  it('maps vertical and paging keys', () => {
    expect(navKey(key('ArrowDown'), body)).toBe('next');
    expect(navKey(key('ArrowUp'), body)).toBe('prev');
    expect(navKey(key('Home'), body)).toBe('first');
    expect(navKey(key('End'), body)).toBe('last');
    expect(navKey(key('PageDown'), body)).toBe('page-next');
    expect(navKey(key(' '), body)).toBe('page-next');
    expect(navKey(key('PageUp'), body)).toBe('page-prev');
    expect(navKey(key(' ', { shiftKey: true }), body)).toBe('page-prev');
  });
  it('leaves horizontal arrows native', () => {
    expect(navKey(key('ArrowLeft'), body)).toBeNull();
    expect(navKey(key('ArrowRight'), body)).toBeNull();
  });
  it('ignores modifiers, dialogs and unrelated keys', () => {
    for (const m of ['ctrlKey', 'altKey', 'metaKey'] as const) expect(navKey(key('ArrowDown', { [m]: true }), body)).toBeNull();
    expect(navKey(key('ArrowDown'), { tag: 'BODY', dialogOpen: true })).toBeNull();
    expect(navKey(key('a'), body)).toBeNull();
  });
  it('ignores everything in form fields and media', () => {
    for (const tag of ['INPUT', 'TEXTAREA', 'SELECT', 'VIDEO', 'IFRAME']) {
      expect(navKey(key('ArrowDown'), { tag, dialogOpen: false })).toBeNull();
    }
  });
  it('leaves Space to links, buttons and summaries but keeps arrows', () => {
    for (const tag of ['A', 'BUTTON', 'SUMMARY']) {
      expect(navKey(key(' '), { tag, dialogOpen: false })).toBeNull();
      expect(navKey(key('ArrowDown'), { tag, dialogOpen: false })).toBe('next');
    }
  });
});

describe('wheelStep', () => {
  it('lets the slide scroll natively when it can', () => {
    expect(wheelStep(30, true, false, 0)).toEqual({ consume: false, accumulated: 0 });
    expect(wheelStep(-30, true, true, 0)).toEqual({ consume: false, accumulated: 0 });
  });
  it('accumulates at an edge', () => {
    expect(wheelStep(30, false, true, 0)).toEqual({ consume: true, accumulated: 30, move: 0 });
    expect(wheelStep(0, false, false, 20)).toEqual({ consume: true, accumulated: 20, move: 0 });
  });
  it('moves one slide once the threshold is passed', () => {
    expect(wheelStep(30, false, true, 30)).toEqual({ consume: true, accumulated: 0, move: 1 });
    expect(wheelStep(-60, true, false, 0)).toEqual({ consume: true, accumulated: 0, move: -1 });
  });
});

describe('counterText', () => {
  it('zero-pads', () => {
    expect(counterText(0, 10)).toBe('01 / 10');
    expect(counterText(3, 10)).toBe('04 / 10');
    expect(counterText(9, 10)).toBe('10 / 10');
  });
});
