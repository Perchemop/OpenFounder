import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'tests',
  use: {
    baseURL: 'http://localhost:4173',
    headless: true,
  },

  // Each Playwright-controlled test needs a built app served on 4173. The CI
  // workflows (`visual.yml`, `a11y.yml`) already build `dist` and serve it
  // with `python3 -m http.server 4173 --directory dist` before running
  // Playwright, so `reuseExistingServer: true` lets Playwright reuse that
  // listener instead of failing to bind the port. When no server is listening
  // (e.g. a developer running `npx playwright test` directly), Playwright
  // falls back to starting the command below.
  webServer: {
    command: 'python3 -m http.server 4173 --directory dist',
    url: 'http://localhost:4173',
    port: 4173,
    reuseExistingServer: true,
    timeout: 120000,
    stdout: 'ignore',
    stderr: 'pipe',
  },

  // The e2e/responsive specs walk navigation and page reloads (IndexedDB
  // writes between steps); give each test enough time.
  timeout: 60000,
  expect: {
    timeout: 10000,
  },

  // The CI workflows archive `playwright-report/`; always produce it so those
  // upload steps have something to collect.
  reporter: [['list'], ['html', { outputFolder: 'playwright-report', open: 'never' }]],
});
