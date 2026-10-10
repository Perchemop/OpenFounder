import { describe, it, expect } from 'vitest';
import {
  DEFAULT_GEMINI_MODEL,
  DEFAULT_GEMINI_FALLBACK_MODELS,
  buildGeminiModelCandidates,
  parseFallbackModels,
  formatFallbackModels,
} from './modelDefaults';

describe('buildGeminiModelCandidates', () => {
  it('puts preferred model first and de-duplicates fallbacks/defaults', () => {
    const result = buildGeminiModelCandidates('gemini-1.5-pro', [
      'gemini-2.0-flash',
      'gemini-1.5-pro',
      'gemini-flash-latest',
    ]);
    expect(result[0]).toBe('gemini-1.5-pro');
    expect(result).toContain('gemini-2.0-flash');
    expect(result).toContain('gemini-flash-latest');
    // no duplicates
    expect(new Set(result).size).toBe(result.length);
  });

  it('falls back to DEFAULT_GEMINI_MODEL when preferred is empty', () => {
    const result = buildGeminiModelCandidates('', []);
    expect(result[0]).toBe(DEFAULT_GEMINI_MODEL);
    for (const m of DEFAULT_GEMINI_FALLBACK_MODELS) {
      expect(result).toContain(m);
    }
  });

  it('trims whitespace on preferred and fallbacks', () => {
    const result = buildGeminiModelCandidates('  gemini-2.0-flash-lite  ', [
      '  gemini-1.5-flash  ',
      '',
      '  ',
    ]);
    expect(result[0]).toBe('gemini-2.0-flash-lite');
    expect(result).toContain('gemini-1.5-flash');
    expect(result.every((m) => m.trim() === m && m.length > 0)).toBe(true);
  });
});

describe('parseFallbackModels / formatFallbackModels', () => {
  it('parses comma and newline separated lists', () => {
    expect(parseFallbackModels('a, b, c')).toEqual(['a', 'b', 'c']);
    expect(parseFallbackModels('a\nb\nc')).toEqual(['a', 'b', 'c']);
    expect(parseFallbackModels('a, \n b,,c')).toEqual(['a', 'b', 'c']);
  });

  it('returns empty array for blank input', () => {
    expect(parseFallbackModels('')).toEqual([]);
    expect(parseFallbackModels(null)).toEqual([]);
    expect(parseFallbackModels(undefined)).toEqual([]);
    expect(parseFallbackModels('   ')).toEqual([]);
  });

  it('round-trips through formatFallbackModels', () => {
    const models = ['gemini-2.0-flash-lite', 'gemini-1.5-flash'];
    expect(parseFallbackModels(formatFallbackModels(models))).toEqual(models);
    expect(formatFallbackModels([])).toBe('');
    expect(formatFallbackModels(null)).toBe('');
  });
});
