import { describe, expect, it } from 'vitest';
import Deck from '../../src/components/Deck.astro';
import { render } from './render';

describe('Deck', () => {
  it('renders the main deck with slot content and hidden arrow buttons', async () => {
    const html = await render(Deck, {}, { default: '<section>s</section>' });
    expect(html).toMatch(/<main[^>]*class="deck"[^>]*data-deck/);
    expect(html).toContain('<section>s</section>');
    expect(html).toMatch(/<button[^>]*data-deck-prev[^>]*aria-label="Previous slide"[^>]*hidden/);
    expect(html).toMatch(/<button[^>]*data-deck-next[^>]*aria-label="Next slide"[^>]*hidden/);
  });
});
