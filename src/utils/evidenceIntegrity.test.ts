import { describe, it, expect } from 'vitest';
import type { ClaimType, EvidenceItem, EvidenceStatus } from '../types';
import {
  EVIDENCE_STRENGTH,
  describeMissingEvidence,
  evaluateEvidencePromotion,
  hasSource,
  hasVerbatimQuote,
  isSupportedStatus,
  promotionDirection,
  summarizeEvidenceIntegrity,
} from './evidenceIntegrity';

function claim(overrides: Partial<EvidenceItem> = {}): EvidenceItem {
  return {
    id: 'ev_1',
    projectId: 'proj_1',
    claim: 'Solo contractors waste money on stale leads',
    type: 'problem',
    status: 'assumption',
    evidenceNotes: '',
    confidence: 'medium',
    nextTest: 'Interview five contractors',
    createdAt: 1,
    updatedAt: 1,
    ...overrides,
  };
}

describe('evidenceIntegrity', () => {
  describe('promotionDirection', () => {
    it('classifies promotions, downgrades, and no-ops by strength order', () => {
      expect(promotionDirection('assumption', 'research_backed')).toBe('strengthen');
      expect(promotionDirection('experiment_confirmed', 'anecdotal')).toBe('weaken');
      expect(promotionDirection('assumption', 'assumption')).toBe('same');
    });

    it('orders every status monotonically', () => {
      const statuses: EvidenceStatus[] = [
        'unverified',
        'assumption',
        'anecdotal',
        'research_backed',
        'customer_confirmed',
        'experiment_confirmed',
      ];
      const strengths = statuses.map((s) => EVIDENCE_STRENGTH[s]);
      expect(strengths).toEqual([...strengths].sort((a, b) => a - b));
    });
  });

  describe('hasVerbatimQuote', () => {
    it('accepts straight and typographic quotes above the minimum length', () => {
      expect(hasVerbatimQuote('She said "I hate buying leads every month".')).toBe(true);
      expect(hasVerbatimQuote('“I hate buying leads every month”')).toBe(true);
      expect(hasVerbatimQuote('«Je déteste acheter des leads»')).toBe(true);
    });

    it('rejects empty, short, or unquoted text', () => {
      expect(hasVerbatimQuote('')).toBe(false);
      expect(hasVerbatimQuote(undefined)).toBe(false);
      expect(hasVerbatimQuote('She said ""')).toBe(false);
      expect(hasVerbatimQuote('She said "tiny"')).toBe(false);
      expect(hasVerbatimQuote('She hates buying leads every month')).toBe(false);
    });
  });

  describe('hasSource', () => {
    it('accepts a title or a URL, and rejects whitespace', () => {
      expect(hasSource({ sourceTitle: 'Interview #2' })).toBe(true);
      expect(hasSource({ sourceUrl: 'https://example.com/report' })).toBe(true);
      expect(hasSource({ sourceTitle: '   ', sourceUrl: '' })).toBe(false);
      expect(hasSource({})).toBe(false);
    });
  });

  describe('evaluateEvidencePromotion', () => {
    it('never blocks a downgrade', () => {
      const evaluation = evaluateEvidencePromotion(
        { claim: 'x', status: 'experiment_confirmed', evidenceNotes: '' },
        'unverified'
      );
      expect(evaluation.allowed).toBe(true);
      expect(evaluation.direction).toBe('weaken');
      expect(evaluation.blockers).toEqual([]);
    });

    it('allows unverified to assumption without evidence', () => {
      expect(
        evaluateEvidencePromotion({ claim: 'x', status: 'unverified' }, 'assumption').allowed
      ).toBe(true);
    });

    it('requires a written observation for anecdotal', () => {
      const blocked = evaluateEvidencePromotion(
        { claim: 'x', status: 'assumption', evidenceNotes: '   ' },
        'anecdotal'
      );
      expect(blocked.allowed).toBe(false);
      expect(blocked.blockers.map((b) => b.code)).toEqual(['notes_required']);

      const allowed = evaluateEvidencePromotion(
        { claim: 'x', status: 'assumption', evidenceNotes: 'Two contractors said this.' },
        'anecdotal'
      );
      expect(allowed.allowed).toBe(true);
    });

    it('requires both notes and a source for research_backed', () => {
      const noNotes = evaluateEvidencePromotion(
        { claim: 'x', status: 'assumption', sourceTitle: 'Report' },
        'research_backed'
      );
      expect(noNotes.blockers.map((b) => b.code)).toEqual(['notes_required']);

      const noSource = evaluateEvidencePromotion(
        { claim: 'x', status: 'assumption', evidenceNotes: 'Market grew 12% in 2025.' },
        'research_backed'
      );
      expect(noSource.blockers.map((b) => b.code)).toEqual(['source_required']);

      const both = evaluateEvidencePromotion(
        {
          claim: 'x',
          status: 'assumption',
          evidenceNotes: 'Market grew 12% in 2025.',
          sourceUrl: 'https://example.com/report',
        },
        'research_backed'
      );
      expect(both.allowed).toBe(true);
      expect(both.blockers).toEqual([]);
    });

    it('requires a source and a verbatim quote for customer_confirmed', () => {
      const evaluation = evaluateEvidencePromotion(
        {
          claim: 'x',
          status: 'anecdotal',
          evidenceNotes: 'Contractors dislike paying per lead.',
        },
        'customer_confirmed'
      );
      expect(evaluation.allowed).toBe(false);
      expect(evaluation.blockers.map((b) => b.code)).toEqual([
        'source_required',
        'verbatim_quote_required',
      ]);
    });

    it('allows customer_confirmed with a named interview and a quote', () => {
      const evaluation = evaluateEvidencePromotion(
        {
          claim: 'x',
          status: 'anecdotal',
          evidenceNotes: 'Interviewee: "I would cancel Angi tomorrow if I could".',
          sourceTitle: 'Plumber interview #2',
        },
        'customer_confirmed'
      );
      expect(evaluation.allowed).toBe(true);
    });

    it('requires a measured result and a reference for experiment_confirmed', () => {
      const blocked = evaluateEvidencePromotion(
        { claim: 'x', status: 'customer_confirmed', evidenceNotes: '' },
        'experiment_confirmed'
      );
      expect(blocked.blockers.map((b) => b.code)).toEqual([
        'notes_required',
        'source_required',
      ]);

      const allowed = evaluateEvidencePromotion(
        {
          claim: 'x',
          status: 'customer_confirmed',
          evidenceNotes: '14/40 targeted users requested an invite; threshold was 10.',
          sourceTitle: 'Smoke test run 2026-10-20',
        },
        'experiment_confirmed'
      );
      expect(allowed.allowed).toBe(true);
    });
  });

  describe('isSupportedStatus', () => {
    it('treats only unverified and assumption as unsupported', () => {
      expect(isSupportedStatus('unverified')).toBe(false);
      expect(isSupportedStatus('assumption')).toBe(false);
      expect(isSupportedStatus('anecdotal')).toBe(true);
      expect(isSupportedStatus('experiment_confirmed')).toBe(true);
    });
  });

  describe('summarizeEvidenceIntegrity', () => {
    it('returns a zeroed summary for an empty ledger', () => {
      expect(summarizeEvidenceIntegrity([])).toEqual({
        total: 0,
        supported: 0,
        unsupported: 0,
        verified: 0,
        coveragePct: 0,
        byType: [],
        weakestType: null,
      });
    });

    it('counts support, verification, and coverage', () => {
      const summary = summarizeEvidenceIntegrity([
        claim({ id: '1', status: 'assumption', type: 'problem' }),
        claim({ id: '2', status: 'unverified', type: 'problem' }),
        claim({ id: '3', status: 'research_backed', type: 'market' }),
        claim({ id: '4', status: 'customer_confirmed', type: 'customer' }),
        claim({ id: '5', status: 'experiment_confirmed', type: 'pricing' }),
      ]);

      expect(summary.total).toBe(5);
      expect(summary.supported).toBe(3);
      expect(summary.unsupported).toBe(2);
      expect(summary.verified).toBe(2);
      expect(summary.coveragePct).toBe(60);
    });

    it('identifies the weakest claim type by unsupported count', () => {
      const summary = summarizeEvidenceIntegrity([
        claim({ id: '1', status: 'assumption', type: 'problem' }),
        claim({ id: '2', status: 'unverified', type: 'problem' }),
        claim({ id: '3', status: 'research_backed', type: 'market' }),
      ]);
      expect(summary.weakestType).toBe('problem');
      expect(summary.byType[0]).toEqual({
        type: 'problem' as ClaimType,
        total: 2,
        supported: 0,
        unsupported: 2,
      });
    });
  });

  describe('describeMissingEvidence', () => {
    it('names the next needed input', () => {
      expect(describeMissingEvidence({ claim: 'x', status: 'assumption' })).toMatch(
        /observed/
      );
      expect(
        describeMissingEvidence({
          claim: 'x',
          status: 'assumption',
          evidenceNotes: 'Two interviews',
        })
      ).toMatch(/source/);
      expect(
        describeMissingEvidence({
          claim: 'x',
          status: 'assumption',
          evidenceNotes: 'Two interviews',
          sourceTitle: 'Interview notes',
        })
      ).toMatch(/falsification/);
      expect(
        describeMissingEvidence({
          claim: 'x',
          status: 'experiment_confirmed',
          evidenceNotes: 'passed',
          sourceTitle: 'run 1',
        })
      ).toMatch(/supported/);
    });
  });
});
