import { describe, expect, it } from 'vitest';
import SplitWords from '../../src/components/SplitWords.astro';
import { render } from './render';

describe('SplitWords', () => {
  it('renders one indexed span per word and keeps the text', async () => {
    const text = 'Top Posts · Careers page';
    const html = await render(SplitWords, { text });
    const spans = [...html.matchAll(/<span[^>]*class="word"[^>]*style="--w:(\d+)"[^>]*>([^<]*)<\/span>/g)];
    expect(spans.map((m) => Number(m[1]))).toEqual([0, 1, 2, 3, 4]);
    expect(spans.map((m) => m[2])).toEqual(['Top', 'Posts', '·', 'Careers', 'page']);
    expect(html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()).toBe(text);
  });
});
