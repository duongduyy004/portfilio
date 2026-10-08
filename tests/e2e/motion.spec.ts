import { expect, test, type Page } from '@playwright/test';

const counter = (page: Page) => page.locator('[data-slide-counter]');

async function goSlide(page: Page, n: number) {
  await page.evaluate((n) => {
    const deck = document.querySelector<HTMLElement>('[data-deck]')!;
    deck.scrollTo({ left: (n - 1) * deck.clientWidth, behavior: 'auto' });
  }, n);
  await expect(counter(page)).toHaveText(`${String(n).padStart(2, '0')} / 10`);
}

test.describe('word-reveal headings', () => {
  test('split headings keep their names', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#slide-1 h1')).toHaveAccessibleName('Thuy Anh Phi');
    for (let n = 2; n <= 10; n++) {
      const title = await page.locator(`#slide-${n}`).getAttribute('data-title');
      await expect(page.locator(`#slide-${n} h2`)).toHaveAccessibleName(title!);
      await expect(page.locator(`#slide-${n} h2 .word`).first()).toBeAttached();
    }
  });

  test('heading words end visible', async ({ page }) => {
    await page.goto('/');
    await goSlide(page, 3);
    const words = page.locator('#slide-3 h2 .word');
    await expect(words).toHaveCount(2); // "Top Posts"
    await expect.poll(() => words.evaluateAll((ws) => ws.every((w) => getComputedStyle(w).opacity === '1'))).toBe(true);
  });

  test.describe('reduced motion', () => {
    test.use({ reducedMotion: 'reduce' });
    test('words are visible immediately', async ({ page }) => {
      await page.goto('/');
      const ops = await page.locator('h1 .word, h2 .word').evaluateAll((ws) => ws.map((w) => getComputedStyle(w).opacity));
      expect(ops.length).toBeGreaterThan(10);
      expect(new Set(ops)).toEqual(new Set(['1']));
    });
  });
});
