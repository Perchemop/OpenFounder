#!/usr/bin/env node
/**
 * Personal-data and secret scan (build guide §II.29).
 *
 * A real person's name, home path, email, phone number or secret must never be
 * committed or released. Three modes, because "full" has four parts (§II.29.2):
 *
 *   node scripts/personal-data-scan.js                 # the working tree (tracked files)
 *   node scripts/personal-data-scan.js history         # every commit + commit metadata
 *   node scripts/personal-data-scan.js asset <dir>     # a built artefact tree
 *
 * Dotfiles and dot-directories are included: that is where agent config hides a
 * maintainer's home path. Every hit is classified, never just counted. A hit that
 * is obviously synthetic, a documented placeholder, or an environment-variable
 * name is reported as allowed with its reason.
 *
 * A value that reached history cannot be un-published by editing HEAD (§II.29.4).
 * Known historical findings are therefore listed in
 * `docs/security/known-historical-findings.json` by the **SHA-256 of the value**
 * — never the value itself — so the gate stays honest and red-for-new-leaks
 * while a purge is pending owner approval.
 */
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

/**
 * `value` extracts the sensitive token to classify, so an `assigned secret` hit
 * is judged on the secret itself rather than on the word `token` before it.
 */
const PATTERNS = [
  {
    // Case-sensitive on `home`: a real Unix home path is lower-case, and the
    // insensitive form false-positives on prose such as "Home/End keys".
    name: 'home path',
    re: /\/home\/[a-z0-9_.-]+/g,
    value: (match) => match,
  },
  {
    name: 'windows user path',
    re: /C:\\Users\\[A-Za-z0-9_.-]+/gi,
    value: (match) => match,
  },
  {
    name: 'email address',
    re: /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g,
    value: (match) => match,
  },
  {
    name: 'assigned secret',
    re: /(?:api[_-]?key|secret|token|password|passwd|bearer)\s*[:=]\s*['"]([^'"]+)['"]/gi,
    value: (match, groups) => groups[0],
  },
];

/** Values that are fine to publish, with the reason they are fine. */
const ALLOWED = [
  { test: (v) => /^\/home\/runner\b/i.test(v), reason: 'CI runner home (build path)' },
  { test: (v) => /^\/home\/example([-_][a-z]+)*\b/i.test(v), reason: 'reserved example home path' },
  { test: (v) => /@example\.(com|org|net)$/i.test(v), reason: 'RFC 2606 reserved example domain' },
  { test: (v) => /^(dev|founder|noreply|test)@/i.test(v), reason: 'synthetic mailbox' },
  { test: (v) => /@users\.noreply\.github\.com$/i.test(v), reason: 'GitHub noreply address' },
  { test: (v) => /^git@[a-z0-9.-]+$/i.test(v), reason: 'git SSH remote, not an email address' },
  { test: (v) => v.includes('REPLACE_WITH'), reason: 'placeholder for a value the user pastes' },
  { test: (v) => /[<>{}]/.test(v), reason: 'documented placeholder token' },
  { test: (v) => /^[A-Z][A-Z0-9_]*$/.test(v), reason: 'environment-variable name, not a value' },
  {
    test: (v) => /^(your[-_]|my[-_]|the[-_]|test|dummy|fake|sample|placeholder)/i.test(v),
    reason: 'declared placeholder',
  },
];

const BINARY = /\0/;
const sha256 = (value) => createHash('sha256').update(value).digest('hex');

function baselineHashes() {
  try {
    const raw = readFileSync('docs/security/known-historical-findings.json', 'utf8');
    const parsed = JSON.parse(raw);
    return new Map((parsed.findings ?? []).map((finding) => [finding.sha256, finding]));
  } catch {
    return new Map();
  }
}

