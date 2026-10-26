#!/usr/bin/env node
/**
 * Every remote GitHub Action must be pinned to a full 40-character commit SHA.
 * A floating tag (`@v4`, `@main`) is mutable, so the code CI runs could change
 * without any commit in this repository.
 *
 * Local composite actions (`./path`) and Docker references are not pinned this
 * way and are ignored.
 *
 * Usage: node scripts/check-action-pinning.js
 */
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const workflowDir = join(root, '.github', 'workflows');
const USES = /^\s*-?\s*uses:\s*(\S+)\s*(?:#.*)?$/;
const SHA = /^[0-9a-f]{40}$/;

const files = readdirSync(workflowDir)
  .filter((name) => name.endsWith('.yml') || name.endsWith('.yaml'))
  .map((name) => join(workflowDir, name));

const violations = [];

for (const file of files) {
  readFileSync(file, 'utf8')
    .split(/\r?\n/)
    .forEach((line, index) => {
      const match = line.match(USES);
      if (!match) return;
      const target = match[1];
      if (target.startsWith('./') || target.startsWith('docker://')) return;

      const at = target.lastIndexOf('@');
      const ref = at === -1 ? '' : target.slice(at + 1);
      if (!SHA.test(ref)) {
        violations.push(`${relative(root, file)}:${index + 1} ${target}`);
      }
    });
}

if (violations.length > 0) {
  console.error('Unpinned GitHub Actions found (pin to a 40-character commit SHA):');
  for (const violation of violations) console.error(`  ${violation}`);
  process.exit(1);
}

console.log(`Action pinning OK (${files.length} workflow files checked).`);
