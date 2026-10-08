import { expect, test, type Page } from '@playwright/test';

const counter = (page: Page) => page.locator('[data-slide-counter]');
const isMobile = (page: Page) => page.viewportSize()!.width < 640;
const slide = (page: Page, n: number) => page.locator(`#slide-${n}`);
const scrollTop = (page: Page, n: number) => slide(page, n).evaluate((e) => e.scrollTop);

async function goSlide(page: Page, n: number) {
  await page.evaluate((n) => {
    const deck = document.querySelector<HTMLElement>('[data-deck]')!;
    deck.scrollTo({ left: (n - 1) * deck.clientWidth, behavior: 'auto' });
  }, n);
  await expect(counter(page)).toHaveText(`${String(n).padStart(2, '0')} / 10`);
}

async function wheelAtCentre(page: Page, dy: number) {
  const vp = page.viewportSize()!;
  await page.mouse.move(vp.width / 2, vp.height / 2);
  await page.mouse.wheel(0, dy);
}

test('each slide fills the deck', async ({ page }) => {
  await page.goto('/');
  const deck = (await page.locator('[data-deck]').boundingBox())!;
  for (let n = 1; n <= 10; n++) {
    await goSlide(page, n);
    const box = (await slide(page, n).boundingBox())!;
    expect(Math.abs(box.x - deck.x)).toBeLessThanOrEqual(1);
    expect(Math.abs(box.width - deck.width)).toBeLessThanOrEqual(1);
    expect(Math.abs(box.height - deck.height)).toBeLessThanOrEqual(1);
  }
  const page_ = await page.evaluate(() => ({
    sh: document.scrollingElement!.scrollHeight, ih: innerHeight, sw: document.documentElement.scrollWidth, iw: innerWidth,
  }));
  expect(page_.sh).toBeLessThanOrEqual(page_.ih + 1);
  expect(page_.sw).toBeLessThanOrEqual(page_.iw);
});

test('keys move slides', async ({ page }) => {
  await page.goto('/');
  const before = await page.evaluate(() => history.length);
  await page.keyboard.press('ArrowRight');
  await expect(counter(page)).toHaveText('02 / 10');
  await expect.poll(() => page.evaluate(() => location.hash)).toBe('#slide-2');
  await page.keyboard.press('End');
  await expect(counter(page)).toHaveText('10 / 10');
  await page.keyboard.press('ArrowLeft');
  await expect(counter(page)).toHaveText('09 / 10');
  await page.keyboard.press('Home');
  await expect(counter(page)).toHaveText('01 / 10');
  expect(await page.evaluate(() => history.length)).toBe(before);
});

test('arrows move slides', async ({ page }) => {
  await page.goto('/');
  const prev = page.locator('[data-deck-prev]');
  const next = page.locator('[data-deck-next]');
  if (isMobile(page)) {
    await expect(prev).toBeHidden();
    await expect(next).toBeHidden();
    return;
  }
  await expect(prev).toBeHidden();
  await expect(next).toBeVisible();
  await next.click();
  await expect(counter(page)).toHaveText('02 / 10');
  await expect(prev).toBeVisible();
  await page.keyboard.press('End');
  await expect(counter(page)).toHaveText('10 / 10');
  await expect(next).toBeHidden();
});

test.describe('final-review fixes', () => {
  test('leaving a scrolled slide does not reset it mid-transit', async ({ page }) => {
    await page.goto('/');
    await goSlide(page, 8);
    await slide(page, 8).evaluate((e) => e.scrollTo({ top: 300 }));
    await page.waitForTimeout(300);
    // sample slide 8 every frame while it is still on screen during a smooth move to slide 9
    const resetWhileVisible = await page.evaluate(
      () =>
        new Promise<boolean>((resolve) => {
          const deck = document.querySelector<HTMLElement>('[data-deck]')!;
          const s8 = document.querySelector<HTMLElement>('#slide-8')!;
          let bad = false;
          const tick = () => {
            const visible = 8 - deck.scrollLeft / deck.clientWidth; // fraction of slide 8 on screen
            if (visible > 0.05 && s8.scrollTop < 300) bad = true;
            if (deck.scrollLeft >= 8 * deck.clientWidth - 1) resolve(bad);
            else requestAnimationFrame(tick);
          };
          document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
          requestAnimationFrame(tick);
        }),
    );
    expect(resetWhileVisible).toBe(false);
    await expect(counter(page)).toHaveText('09 / 10');
    await expect.poll(() => scrollTop(page, 8)).toBe(0); // reset once settled
  });

  test('trackpad momentum does not scroll the slide you arrive on', async ({ page }) => {
    await page.goto('/');
    await goSlide(page, 7);
    await slide(page, 7).evaluate((e) => e.scrollTo({ top: e.scrollHeight }));
    await page.waitForTimeout(300);
    // trusted wheel input (has a default scroll action), decaying like trackpad momentum
    const client = await page.context().newCDPSession(page);
    const vp = page.viewportSize()!;
    for (let i = 0; i < 40; i++) {
      await client.send('Input.dispatchMouseEvent', {
        type: 'mouseWheel', x: vp.width / 2, y: vp.height / 2, deltaX: 0, deltaY: Math.max(4, 120 * Math.pow(0.92, i)),
      });
    }
    await page.waitForTimeout(900);
    await expect(counter(page)).toHaveText('08 / 10');
    expect(await scrollTop(page, 8)).toBe(0);
  });

  test('two quick presses move two slides', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    await expect(counter(page)).toHaveText('03 / 10');
  });

  test('a throwing history.replaceState (Safari rate limit) does not break navigation', async ({ page }) => {
    await page.addInitScript(() => {
      history.replaceState = () => {
        throw new DOMException('Attempt to use history.replaceState() more than 100 times per 10 seconds', 'SecurityError');
      };
    });
    await page.goto('/');
    await page.keyboard.press('End');
    await expect(counter(page)).toHaveText('10 / 10');
    await expect(page.locator('[aria-live]')).toHaveText('Slide 10 of 10: Contact');
  });
});

