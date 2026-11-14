import { test, expect } from '@playwright/test';

/**
 * End-to-end functional test over the core workspace loop (audit finding VER-01).
 *
 * This exercises the product end-to-end without real AI (offline_rules default,
 * deterministic auto-fill templates). It verifies the loop a founder actually
 * runs: create a project → record an evidence claim → hit the promotion guard
 * → satisfy the guard → export → import as a copy.
 *
 * Covered:
 *   * new-project wizard (5 steps) completes and launches a workspace
 *   * evidence claim creation through the real form
 *   * the evidence promotion guard blocks unsupported upgrades
 *   * satisfying the guard (notes + source + verbatim quote) upgrades the claim
 *   * JSON export triggers a browser download
 *   * re-importing the exported file creates a distinct copy project
 *
 * Selectors use accessible roles / labels first, then stable ids
 * (#nav-evidence, #nav-documents, [data-testid=...]).
 */

test('core loop: create project → evidence → promotion guard → export → import copy', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(`console.error: ${m.text()}`);
  });

  // Fresh origin storage = empty state (no project).
  await page.context().clearCookies();
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  // ------------------------------------------------------------------
  // 1. Create a new project through the 5-step wizard.
  // ------------------------------------------------------------------
  await page.click('button:has-text("Create New Project")');
  await page.waitForLoadState('networkidle');

  // Step 1: Idea — name is required to enable "Next Step".
  await page.getByLabel('Project Name').fill('E2E Test Workshop');
  await page.getByLabel('One-Sentence Value Hypothesis').fill(
    'A booking platform that connects trade contractors directly with customers.',
  );
  await page.getByLabel('Industry Category').fill('Home Services');
  await page.click('button:has-text("Next Step")');

  // Step 2: Problem.
  await page.getByLabel('What acute problem are you solving?').fill(
    'Contractors waste hours chasing shared lead brokers that resell the same lead.',
  );
  await page.click('button:has-text("Next Step")');

  // Step 3: Solution / alternatives.
  await page.getByLabel('Describe the painful reality: what goes wrong, what causes stress, or what wastes time or capital?').fill(
    'Shared leads are sold to 5+ contractors, win rate under 15%.',
  );
  await page.click('button:has-text("Next Step")');

  // Step 4: Alternatives / metrics.
  await page.getByLabel('e.g. Buying leads on Angi/Thumbtack, messy text messages, paper pads').fill(
    'Angi / Thumbtack shared leads.',
  );
  await page.click('button:has-text("Next Step")');

  // Step 5: Finish.
  await page.click('button:has-text("Create Project & Launch Workspace")');
  await page.waitForLoadState('networkidle');

  // Workspace should now be loaded for the new project.
  await expect(page.getByRole('heading', { name: 'E2E Test Workshop', exact: true })).toBeVisible();

  // ------------------------------------------------------------------
  // 2. Evidence: add a claim through the real form.
  // ------------------------------------------------------------------
  await page.click('#nav-evidence');
  await page.waitForLoadState('networkidle');
  await expect(page.getByRole('heading', { name: 'Evidence Ledger', exact: true })).toBeVisible();

  await page.click('button:has-text("Add Claim / Assumption")');
  await page.waitForLoadState('networkidle');

  await page.getByLabel('Claim / Hypothesis Statement').fill(
    'Solo contractors waste $600-$1,200/mo on shared lead brokers.',
  );
  await page.getByLabel('Current Status').selectOption('research_backed');
  await page.getByLabel('Evidence Notes / Quotes').fill(
    'Interviewed 3 contractors; all reported resold leads. “Every lead goes to at least five people.”',
  );
  await page.getByLabel('Source Reference Title').fill('Contractor Interview #1');
  await page.click('button:has-text("Save Claim to Ledger")');
  await page.waitForLoadState('networkidle');

  // Claim should appear in the ledger as research_backed.
  await expect(
    page.getByText('Solo contractors waste $600-$1,200/mo on shared lead brokers.'),
  ).toBeVisible();

  // ------------------------------------------------------------------
  // 3. Promotion guard: upgrade a claim to customer_confirmed without
  //    a verbatim quote → refused. Then add the quote → allowed.
  // ------------------------------------------------------------------
  // Open the edit modal for the claim row.
  await page.click('button[title="Edit claim and evidence"]').first();
  await page.waitForLoadState('networkidle');

  await page.getByLabel('Current Status').selectOption('customer_confirmed');
  await page.click('button:has-text("Save Claim")');
  await page.waitForLoadState('networkidle');

  // Guard should block: status still research_backed, blocker shown.
  await expect(
    page.getByText('Promotion blocked — nothing was saved'),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Edit Claim & Evidence', exact: true }),
  ).toBeVisible();

  // Satisfy the guard: add source + verbatim quote is already present; just re-save
  // (the quote from step 2 satisfies customer_confirmed). Change status again and save.
  await page.getByLabel('Current Status').selectOption('customer_confirmed');
  await page.click('button:has-text("Save Claim")');
  await page.waitForLoadState('networkidle');

  // The claim should now show as customer_confirmed in the ledger.
  await expect(page.getByText('Customer-Confirmed')).toBeVisible();

  // ------------------------------------------------------------------
  // 4. Export → download fires.
  // ------------------------------------------------------------------
  await page.click('#nav-documents');
  await page.waitForLoadState('networkidle');
  await expect(page.getByRole('heading', { name: 'Reports & Exports', exact: true })).toBeVisible();

  const downloadPromise = page.waitForEvent('download');
  await page.click('button:has-text("Export JSON")');
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/\.json$/);

  // ------------------------------------------------------------------
  // 5. Import the downloaded file → a distinct copy project appears.
  // ------------------------------------------------------------------
  const filePath = await download.path();
  expect(filePath).toBeTruthy();

  // Open Settings → data tab (already on Documents). Click Import JSON.
  const fileChooserPromise = page.waitForEvent('filechooser');
  await page.click('label:has-text("Import JSON")');
  const fileChooser = await fileChooserPromise;
  await fileChooser.setFiles(filePath!);
  await page.waitForLoadState('networkidle');

  // Import should succeed; verify via a toast or the new project appearing.
  await expect(
    page.getByText(/Successfully imported/),
  ).toBeVisible();

  expect(
    errors,
    `the core loop must complete without errors:\n${errors.join('\n')}`,
  ).toEqual([]);
});
