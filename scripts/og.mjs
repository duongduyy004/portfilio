// Render the 1200x630 social share image from the built site's profile header.
// Usage: npm run build && node scripts/og.mjs  (starts its own preview server)
import { spawn } from 'node:child_process';
import { chromium } from '@playwright/test';

const server = spawn(process.execPath, ['node_modules/astro/bin/astro.mjs', 'preview', '--port', '4399'], { stdio: 'ignore' });
try {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
  for (let i = 0; i < 40; i++) {
    try { await page.goto('http://localhost:4399/', { waitUntil: 'networkidle' }); break; }
    catch { await page.waitForTimeout(250); }
  }
  await page.addStyleTag({
    content: `
      /* only the profile slide, full-bleed, without deck chrome */
      .tabbar, .slidenav, .deck__arrow, .slide__more, .deck > :not(#slide-1) { display: none !important; }
      .deck { margin: 0 !important; height: 630px !important; }
      .profile { padding: 0 48px !important; }
      .profile__actions { display: none !important; }
    `,
  });
  await page.screenshot({ path: 'public/og-image.png', clip: { x: 0, y: 0, width: 1200, height: 630 } });
  await browser.close();
} finally {
  server.kill();
}
