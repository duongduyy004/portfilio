import { describe, expect, it } from 'vitest';
import ActivityCard from '../../src/components/ActivityCard.astro';
import ContactCard from '../../src/components/ContactCard.astro';
import EducationList from '../../src/components/EducationList.astro';
import { profile } from '../../src/data/profile';
import { render } from './render';

describe('ContactCard', () => {
  it('renders mailto and international tel links', async () => {
    const html = await render(ContactCard, { contact: profile.contact });
    expect(html).toMatch(/Let(&#39;|')s work together/);
    expect(html).toContain('href="mailto:thuyanhphi.work@gmail.com"');
    expect(html).toContain('href="tel:+84838831319"');
  });

  it('has no LinkedIn button', async () => {
    const html = await render(ContactCard, { contact: profile.contact });
    expect(html).not.toMatch(/linkedin/i);
  });

  it('renders no CV button when missing', async () => {
    const html = await render(ContactCard, { contact: { ...profile.contact, cv: undefined } });
    expect(html).not.toContain('Download CV');
  });

  it('renders the CV button when supplied', async () => {
    const html = await render(ContactCard, { contact: { ...profile.contact, cv: '/cv.pdf' } });
    expect(html).toContain('Download CV');
  });
});

describe('EducationList', () => {
  it('lists both schools with years', async () => {
    const html = await render(EducationList, { items: profile.education });
    expect(html).toContain('Foreign Trade University');
    expect(html).toContain('2021 – 2025');
    expect(html).toContain('Hallym University');
  });
});

describe('ActivityCard', () => {
  it('renders title, role and photo alt', async () => {
    const activity = profile.activities[0];
    const html = await render(ActivityCard, { activity });
    expect(html).toContain(activity.title);
    expect(html).toContain(activity.role);
    expect(html).toContain(`alt="${activity.photo!.alt}"`);
  });
});