function classify(text, file, line, allowedHits, violations, baseline) {
  for (const { name, re, value } of PATTERNS) {
    re.lastIndex = 0;
    for (const match of text.matchAll(re)) {
      const sensitive = value(match[0], match.slice(1));
      if (!sensitive) continue;

      const allow = ALLOWED.find((entry) => entry.test(sensitive));
      if (allow) {
        allowedHits.push({ file, line, kind: name, value: sensitive, reason: allow.reason });
        continue;
      }

      const known = baseline.get(sha256(sensitive));
      if (known) {
        allowedHits.push({
          file,
          line,
          kind: name,
          value: `sha256:${sha256(sensitive).slice(0, 12)}…`,
          reason: known.reason,
        });
        continue;
      }

      violations.push({ file, line, kind: name, value: sensitive });
    }
  }
}

function treeFiles() {
  const out = execFileSync('git', ['ls-files', '-z'], { maxBuffer: 64 * 1024 * 1024 });
  return out
    .toString('utf8')
    .split('\0')
    .filter(Boolean)
    .map((path) => ({ path, diskPath: path }));
}

function assetFiles(root) {
  const files = [];
  const walk = (dir) => {
    for (const entry of readdirSync(dir)) {
      const diskPath = join(dir, entry);
      if (statSync(diskPath).isDirectory()) walk(diskPath);
      else files.push({ path: relative(root, diskPath), diskPath });
    }
  };
  walk(root);
  return files;
}

const [, , modeArg, assetDir] = process.argv;
const mode = modeArg === 'history' ? 'history' : modeArg === 'asset' ? 'asset' : 'tree';

const allowedHits = [];
const violations = [];
const baseline = mode === 'history' ? baselineHashes() : new Map();

if (mode === 'history') {
  // Whole history, not just HEAD: a value deleted later is still readable (§II.29.2).
  const log = execFileSync('git', ['log', '-p', '--all', '--unified=0', '--no-color', '--format=%H%n%an <%ae>%n%cn <%ce>'], {
    maxBuffer: 1024 * 1024 * 1024,
  }).toString('utf8');

  let commit = '';
  log.split(/\r?\n/).forEach((line) => {
    if (/^[0-9a-f]{40}$/.test(line)) commit = line.slice(0, 10);
    else if (line.startsWith('+') && !line.startsWith('+++')) {
      classify(line.slice(1), `history:${commit}`, 0, allowedHits, violations, baseline);
    } else if (/^(Author|Committer|committer|author):/.test(line)) {
      classify(line, `metadata:${commit}`, 0, allowedHits, violations, baseline);
    }
  });
} else {
  const files = mode === 'asset' ? assetFiles(assetDir ?? '.') : treeFiles();
  if (mode === 'asset' && !assetDir) {
    console.error('Usage: node scripts/personal-data-scan.js asset <dir>');
    process.exit(2);
  }
  for (const { path, diskPath } of files) {
    let content;
    try {
      content = readFileSync(diskPath, 'utf8');
    } catch {
      continue; // unreadable (permissions, or removed between listing and read)
    }
    if (BINARY.test(content.slice(0, 4096))) continue;
    content.split(/\r?\n/).forEach((line, index) => {
      classify(line, path, index + 1, allowedHits, violations, baseline);
    });
  }
}

for (const hit of allowedHits) {
  console.log(`allowed  ${hit.file}${hit.line ? `:${hit.line}` : ''} [${hit.kind}] ${hit.value} — ${hit.reason}`);
}

if (violations.length > 0) {
  console.error(`\nUnclassified personal data or secret in ${violations.length} place(s) [${mode} scan]:`);
  for (const hit of violations) {
    console.error(`  ${hit.file}${hit.line ? `:${hit.line}` : ''} [${hit.kind}] ${hit.value}`);
  }
  console.error(
    '\nFix by removing the value, or replace it with an obviously synthetic one ' +
      '(`dev@example.com`, `Jane Doe`, `example.com`). Never substitute another plausible real value. ' +
      'For a value already in history, record its SHA-256 in docs/security/known-historical-findings.json ' +
      'and raise the purge decision with the owner (guide §II.29.4).',
  );
  process.exit(1);
}

console.log(
  `\nPersonal-data scan clean [${mode}]: ${allowedHits.length} allowed hit(s), 0 unclassified.`,
);
