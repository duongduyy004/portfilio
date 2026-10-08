import { expect, test, type Page } from '@playwright/test';

// Review follow-ups (fix/review-minors). Numbers refer to the agreed list.
const counter = (page: Page) => page.locator('[data-slide-counter]');
const desktop = (page: Page) => page.viewportSize()!.width >= 900;
const slide = (page: Page, n: number) => page.locator(`#slide-${n}`);

async function goSlide(page: Page, n: number) {
  await page.evaluate((n) => {
    const deck = document.querySelector<HTMLElement>('[data-deck]')!;
    deck.scrollTo({ left: (n - 1) * deck.clientWidth, behavior: 'auto' });
  }, n);
  await expect(counter(page)).toHaveText(`${String(n).padStart(2, '0')} / 10`);
}

test.describe('motion', () => {
  test('#2 a card does not tilt until its drop-in has finished', async ({ page }) => {
    test.skip(!desktop(page), 'fine pointers only');
    await page.goto('/');
    const card = slide(page, 3).locator('[data-tilt]').nth(1);
    await page.evaluate(() => {
      const deck = document.querySelector<HTMLElement>('[data-deck]')!;
      deck.scrollTo({ left: 2 * deck.clientWidth, behavior: 'auto' });
    });
    const box = (await card.boundingBox())!;
    await page.mouse.move(box.x + 20, box.y + 20);
    await page.mouse.move(box.x + box.width - 20, box.y + 30, { steps: 3 });
    const running = await card.evaluate((e) => e.getAnimations().some((a) => a.playState === 'running'));
    if (running) await expect(card).not.toHaveClass(/is-tilting/);
    await page.waitForTimeout(1200);
    await page.mouse.move(box.x + box.width - 30, box.y + 40, { steps: 3 });
    await expect(card).toHaveClass(/is-tilting/);
  });

  test('#4 only the dot under the pointer is pulled', async ({ page }) => {
    test.skip(!desktop(page), 'fine pointers only');
    await page.goto('/');
    const dot = page.locator('[data-dot="5"]');
    const b = (await dot.boundingBox())!;
    await page.mouse.move(b.x + b.width / 2 + 5, b.y + b.height / 2, { steps: 3 });
    await expect.poll(() => dot.evaluate((e) => parseFloat(getComputedStyle(e).translate) || 0)).toBeGreaterThan(0);
    for (const n of [3, 4, 6, 7]) {
      const t = await page.locator(`[data-dot="${n}"]`).evaluate((e) => getComputedStyle(e).translate);
      expect(t === 'none' || t === '0px').toBe(true);
    }
  });

  test('#6 only the current slide promotes its blobs', async ({ page }) => {
    await page.goto('/');
    await goSlide(page, 4);
    const wc = await page.locator('[data-slide]').evaluateAll((s) =>
      s.map((e) => getComputedStyle(e.querySelector('.slide__blobs span')!).willChange),
    );
    expect(wc[3]).not.toBe('auto');
    expect(wc.filter((w, i) => i !== 3 && w !== 'auto')).toEqual([]);
  });

  test.describe('without JavaScript', () => {
    test.use({ javaScriptEnabled: false });
    test('#5 only the first slide drifts', async ({ page }) => {
      await page.goto('/');
      const states = await page.locator('[data-slide]').evaluateAll((s) =>
        s.map((e) => getComputedStyle(e.querySelector('.slide__blobs span')!).animationPlayState),
      );
      expect(states[0]).toBe('running');
      expect(states.slice(1).filter((s) => s === 'running')).toEqual([]);
    });
  });
});

