import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'tests',
  use: {
    baseURL: 'http://localhost:4173',
    headless: true,
  },
  webServer: {
    command: 'npx serve dist -l 4173',
    port: 4173,
    reuseExistingServer: !process.env.CI,
  },
});
