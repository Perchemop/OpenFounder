import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('axe accessibility scan: homepage (no project)', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'section508'])
    .analyze();

  console.log(`\n=== axe results for homepage ===`);
  console.log(`Violations: ${results.violations.length}`);
  for (const v of results.violations.slice(0, 10)) {
    console.log(`  - ${v.id}: ${v.description} (${v.impact})`);
    for (const n of v.nodes.slice(0, 3)) {
      console.log(`      ${n.html}`);
    }
  }

  const critical = results.violations.filter((v) => v.impact === 'critical');
  expect(critical.length).toBe(0);
});

test('axe accessibility scan: demo workspace dashboard', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  // Load the demo workspace to test a populated dashboard
  await page.click('button:has-text("Load Demo Workspace (TradePulse)"');
  await page.waitForLoadState('networkidle');

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'section508'])
    .analyze();

  console.log(`\n=== axe results for demo dashboard ===`);
  console.log(`Violations: ${results.violations.length}`);
  for (const v of results.violations.slice(0, 10)) {
    console.log(`  - ${v.id}: ${v.description} (${v.impact})`);
    for (const n of v.nodes.slice(0, 3)) {
      console.log(`      ${n.html}`);
    }
  }

  const critical = results.violations.filter((v) => v.impact === 'critical');
  expect(critical.length).toBe(0);
});
