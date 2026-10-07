import { expect, test } from '@playwright/test';

test('og image is served as png', async ({ page, request }) => {
  await page.goto('/');
  const og = await page.locator('meta[property="og:image"]').getAttribute('content');
  expect(og).toMatch(/\/og-image\.png$/);
  const res = await request.get(new URL(og!).pathname);
  expect(res.status()).toBe(200);
  expect(res.headers()['content-type']).toContain('image/png');
});

test('favicon resolves', async ({ page, request }) => {
  await page.goto('/');
  const href = await page.locator('link[rel="icon"]').getAttribute('href');
  const res = await request.get(href!);
  expect(res.status()).toBe(200);
});

test('external links are safe and no dead hrefs', async ({ page }) => {
  await page.goto('/');
  const rels = await page.locator('a[href^="http"]').evaluateAll((as) => as.map((a) => a.getAttribute('rel') ?? ''));
  for (const rel of rels) expect(rel).toContain('noopener');
  await expect(page.locator('a[href=""], a[href="#"]')).toHaveCount(0);
});
