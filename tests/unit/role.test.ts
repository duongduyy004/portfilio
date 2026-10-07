import { describe, expect, it } from 'vitest';
import RoleCard from '../../src/components/RoleCard.astro';
import { profile } from '../../src/data/profile';
import { render } from './render';

const mor = profile.roles.find((r) => r.id === 'mor')!;

// Astro escapes apostrophes etc.; compare against the escaped form
const escape = (s: string) =>
  s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');

describe('RoleCard', () => {
  it('puts the full story inside details/summary', async () => {
    const html = await render(RoleCard, { role: mor });
    expect(html).toContain('<details');
    expect(html).toMatch(/<summary[^>]*>[\s\S]*Read the full story[\s\S]*<\/summary>/);
    for (const p of mor.story) expect(html).toContain(escape(p));
  });

  it('renders one list item per bullet', async () => {
    const html = await render(RoleCard, { role: mor });
    expect(html.match(/<li/g)).toHaveLength(mor.bullets.length);
  });

  it('omits dates when not provided', async () => {
    const html = await render(RoleCard, { role: { ...mor, dates: undefined } });
    expect(html).not.toContain('role__dates');
  });

  it('shows dates when provided', async () => {
    const html = await render(RoleCard, { role: { ...mor, dates: '2025 – Present' } });
    expect(html).toContain('2025 – Present');
  });
});
