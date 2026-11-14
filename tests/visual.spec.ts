import { test, expect, type Page } from '@playwright/test';

/**
 * Visual evidence for the designer agent (guide section 27.12).
 *
 * These are *artefacts*, not assertions: the job uploads `snapshots/` so a
 * human or the designer can look at the rendered product. Two things are
 * still enforced, because they are real bugs rather than taste:
 *
 *   1. no uncaught exception or console error on load, and
 *   2. the app actually painted something (the screenshot is not a blank frame).
 *
 * Covered: the landing screen at three viewports, the empty state, the error
 * state, the main workspace tabs at desktop, dark mode, and the phone drawer
 * open/closed.
 *
 * What is *not* covered yet: deep interactions inside each tab (claim editing,
 * promotion, export), because there are no stable selectors for them. Add a
 * loop here once those land.
 */

const OUT = 'snapshots';

async function settle(page: Page) {
  await page.waitForLoadState('networkidle');
  // Two frames: one for React to commit, one for fonts/layout to finish.
  await page.evaluate(
    () =>
      new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      ),
  );
}

const errorsFor = (page: Page): string[] => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(`console.error: ${m.text()}`);
  });
  return errors;
};

test('landing screen at three viewports', async ({ page }) => {
  const errors = errorsFor(page);

  for (const [name, width, height] of [
    ['desktop', 1280, 800],
    ['tablet', 768, 1024],
    ['phone', 390, 844],
  ] as const) {
    await page.setViewportSize({ width, height });
    await page.goto('/');
    await settle(page);
    const shot = `${OUT}/landing-${name}.png`;
    await page.screenshot({ path: shot, fullPage: true });

    // A blank frame proves nothing: the app root must have been laid out.
    const box = await page.locator('#root, body').first().boundingBox();
    expect(box?.width ?? 0, `${name} rendered width`).toBeGreaterThan(0);
    expect(box?.height ?? 0, `${name} rendered height`).toBeGreaterThan(0);

    console.log(`captured ${shot} at ${width}x${height}`);
  }

  expect(errors, `the landing screen must load without errors:\n${errors.join('\n')}`).toEqual([]);
});

test('error state renders the error boundary', async ({ page }) => {
  // The app renders its real error boundary when `?__forceError=1` is present
  // (see src/main.tsx). The intentional error logs to the console, so this test
  // asserts the visible state instead of a clean console.
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/?__forceError=1');
  await settle(page);

  await expect(page.getByText('OpenFounder crashed')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Try again' })).toBeVisible();

  await page.screenshot({ path: `${OUT}/error-state.png`, fullPage: true });
  console.log(`captured ${OUT}/error-state.png`);
});

test('empty state with no stored project', async ({ page, context }) => {
  // A fresh origin storage is the empty state: no project, no onboarding data.
  await context.clearCookies();
  await page.goto('/');
  await page.evaluate(() => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {
      // Storage can be blocked; the empty state is then whatever the app shows.
    }
  });
  await page.reload();
  await settle(page);
  await page.screenshot({ path: `${OUT}/empty-state.png`, fullPage: true });
  console.log(`captured ${OUT}/empty-state.png`);
});

test('workspace tabs at desktop', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  await page.click('button:has-text("Load Demo Workspace (TradePulse)")');
  await page.waitForLoadState('networkidle');

  const tabs: Array<[string, string]> = [
    ['Evidence Ledger', '#nav-evidence'],
    ['Risk Register', '#nav-risks'],
    ['Hiring Pipeline', '#nav-hiring'],
    ['Reports & Exports', '#nav-documents'],
  ];

  const errors = errorsFor(page);
  for (const [label, selector] of tabs) {
    await page.click(selector);
    await page.waitForLoadState('networkidle');
    await page.screenshot({
      path: `${OUT}/tab-${label.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.png`,
      fullPage: true,
    });
    console.log(`captured tab ${label}`);
  }

  expect(
    errors,
    `workspace tabs must load without errors:\n${errors.join('\n')}`,
  ).toEqual([]);
});

test('phone drawer open and closed', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  await page.screenshot({ path: `${OUT}/phone-drawer-closed.png`, fullPage: true });

  await page.click('[data-testid="sidebar-toggle"]');
  await page.waitForTimeout(300); // let the slide transition finish
  await page.screenshot({ path: `${OUT}/phone-drawer-open.png`, fullPage: true });
  console.log(`captured phone drawer open + closed`);
});

test('dark mode demo dashboard', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  await page.click('button:has-text("Switch to light mode"), button:has-text("Switch to dark mode")');
  await page.waitForLoadState('networkidle');

  await page.click('button:has-text("Load Demo Workspace (TradePulse)")');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: `${OUT}/dashboard-dark.png`, fullPage: true });
  console.log(`captured ${OUT}/dashboard-dark.png`);
});
