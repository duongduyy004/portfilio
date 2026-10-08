import { describe, expect, it } from 'vitest';
import ProfileHeader from '../../src/components/ProfileHeader.astro';
import TabBar from '../../src/components/TabBar.astro';
import { profile } from '../../src/data/profile';
import { SECTION_FIRST_SLIDE } from '../../src/data/slides';
import { SECTIONS } from '../../src/data/types';
import { formatStat, parseStat } from '../../src/lib/stat';
import { render } from './render';

const headerProps = {
  name: profile.name,
  headline: profile.headline,
  bio: profile.bio,
  skills: profile.skills,
  avatar: profile.avatar,
  stats: profile.stats,
};

describe('formatStat', () => {
  it('round-trips each stat shape', () => {
    for (const v of ['+267%', '6M+', '687,370', '13.3K', '5']) {
      expect(formatStat(parseStat(v)!, parseStat(v)!.number)).toBe(v);
    }
  });
  it('formats an intermediate value', () => {
    expect(formatStat(parseStat('687,370')!, 1234)).toBe('1,234');
  });
});

describe('ProfileHeader', () => {
  it('has exactly one h1 with the name', async () => {
    const html = await render(ProfileHeader, headerProps);
    expect(html.match(/<h1/g)).toHaveLength(1);
    const h1 = /<h1[^>]*>([\s\S]*?)<\/h1>/.exec(html)!;
    expect(h1[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()).toBe('Thuy Anh Phi');
  });
  it('renders final stat values in server HTML', async () => {
    const html = await render(ProfileHeader, headerProps);
    for (const v of ['6M+', '+267%', '160K']) expect(html).toContain(`>${v}<`);
  });
  it('renders stats as an aria-hidden odometer with the real value for screen readers', async () => {
    const html = await render(ProfileHeader, headerProps);
    expect(html).toMatch(/<span class="sr-only"[^>]*>\+267%<\/span>/);
    const odo = /<span class="odo"[^>]*aria-hidden="true"[^>]*>([\s\S]*?)<span class="stat__label/.exec(html.slice(html.indexOf('data-count="+267%"')))!;
    expect(odo[1].match(/class="odo__col"/g)).toHaveLength(3);
  });

  it('hides Download CV without a cv url', async () => {
    const html = await render(ProfileHeader, headerProps);
    expect(html).not.toContain('Download CV');
  });
  it('shows Download CV with a cv url', async () => {
    const html = await render(ProfileHeader, { ...headerProps, cvUrl: '/cv.pdf' });
    expect(html).toContain('Download CV');
  });
});

describe('TabBar', () => {
  it('links each section to its first slide and shows the counter', async () => {
    const html = await render(TabBar, { sections: SECTIONS, firstSlide: SECTION_FIRST_SLIDE, total: 10 });
    const hrefs = [...html.matchAll(/href="#([^"]+)"/g)].map((m) => m[1]);
    expect(hrefs).toEqual(['slide-2', 'slide-4', 'slide-7', 'slide-8', 'slide-9', 'slide-10']);
    expect(html).toMatch(/data-slide-counter[^>]*>01 \/ 10</);
  });
});
