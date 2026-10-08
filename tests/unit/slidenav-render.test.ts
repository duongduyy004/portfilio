import { describe, expect, it } from 'vitest';
import SlideNav from '../../src/components/SlideNav.astro';
import { SLIDES } from '../../src/data/slides';
import { render } from './render';

describe('SlideNav', () => {
  it('renders a visible ordered row of labelled dots (works without JS)', async () => {
    const html = await render(SlideNav, { slides: SLIDES });
    const nav = /<nav[^>]*aria-label="Slides"[^>]*>/.exec(html)?.[0];
    expect(nav).toBeDefined();
    expect(nav).not.toMatch(/\shidden/);
    expect(html).toContain('<ol');
    const dots = [...html.matchAll(/<a[^>]*href="#(slide-\d+)"[^>]*data-dot="(\d+)"[^>]*>\s*<span class="slidenav__label[^"]*"[^>]*>([^<]+)</g)];
    expect(dots.map((d) => d[1])).toEqual(SLIDES.map((s) => s.id));
    expect(dots.map((d) => d[3])).toEqual(SLIDES.map((s) => s.title));
  });
});