test('dots are named, tappable targets', async ({ page }) => {
  await page.goto('/');
  const dots = page.locator('[data-dot]');
  await expect(dots).toHaveCount(10);
  for (let i = 0; i < 10; i++) {
    await expect(dots.nth(i)).toHaveAccessibleName(/\S/);
    const box = (await dots.nth(i).boundingBox())!;
    expect(box.width).toBeGreaterThanOrEqual(24);
    expect(box.height).toBeGreaterThanOrEqual(24);
  }
});

test('dot click moves to its slide', async ({ page }) => {
  await page.goto('/');
  await page.locator('[data-dot="7"]').click();
  await expect(counter(page)).toHaveText('07 / 10');
  await expect(page.locator('[data-dot="7"]')).toHaveAttribute('aria-current', 'true');
});

// slide 1 fits the screen and slide 8 overflows it at both test sizes (measured)
test("wheel at a short slide's edge moves on", async ({ page }) => {
  await page.goto('/');
  await wheelAtCentre(page, 120);
  await expect(counter(page)).toHaveText('02 / 10');
});

test('wheel inside a tall slide scrolls it', async ({ page }) => {
  await page.goto('/');
  await goSlide(page, 8);
  await wheelAtCentre(page, 120);
  await expect.poll(() => scrollTop(page, 8)).toBeGreaterThan(0);
  await expect(counter(page)).toHaveText('08 / 10');
});

test('a long wheel burst moves one slide', async ({ page }) => {
  await page.goto('/');
  // fire the burst in-page on a fixed 30ms cadence (like trackpad momentum); Playwright
  // round-trips under load can leave >250ms gaps, which is two gestures, not one
  await page.evaluate(async () => {
    const deck = document.querySelector('[data-deck]')!;
    for (let i = 0; i < 10; i++) {
      deck.dispatchEvent(new WheelEvent('wheel', { deltaY: 120, bubbles: true, cancelable: true }));
      await new Promise((r) => setTimeout(r, 30));
    }
  });
  await page.waitForTimeout(600);
  await expect(counter(page)).toHaveText('02 / 10');
});

test('pagedown scrolls inside then moves on', async ({ page }) => {
  await page.goto('/');
  await goSlide(page, 8);
  await slide(page, 8).focus();
  await page.keyboard.press('PageDown');
  await expect.poll(() => scrollTop(page, 8)).toBeGreaterThan(0);
  await expect(counter(page)).toHaveText('08 / 10');
  for (let i = 0; i < 15 && (await counter(page).textContent()) === '08 / 10'; i++) {
    await page.keyboard.press('PageDown');
    await page.waitForTimeout(300);
  }
  await expect(counter(page)).toHaveText('09 / 10');
});

test("more hint follows the slide's scroll", async ({ page }) => {
  await page.goto('/');
  await goSlide(page, 8);
  const hint = slide(page, 8).locator('.slide__more > span');
  await expect(hint).toBeVisible();
  const heightBefore = await slide(page, 8).evaluate((e) => e.scrollHeight);
  await slide(page, 8).evaluate((e) => e.scrollTo({ top: e.scrollHeight }));
  await expect(hint).toBeHidden();
  // the hint floats; hiding it must not change the slide's height (or yank the scroll position)
  expect(await slide(page, 8).evaluate((e) => e.scrollHeight)).toBe(heightBefore);
  await expect(slide(page, 10).locator('.slide__more > span')).toBeHidden(); // contact fits
});

test('arriving does not reset the current slide mid-read', async ({ page }) => {
  await page.goto('/');
  await goSlide(page, 8);
  await slide(page, 8).evaluate((e) => e.scrollTo({ top: 300 }));
  await page.waitForTimeout(500);
  expect(await scrollTop(page, 8)).toBeGreaterThanOrEqual(300);
  await goSlide(page, 9);
  await goSlide(page, 8);
  expect(await scrollTop(page, 8)).toBe(0);
});

