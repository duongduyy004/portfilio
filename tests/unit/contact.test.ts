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

  it('renders no LinkedIn link or CV button when missing', async () => {
    const html = await render(ContactCard, { contact: { ...profile.contact, linkedin: undefined, cv: undefined } });
    expect(html).not.toContain('linkedin.com');
    expect(html).not.toContain('Download CV');
    expect(html).toContain('LinkedIn coming soon');
  });

  it('renders LinkedIn and CV when supplied', async () => {
    const html = await render(ContactCard, {
      contact: { ...profile.contact, linkedin: 'https://www.linkedin.com/in/x', cv: '/cv.pdf' },
    });
    expect(html).toContain('href="https://www.linkedin.com/in/x"');
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
