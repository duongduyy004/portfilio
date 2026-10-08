import { expect, test, type Page } from '@playwright/test';

const counter = (page: Page) => page.locator('[data-slide-counter]');
const isMobile = (page: Page) => page.viewportSize()!.width < 900;
const tabbarH = (page: Page) => page.locator('.tabbar').evaluate((e) => e.getBoundingClientRect().height);

test('ten full-height slides', async ({ page }) => {
  await page.goto('/');
  const slides = page.locator('[data-slide]');
  await expect(slides).toHaveCount(10);
  const bar = await tabbarH(page);
  const vh = page.viewportSize()!.height;
  const heights = await slides.evaluateAll((els) => els.map((e) => e.getBoundingClientRect().height));
  for (const h of heights) expect(h).toBeGreaterThanOrEqual(vh - bar - 1 - 4);
});

test.describe('layout', () => {
  // measure the settled layout, not cards mid drop-in
  test.use({ reducedMotion: 'reduce' });

  test('profile card lines up with the other slides and its stats do not wrap', async ({ page }) => {
  await page.goto('/');
  const profile = (await page.locator('#slide-1 .profile__card').boundingBox())!;
  const highlight = (await page.locator('#slide-2 .highlight').boundingBox())!;
  expect(Math.abs(profile.x - highlight.x)).toBeLessThanOrEqual(1);
  expect(Math.abs(profile.width - highlight.width)).toBeLessThanOrEqual(1);
  const lines = await page
    .locator('#slide-1 .stat__value')
    .evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().height / parseFloat(getComputedStyle(e).lineHeight))));
  for (const n of lines) expect(n).toBe(1);
  });
});

test('keyboard moves between slides', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('End');
  await expect(counter(page)).toHaveText('10 / 10');
  await page.keyboard.press('Home');
  await expect(counter(page)).toHaveText('01 / 10');
  await page.keyboard.press('PageDown');
  await expect(counter(page)).toHaveText('02 / 10');
  await expect.poll(() => page.evaluate(() => location.hash)).toBe('#slide-2');
});

test('arrow scrolls within a tall slide first', async ({ page }) => {
  test.skip(!isMobile(page), 'slides fit on desktop');
  await page.goto('/#slide-4');
  await expect(counter(page)).toHaveText('04 / 10');
  const tall = await page.locator('#slide-4').evaluate((e) => e.getBoundingClientRect().bottom > window.innerHeight + 1);
  test.skip(!tall, 'slide 4 fits the viewport');
  const before = await page.evaluate(() => window.scrollY);
  await page.keyboard.press('ArrowDown');
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(before);
  await expect(counter(page)).toHaveText('04 / 10');
});

test('experience tab stays current across role slides', async ({ page }) => {
  await page.goto('/');
  const tab = page.locator('[data-tab-section="experience"]');
  for (const n of [4, 5, 6]) {
    await page.locator(`#slide-${n}`).evaluate((e) => e.scrollIntoView({ block: 'start' }));
    await expect(counter(page)).toHaveText(`0${n} / 10`);
    await expect(tab).toHaveAttribute('aria-current', 'true');
  }
});

test('dot click jumps to its slide', async ({ page }) => {
  await page.goto('/');
  if (isMobile(page)) {
    await expect(page.locator('.slidenav')).toBeHidden();
    return;
  }
  await page.locator('[data-dot="7"]').click();
  await expect(counter(page)).toHaveText('07 / 10');
  await expect(page.locator('[data-dot="7"]')).toHaveAttribute('aria-current', 'true');
});

test('deep link to a slide', async ({ page }) => {
  await page.goto('/#slide-4');
  await expect(counter(page)).toHaveText('04 / 10');
});

test('legacy anchors land on their slide', async ({ page }) => {
  await page.goto('/#events');
  await page.waitForTimeout(800);
  await expect(counter(page)).toHaveText('07 / 10');
  await expect(page.locator('#slide-7')).toBeInViewport();
});

test('expanding a story does not jump slides', async ({ page }) => {
  await page.goto('/#slide-4');
  await expect(counter(page)).toHaveText('04 / 10');
  await page.locator('#slide-4 summary').click();
  await page.waitForTimeout(600);
  await expect(counter(page)).toHaveText('04 / 10');
});

test('space on a summary toggles it', async ({ page }) => {
  await page.goto('/#slide-4');
  await expect(counter(page)).toHaveText('04 / 10');
  await page.locator('#slide-4 summary').focus();
  await page.keyboard.press('Space');
  await expect(page.locator('#slide-4 details')).toHaveAttribute('open', '');
  await expect(counter(page)).toHaveText('04 / 10');
});

test('keys do nothing while the lightbox is open', async ({ page }) => {
  await page.goto('/#slide-4');
  await expect(counter(page)).toHaveText('04 / 10');
  await page.locator('#slide-4 [data-lightbox]').first().click();
  await expect(page.locator('dialog#lightbox')).toHaveAttribute('open', '');
  await page.keyboard.press('ArrowDown');
  await page.waitForTimeout(400);
  await expect(counter(page)).toHaveText('04 / 10');
});

test('space does not change slide while the video modal is open', async ({ page }) => {
  await page.goto('/#slide-8');
  await expect(counter(page)).toHaveText('08 / 10');
  await page.locator('#slide-8 a[data-video-modal]').first().click();
  await expect(page.locator('dialog#video-modal')).toHaveAttribute('open', '');
  await page.keyboard.press('Space');
  await page.waitForTimeout(400);
  await expect(counter(page)).toHaveText('08 / 10');
});

test('scrolling adds no history entries', async ({ page }) => {
  await page.goto('/');
  const before = await page.evaluate(() => history.length);
  // tall slides take more than one PageDown on phones, so press until slide 4 is reached
  for (let i = 0; i < 12 && (await counter(page).textContent()) !== '04 / 10'; i++) {
    await page.keyboard.press('PageDown');
    await page.waitForTimeout(350);
  }
  await expect(counter(page)).toHaveText('04 / 10');
  await expect.poll(() => page.evaluate(() => location.hash)).toBe('#slide-4');
  expect(await page.evaluate(() => history.length)).toBe(before);
});

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('keyboard navigation scrolls instantly', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('End');
    await expect(counter(page)).toHaveText('10 / 10', { timeout: 300 });
  });
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('slides work without the nav layer', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('[data-slide]')).toHaveCount(10);
    await expect(page.locator('.slidenav')).toBeHidden();
    await expect(counter(page)).toBeHidden();
    await page.locator('nav[aria-label="Sections"] a[href="#slide-10"]').click();
    await expect(page.locator('#slide-10')).toBeInViewport();
  });
});
