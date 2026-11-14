// @ts-nocheck — test file uses Playwright + axe-core types that may differ from project TS config
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const PAGES: Array<[string, string]> = [
  ['Evidence Ledger', '#nav-evidence'],
  ['Risk Register', '#nav-risks'],
  ['Hiring Pipeline', '#nav-hiring'],
  ['Reports & Exports', '#nav-documents'],
] as const;

async function scanAxe(page: any, label: string) {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'section508'])
    .analyze();

  console.log(`\n=== axe results for ${label} ===`);
  console.log(`Violations: ${results.violations.length}`);
  for (const v of results.violations.slice(0, 10)) {
    console.log(`  - ${v.id}: ${v.description} (${v.impact})`);
    for (const n of v.nodes.slice(0, 3)) {
      console.log(`      ${n.html}`);
    }
  }

  const critical = results.violations.filter((v) => v.impact === 'critical');
  expect(critical.length, `${label}: no critical axe violations`).toBe(0);
}

test('axe accessibility scan: homepage (no project)', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await scanAxe(page, 'homepage (no project)');
});

test('axe accessibility scan: demo workspace dashboard', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  // Load the demo workspace to test a populated dashboard
  await page.click('button:has-text("Load Demo Workspace (TradePulse)")');
  await page.waitForLoadState('networkidle');
  await scanAxe(page, 'demo dashboard');
});

test('axe accessibility scan: workspace tabs (demo)', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await page.click('button:has-text("Load Demo Workspace (TradePulse)")');
  await page.waitForLoadState('networkidle');

  for (const [label, selector] of PAGES) {
    await page.click(selector);
    await page.waitForLoadState('networkidle');
    await scanAxe(page, label);
  }
});

test('axe accessibility scan: Settings modal open', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await page.click('[id="btn-settings-trigger"]');
  await page.waitForLoadState('networkidle');
  await scanAxe(page, 'Settings modal');
});

test('axe accessibility scan: New Project modal open', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await page.click('[id="btn-new-project-header"], button:has-text("Create New Project")');
  await page.waitForLoadState('networkidle');
  await scanAxe(page, 'New Project modal');
});

test('axe accessibility scan: demo dashboard in dark mode', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  // Toggle dark mode via the theme button in the navbar.
  await page.click('[id="btn-theme-toggle"]');
  await page.waitForLoadState('networkidle');

  await page.click('button:has-text("Load Demo Workspace (TradePulse)")');
  await page.waitForLoadState('networkidle');
  await scanAxe(page, 'demo dashboard (dark mode)');
});