test.describe('deck navigation', () => {
  test('#10 small wheel residues decay instead of adding up', async ({ page }) => {
    await page.goto('/#slide-10');
    await expect(counter(page)).toHaveText('10 / 10');
    await page.evaluate(async () => {
      const deck = document.querySelector('[data-deck]')!;
      deck.dispatchEvent(new WheelEvent('wheel', { deltaY: -30, bubbles: true, cancelable: true }));
      await new Promise((r) => setTimeout(r, 450));
      deck.dispatchEvent(new WheelEvent('wheel', { deltaY: -30, bubbles: true, cancelable: true }));
    });
    await page.waitForTimeout(600);
    await expect(counter(page)).toHaveText('10 / 10');
  });

  test('#11 arrow buttons keep focus so they can be pressed again', async ({ page }) => {
    test.skip(!desktop(page), 'arrows are hidden on phones');
    await page.goto('/');
    const next = page.locator('[data-deck-next]');
    await next.focus();
    await page.keyboard.press('Enter');
    await expect(counter(page)).toHaveText('02 / 10');
    await expect(next).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(counter(page)).toHaveText('03 / 10');
  });

  test('#12 keyboard focus on a slide is visible', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('ArrowRight');
    await expect(slide(page, 2)).toBeFocused();
    expect(await slide(page, 2).evaluate((e) => getComputedStyle(e).outlineStyle)).not.toBe('none');
  });

  test('#13 a swipe moves focus along with the slide', async ({ page }) => {
    test.skip(desktop(page), 'touch only');
    await page.goto('/');
    await slide(page, 1).focus();
    const client = await page.context().newCDPSession(page);
    await client.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 320, y: 400 }] });
    for (let i = 1; i <= 8; i++) {
      await client.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 320 - 30 * i, y: 400 }] });
      await page.waitForTimeout(16);
    }
    await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await expect(counter(page)).toHaveText('02 / 10');
    await expect(slide(page, 2)).toBeFocused();
  });

  test('#13 focusing something on another slide keeps focus there', async ({ page }) => {
    for (let i = 0; i < 3; i++) {
      await page.goto('/');
      const poster = page.locator('#slide-8 a[data-video-modal][href="/video/dance.mp4"]');
      await poster.focus(); // the browser scrolls the deck to slide 8
      await expect(counter(page)).toHaveText('08 / 10');
      await page.waitForTimeout(400); // past the settle fallback
      await expect(poster).toBeFocused();
    }
  });

  test('#14 up/down scroll the slide while a tab is focused', async ({ page }) => {
    await page.goto('/');
    await goSlide(page, 8);
    await page.locator('[data-tab-section="videos"]').focus();
    await page.keyboard.press('ArrowDown');
    await expect.poll(() => slide(page, 8).evaluate((e) => e.scrollTop)).toBeGreaterThan(0);
  });

  test('#15 the first tab focus ring is not clipped', async ({ page }) => {
    await page.goto('/');
    const tab = page.locator('.tabbar__tab').first();
    await tab.focus();
    const { tabLeft, listLeft } = await tab.evaluate((t) => ({
      tabLeft: t.getBoundingClientRect().left,
      listLeft: t.closest('ul')!.getBoundingClientRect().left,
    }));
    expect(tabLeft - 6).toBeGreaterThanOrEqual(listLeft); // 3px outline + 3px offset
  });

  test('#16 if the navigation script fails, the deck scrollbar stays visible', async ({ page }) => {
    await page.route('**/_astro/*.js', (r) => r.abort());
    await page.goto('/');
    // headless Chromium never paints scrollbars, so assert the styling contract instead
    expect(await page.evaluate(() => document.documentElement.classList.contains('deck-nav'))).toBe(false);
    expect(await page.locator('[data-deck]').evaluate((e) => getComputedStyle(e).scrollbarWidth)).toBe('auto');
    // and once the script runs, the scrollbar gives way to the deck's own controls
    await page.unroute('**/_astro/*.js');
    await page.reload();
    await expect.poll(() => page.locator('[data-deck]').evaluate((e) => getComputedStyle(e).scrollbarWidth)).toBe('none');
  });

  test('#21 a skip link jumps keyboard users to the slides', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');
    const skip = page.getByRole('link', { name: 'Skip to slides' });
    await expect(skip).toBeFocused();
    await expect(skip).toBeVisible();
    await page.keyboard.press('Enter');
    await expect(slide(page, 1)).toBeFocused();
  });
});

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });
  test('#1 nothing is animating', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(500);
    const running = await page.evaluate(() => document.getAnimations().filter((a) => a.playState === 'running').length);
    expect(running).toBe(0);
  });
});
