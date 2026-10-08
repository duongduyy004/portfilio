import { describe, expect, it } from 'vitest';
import { SECTION_FIRST_SLIDE, SLIDES } from '../../src/data/slides';

describe('SLIDES', () => {
  it('has ten slides numbered in order', () => {
    expect(SLIDES.map((s) => s.id)).toEqual(Array.from({ length: 10 }, (_, i) => `slide-${i + 1}`));
    SLIDES.forEach((s, i) => expect(s.n).toBe(i + 1));
  });

  it('titles match the spec', () => {
    expect(SLIDES.map((s) => s.title)).toEqual([
      'Thuy Anh Phi', 'Top Posts · Careers page', 'Top Posts', 'Experience · MOR Software',
      'Experience · Future Media', 'Experience · Meraces', 'Events', 'Videos', 'Beyond Work', 'Contact',
    ]);
  });

  it('tones cycle lavender, yellow, mint, pink, lilac', () => {
    expect(SLIDES.map((s) => s.tone)).toEqual([
      'lavender', 'yellow', 'mint', 'pink', 'lilac', 'lavender', 'yellow', 'mint', 'pink', 'lilac',
    ]);
  });

  it('sections match the spec', () => {
    expect(SLIDES.map((s) => s.section)).toEqual([
      'profile', 'top-posts', 'top-posts', 'experience', 'experience', 'experience', 'events', 'videos', 'beyond-work', 'contact',
    ]);
  });

  it('maps each section to its first slide', () => {
    expect(SECTION_FIRST_SLIDE).toEqual({
      'top-posts': 'slide-2', experience: 'slide-4', events: 'slide-7', videos: 'slide-8', 'beyond-work': 'slide-9', contact: 'slide-10',
    });
  });

  it('sets the legacy anchor only on the first slide of each section', () => {
    expect(SLIDES.map((s) => s.anchor)).toEqual([
      undefined, 'top-posts', undefined, 'experience', undefined, undefined, 'events', 'videos', 'beyond-work', 'contact',
    ]);
  });
});
