import type { ResearchSource, ResearchCategory } from '../types';

export interface ResearchQuery {
  category: ResearchCategory;
  query: string;
  maxResults?: number;
}

export interface ResearchProvider {
  id: string;
  name: string;
  description: string;
  isLocalOnly: boolean;
  search(query: ResearchQuery): Promise<Partial<ResearchSource>[]>;
}

// 1. Manual Research Provider (Local-First, Zero Network, 100% User Provenance)
export class ManualResearchProvider implements ResearchProvider {
  id = 'manual';
  name = 'Manual Entry / Local Reference';
  description = 'Add verified industry reports, academic papers, customer forum posts, or SEC filings directly.';
  isLocalOnly = true;

  async search(_query: ResearchQuery): Promise<Partial<ResearchSource>[]> {
    // Manual provider requires direct user input
    return [];
  }
}

// Source Type metadata & guidance
export const RESEARCH_SOURCE_TYPES: {
  id: NonNullable<ResearchSource['sourceType']>;
  label: string;
  description: string;
  provenanceChecklist: string[];
}[] = [
  {
    id: 'industry_report',
    label: 'Industry / Market Report',
    description: 'Third-party research reports (e.g. IBISWorld, Gartner, Statista, Grand View).',
    provenanceChecklist: ['Verify publisher credibility', 'Note methodology and sample size', 'Check publication date'],
  },
  {
    id: 'user_forum',
    label: 'Customer Community / Forum',
    description: 'Unsolicited discussions from Reddit, Hacker News, niche Discord servers, or subreddits.',
    provenanceChecklist: ['Confirm actual user persona matches target', 'Capture exact verbatim quotes', 'Save permalink'],
  },
  {
    id: 'pricing_page',
    label: 'Competitor Pricing Page',
    description: 'Published public pricing tables, tier restrictions, and feature gates.',
    provenanceChecklist: ['Record timestamp of pricing capture', 'Document hidden limits or seat minimums'],
  },
  {
    id: 'sec_filing',
    label: 'SEC / Regulatory Filing',
    description: '10-K, 10-Q, S-1 disclosures, or government regulatory agency public rulings.',
    provenanceChecklist: ['Highest confidence for revenue benchmarks and risk factors', 'Cite specific filing date'],
  },
  {
    id: 'academic',
    label: 'Peer-Reviewed Academic Paper',
    description: 'Published scientific or behavioral research with formal peer-review.',
    provenanceChecklist: ['Check citation count', 'Verify experimental sample validity'],
  },
  {
    id: 'interview_transcript',
    label: 'Customer Interview Transcript',
    description: 'Direct 1-on-1 discovery interview notes or audio transcriptions.',
    provenanceChecklist: ['Anonymize identifiable PII', 'Link directly to specific pain claim in Evidence Ledger'],
  },
  {
    id: 'news',
    label: 'News / Trade Press',
    description: 'Articles from verified journalism or trade magazines.',
    provenanceChecklist: ['Distinguish editorial opinion from empirical reporting'],
  },
  {
    id: 'other',
    label: 'Other Primary Source',
    description: 'Books, patents, podcast transcripts, or FOIA documents.',
    provenanceChecklist: ['Document source author and original context'],
  },
];
