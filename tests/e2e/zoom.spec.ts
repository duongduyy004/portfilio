import { expect, test } from '@playwright/test';

test('every content image opens a viewer (photo lightbox or video modal)', async ({ page }) => {
  await page.goto('/');
  const orphans = await page.locator('main img, header.profile img').evaluateAll((imgs) =>
    imgs.filter((i) => !i.closest('[data-lightbox], [data-video-modal], a[href^="https://"]')).map((i) => i.getAttribute('alt') || i.getAttribute('src')),
  );
  expect(orphans).toEqual([]);
});

test('clicking a role photo opens it in the lightbox', async ({ page }) => {
  await page.goto('/');
  const opener = page.locator('#role-mor [data-lightbox]').nth(1);
  const alt = await opener.locator('img').getAttribute('alt');
  await opener.click();
  const dialog = page.locator('dialog#lightbox');
  await expect(dialog).toHaveAttribute('open', '');
  await expect(dialog.locator('img')).toHaveAttribute('alt', alt!);
  await expect(dialog.locator('figcaption')).not.toBeEmpty();
});

test('highlight screenshot and photography open the lightbox', async ({ page }) => {
  await page.goto('/');
  for (const sel of ['.highlight [data-lightbox]', '#videos .photo [data-lightbox]', '.profile [data-lightbox]']) {
    await page.locator(sel).first().click();
    await expect(page.locator('dialog#lightbox')).toHaveAttribute('open', '');
    await page.keyboard.press('Escape');
    await expect(page.locator('dialog#lightbox')).not.toHaveAttribute('open', '');
  }
});

test('ctrl-click does not open the lightbox', async ({ page, context }) => {
  await page.goto('/');
  const popup = context.waitForEvent('page', { timeout: 3000 }).catch(() => null);
  await page.locator('#role-mor [data-lightbox]').first().click({ modifiers: ['Control'] });
  await popup;
  await expect(page.locator('dialog#lightbox')).not.toHaveAttribute('open', '');
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('photos are links to their full-size image', async ({ page }) => {
    await page.goto('/');
    const href = await page.locator('#role-mor a[data-lightbox]').first().getAttribute('href');
    expect(href).toMatch(/\.(webp|jpg|jpeg|png)/);
    const res = await page.request.get(href!);
    expect(res.status()).toBe(200);
  });
});
