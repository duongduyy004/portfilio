import { describe, expect, it } from 'vitest';
import { profile } from '../../src/data/profile';

function collect(obj: unknown, key: string, out: unknown[] = [], seen = new Set<unknown>()): unknown[] {
  if (obj === null || typeof obj !== 'object' || seen.has(obj)) return out;
  seen.add(obj);
  for (const [k, v] of Object.entries(obj)) {
    if (k === key) out.push(v);
    // image metadata objects are leaves
    if (k === 'src' && typeof v === 'object') continue;
    collect(v, key, out, seen);
  }
  return out;
}

const role = (id: string) => profile.roles.find((r) => r.id === id)!;
const metricValues = (id: string) => role(id).metrics.map((m) => m.value);

describe('profile content', () => {
  it('names and headline', () => {
    expect(profile.name).toBe('Thuy Anh Phi');
    expect(profile.headline).toBe('Employer Branding & Internal Communication');
  });

  it('headline stats match the deck', () => {
    expect(profile.stats.map((s) => s.value)).toEqual(['6M+', '+267%', '160K']);
  });

  it('careers-page highlight matches the deck', () => {
    expect(profile.highlight.stats.map((s) => s.value)).toEqual(['687,370', '+209%', '49,110', '+135%', '+50%']);
  });

  it('top posts match the deck', () => {
    expect(profile.posts.map((p) => p.views)).toEqual(['160K', '93K', '66K', '54K+']);
  });

  it('roles in order', () => {
    expect(profile.roles.map((r) => r.id)).toEqual(['mor', 'future-media', 'meraces']);
  });

  it('role metrics match the deck', () => {
    expect(metricValues('future-media')).toEqual(expect.arrayContaining(['1,451', '446,065', '6M+']));
    expect(metricValues('meraces')).toEqual(expect.arrayContaining(['128,552', '100+', '5']));
  });

  it('contact details', () => {
    expect(profile.contact.email).toBe('thuyanhphi.work@gmail.com');
    expect(profile.contact.phone).toBe('083-883-1319');
  });

  it('every url is undefined or https', () => {
    for (const url of collect(profile, 'url')) {
      if (url !== undefined) expect(String(url)).toMatch(/^https:\/\//);
    }
  });

  it('every photo has alt text', () => {
    const alts = collect(profile, 'alt');
    expect(alts.length).toBeGreaterThan(10);
    for (const alt of alts) expect(typeof alt === 'string' && alt.trim().length > 0).toBe(true);
  });
});
