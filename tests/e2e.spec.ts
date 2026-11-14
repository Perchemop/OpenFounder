import { test, expect } from '@playwright/test';

/**
 * End-to-end smoke test over the core workspace (audit finding VER-01).
 *
 * This is a *smoke* test, not a full claim lifecycle: it verifies that a user
 * can load the demo workspace and navigate the main evidence / planning /
 * export pages without errors. The domain promotion guard (evidenceIntegrity)
 * is already covered by unit tests in src/db/.
 *
 * Covered:
 *   * the demo workspace loads;
 *   * each workspace tab (Evidence, Risks, Hiring, Documents) opens and renders
 *     its heading;
 *   * no uncaught exception or console error on load.
 */

const TABS: Array<[string, string]> = [
  ['Evidence Ledger', '#nav-evidence'],
  ['Risk Register', '#nav-risks'],
  ['Hiring Pipeline', '#nav-hiring'],
  ['Reports & Exports', '#nav-documents'],
] as const;

test('demo workspace loads and the main tabs open without errors', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(`console.error: ${m.text()}`);
  });

  await page.goto('/');
  await page.waitForLoadState('networkidle');

  // Load the demo workspace so the tab pages have data to render.
  await page.click('button:has-text("Load Demo Workspace (TradePulse)")');
  await page.waitForLoadState('networkidle');

  // Every workspace tab must open and render its heading without crashing.
  for (const [label, selector] of TABS) {
    await page.click(selector);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1').first()).toBeVisible();
    await expect(
      page.getByRole('heading', { name: label, exact: true }),
    ).toBeVisible();
  }

  expect(
    errors,
    `the demo workspace and its tabs must load without errors:\n${errors.join(
      '\n',
    )}`,
  ).toEqual([]);
});
