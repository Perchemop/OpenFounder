import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'tests',
  use: {
    baseURL: 'http://localhost:4173',
    headless: true,
  },

  // The CI workflows (`visual.yml`, `a11y.yml`) build `dist` and serve it with
  // `python3 -m http.server 4173 --directory dist` before running Playwright,
  // so Playwright connects to an already-running server via `baseURL`. There is
  // no `webServer` block here: adding one made Playwright 1.49 reject the config
  // ("Either 'port' or 'url' should be specified in config.webServer") when a
  // server was already listening on 4173.

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