test.describe('settled layout', () => {
  // measure scroll ranges after cards land, not mid drop-in (tilted cards briefly add overflow)
  test.use({ reducedMotion: 'reduce' });

  test('expanding a story keeps the slide and position', async ({ page }) => {
  await page.goto('/');
  await goSlide(page, 4);
  // slide 4 overflows a little on desktop and a lot on phones
  const target = await slide(page, 4).evaluate((e) => Math.min(200, e.scrollHeight - e.clientHeight));
  expect(target).toBeGreaterThan(0);
  await slide(page, 4).evaluate((e, t) => e.scrollTo({ top: t }), target);
  const box = (await slide(page, 4).locator('summary').boundingBox())!;
  await page.mouse.click(box.x + 20, box.y + box.height / 2);
  await page.waitForTimeout(400);
  await expect(counter(page)).toHaveText('04 / 10');
  expect(await scrollTop(page, 4)).toBeGreaterThanOrEqual(target - 1);
  });
});

test('resizing keeps the current slide', async ({ page }) => {
  await page.goto('/');
  await goSlide(page, 5);
  const vp = page.viewportSize()!;
  await page.setViewportSize(vp.width < 640 ? { width: 1440, height: 900 } : { width: 390, height: 844 });
  await page.waitForTimeout(400);
  await expect(counter(page)).toHaveText('05 / 10');
  const deck = (await page.locator('[data-deck]').boundingBox())!;
  const box = (await slide(page, 5).boundingBox())!;
  expect(Math.abs(box.x - deck.x)).toBeLessThanOrEqual(1);
});

test('swipe moves one slide', async ({ page }) => {
  test.skip(!isMobile(page), 'touch only');
  await page.goto('/');
  // raw touch events: CDP's synthesizeScrollGesture doesn't drive touch scrolling headless
  const client = await page.context().newCDPSession(page);
  const y = 400;
  await client.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 320, y }] });
  for (let i = 1; i <= 8; i++) {
    await client.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 320 - 30 * i, y }] });
    await page.waitForTimeout(16);
  }
  await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await expect(counter(page)).toHaveText('02 / 10');
  await page.waitForTimeout(500);
  await expect(counter(page)).toHaveText('02 / 10');
});

test('deep link to a slide', async ({ page }) => {
  await page.goto('/#slide-4');
  await expect(counter(page)).toHaveText('04 / 10');
  await expect(slide(page, 4)).toBeInViewport({ ratio: 0.9 });
});

test('legacy anchors open their slide', async ({ page }) => {
  await page.goto('/#events');
  await expect(counter(page)).toHaveText('07 / 10');
  await expect(slide(page, 7)).toBeInViewport({ ratio: 0.9 });
});

test('keys and wheel do nothing while a pop-up is open', async ({ page }) => {
  await page.goto('/');
  await goSlide(page, 4);
  await slide(page, 4).locator('[data-lightbox]').first().click();
  await expect(page.locator('dialog#lightbox')).toHaveAttribute('open', '');
  await page.keyboard.press('ArrowRight');
  await wheelAtCentre(page, 120);
  await page.waitForTimeout(500);
  await expect(counter(page)).toHaveText('04 / 10');
});

test('screen readers hear the slide once it settles', async ({ page }) => {
  await page.goto('/');
  const live = page.locator('[aria-live]');
  await expect(live).toHaveCount(1);
  await page.evaluate(() => {
    const el = document.querySelector('[aria-live]')!;
    (window as any).__liveChanges = 0;
    new MutationObserver(() => (window as any).__liveChanges++).observe(el, { childList: true, characterData: true, subtree: true });
  });
  await page.keyboard.press('End');
  await expect(counter(page)).toHaveText('10 / 10');
  await expect(live).toHaveText('Slide 10 of 10: Contact');
  expect(await page.evaluate(() => (window as any).__liveChanges)).toBeLessThanOrEqual(2);
});

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('keyboard navigation is instant', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('End');
    await expect(counter(page)).toHaveText('10 / 10', { timeout: 300 });
  });
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('the deck still works as a sideways strip', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('[data-slide]')).toHaveCount(10);
    const deck = page.locator('[data-deck]');
    const d = (await deck.boundingBox())!;
    const s = (await slide(page, 1).boundingBox())!;
    expect(Math.abs(s.width - d.width)).toBeLessThanOrEqual(1);
    expect(Math.abs(s.height - d.height)).toBeLessThanOrEqual(1);
    expect(await deck.evaluate((e) => e.scrollWidth > e.clientWidth)).toBe(true);
    await expect(counter(page)).toBeHidden();
    await expect(page.locator('[data-deck-next]')).toBeHidden();
    await expect(page.locator('.slidenav')).toBeVisible();
    await page.locator('nav[aria-label="Sections"] a[href="#slide-10"]').click();
    await expect(slide(page, 10)).toBeInViewport({ ratio: 0.9 });
  });
});
