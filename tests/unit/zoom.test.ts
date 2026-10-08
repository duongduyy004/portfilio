import { describe, expect, it } from 'vitest';
import ZoomImage from '../../src/components/ZoomImage.astro';
import { profile } from '../../src/data/profile';
import { render } from './render';

const photo = profile.roles[0].photos[1];

describe('ZoomImage', () => {
  it('wraps the image in a lightbox link to its full-size version', async () => {
    const html = await render(ZoomImage, { photo, caption: 'Ha Long trip', widths: [240, 480], sizes: '300px' });
    const link = /<a[^>]*data-lightbox[^>]*>/.exec(html)?.[0];
    expect(link).toBeDefined();
    expect(link).toMatch(/href="[^"]+\.(webp|jpg|jpeg|png)[^"]*"/);
    expect(link).toMatch(/data-full="[^"]+"/);
    expect(link).toContain('data-caption="Ha Long trip"');
    expect(html).toMatch(new RegExp(`<img[^>]*alt="${photo.alt.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`));
  });

  it('falls back to the alt text as the caption', async () => {
    const html = await render(ZoomImage, { photo, widths: [240], sizes: '240px' });
    expect(html).toContain(`data-caption="${photo.alt}"`);
  });
});
