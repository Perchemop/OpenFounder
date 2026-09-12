import { z } from 'zod';
import type { ExportPackage } from '../types';

// Safe bounds & regexes
export const ID_REGEX = /^[a-zA-Z0-9_-]{1,128}$/;
export const SafeIdSchema = z
  .string()
  .regex(ID_REGEX, { message: 'ID must consist of alphanumeric characters, hyphens or underscores (1-128 chars).' });

export const SafeUrlSchema = z
  .string()
  .max(1000)
  .refine(
    (val) => {
      if (!val || val.trim() === '') return true;
      const trimmed = val.trim().toLowerCase();
      if (
        trimmed.startsWith('javascript:') ||
        trimmed.startsWith('data:') ||
        trimmed.startsWith('vbscript:')
      ) {
        return false;
      }
      try {
        const parsed = new URL(val);
        return parsed.protocol === 'http:' || parsed.protocol === 'https:';
      } catch {
        return false;
      }
    },
    { message: 'URL must be a valid http:// or https:// address.' }
  )
  .optional();

export const ProjectSchema = z.object({
  id: SafeIdSchema,
  name: z.string().min(1).max(250),
  oneSentenceIdea: z.string().max(1000).default(''),
  category: z.string().max(200).default('General'),
  stage: z.enum([
    'idea',
    'problem_identified',
    'researching',
    'validating',
    'mvp_building',
    'launched',
    'growth',
  ]).default('idea'),
  targetMarket: z.string().max(500).default(''),
  location: z.string().max(200).default(''),
  website: SafeUrlSchema,
  existingResearch: z.string().max(10000).optional(),
  problemStatement: z.string().max(5000).default(''),
  targetUserGroup: z.string().max(500).default(''),
  problemFrequency: z.enum(['hourly', 'daily', 'weekly', 'monthly', 'rarely', 'unknown']).default('unknown'),
  problemSeverity: z.enum(['mild', 'moderate', 'severe', 'critical', 'unknown']).default('unknown'),
  currentAlternatives: z.string().max(5000).default(''),
  successDefinition: z.string().max(5000).default(''),
  behavioralChange: z.string().max(5000).default(''),
  willingnessToPayTrigger: z.string().max(5000).default(''),
  founderSkills: z.string().max(5000).optional(),
  availableResources: z.string().max(5000).optional(),
  budget: z.string().max(200).optional(),
  timeline: z.string().max(200).optional(),
  existingAudience: z.string().max(2000).optional(),
  constraints: z.string().max(5000).optional(),
  startingPoint: z.enum([
    'idea_only',
    'problem_identified',
    'research_completed',
    'mvp_started',
    'existing_business',
  ]).default('idea_only'),
  currentPhaseIndex: z.number().int().min(0).max(9).default(0),
  completedTaskIds: z.array(z.string().max(128)).max(500).optional().default([]),
  phaseHistory: z.array(
    z.object({
      phaseIndex: z.number().int().min(0).max(9),
      manualOverride: z.boolean().optional(),
      overrideReason: z.string().max(2000).optional(),
      completedAt: z.number(),
    })
  ).max(50).optional(),
  isSynthetic: z.boolean().optional(),
  createdAt: z.number().default(() => Date.now()),
  updatedAt: z.number().default(() => Date.now()),
});

export const EvidenceItemSchema = z.object({
  id: SafeIdSchema,
  projectId: SafeIdSchema,
  claim: z.string().min(1).max(2000),
  type: z.enum(['problem', 'customer', 'market', 'pricing', 'feasibility', 'distribution', 'retention']),
  status: z.enum([
    'unverified',
    'assumption',
    'anecdotal',
    'research_backed',
    'customer_confirmed',
    'experiment_confirmed',
  ]),
  evidenceNotes: z.string().max(10000).default(''),
  sourceUrl: SafeUrlSchema,
  sourceTitle: z.string().max(500).optional(),
  confidence: z.enum(['low', 'medium', 'high']),
  nextTest: z.string().max(2000).default(''),
  isSynthetic: z.boolean().optional(),
  createdAt: z.number(),
  updatedAt: z.number(),
});

