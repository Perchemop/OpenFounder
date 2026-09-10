export type ProjectStage = 'idea' | 'problem_identified' | 'researching' | 'validating' | 'mvp_building' | 'launched' | 'growth';

export type FounderStartingPoint = 'idea_only' | 'problem_identified' | 'research_completed' | 'mvp_started' | 'existing_business';

export interface Project {
  id: string;
  name: string;
  oneSentenceIdea: string;
  category: string;
  stage: ProjectStage;
  targetMarket: string;
  location: string;
  website?: string;
  existingResearch?: string;

  // Problem definition
  problemStatement: string;
  targetUserGroup: string;
  problemFrequency: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'rarely' | 'unknown';
  problemSeverity: 'mild' | 'moderate' | 'severe' | 'critical' | 'unknown';
  currentAlternatives: string;

  // Desired outcome
  successDefinition: string;
  behavioralChange: string;
  willingnessToPayTrigger: string;

  // Founder context
  founderSkills?: string;
  availableResources?: string;
  budget?: string;
  timeline?: string;
  existingAudience?: string;
  constraints?: string;
  startingPoint: FounderStartingPoint;

  currentPhaseIndex: number;
  createdAt: number;
  updatedAt: number;
}

export type EvidenceStatus =
  | 'unverified'
  | 'assumption'
  | 'anecdotal'
  | 'research_backed'
  | 'customer_confirmed'
  | 'experiment_confirmed';

export type ClaimType = 'problem' | 'customer' | 'market' | 'pricing' | 'feasibility' | 'distribution' | 'retention';

export interface EvidenceItem {
  id: string;
  projectId: string;
  claim: string;
  type: ClaimType;
  status: EvidenceStatus;
  evidenceNotes: string;
  sourceUrl?: string;
  sourceTitle?: string;
  confidence: 'low' | 'medium' | 'high';
  nextTest: string;
  createdAt: number;
  updatedAt: number;
}

export type ResearchCategory =
  | 'market'
  | 'competitors'
  | 'customers'
  | 'trends'
  | 'pricing'
  | 'technology'
  | 'regulations'
  | 'distribution'
  | 'substitutes';

export interface ResearchSource {
  id: string;
  projectId: string;
  title: string;
  url?: string;
  category: ResearchCategory;
  dateAccessed: string;
  summary: string;
  keyFindings: string[];
  relevance: 'high' | 'medium' | 'low';
  confidence: 'high' | 'medium' | 'low';
  notes?: string;
  createdAt: number;
}

export interface CommunityInsight {
  id: string;
  projectId: string;
  sourceCommunity: string; // e.g. "r/smallbusiness", "Hacker News"
  query: string;
  directQuotes: string[];
  aiInterpretation: string;
  problemMentioned: string;
  willingnessToPaySignal: 'strong' | 'moderate' | 'weak' | 'none' | 'negative';
  url?: string;
  createdAt: number;
}

export interface Competitor {
  id: string;
  projectId: string;
  name: string;
  url?: string;
  productDescription: string;
  pricingModel: string;
  targetAudience: string;
  positioning: string;
  strengths: string[];
  weaknesses: string[];
  customerComplaints: string[];
  keyDifferentiators: string;
  evidenceNotes: string;
  createdAt: number;
  updatedAt: number;
}

export type ExperimentStatus = 'planned' | 'running' | 'completed' | 'inconclusive' | 'passed' | 'failed';

export type ValidationDimension = 'problem' | 'customer' | 'solution' | 'market' | 'commercial';

export type ExperimentMethod =
  | 'customer_interview'
  | 'smoke_landing_page'
  | 'waitlist'
  | 'survey'
  | 'clickable_prototype'
  | 'pricing_test'
  | 'pre_order'
  | 'cold_outreach'
  | 'concierge_mvp'
  | 'competitor_teardown'
  | 'interview'
  | 'landing_page'
  | 'concierge'
  | 'prototype'
  | 'pre_sale';

export interface Experiment {
  id: string;
  projectId: string;
  hypothesis: string;
  targetAudience?: string;
  dimension?: ValidationDimension;
  method: ExperimentMethod;
  requiredSampleSize?: number;
  targetSampleSize?: number;
  currentSampleSize: number;
  successCriteria: string;
  failureCriteria: string;
  timeframeWeeks?: number;
  status: ExperimentStatus;
  resultSummary?: string;
  results?: string;
  evidenceId?: string;
  decisionTaken?: string;
  startDate?: string;
  endDate?: string;
  createdAt: number;
  updatedAt: number;
}

