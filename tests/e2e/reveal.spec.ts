import { expect, test } from '@playwright/test';

const opacityOf = (els: Element[]) => els.map((e) => getComputedStyle(e).opacity);

test('cards drop in when scrolled into view', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('html')).toHaveClass(/reveal-on/);
  const card = page.locator('#slide-7 li[data-reveal]').first();
  await expect(card).not.toHaveClass(/is-in/);
  await card.scrollIntoViewIfNeeded();
  await expect(card).toHaveClass(/is-in/);
  await expect.poll(() => card.evaluate((e) => getComputedStyle(e).opacity)).toBe('1');
});

test('grid items are staggered', async ({ page }) => {
  await page.goto('/');
  const delays = await page
    .locator('#slide-7 li[data-reveal]')
    .evaluateAll((els) => els.slice(0, 3).map((e) => getComputedStyle(e).getPropertyValue('--i').trim()));
  expect(delays).toEqual(['0', '1', '2']);
});

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('no reveal animation and everything visible', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('html')).not.toHaveClass(/reveal-on/);
    const opacities = await page.locator('[data-reveal]').evaluateAll(opacityOf);
    expect(opacities.length).toBeGreaterThan(20);
    expect(new Set(opacities)).toEqual(new Set(['1']));
  });
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('every revealable element is visible', async ({ page }) => {
    await page.goto('/');
    const opacities = await page.locator('[data-reveal]').evaluateAll(opacityOf);
    expect(opacities.length).toBeGreaterThan(20);
    expect(new Set(opacities)).toEqual(new Set(['1']));
  });
});
