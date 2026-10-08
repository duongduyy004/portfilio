import { expect, test } from '@playwright/test';

const SLIDE_IDS = Array.from({ length: 10 }, (_, i) => `slide-${i + 1}`);

test('slides in order', async ({ page }) => {
  await page.goto('/');
  const ids = await page.locator('[data-slide]').evaluateAll((els) => els.map((e) => e.id));
  expect(ids).toEqual(SLIDE_IDS);
});

test('tab highlight', async ({ page }) => {
  await page.goto('/');
  const tab = page.locator('nav[aria-label="Sections"] a[href="#slide-7"]');
  await tab.click();
  await expect(page.locator('#slide-7')).toBeInViewport();
  await expect(tab).toHaveAttribute('aria-current', 'true');
});

test('contact tab becomes current at the bottom of the page', async ({ page }) => {
  await page.goto('/');
  const tab = page.locator('nav[aria-label="Sections"] a[href="#slide-10"]');
  await tab.click();
  await expect(tab).toHaveAttribute('aria-current', 'true');
  await expect(page.locator('nav[aria-label="Sections"] [aria-current="true"]')).toHaveCount(1);
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

    // every video card is a link (to the mp4 or the platform) or a coming-soon card
    const posters = page.locator('#slide-8 .video__media');
    const count = await posters.count();
    for (let i = 0; i < count; i++) {
      const p = posters.nth(i);
      const ok = (await p.locator('a[href$=".mp4"], a[href^="https://"], .video__soon').count()) > 0;
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
    .locator('.role__photos img, .event__photo img')
    .evaluateAll((imgs) => imgs.map((i) => i.getBoundingClientRect().height / i.getBoundingClientRect().width));
  expect(ratios.length).toBeGreaterThan(0);
  for (const r of ratios) expect(r).toBeCloseTo(0.75, 1);
});

test('post tiles do not repeat the title', async ({ page }) => {
  await page.goto('/');
  const first = page.locator('#slide-3 .post').first();
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
  await expect(page.locator('dialog#video-modal iframe[src*="youtube-nocookie.com"]')).toHaveCount(1);
});