export const ResearchSourceSchema = z.object({
  id: SafeIdSchema,
  projectId: SafeIdSchema,
  title: z.string().min(1).max(500),
  url: SafeUrlSchema,
  publisherOrDomain: z.string().max(300).optional(),
  sourceType: z.enum([
    'academic',
    'industry_report',
    'user_forum',
    'sec_filing',
    'news',
    'pricing_page',
    'interview_transcript',
    'other',
  ]).optional(),
  category: z.enum([
    'market',
    'competitors',
    'customers',
    'trends',
    'pricing',
    'technology',
    'regulations',
    'distribution',
    'substitutes',
  ]),
  dateAccessed: z.string().max(50),
  summary: z.string().max(10000).default(''),
  keyFindings: z.array(z.string().max(2000)).max(50).default([]),
  relevance: z.enum(['high', 'medium', 'low']),
  confidence: z.enum(['high', 'medium', 'low']),
  claimLinkedIds: z.array(SafeIdSchema).max(100).optional(),
  notes: z.string().max(5000).optional(),
  isSynthetic: z.boolean().optional(),
  createdAt: z.number(),
});

export const CommunityInsightSchema = z.object({
  id: SafeIdSchema,
  projectId: SafeIdSchema,
  sourceCommunity: z.string().min(1).max(300),
  query: z.string().max(1000).default(''),
  directQuotes: z.array(z.string().max(2000)).max(50).default([]),
  aiInterpretation: z.string().max(5000).default(''),
  problemMentioned: z.string().max(3000).default(''),
  willingnessToPaySignal: z.enum(['strong', 'moderate', 'weak', 'none', 'negative']),
  url: SafeUrlSchema,
  createdAt: z.number(),
});

export const CompetitorSchema = z.object({
  id: SafeIdSchema,
  projectId: SafeIdSchema,
  name: z.string().min(1).max(300),
  url: SafeUrlSchema,
  productDescription: z.string().max(5000).default(''),
  pricingModel: z.string().max(2000).default(''),
  targetAudience: z.string().max(2000).default(''),
  positioning: z.string().max(2000).default(''),
  strengths: z.array(z.string().max(1000)).max(50).default([]),
  weaknesses: z.array(z.string().max(1000)).max(50).default([]),
  customerComplaints: z.array(z.string().max(2000)).max(50).default([]),
  keyDifferentiators: z.string().max(5000).default(''),
  evidenceNotes: z.string().max(10000).default(''),
  isSynthetic: z.boolean().optional(),
  createdAt: z.number(),
  updatedAt: z.number(),
});

export const ExperimentSchema = z.object({
  id: SafeIdSchema,
  projectId: SafeIdSchema,
  hypothesis: z.string().min(1).max(3000),
  targetAudience: z.string().max(1000).optional(),
  dimension: z.enum(['problem', 'customer', 'solution', 'market', 'commercial']).optional(),
  method: z.enum([
    'customer_interview',
    'smoke_landing_page',
    'waitlist',
    'survey',
    'clickable_prototype',
    'pricing_test',
    'pre_order',
    'cold_outreach',
    'concierge_mvp',
    'competitor_teardown',
  ]),
  requiredSampleSize: z.number().int().min(0).max(1000000).optional(),
  targetSampleSize: z.number().int().min(0).max(1000000).optional(),
  currentSampleSize: z.number().int().min(0).max(1000000).default(0),
  successCriteria: z.string().max(2000).default(''),
  failureCriteria: z.string().max(2000).default(''),
  timeframeWeeks: z.number().min(0).max(52).optional(),
  status: z.enum(['planned', 'running', 'completed', 'inconclusive', 'passed', 'failed']),
  resultSummary: z.string().max(10000).optional(),
  results: z.string().max(10000).optional(),
  evidenceId: SafeIdSchema.optional(),
  decisionTaken: z.string().max(2000).optional(),
  startDate: z.string().max(50).optional(),
  endDate: z.string().max(50).optional(),
  isSynthetic: z.boolean().optional(),
  createdAt: z.number(),
  updatedAt: z.number(),
});

export const CustomerInterviewSchema = z.object({
  id: SafeIdSchema,
  projectId: SafeIdSchema,
  intervieweeIdentifier: z.string().min(1).max(300),
  participantRole: z.string().max(300).default(''),
  date: z.string().max(50),
  objectives: z.string().max(3000).default(''),
  notesOrTranscript: z.string().max(50000).default(''),
  recurringPainPoints: z.array(z.string().max(1000)).max(50).default([]),
  severityRating: z.enum(['mild', 'moderate', 'severe', 'dealbreaker']),
  existingWorkarounds: z.string().max(5000).default(''),
  willingnessToPayNotes: z.string().max(5000).default(''),
  verbatimQuotes: z.array(z.string().max(2000)).max(50).default([]),
  surprisesOrObjections: z.string().max(5000).default(''),
  isSynthetic: z.boolean().optional(),
  createdAt: z.number(),
});

