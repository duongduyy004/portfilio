import { describe, expect, it } from 'vitest';
import HighlightCard from '../../src/components/HighlightCard.astro';
import PostCard from '../../src/components/PostCard.astro';
import { profile } from '../../src/data/profile';
import { render } from './render';

const post = profile.posts[0];

describe('PostCard', () => {
  it('without a url renders no link and says coming soon', async () => {
    const html = await render(PostCard, { post: { ...post, url: undefined } });
    expect(html).not.toMatch(/<a[\s>]/);
    expect(html).toContain('Link coming soon');
    expect(html).toContain('160K');
  });

  it('with a url renders an external link with an accessible name', async () => {
    const html = await render(PostCard, { post: { ...post, url: 'https://facebook.com/p/1' } });
    expect(html).toContain('href="https://facebook.com/p/1"');
    expect(html).toContain('rel="noopener"');
    expect(html).toContain('aria-label="Whose idea was this?, 160K views, opens in new tab"');
  });
});

describe('HighlightCard', () => {
  it('renders all five highlight stats', async () => {
    const html = await render(HighlightCard, profile.highlight);
    for (const s of profile.highlight.stats) expect(html).toContain(`>${s.value}<`);
  });
});
