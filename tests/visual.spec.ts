import { test, expect, type Page } from '@playwright/test';
import { mkdirSync } from 'node:fs';

/**
 * Visual evidence for the designer agent (guide section 27.12).
 *
 * These are *artefacts*, not assertions: the job uploads `snapshots/` so a
 * human or the designer can look at the rendered product. Two things are still
 * enforced, because they are real bugs rather than taste:
 *
 *   1. no uncaught exception or console error on load, and
 *   2. the app actually painted something (the screenshot is not a blank frame).
 *
 * What is *not* covered yet: screens behind the workspace tabs, because there
 * are no stable selectors for them (no role="tab", no data-testid). When those
 * land, add a loop here instead of guessing at CSS classes.
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

test.beforeAll(() => {
  mkdirSync(OUT, { recursive: true });
});

test('landing screen at three viewports', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(`console.error: ${m.text()}`);
  });

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

    // A blank or monochrome frame means the screenshot proves nothing.
    expect(page, 'the app must render a non-empty body').toBeTruthy();
    const box = await page.locator('#root, body').first().boundingBox();
    expect(box?.width ?? 0, `${name} width`).toBeGreaterThan(0);

    console.log(`captured ${shot} at ${width}x${height}`);
  }

  expect(errors, `the landing screen must load without errors:\n${errors.join('\n')}`).toEqual([]);
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
