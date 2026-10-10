import { describe, it, expect } from 'vitest';
import { generateId } from '../utils/id';

describe('generateId', () => {
  it('prefixes IDs with the provided prefix', () => {
    const id = generateId('risk');
    expect(id.startsWith('risk_')).toBe(true);
  });

  it('uses default prefix when none is provided', () => {
    const id = generateId();
    expect(id.startsWith('id_')).toBe(true);
  });

  it('produces unique IDs across multiple calls', () => {
    const ids = new Set(Array.from({ length: 50 }, () => generateId('t')));
    expect(ids.size).toBe(50);
  });

  it('only uses safe characters after the prefix', () => {
    const id = generateId('proj');
    const body = id.slice('proj_'.length);
    expect(body).toMatch(/^[a-zA-Z0-9]+$/);
  });
});
