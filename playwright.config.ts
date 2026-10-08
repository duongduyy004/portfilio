import { defineConfig, devices } from '@playwright/test';

const MOBILE = { ...devices['Desktop Chrome'], viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true };
const DESKTOP = { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } };

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  reporter: 'list',
  // a full run (~180 tests, parallel workers) can slow script start-up past the 5s default
  expect: { timeout: 10_000 },
  use: { baseURL: 'http://localhost:4322' },
  webServer: {
    command: 'npm run build && npm run preview -- --port 4322',
    url: 'http://localhost:4322',
    reuseExistingServer: false,
    timeout: 180_000,
  },
  // Tests tagged @timing depend on wheel-event cadence, which CPU contention from parallel
  // workers can stretch. They run in their own projects, only after the main ones have finished.
  projects: [
    { name: 'mobile', grepInvert: /@timing/, use: MOBILE },
    { name: 'desktop', grepInvert: /@timing/, use: DESKTOP },
    { name: 'timing-mobile', grep: /@timing/, dependencies: ['mobile', 'desktop'], use: MOBILE },
    { name: 'timing-desktop', grep: /@timing/, dependencies: ['mobile', 'desktop'], use: DESKTOP },
  ],
});