export interface CustomerInterview {
  id: string;
  projectId: string;
  intervieweeIdentifier: string; // e.g. "Independent Plumber #1" (no PII required)
  participantRole: string;
  date: string;
  objectives: string;
  notesOrTranscript: string;
  recurringPainPoints: string[];
  severityRating: 'mild' | 'moderate' | 'severe' | 'dealbreaker';
  existingWorkarounds: string;
  willingnessToPayNotes: string;
  verbatimQuotes: string[];
  surprisesOrObjections: string;
  createdAt: number;
}

export type MoscowPriority = 'must' | 'should' | 'could' | 'wont';

export interface FeatureItem {
  id: string;
  projectId: string;
  title: string;
  description: string;
  priority: MoscowPriority;
  solvesProblem: string;
  technicalComplexity: 'low' | 'medium' | 'high';
  estimatedDays?: number;
  status: 'idea' | 'planned' | 'in_progress' | 'built';
  createdAt: number;
}

export type RoadmapStatus = 'not_started' | 'in_progress' | 'blocked' | 'completed';

export interface RoadmapItem {
  id: string;
  projectId: string;
  title: string;
  objective: string;
  status: RoadmapStatus;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  owner: string;
  evidenceRequired: string;
  estimatedEffort: string; // e.g. "1 week"
  orderIndex: number;
  dependencies?: string[];
  createdAt: number;
  updatedAt: number;
}

export interface CanvasNode {
  id: string;
  projectId: string;
  type: 'problem' | 'customer' | 'solution' | 'hypothesis' | 'experiment' | 'evidence' | 'competitor' | 'feature' | 'decision' | 'note';
  title: string;
  description: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  color?: string;
}

export interface CanvasEdge {
  id: string;
  projectId: string;
  fromNodeId: string;
  toNodeId: string;
  label?: string;
}

export interface PhaseTask {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  userEvidenceNotes?: string;
}

export interface PhaseDefinition {
  index: number;
  key: string;
  name: string;
  tagline: string;
  objective: string;
  requiredInputs: string[];
  aiGuidancePrompt: string;
  tasks: PhaseTask[];
  completionCriteria: string;
}

export interface BusinessModelData {
  id: string;
  projectId: string;
  customerSegments: string;
  valueProposition: string;
  channels: string;
  customerRelationships: string;
  revenueStreams: string;
  keyResources: string;
  keyActivities: string;
  keyPartners: string;
  costStructure: string;
  pricingHypothesis: string;
  estimatedCAC?: string;
  estimatedLTV?: string;
  breakEvenMonthlyUsers?: string;
  updatedAt: number;
}

export interface GTMPlan {
  id: string;
  projectId: string;
  targetSegment: string;
  positioningStatement: string;
  coreMessaging: string;
  assumedChannels: string[];
  validatedChannels: string[];
  launchStrategy: string;
  contentPlan: string;
  outreachStrategy: string;
  launchChecklist: { task: string; done: boolean }[];
  keySuccessMetrics: string;
  updatedAt: number;
}

export interface LandingPageSpec {
  id: string;
  projectId: string;
  headline: string;
  subheadline: string;
  problemStatement: string;
  solutionSummary: string;
  keyBenefits: { title: string; desc: string }[];
  socialProofOrSignals: string;
  features: { title: string; desc: string }[];
  faqs: { question: string; answer: string }[];
  callToAction: string;
  secondaryCTA?: string;
  updatedAt: number;
}

export interface ProjectDecision {
  id: string;
  projectId: string;
  title: string;
  rationale: string;
  rejectedAlternatives: string;
  date: string;
  phaseKey: string;
  createdAt: number;
}

export interface AIChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  distinctions?: {
    whatWeKnow?: string[];
    whatWeDontKnow?: string[];
    biggestRisk?: string;
    recommendedNextAction?: string;
  };
}

export interface AIProviderConfig {
  activeProvider: 'server_gemini' | 'direct_gemini' | 'openai' | 'anthropic' | 'ollama' | 'offline_rules';
  directGeminiKey?: string;
  openaiKey?: string;
  openaiEndpoint?: string;
  openaiModel?: string;
  anthropicKey?: string;
  anthropicModel?: string;
  ollamaEndpoint?: string;
  ollamaModel?: string;
  temperature: number;
  maxTokens: number;
  telemetryEnabled: boolean; // Must be false by default
  storeKeysLocally: boolean;
}

export interface ExportPackage {
  schemaVersion: number;
  exportedAt: string;
  appVersion: string;
  project: Project;
  evidence: EvidenceItem[];
  research: ResearchSource[];
  communityInsights: CommunityInsight[];
  competitors: Competitor[];
  experiments: Experiment[];
  interviews: CustomerInterview[];
  features: FeatureItem[];
  roadmap: RoadmapItem[];
  canvasNodes: CanvasNode[];
  canvasEdges: CanvasEdge[];
  businessModel?: BusinessModelData;
  gtmPlan?: GTMPlan;
  landingPage?: LandingPageSpec;
  decisions: ProjectDecision[];
}
