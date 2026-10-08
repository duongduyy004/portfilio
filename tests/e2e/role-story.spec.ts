import { expect, test } from '@playwright/test';

// a tall screen, so the cards fit and are centred before opening
test.use({ viewport: { width: 1920, height: 1080 } });

for (const id of ['mor', 'future-media', 'meraces']) {
  test(`opening ${id}'s full story grows the card downward; its top stays put`, async ({ page }) => {
    await page.goto('/');
    const card = page.locator(`#role-${id}`);
    const n = await card.evaluate((e) => [...document.querySelectorAll('[data-slide]')].indexOf(e.closest('[data-slide]')!) + 1);
    await page.goto(`/#slide-${n}`);
    await expect(page.locator('[data-slide-counter]')).toHaveText(`${String(n).padStart(2, '0')} / 10`);
    await page.waitForTimeout(1500); // drop-in finished
    const toggle = () => card.locator('summary').evaluate((e) => (e as HTMLElement).click()); // a click that doesn't scroll
    const before = (await card.boundingBox())!;
    await toggle();
    await expect(card.locator('details')).toHaveAttribute('open', '');
    const after = (await card.boundingBox())!;
    expect(after.height).toBeGreaterThan(before.height);
    expect(Math.abs(after.y - before.y)).toBeLessThanOrEqual(1);
    // closing returns it to where it was
    await toggle();
    await expect.poll(async () => Math.abs((await card.boundingBox())!.y - before.y)).toBeLessThanOrEqual(1);
  });
}
