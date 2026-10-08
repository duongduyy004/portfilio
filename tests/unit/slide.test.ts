import { describe, expect, it } from 'vitest';
import Slide from '../../src/components/Slide.astro';
import { SLIDES } from '../../src/data/slides';
import { render } from './render';

describe('Slide', () => {
  it('renders id, tone, section, legacy anchor and a labelling h2', async () => {
    const html = await render(Slide, { ...SLIDES[6] }, { default: '<p>x</p>' });
    expect(html).toMatch(/<section[^>]*id="slide-7"/);
    expect(html).toMatch(/<section[^>]*class="[^"]*slide--yellow/);
    expect(html).toContain('data-section="events"');
    expect(html).toContain('data-slide');
    expect(html).toMatch(/<span[^>]*id="events"/);
    const labelledby = /aria-labelledby="([^"]+)"/.exec(html)![1];
    const h2 = new RegExp(`<h2[^>]*id="${labelledby}"[^>]*>([\\s\\S]*?)</h2>`).exec(html)!;
    expect(h2[1].replace(/<[^>]+>/g, '').trim()).toBe('Events');
    expect(html).toContain('<p>x</p>');
  });

  it('is a focusable panel with a hidden "more" hint', async () => {
    const html = await render(Slide, { ...SLIDES[3] }, { default: '<p>x</p>' });
    expect(html).toMatch(/<section[^>]*tabindex="-1"/);
    expect(html).toMatch(/<span[^>]*class="slide__more"[^>]*aria-hidden="true"[^>]*hidden/);
    expect(html).toMatch(/class="slide__more"[^>]*>\s*<span[^>]*>↓ more<\/span>/);
  });

  it('hides the header for the profile slide and labels it instead', async () => {
    const html = await render(Slide, { ...SLIDES[0], hideHeader: true }, { default: '<p>x</p>' });
    expect(html).not.toContain('<h2');
    expect(html).toContain('aria-label="Thuy Anh Phi"');
    expect(html).not.toContain('aria-labelledby');
  });
});
