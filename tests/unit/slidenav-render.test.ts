import { describe, expect, it } from 'vitest';
import SlideNav from '../../src/components/SlideNav.astro';
import { SLIDES } from '../../src/data/slides';
import { render } from './render';

describe('SlideNav', () => {
  it('renders a hidden rail with one labelled dot per slide', async () => {
    const html = await render(SlideNav, { slides: SLIDES });
    expect(html).toMatch(/<nav[^>]*aria-label="Slides"[^>]*hidden/);
    const dots = [...html.matchAll(/<a[^>]*href="#(slide-\d+)"[^>]*data-dot="(\d+)"[^>]*>\s*<span class="slidenav__label[^"]*"[^>]*>([^<]+)</g)];
    expect(dots.map((d) => d[1])).toEqual(SLIDES.map((s) => s.id));
    expect(dots.map((d) => d[3])).toEqual(SLIDES.map((s) => s.title));
  });
});
