import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { validateExportPackage } from './validation';

// The example project ships with the app and in every release (guide R-048). It
// is the artefact a new user is most likely to import first, so it must pass
// the same validator the importer uses. That rule had no test until now, which
// is how a `null`-for-optional mismatch survived a release and made the
// "Import Example Project" button fail.
const COPIES = [
  'assets/example-project-tradepulse.json',
  'public/assets/example-project-tradepulse.json',
];

function readJson(path: string): Record<string, unknown> {
  return JSON.parse(readFileSync(path, 'utf8')) as Record<string, unknown>;
}

describe('bundled example project', () => {
  it.each(COPIES)('%s passes import validation', (path) => {
    const result = validateExportPackage(readJson(path));
    expect(result.errors ?? []).toEqual([]);
    expect(result.valid).toBe(true);
  });

  it('ships the same bytes in assets/ and public/assets/', () => {
    const [a, b] = COPIES.map((p) => readFileSync(p, 'utf8'));
    expect(a).toBe(b);
  });

  it('accepts null for an optional field (the mismatch that broke import)', () => {
    const raw = readJson(COPIES[0]);
    const evidence = raw.evidence as Array<Record<string, unknown>>;
    expect(Array.isArray(evidence)).toBe(true);

    const withNulls = {
      ...raw,
      evidence: evidence.map((item) => ({ ...item, sourceTitle: null })),
    };

    const result = validateExportPackage(withNulls);
    expect(result.errors ?? []).toEqual([]);
    expect(result.valid).toBe(true);
  });

  it('still rejects a required field that is null', () => {
    const raw = readJson(COPIES[0]);
    const project = raw.project as Record<string, unknown>;
    const result = validateExportPackage({ ...raw, project: { ...project, id: null } });
    expect(result.valid).toBe(false);
  });
});
