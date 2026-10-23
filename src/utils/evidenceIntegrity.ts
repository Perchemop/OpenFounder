import type { ClaimType, EvidenceItem, EvidenceStatus } from '../types';

/**
 * Strength order of evidence statuses. Moving to a higher number is a
 * "promotion" and must be supported by evidence. Moving down is always allowed:
 * a founder can always admit that a claim is weaker than previously believed.
 */
export const EVIDENCE_STRENGTH: Record<EvidenceStatus, number> = {
  unverified: 0,
  assumption: 1,
  anecdotal: 2,
  research_backed: 3,
  customer_confirmed: 4,
  experiment_confirmed: 5,
};

export type PromotionDirection = 'weaken' | 'same' | 'strengthen';

export type PromotionBlockerCode =
  | 'notes_required'
  | 'source_required'
  | 'verbatim_quote_required';

export interface PromotionBlocker {
  code: PromotionBlockerCode;
  /** Field the user must fill in: evidenceNotes, sourceTitle/sourceUrl. */
  field: 'evidenceNotes' | 'source';
  message: string;
}

export interface EvidenceDraft {
  claim: string;
  status: EvidenceStatus;
  evidenceNotes?: string;
  sourceTitle?: string;
  sourceUrl?: string;
  nextTest?: string;
}

export interface PromotionEvaluation {
  /** True when the target status may be applied. */
  allowed: boolean;
  targetStatus: EvidenceStatus;
  currentStatus: EvidenceStatus;
  direction: PromotionDirection;
  blockers: PromotionBlocker[];
}

const MIN_QUOTE_LENGTH = 8;

/**
 * Detects a verbatim quote in free text. Accepts straight and typographic
 * quotes, and requires a minimum length so an empty pair of quotes cannot
 * satisfy the rule.
 */
export function hasVerbatimQuote(text: string | undefined | null): boolean {
  if (!text) return false;
  const patterns = [
    /"([^"]{8,})"/, // "quote"
    /“([^”]{8,})”/, // “quote”
    /„([^“”]{8,})[“”]/, // „quote“
    /«([^»]{8,})»/, // «quote»
  ];
  return patterns.some((pattern) => pattern.test(text));
}

function hasText(value: string | undefined | null): boolean {
  return typeof value === 'string' && value.trim().length > 0;
}

export function hasSource(draft: Pick<EvidenceDraft, 'sourceTitle' | 'sourceUrl'>): boolean {
  return hasText(draft.sourceTitle) || hasText(draft.sourceUrl);
}

export function promotionDirection(
  from: EvidenceStatus,
  to: EvidenceStatus
): PromotionDirection {
  const delta = EVIDENCE_STRENGTH[to] - EVIDENCE_STRENGTH[from];
  if (delta > 0) return 'strengthen';
  if (delta < 0) return 'weaken';
  return 'same';
}

/**
 * Decides whether a claim may move to `targetStatus` given the evidence the
 * founder has actually recorded. This is the single source of truth used by
 * the Evidence page; it must not be re-implemented in a component.
 *
 * Rules:
 * - Weakening a claim (or leaving it unchanged) is always allowed.
 * - `anecdotal` needs a written observation.
 * - `research_backed` needs a written observation plus a named source.
 * - `customer_confirmed` needs a source and a verbatim quote.
 * - `experiment_confirmed` needs a written result plus a named source.
 */
