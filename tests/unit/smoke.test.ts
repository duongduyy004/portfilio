import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import Base from '../../src/layouts/Base.astro';

describe('Base layout', () => {
  it('renders title, lang and viewport', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Base, {
      props: { title: 'T', description: 'D' },
    });
    expect(html).toContain('<title>T</title>');
    expect(html).toContain('lang="en"');
    expect(html).toContain('name="viewport"');
  });
});
