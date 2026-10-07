import { describe, expect, it } from 'vitest';
import EventGrid from '../../src/components/EventGrid.astro';
import Lightbox from '../../src/components/Lightbox.astro';
import { profile } from '../../src/data/profile';
import { render } from './render';

describe('EventGrid', () => {
  it('renders one lightbox button per event, each with alt text and a full-size source', async () => {
    const events = profile.events.slice(0, 3);
    const html = await render(EventGrid, { events });
    const buttons = html.match(/<button[^>]*data-lightbox[^>]*>/g) ?? [];
    expect(buttons).toHaveLength(3);
    for (const b of buttons) expect(b).toMatch(/data-full="[^"]+"/);
    const alts = [...html.matchAll(/<img[^>]*alt="([^"]*)"/g)].map((m) => m[1]);
    expect(alts).toHaveLength(3);
    for (const alt of alts) expect(alt.trim()).not.toBe('');
  });
});

describe('Lightbox', () => {
  it('renders a dialog with a labelled close button', async () => {
    const html = await render(Lightbox);
    expect(html).toContain('<dialog');
    expect(html).toMatch(/<button[^>]*aria-label="Close"/);
  });
});
