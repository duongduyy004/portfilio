import { defineConfig, devices } from '@playwright/test';

const MOBILE = { ...devices['Desktop Chrome'], viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true };
const DESKTOP = { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } };

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  reporter: 'list',
  // 12 cores → 6 workers by default; at 6, CPU contention slowed page start-up past 5s
  workers: 4,
  use: { baseURL: 'http://localhost:4322' },
  webServer: {
    command: 'npm run build && npm run preview -- --port 4322',
    url: 'http://localhost:4322',
    reuseExistingServer: false,
    timeout: 180_000,
  },
  // Tests tagged @timing depend on wheel-event cadence, which CPU contention from parallel
  // workers can stretch. `npm run test:e2e` runs them as a second phase with one worker.
  // (Not `dependencies`: those would skip all timing results whenever any main test failed.)
  projects: [
    { name: 'mobile', grepInvert: /@timing/, use: MOBILE },
    { name: 'desktop', grepInvert: /@timing/, use: DESKTOP },
    { name: 'timing-mobile', grep: /@timing/, use: MOBILE },
    { name: 'timing-desktop', grep: /@timing/, use: DESKTOP },
  ],
});
