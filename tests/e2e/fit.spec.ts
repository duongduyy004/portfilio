import { expect, test } from '@playwright/test';

for (const viewport of [{ width: 320, height: 568 }, { width: 390, height: 844 }, { width: 1440, height: 600 }, { width: 1440, height: 900 }]) {
  test(`every slide fits the viewport at ${viewport.width}x${viewport.height}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);
    for (let n = 1; n <= 10; n++) {
      await page.evaluate(n => {
        const deck = document.querySelector<HTMLElement>('[data-deck]')!;
        deck.scrollTo({ top: (n - 1) * deck.clientHeight, behavior: 'auto' });
      }, n);
      await expect(page.locator('[data-slide-counter]')).toHaveText(`${String(n).padStart(2, '0')} / 10`);
      await expect.poll(() => page.locator(`#slide-${n}`).evaluate(e => {
        const slide = e.getBoundingClientRect();
        const content = e.querySelector('.slide__inner')!.getBoundingClientRect();
        return content.top >= slide.top - 1 && content.bottom <= slide.bottom + 1
          && content.left >= slide.left - 1 && content.right <= slide.right + 1;
      })).toBe(true);
      expect(await page.locator(`#slide-${n}`).evaluate(e => getComputedStyle(e).overflowY)).toBe('hidden');
    }
  });
}
