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
  completedTaskIds?: string[];
  phaseHistory?: {
    phaseIndex: number;
    manualOverride?: boolean;
    overrideReason?: string;
    completedAt: number;
  }[];
  isSynthetic?: boolean;
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
  isSynthetic?: boolean;
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
  publisherOrDomain?: string;
  sourceType?: 'academic' | 'industry_report' | 'user_forum' | 'sec_filing' | 'news' | 'pricing_page' | 'interview_transcript' | 'other';
  category: ResearchCategory;
  dateAccessed: string;
  summary: string;
  keyFindings: string[];
  relevance: 'high' | 'medium' | 'low';
  confidence: 'high' | 'medium' | 'low';
  claimLinkedIds?: string[];
  notes?: string;
  isSynthetic?: boolean;
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
  isSynthetic?: boolean;
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
  | 'competitor_teardown';

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
  isSynthetic?: boolean;
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
  isSynthetic?: boolean;
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
  isSynthetic?: boolean;
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
  isSynthetic?: boolean;
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
  entityType?: 'problem' | 'customer' | 'solution' | 'evidence' | 'experiment' | 'competitor' | 'feature' | 'decision';
  entityId?: string;
}

export interface ProjectWorkspace {
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
  risks: RiskItem[];
  objectives: Objective[];
  advisors: Advisor[];
  teamMembers: TeamMember[];
  skillRequirements: SkillRequirement[];
  hiringRoles: HiringRole[];
  candidates: Candidate[];
}

export interface CanvasEdge {
  id: string;
  projectId: string;
  fromNodeId: string;
  toNodeId: string;
  label?: string;
}

export interface PhaseTaskDefinition {
  id: string;
  title: string;
  description: string;
  required?: boolean;
}

export interface PhaseTask {
  id: string;
  title: string;
  description: string;
  completed?: boolean;
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
  tasks: PhaseTaskDefinition[];
  completionCriteria: string;
  requiredTaskIds?: string[];
}

export interface BusinessModelData {
  id: string;
  projectId: string;
  // Unit Economics
  monthlyPrice?: number;
  grossMarginPct?: number;
  monthlyChurnPct?: number;
  cac?: number;
  fixedMonthlyCost?: number;
  // Lean Canvas
  problem?: string;
  customerSegments?: string;
  uniqueValue?: string;
  solution?: string;
  channels?: string;
  revenueStreams?: string;
  costStructure?: string;
  keyMetrics?: string;
  unfairAdvantage?: string;
  updatedAt: number;
}

export interface GTMPlan {
  id: string;
  projectId: string;
  targetUser?: string;
  need?: string;
  productName?: string;
  category?: string;
  benefit?: string;
  competitor?: string;
  differentiator?: string;
  channels?: {
    name: string;
    type: string;
    status: 'assumed' | 'testing' | 'validated' | 'abandoned';
    notes: string;
  }[];
  checklist?: { id: string; title: string; desc: string; done: boolean }[];
  updatedAt: number;
}

export interface LandingPageSpec {
  id: string;
  projectId: string;
  headline: string;
  subheadline: string;
  ctaText: string;
  problemHeadline: string;
  problemBody: string;
  step1: string;
  step2: string;
  step3: string;
  faq1Q: string;
  faq1A: string;
  faq2Q: string;
  faq2A: string;
  updatedAt: number;
}

export interface ProjectDecision {
  id: string;
  projectId: string;
  title: string;
  context?: string;
  rationale: string;
  rejectedAlternatives: string;
  evidenceConsideredIds?: string[];
  options?: string[];
  chosenOption?: string;
  confidence?: 'low' | 'medium' | 'high';
  revisitDate?: string;
  status?: 'active' | 'revisited' | 'superseded';
  date: string;
  phaseKey: string;
  isSynthetic?: boolean;
  createdAt: number;
  updatedAt?: number;
}

export type RiskCategory =
  | 'desirability'
  | 'market'
  | 'customer'
  | 'pricing'
  | 'distribution'
  | 'technical'
  | 'operational'
  | 'legal'
  | 'financial';

export interface RiskItem {
  id: string;
  projectId: string;
  title: string;
  category: RiskCategory;
  probability: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  evidenceNotes?: string;
  mitigation: string;
  status: 'open' | 'testing' | 'mitigated' | 'accepted';
  nextTest?: string;
  isSynthetic?: boolean;
  createdAt: number;
  updatedAt: number;
}

export type MetricUnit = 'number' | 'currency' | 'percent' | 'ratio';

/**
 * Direction the metric must move to reach the target. A churn-rate key result
 * uses `decrease`; a revenue key result uses `increase`.
 */
export type MetricDirection = 'increase' | 'decrease';

export interface KeyResult {
  id: string;
  title: string;
  unit: MetricUnit;
  direction: MetricDirection;
  /** Value at the start of the objective period. */
  baseline: number;
  /** Value that would mean the key result is met. */
  target: number;
  /** Latest measured value, typed in by the founder with a source. */
  current: number;
  /** Where the current value came from (dashboard, interview round, invoice sheet). */
  source?: string;
  updatedAt: number;
}

