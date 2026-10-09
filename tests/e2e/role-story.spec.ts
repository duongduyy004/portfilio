import { expect, test } from '@playwright/test';
test.use({ viewport: { width: 1920, height: 1080 }, reducedMotion: 'reduce' });
for (const id of ['mor', 'future-media', 'meraces']) {
  test(`reading ${id}'s full story keeps the card fitted`, async ({ page }) => {
    await page.goto('/');
    const card = page.locator(`#role-${id}`);
    const n = await card.evaluate(e => [...document.querySelectorAll('[data-slide]')].indexOf(e.closest('[data-slide]')!) + 1);
    await page.goto(`/#slide-${n}`);
    await expect(page.locator('[data-slide-counter]')).toHaveText(`${String(n).padStart(2, '0')} / 10`);
    const before = (await card.boundingBox())!;
    await card.locator('summary').click();
    const dialog = page.locator('.story-modal[open]');
    await expect(dialog).toBeVisible();
    await expect(dialog.locator('p').first()).toBeVisible();
    const after = (await card.boundingBox())!;
    expect(Math.abs(after.y - before.y)).toBeLessThanOrEqual(1);
    expect(Math.abs(after.height - before.height)).toBeLessThanOrEqual(1);
    await dialog.getByRole('button', { name: 'Close' }).click();
    await expect(dialog).toHaveCount(0);
    await expect(card.locator('summary')).toBeFocused();
  });
}
