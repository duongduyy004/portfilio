import { expect, test } from '@playwright/test';

const SECTION_IDS = ['top-posts', 'experience', 'events', 'videos', 'beyond-work', 'contact'];

test('sections in order', async ({ page }) => {
  await page.goto('/');
  const ids = await page.locator('main section').evaluateAll((els) => els.map((e) => e.id));
  expect(ids).toEqual(SECTION_IDS);
});

test('tab highlight', async ({ page }) => {
  await page.goto('/');
  const tab = page.locator('nav[aria-label="Sections"] a[href="#events"]');
  await tab.click();
  await expect(page.locator('#events')).toBeInViewport();
  await expect(tab).toHaveAttribute('aria-current', 'true');
});

for (const width of [320, 390, 1440]) {
  test(`no horizontal scroll at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
}

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('works without JS', async ({ page }) => {
    await page.goto('/');
    for (const text of ['+267%', '687,370', '6M+']) {
      await expect(page.getByText(text, { exact: true }).first()).toBeVisible();
    }
    const firstStory = page.locator('details').first();
    await firstStory.locator('summary').click();
    await expect(firstStory.locator('p').first()).toBeVisible();

    // every non-file video is a link or a coming-soon card
    const posters = page.locator('#videos .video__media');
    const count = await posters.count();
    for (let i = 0; i < count; i++) {
      const p = posters.nth(i);
      const ok = (await p.locator('video, a[href^="https://"], .video__soon').count()) > 0;
      expect(ok).toBe(true);
    }
  });
});

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('reduced motion shows final stats', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.profile [data-count="+267%"]')).toHaveText('+267%');
  });
});

test('card photos keep their crop ratio', async ({ page }) => {
  await page.goto('/');
  const ratios = await page
    .locator('.role__photos img, .event__button img')
    .evaluateAll((imgs) => imgs.map((i) => i.getBoundingClientRect().height / i.getBoundingClientRect().width));
  expect(ratios.length).toBeGreaterThan(0);
  for (const r of ratios) expect(r).toBeCloseTo(0.75, 1);
});

test('post tiles do not repeat the title', async ({ page }) => {
  await page.goto('/');
  const first = page.locator('#top-posts .post').first();
  await expect(first.getByText('Whose idea was this?')).toHaveCount(1);
});

test('lightbox keyboard', async ({ page }) => {
  await page.goto('/');
  const opener = page.locator('[data-lightbox]').first();
  await opener.focus();
  await page.keyboard.press('Enter');
  const dialog = page.locator('dialog#lightbox');
  await expect(dialog).toHaveAttribute('open', '');
  await page.keyboard.press('Escape');
  await expect(dialog).not.toHaveAttribute('open', '');
  await expect(opener).toBeFocused();
});

test('video click-to-load', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('iframe')).toHaveCount(0);
  const youtube = page.locator('a[data-embed*="youtube-nocookie.com"]');
  test.skip((await youtube.count()) === 0, 'no youtube url in profile yet');
  await youtube.first().click();
  await expect(page.locator('iframe[src*="youtube-nocookie.com"]')).toHaveCount(1);
});
