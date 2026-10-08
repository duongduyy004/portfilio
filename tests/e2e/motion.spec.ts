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

// each rolling strip must rest at -digit em (strip translated so the right digit shows)
async function odometerSettled(page: Page, value: string) {
  const stat = page.locator(`[data-count="${value}"]`).first();
  await expect(stat.locator('.sr-only')).toHaveText(value);
  await expect
    .poll(() =>
      stat.locator('.odo__col').evaluateAll((cols) =>
        cols.every((c) => {
          const strip = c.querySelector<HTMLElement>('.odo__strip')!;
          const d = Number(getComputedStyle(c).getPropertyValue('--d'));
          const em = parseFloat(getComputedStyle(c).fontSize);
          const y = new DOMMatrix(getComputedStyle(strip).transform).f || parseFloat(getComputedStyle(strip).translate.split(' ')[1] ?? '0');
          return Math.abs(y + d * em) <= 1;
        }),
      ),
    )
    .toBe(true);
}

test.describe('odometer stats', () => {
  test('odometer ends on the right digits', async ({ page }) => {
    await page.goto('/');
    await goSlide(page, 2);
    await odometerSettled(page, '687,370');
  });

  test('odometer ends correct after a deep link', async ({ page }) => {
    await page.goto('/#slide-2');
    await expect(counter(page)).toHaveText('02 / 10');
    await odometerSettled(page, '+209%');
  });

  test.describe('reduced motion', () => {
    test.use({ reducedMotion: 'reduce' });
    test('digits are final immediately', async ({ page }) => {
      await page.goto('/');
      await odometerSettled(page, '+267%');
    });
  });

  test.describe('without JavaScript', () => {
    test.use({ javaScriptEnabled: false });
    test('digits are final', async ({ page }) => {
      await page.goto('/');
      await odometerSettled(page, '6M+');
    });
  });
});

test.describe('tilt and magnet', () => {
  const desktop = (page: Page) => page.viewportSize()!.width >= 900;

  test('cards tilt toward the pointer', async ({ page }) => {
    test.skip(!desktop(page), 'fine pointers only');
    await page.goto('/');
    await goSlide(page, 3);
    const card = page.locator('#slide-3 [data-tilt]').first();
    await expect(card).toBeAttached();
    const box = (await card.boundingBox())!;
    await page.mouse.move(box.x + box.width * 0.5, box.y + box.height * 0.5);
    await page.mouse.move(box.x + box.width * 0.9, box.y + box.height * 0.1, { steps: 4 });
    await expect(card).toHaveClass(/is-tilting/);
    expect(await card.evaluate((e) => getComputedStyle(e).transform)).not.toBe('none');
    await page.mouse.move(5, box.y + box.height + 200);
    await expect(card).not.toHaveClass(/is-tilting/);
  });

  test('no tilt on touch screens', async ({ page }) => {
    test.skip(desktop(page), 'touch only');
    await page.goto('/');
    await goSlide(page, 3);
    const card = page.locator('#slide-3 [data-tilt]').first();
    await expect(card).toBeAttached();
    const box = (await card.boundingBox())!;
    await page.mouse.move(box.x + 20, box.y + 20);
    await page.mouse.move(box.x + 60, box.y + 40, { steps: 3 });
    await expect(card).not.toHaveClass(/is-tilting/);
  });

  test('arrows are magnetic', async ({ page }) => {
    test.skip(!desktop(page), 'fine pointers only');
    await page.goto('/');
    const next = page.locator('[data-deck-next]');
    const b = (await next.boundingBox())!;
    const cx = b.x + b.width / 2;
    const cy = b.y + b.height / 2;
    await page.mouse.move(cx - 40, cy, { steps: 3 });
    await expect
      .poll(async () => {
        const t = await next.evaluate((e) => getComputedStyle(e).translate);
        return parseFloat(t);
      })
      .toBeLessThan(0);
    const x = parseFloat(await next.evaluate((e) => getComputedStyle(e).translate));
    expect(Math.abs(x)).toBeLessThanOrEqual(6);
    await page.mouse.move(cx - 400, cy, { steps: 3 });
    await expect.poll(() => next.evaluate((e) => getComputedStyle(e).translate)).toMatch(/^(none|0px)$/);
  });

  test('clicking a tilted video poster opens the modal', async ({ page }) => {
    test.skip(!desktop(page), 'fine pointers only');
    await page.goto('/');
    await goSlide(page, 8);
    const poster = page.locator('#slide-8 a[data-video-modal][href="/video/dance.mp4"]');
    const box = (await poster.boundingBox())!;
    await page.mouse.move(box.x + box.width * 0.2, box.y + box.height * 0.2);
    await page.mouse.move(box.x + box.width * 0.8, box.y + box.height * 0.3, { steps: 4 });
    await page.mouse.click(box.x + box.width * 0.5, box.y + box.height * 0.5);
    await expect(page.locator('dialog#video-modal')).toHaveAttribute('open', '');
  });

  test.describe('reduced motion', () => {
    test.use({ reducedMotion: 'reduce' });
    test('no tilt', async ({ page }) => {
      test.skip(!desktop(page), 'fine pointers only');
      await page.goto('/');
      await goSlide(page, 3);
      const card = page.locator('#slide-3 [data-tilt]').first();
      await expect(card).toBeAttached();
    await expect(card).toBeAttached();
      const box = (await card.boundingBox())!;
      await page.mouse.move(box.x + 10, box.y + 10);
      await page.mouse.move(box.x + box.width - 10, box.y + 10, { steps: 4 });
      await expect(card).not.toHaveClass(/is-tilting/);
    });
  });
});
