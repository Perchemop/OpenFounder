import { test, expect } from '@playwright/test';

/**
 * Regression test for the broken phone layout (audit finding UI-01).
 *
 * Before the fix the fixed 256 px sidebar forced horizontal overflow at
 * small viewports: the page was wider than the viewport, headings wrapped one
 * word per line, and the primary buttons were clipped. The responsive shell
 * now uses an off-canvas drawer below `md`, so:
 *
 *   * no page overflows horizontally at 390 / 768 / 1280 px;
 *   * the drawer is hidden until the toggle is clicked at 390 px;
 *   * the drawer is always visible at 1280 px.
 */

const VIEWPORTS = [
  ['phone', 390, 844] as const,
  ['tablet', 768, 1024] as const,
  ['desktop', 1280, 800] as const,
] as const;

test('no horizontal overflow at phone / tablet / desktop', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(`console.error: ${m.text()}`);
  });

  for (const [name, width, height] of VIEWPORTS) {
    await page.setViewportSize({ width, height });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const overflow =
      (await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1)) ??
      false;
    expect(overflow, `${name} (${width}x${height}) must not overflow horizontally`).toBe(false);

    // The empty-state heading must not collapse to one word per line.
    const heading = page.getByRole('heading', { name: 'No active project selected' });
    await expect(heading).toBeVisible();
    const box = await heading.boundingBox();
    expect(box?.width, `${name} heading must have room to wrap`).toBeGreaterThan(120);
  }

  expect(errors, `pages must load without errors:\n${errors.join('\n')}`).toEqual([]);
});

test('mobile drawer opens and closes at phone width', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  const sidebar = page.getByTestId('sidebar');
  const toggle = page.getByTestId('sidebar-toggle');

  // Hidden by default on phone.
  await expect(sidebar).not.toBeVisible();

  // Opening the drawer reveals the sidebar.
  await toggle.click();
  await expect(sidebar).toBeVisible();

  // Escape closes it.
  await page.keyboard.press('Escape');
  await expect(sidebar).not.toBeVisible();

  // Clicking the toggle again re-opens it.
  await toggle.click();
  await expect(sidebar).toBeVisible();
});

test('drawer is always visible on desktop', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  await expect(page.getByTestId('sidebar')).toBeVisible();
  // The mobile toggle is not rendered on desktop.
  await expect(page.getByTestId('sidebar-toggle')).not.toBeVisible();
});

test('no horizontal overflow after opening the demo workspace at phone width', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  await page.click('button:has-text("Load Demo Workspace (TradePulse)")');
  await page.waitForLoadState('networkidle');

  const overflow =
    (await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1)) ??
    false;
  expect(
    overflow,
    'demo workspace must not overflow horizontally at phone width',
  ).toBe(false);
});
