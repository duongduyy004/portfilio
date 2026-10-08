import { describe, expect, it } from 'vitest';
import { digitColumns, magnetOffset, splitWords, tiltFor } from '../../src/lib/motion';

describe('splitWords', () => {
  it('splits on whitespace and keeps punctuation tokens', () => {
    expect(splitWords('Top Posts · Careers page')).toEqual(['Top', 'Posts', '·', 'Careers', 'page']);
    expect(splitWords('  a   b ')).toEqual(['a', 'b']);
    expect(splitWords('')).toEqual([]);
  });
});

describe('digitColumns', () => {
  it('maps digits to rolling columns and keeps symbols static', () => {
    expect(digitColumns('+267%')).toEqual([{ static: '+' }, { digit: 2 }, { digit: 6 }, { digit: 7 }, { static: '%' }]);
    expect(digitColumns('6M+')).toEqual([{ digit: 6 }, { static: 'M' }, { static: '+' }]);
    expect(digitColumns('13.3K')).toEqual([{ digit: 1 }, { digit: 3 }, { static: '.' }, { digit: 3 }, { static: 'K' }]);
  });
  it('keeps thousands separators static', () => {
    const cols = digitColumns('687,370');
    expect(cols).toHaveLength(7);
    expect(cols[3]).toEqual({ static: ',' });
    expect(cols.filter((c) => 'digit' in c)).toHaveLength(6);
  });
});

describe('tiltFor', () => {
  const rect = { left: 0, top: 0, width: 100, height: 100 };
  it('is flat at the centre', () => {
    expect(tiltFor(50, 50, rect, 6)).toEqual({ rx: 0, ry: 0, gx: 50, gy: 50 });
  });
  it('tilts fully at the top-right corner', () => {
    expect(tiltFor(100, 0, rect, 6)).toEqual({ rx: 6, ry: 6, gx: 100, gy: 0 });
  });
  it('clamps outside the card', () => {
    const t = tiltFor(200, 200, rect, 6);
    expect(Math.abs(t.rx)).toBeLessThanOrEqual(6);
    expect(Math.abs(t.ry)).toBeLessThanOrEqual(6);
    expect(t.gx).toBe(100);
    expect(t.gy).toBe(100);
  });
});

describe('magnetOffset', () => {
  it('does nothing beyond the radius', () => {
    expect(magnetOffset(100, 0, 64, 6)).toEqual({ x: 0, y: 0 });
  });
  it('pulls toward the pointer, at most max', () => {
    const o = magnetOffset(32, 0, 64, 6);
    expect(o.x).toBeGreaterThan(0);
    expect(o.x).toBeLessThanOrEqual(6);
    expect(o.y).toBe(0);
    const d = magnetOffset(-10, -10, 64, 6);
    expect(d.x).toBeLessThan(0);
    expect(d.y).toBeLessThan(0);
    expect(Math.hypot(d.x, d.y)).toBeLessThanOrEqual(6);
  });
  it('is zero at the exact centre', () => {
    expect(magnetOffset(0, 0, 64, 6)).toEqual({ x: 0, y: 0 });
  });
});