/**
 * A single objective with measurable key results. Progress is always derived
 * from the key results by `summarizeOkrs`; it is never stored, so the page
 * cannot drift from the numbers the founder entered.
 */
export interface Objective {
  id: string;
  projectId: string;
  title: string;
  description: string;
  owner: string;
  /** Free text such as "Q4 2026" or "first 90 days". */
  timeframe: string;
  status: 'active' | 'done' | 'archived';
  keyResults: KeyResult[];
  isSynthetic?: boolean;
  createdAt: number;
  updatedAt: number;
}

/** One action the founder promised an advisor they would take. */
export interface AdvisorCommitment {
  id: string;
  description: string;
  /** ISO date (yyyy-mm-dd). Optional: an open commitment may be undated. */
  dueDate?: string;
  status: 'open' | 'done';
}

/** A logged session with one advisor. */
export interface AdvisorSession {
  id: string;
  /** ISO date (yyyy-mm-dd). */
  date: string;
  durationMinutes?: number;
  topic: string;
  adviceGiven: string;
  /** Verbatim words, where the founder wrote them down. */
  quotes: string[];
  commitments: AdvisorCommitment[];
  /** Whether the session was free, paid, barter, or something else. */
  exchanged?: string;
  createdAt: number;
}

/**
 * A person the founder gets advice from. Sessions live on the advisor so the
 * log reads as a relationship, not a pile of meetings.
 */
export interface Advisor {
  id: string;
  projectId: string;
  name: string;
  role: string;
  organisation?: string;
  /** Email, handle, or "met at X". Contact details are for the founder's use. */
  contact?: string;
  expertise: string[];
  notes: string;
  isSynthetic?: boolean;
  createdAt: number;
  updatedAt: number;
  sessions: AdvisorSession[];
}

export type TeamCommitment = 'full_time' | 'part_time' | 'advisor' | 'contractor';

/** Someone on the team, including the founder(s). */
export interface TeamMember {
  id: string;
  projectId: string;
  name: string;
  role: string;
  commitment: TeamCommitment;
  /** Skills this person actually brings, free text tags. */
  skills: string[];
  /** Where their time goes, free text. */
  focus: string;
  /** Optional link to an advisor this person also advises through. */
  advisorId?: string;
  isSynthetic?: boolean;
  createdAt: number;
}

/**
 * A skill the venture needs and how well it is covered. Coverage is derived
 * from the team by `src/utils/skillCoverage.ts`, never typed in by hand.
 */
export interface SkillRequirement {
  id: string;
  projectId: string;
  /** Skill name, e.g. "customer discovery", "React", "B2B sales". */
  skill: string;
  /** Why the venture needs it, in one line. */
  why: string;
  /** 1 = nice to have, 3 = the venture fails without it. */
  importance: 1 | 2 | 3;
  targetLevel: 'aware' | 'working' | 'expert';
  isSynthetic?: boolean;
  createdAt: number;
}

export interface SkillLevels {
  /** Proficiency the founder/team claims per skill, 0–3. */
  [skill: string]: number;
}

/**
 * First-hire pipeline: the roles a small venture is trying to fill and the
 * people it is talking to. This is a decision log, not an applicant-tracking
 * system — no résumé parsing, no network calls, no third-party profiles.
 */
export type HiringRoleKind = 'full_time' | 'part_time' | 'contract' | 'advisor' | 'intern';

export type HiringStage =
  | 'identified'
  | 'contacted'
  | 'screening'
  | 'interviewing'
  | 'offer'
  | 'hired'
  | 'rejected'
  | 'withdrawn';

export interface HiringRole {
  id: string;
  projectId: string;
  title: string;
  kind: HiringRoleKind;
  /** Non-negotiable skills; the role is not a fit without them. */
  mustHaveSkills: string[];
  niceToHaveSkills: string[];
  /** What the venture can actually pay or trade, in words. */
  budgetNote: string;
  notes: string;
  isSynthetic?: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface Candidate {
  id: string;
  projectId: string;
  roleId: string;
  name: string;
  /** How this person reached you (referral, community, inbound) — free text. */
  source: string;
  stage: HiringStage;
  strengths: string[];
  concerns: string[];
  /**
   * What you actually observed: a trial task, a reference call, a work sample.
   * Left blank when the person is only known by reputation.
   */
  evidenceNotes: string;
  /** The single next thing to do with this person. */
  nextStep: string;
  isSynthetic?: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface AIChatMessage {
  id: string;
  projectId?: string;
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
  /** Primary Gemini model id (server + direct). */
  geminiModel?: string;
  /** Ordered fallback Gemini models when primary is unavailable. */
  geminiFallbackModels?: string[];
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
  risks?: RiskItem[];
  objectives?: Objective[];
  advisors?: Advisor[];
  teamMembers?: TeamMember[];
  skillRequirements?: SkillRequirement[];
  hiringRoles?: HiringRole[];
  candidates?: Candidate[];
  chatMessages?: AIChatMessage[];
}