export function evaluateEvidencePromotion(
  draft: EvidenceDraft,
  targetStatus: EvidenceStatus
): PromotionEvaluation {
  const currentStatus = draft.status;
  const direction = promotionDirection(currentStatus, targetStatus);
  const blockers: PromotionBlocker[] = [];

  if (direction === 'strengthen') {
    const notes = draft.evidenceNotes;
    const source = hasSource(draft);

    if (targetStatus === 'anecdotal') {
      if (!hasText(notes)) {
        blockers.push({
          code: 'notes_required',
          field: 'evidenceNotes',
          message:
            'Record what you actually observed or heard. Anecdotal claims need a note, even if informal.',
        });
      }
    }

    if (targetStatus === 'research_backed') {
      if (!hasText(notes)) {
        blockers.push({
          code: 'notes_required',
          field: 'evidenceNotes',
          message: 'Summarise the finding that supports this claim.',
        });
      }
      if (!source) {
        blockers.push({
          code: 'source_required',
          field: 'source',
          message: 'Name or link the public source (report, page, filing, dataset).',
        });
      }
    }

    if (targetStatus === 'customer_confirmed') {
      if (!source) {
        blockers.push({
          code: 'source_required',
          field: 'source',
          message:
            'Name the interview or interview set (for example "Plumber interview #2").',
        });
      }
      if (!hasVerbatimQuote(notes)) {
        blockers.push({
          code: 'verbatim_quote_required',
          field: 'evidenceNotes',
          message: `Paste a verbatim quote (at least ${MIN_QUOTE_LENGTH} characters) in quotation marks. Do not paraphrase.`,
        });
      }
    }

    if (targetStatus === 'experiment_confirmed') {
      if (!hasText(notes)) {
        blockers.push({
          code: 'notes_required',
          field: 'evidenceNotes',
          message: 'Record the measured result and how it met the success criteria.',
        });
      }
      if (!source) {
        blockers.push({
          code: 'source_required',
          field: 'source',
          message: 'Reference the experiment result (name, sheet, or link).',
        });
      }
    }
  }

  return {
    allowed: blockers.length === 0,
    targetStatus,
    currentStatus,
    direction,
    blockers,
  };
}

export function isSupportedStatus(status: EvidenceStatus): boolean {
  return status !== 'unverified' && status !== 'assumption';
}

export interface EvidenceTypeIntegrity {
  type: ClaimType;
  total: number;
  supported: number;
  unsupported: number;
}

export interface EvidenceIntegritySummary {
  total: number;
  supported: number;
  unsupported: number;
  verified: number;
  coveragePct: number;
  byType: EvidenceTypeIntegrity[];
  /**
   * Claim type with the highest share of unsupported claims (ties broken by
   * the larger absolute count). Null when there are no claims at all.
   */
  weakestType: ClaimType | null;
}

/**
 * Rolls the ledger up for the integrity strip. Pure and deterministic, so the
 * same numbers can be reused by the dashboard and by exports.
 */
export function summarizeEvidenceIntegrity(
  evidence: readonly EvidenceItem[]
): EvidenceIntegritySummary {
  const byTypeMap = new Map<ClaimType, EvidenceTypeIntegrity>();
  let supported = 0;
  let verified = 0;

  for (const item of evidence) {
    const isSupported = isSupportedStatus(item.status);
    if (isSupported) supported += 1;
    if (item.status === 'customer_confirmed' || item.status === 'experiment_confirmed') {
      verified += 1;
    }

    const bucket = byTypeMap.get(item.type) ?? {
      type: item.type,
      total: 0,
      supported: 0,
      unsupported: 0,
    };
    bucket.total += 1;
    if (isSupported) bucket.supported += 1;
    else bucket.unsupported += 1;
    byTypeMap.set(item.type, bucket);
  }

  const byType = [...byTypeMap.values()].sort(
    (a, b) => b.unsupported - a.unsupported || b.total - a.total || a.type.localeCompare(b.type)
  );

  const total = evidence.length;
  const unsupported = total - supported;
  const weakestType = byType.length > 0 ? byType[0].type : null;

  return {
    total,
    supported,
    unsupported,
    verified,
    coveragePct: total === 0 ? 0 : Math.round((supported / total) * 100),
    byType,
    weakestType,
  };
}

/** Human-readable next action for a claim that is not yet supported. */
export function describeMissingEvidence(draft: EvidenceDraft): string {
  if (isSupportedStatus(draft.status)) {
    return 'This claim is supported. Re-check it when new evidence appears.';
  }
  if (!hasText(draft.evidenceNotes)) {
    return 'Record what you have observed so far — and what would prove this wrong.';
  }
  if (!hasSource(draft)) {
    return 'Attach a source (interview, report, or experiment result).';
  }
  return 'Run the falsification test, then promote this claim with the result.';
}
