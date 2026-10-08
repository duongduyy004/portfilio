import { expect, test, type Locator, type Page } from '@playwright/test';

async function expectCloseOutside(page: Page, frame: Locator, close: Locator) {
  const f = (await frame.boundingBox())!;
  const c = (await close.boundingBox())!;
  // sits above the frame, right-aligned with it, and fully on screen
  expect(c.y + c.height).toBeLessThanOrEqual(f.y);
  expect(Math.abs(c.x + c.width - (f.x + f.width))).toBeLessThanOrEqual(2);
  expect(c.y).toBeGreaterThanOrEqual(0);
  const vw = page.viewportSize()!.width;
  expect(c.x + c.width).toBeLessThanOrEqual(vw);
}

test('photo viewer close button sits outside the frame', async ({ page }) => {
  await page.goto('/');
  await page.locator('#role-mor [data-lightbox]').nth(1).click();
  const dialog = page.locator('dialog#lightbox');
  await expect(dialog).toHaveAttribute('open', '');
  await expectCloseOutside(page, dialog.locator('.lightbox__frame'), dialog.getByRole('button', { name: 'Close' }));
  await dialog.getByRole('button', { name: 'Close' }).click();
  await expect(dialog).not.toHaveAttribute('open', '');
});

test('video player close button sits outside the frame', async ({ page }) => {
  await page.goto('/');
  await page.locator('a[data-video-modal][href="/video/dance.mp4"]').click();
  const dialog = page.locator('dialog#video-modal');
  await expect(dialog).toHaveAttribute('open', '');
  await expectCloseOutside(page, dialog.locator('.video-modal__frame'), dialog.getByRole('button', { name: 'Close video' }));
  await dialog.getByRole('button', { name: 'Close video' }).click();
  await expect(dialog).not.toHaveAttribute('open', '');
});

test('clicking the backdrop beside the frame still closes the photo viewer', async ({ page }) => {
  await page.goto('/');
  await page.locator('#role-mor [data-lightbox]').nth(1).click();
  const dialog = page.locator('dialog#lightbox');
  await expect(dialog).toHaveAttribute('open', '');
  await page.mouse.click(4, 4);
  await expect(dialog).not.toHaveAttribute('open', '');
});
