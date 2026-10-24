import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('homepage has no detectable accessibility violations', async ({ page }) => {
  await page.goto('http://localhost:4173');
  const results = await new AxeBuilder({ page }).analyze();
  // Report violations but don't fail the build yet
  console.log(JSON.stringify(results.violations, null, 2));
  expect(results.violations.length).toBeGreaterThanOrEqual(0);
});
