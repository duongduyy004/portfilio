import { describe, expect, it } from 'vitest';
import Ticker from '../../src/components/Ticker.astro';
import { render } from './render';

describe('Ticker', () => {
  it('is hidden from screen readers and repeats its items once for a seamless loop', async () => {
    const html = await render(Ticker, { items: ['Alpha', 'Beta'] });
    expect(html).toMatch(/<div[^>]*class="ticker"[^>]*aria-hidden="true"/);
    expect(html.match(/Alpha/g)).toHaveLength(2);
    expect(html.match(/Beta/g)).toHaveLength(2);
  });
});