export const FeatureItemSchema = z.object({
  id: SafeIdSchema,
  projectId: SafeIdSchema,
  title: z.string().min(1).max(300),
  description: z.string().max(3000).default(''),
  priority: z.enum(['must', 'should', 'could', 'wont']),
  solvesProblem: z.string().max(3000).default(''),
  technicalComplexity: z.enum(['low', 'medium', 'high']),
  estimatedDays: z.number().min(0).max(365).optional(),
  status: z.enum(['idea', 'planned', 'in_progress', 'built']),
  isSynthetic: z.boolean().optional(),
  createdAt: z.number(),
});

export const RoadmapItemSchema = z.object({
  id: SafeIdSchema,
  projectId: SafeIdSchema,
  title: z.string().min(1).max(300),
  objective: z.string().max(3000).default(''),
  status: z.enum(['not_started', 'in_progress', 'blocked', 'completed']),
  priority: z.enum(['urgent', 'high', 'medium', 'low']),
  owner: z.string().max(200).default(''),
  evidenceRequired: z.string().max(2000).default(''),
  estimatedEffort: z.string().max(200).default(''),
  orderIndex: z.number().int().default(0),
  dependencies: z.array(SafeIdSchema).max(50).optional(),
  isSynthetic: z.boolean().optional(),
  createdAt: z.number(),
  updatedAt: z.number(),
});

export const CanvasNodeSchema = z.object({
  id: SafeIdSchema,
  projectId: SafeIdSchema,
  type: z.enum([
    'problem',
    'customer',
    'solution',
    'hypothesis',
    'experiment',
    'evidence',
    'competitor',
    'feature',
    'decision',
    'note',
  ]),
  title: z.string().max(300).default(''),
  description: z.string().max(3000).default(''),
  x: z.number(),
  y: z.number(),
  width: z.number().optional(),
  height: z.number().optional(),
  color: z.string().max(50).optional(),
  entityType: z.enum(['problem', 'customer', 'solution', 'evidence', 'experiment', 'competitor', 'feature', 'decision']).optional(),
  entityId: SafeIdSchema.optional(),
});

export const CanvasEdgeSchema = z.object({
  id: SafeIdSchema,
  projectId: SafeIdSchema,
  fromNodeId: SafeIdSchema,
  toNodeId: SafeIdSchema,
  label: z.string().max(200).optional(),
});

export const ProjectDecisionSchema = z.object({
  id: SafeIdSchema,
  projectId: SafeIdSchema,
  title: z.string().min(1).max(300),
  context: z.string().max(3000).optional(),
  rationale: z.string().max(5000).default(''),
  rejectedAlternatives: z.string().max(5000).default(''),
  evidenceConsideredIds: z.array(SafeIdSchema).max(50).optional(),
  options: z.array(z.string().max(1000)).max(20).optional(),
  chosenOption: z.string().max(1000).optional(),
  confidence: z.enum(['low', 'medium', 'high']).optional(),
  revisitDate: z.string().max(50).optional(),
  status: z.enum(['active', 'revisited', 'superseded']).optional(),
  date: z.string().max(50),
  phaseKey: z.string().max(100).default('define'),
  isSynthetic: z.boolean().optional(),
  createdAt: z.number(),
  updatedAt: z.number().optional(),
});

export const RiskItemSchema = z.object({
  id: SafeIdSchema,
  projectId: SafeIdSchema,
  title: z.string().min(1).max(300),
  category: z.enum([
    'desirability',
    'market',
    'customer',
    'pricing',
    'distribution',
    'technical',
    'operational',
    'legal',
    'financial',
  ]),
  probability: z.enum(['low', 'medium', 'high']),
  impact: z.enum(['low', 'medium', 'high']),
  evidenceNotes: z.string().max(3000).optional(),
  mitigation: z.string().max(3000).default(''),
  status: z.enum(['open', 'testing', 'mitigated', 'accepted']),
  nextTest: z.string().max(2000).optional(),
  isSynthetic: z.boolean().optional(),
  createdAt: z.number(),
  updatedAt: z.number(),
});

export const BusinessModelSchema = z.object({
  id: SafeIdSchema,
  projectId: SafeIdSchema,
  monthlyPrice: z.number().min(0).max(10000000).optional(),
  grossMarginPct: z.number().min(0).max(100).optional(),
  monthlyChurnPct: z.number().min(0).max(100).optional(),
  cac: z.number().min(0).max(10000000).optional(),
  fixedMonthlyCost: z.number().min(0).max(100000000).optional(),
  problem: z.string().max(5000).optional(),
  customerSegments: z.string().max(5000).optional(),
  uniqueValue: z.string().max(5000).optional(),
  solution: z.string().max(5000).optional(),
  channels: z.string().max(5000).optional(),
  revenueStreams: z.string().max(5000).optional(),
  costStructure: z.string().max(5000).optional(),
  keyMetrics: z.string().max(5000).optional(),
  unfairAdvantage: z.string().max(5000).optional(),
  updatedAt: z.number(),
});

