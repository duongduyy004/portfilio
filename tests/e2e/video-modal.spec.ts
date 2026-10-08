import { expect, test } from '@playwright/test';

const dancePoster = (page: import('@playwright/test').Page) =>
  page.locator('#videos a[data-video-modal][href="/video/dance.mp4"]');

test('no video element exists before a poster is tapped', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('video')).toHaveCount(0);
});

test('tapping a poster opens the modal and plays the video', async ({ page }) => {
  await page.goto('/');
  await dancePoster(page).click();
  const dialog = page.locator('dialog#video-modal');
  await expect(dialog).toHaveAttribute('open', '');
  const video = dialog.locator('video');
  await expect(video).toHaveAttribute('src', '/video/dance.mp4');
  await expect(dialog.locator('.video-modal__title')).toHaveText('Dance');
  await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.currentTime), { timeout: 8000 }).toBeGreaterThan(0);
});

test('Esc closes the modal, removes the player and returns focus', async ({ page }) => {
  await page.goto('/');
  const poster = dancePoster(page);
  await poster.focus();
  await page.keyboard.press('Enter');
  const dialog = page.locator('dialog#video-modal');
  await expect(dialog).toHaveAttribute('open', '');
  await page.keyboard.press('Escape');
  await expect(dialog).not.toHaveAttribute('open', '');
  await expect(page.locator('video')).toHaveCount(0);
  await expect(poster).toBeFocused();
});

test('close button closes the modal', async ({ page }) => {
  await page.goto('/');
  await dancePoster(page).click();
  await page.getByRole('button', { name: 'Close video' }).click();
  await expect(page.locator('dialog#video-modal')).not.toHaveAttribute('open', '');
  await expect(page.locator('video')).toHaveCount(0);
});

test('ctrl-click does not open the modal', async ({ page, context }) => {
  await page.goto('/');
  const popup = context.waitForEvent('page', { timeout: 3000 }).catch(() => null);
  await dancePoster(page).click({ modifiers: ['Control'] });
  await popup;
  await expect(page.locator('dialog#video-modal')).not.toHaveAttribute('open', '');
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('posters are plain links to the mp4', async ({ page }) => {
    await page.goto('/');
    await expect(dancePoster(page)).toHaveCount(1);
    await expect(page.locator('#videos a[href="/video/edits.mp4"]')).toHaveCount(1);
  });
});