export const GTMPlanSchema = z.object({
  id: SafeIdSchema,
  projectId: SafeIdSchema,
  targetUser: z.string().max(1000).optional(),
  need: z.string().max(1000).optional(),
  productName: z.string().max(300).optional(),
  category: z.string().max(300).optional(),
  benefit: z.string().max(2000).optional(),
  competitor: z.string().max(1000).optional(),
  differentiator: z.string().max(2000).optional(),
  channels: z.array(
    z.object({
      name: z.string().max(300),
      type: z.string().max(100),
      status: z.enum(['assumed', 'testing', 'validated', 'abandoned']),
      notes: z.string().max(2000),
    })
  ).max(50).optional(),
  checklist: z.array(
    z.object({
      id: SafeIdSchema,
      title: z.string().max(300),
      desc: z.string().max(1000),
      done: z.boolean(),
    })
  ).max(100).optional(),
  updatedAt: z.number(),
});

export const LandingPageSpecSchema = z.object({
  id: SafeIdSchema,
  projectId: SafeIdSchema,
  headline: z.string().max(1000),
  subheadline: z.string().max(2000),
  ctaText: z.string().max(200),
  problemHeadline: z.string().max(1000),
  problemBody: z.string().max(5000),
  step1: z.string().max(2000),
  step2: z.string().max(2000),
  step3: z.string().max(2000),
  faq1Q: z.string().max(1000),
  faq1A: z.string().max(3000),
  faq2Q: z.string().max(1000),
  faq2A: z.string().max(3000),
  updatedAt: z.number(),
});

export const AIChatMessageSchema = z.object({
  id: SafeIdSchema,
  projectId: SafeIdSchema.optional(),
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string().max(50000),
  timestamp: z.number(),
  distinctions: z.object({
    whatWeKnow: z.array(z.string().max(2000)).optional(),
    whatWeDontKnow: z.array(z.string().max(2000)).optional(),
    biggestRisk: z.string().max(2000).optional(),
    recommendedNextAction: z.string().max(2000).optional(),
  }).optional(),
});

// Full Export Package Zod Schema
export const ExportPackageSchema = z.object({
  schemaVersion: z.number().int().min(1).max(3),
  exportedAt: z.string(),
  appVersion: z.string().max(50),
  project: ProjectSchema,
  evidence: z.array(EvidenceItemSchema).max(2000).default([]),
  research: z.array(ResearchSourceSchema).max(2000).default([]),
  communityInsights: z.array(CommunityInsightSchema).max(1000).default([]),
  competitors: z.array(CompetitorSchema).max(500).default([]),
  experiments: z.array(ExperimentSchema).max(1000).default([]),
  interviews: z.array(CustomerInterviewSchema).max(1000).default([]),
  features: z.array(FeatureItemSchema).max(1000).default([]),
  roadmap: z.array(RoadmapItemSchema).max(500).default([]),
  canvasNodes: z.array(CanvasNodeSchema).max(1000).default([]),
  canvasEdges: z.array(CanvasEdgeSchema).max(2000).default([]),
  businessModel: BusinessModelSchema.optional(),
  gtmPlan: GTMPlanSchema.optional(),
  landingPage: LandingPageSpecSchema.optional(),
  decisions: z.array(ProjectDecisionSchema).max(1000).default([]),
  risks: z.array(RiskItemSchema).max(1000).optional().default([]),
  chatMessages: z.array(AIChatMessageSchema).max(5000).optional().default([]),
});

export type ValidatedExportPackage = z.infer<typeof ExportPackageSchema>;

export interface ValidationResult {
  valid: boolean;
  data?: ExportPackage;
  errors?: string[];
}

export function validateExportPackage(rawInput: unknown): ValidationResult {
  if (!rawInput || typeof rawInput !== 'object') {
    return { valid: false, errors: ['Input is empty or not a valid JSON object.'] };
  }

  // Pre-check for security: prevent arbitrary prototype pollution or functions
  const jsonString = JSON.stringify(rawInput);
  if (jsonString.includes('<script') || jsonString.includes('javascript:')) {
    return {
      valid: false,
      errors: ['Input contains disallowed script tags or potential XSS vectors.'],
    };
  }

  const result = ExportPackageSchema.safeParse(rawInput);
  if (!result.success) {
    const errorMessages = (result.error.issues || []).map((e) => {
      const path = e.path.join('.');
      return `${path ? `Field "${path}": ` : ''}${e.message}`;
    });
    return { valid: false, errors: errorMessages.slice(0, 15) };
  }

  return { valid: true, data: result.data as unknown as ExportPackage };
}
