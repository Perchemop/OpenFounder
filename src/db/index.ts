import Dexie, { type Table } from 'dexie';
import type {
  Project,
  EvidenceItem,
  ResearchSource,
  CommunityInsight,
  Competitor,
  Experiment,
  CustomerInterview,
  FeatureItem,
  RoadmapItem,
  CanvasNode,
  CanvasEdge,
  BusinessModelData,
  GTMPlan,
  LandingPageSpec,
  ProjectDecision,
  RiskItem,
  AIChatMessage,
  ExportPackage,
  AIProviderConfig,
  ProjectWorkspace,
} from '../types';
import { validateExportPackage } from './validation';

// Cryptographically secure ID generator with fallback
export function generateId(prefix = 'id'): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}_${crypto.randomUUID().replace(/-/g, '').substring(0, 12)}`;
  }
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;
}

export class OpenFounderDB extends Dexie {
  projects!: Table<Project, string>;
  evidence!: Table<EvidenceItem, string>;
  research!: Table<ResearchSource, string>;
  communityInsights!: Table<CommunityInsight, string>;
  competitors!: Table<Competitor, string>;
  experiments!: Table<Experiment, string>;
  interviews!: Table<CustomerInterview, string>;
  features!: Table<FeatureItem, string>;
  roadmap!: Table<RoadmapItem, string>;
  canvasNodes!: Table<CanvasNode, string>;
  canvasEdges!: Table<CanvasEdge, string>;
  businessModel!: Table<BusinessModelData, string>;
  gtmPlan!: Table<GTMPlan, string>;
  landingPage!: Table<LandingPageSpec, string>;
  decisions!: Table<ProjectDecision, string>;
  risks!: Table<RiskItem, string>;
  chatMessages!: Table<AIChatMessage, string>;

  constructor() {
    super('OpenFounderDB');
    this.version(1).stores({
      projects: 'id, name, stage, createdAt, updatedAt',
      evidence: 'id, projectId, status, type, confidence',
      research: 'id, projectId, category, relevance',
      communityInsights: 'id, projectId',
      competitors: 'id, projectId, name',
      experiments: 'id, projectId, status, method',
      interviews: 'id, projectId, date',
      features: 'id, projectId, priority, status',
      roadmap: 'id, projectId, status, priority, orderIndex',
      canvasNodes: 'id, projectId, type',
      canvasEdges: 'id, projectId, fromNodeId, toNodeId',
      businessModel: 'id, projectId',
      gtmPlan: 'id, projectId',
      landingPage: 'id, projectId',
      decisions: 'id, projectId, phaseKey, createdAt',
      chatMessages: 'id, timestamp',
    });
    this.version(2).stores({
      chatMessages: 'id, projectId, timestamp',
    });
    this.version(3).stores({
      risks: 'id, projectId, category, status, impact, probability',
      decisions: 'id, projectId, phaseKey, status, createdAt',
    });
  }
}

export const db = new OpenFounderDB();

// Local settings storage (localStorage)
const SETTINGS_STORAGE_KEY = 'openfounder_settings_v1';
const ACTIVE_PROJECT_KEY = 'openfounder_active_project_id';
const SESSION_KEYS_STORAGE_KEY = 'openfounder_session_keys';

// In-memory session keys cache (never written to disk if storeKeysLocally is false)
let memoryApiKeys: {
  directGeminiKey?: string;
  openaiKey?: string;
  anthropicKey?: string;
} = {};

export function getSessionKey(provider: 'direct_gemini' | 'openai' | 'anthropic'): string | undefined {
  if (memoryApiKeys[provider === 'direct_gemini' ? 'directGeminiKey' : provider === 'openai' ? 'openaiKey' : 'anthropicKey']) {
    return memoryApiKeys[provider === 'direct_gemini' ? 'directGeminiKey' : provider === 'openai' ? 'openaiKey' : 'anthropicKey'];
  }
  // Check sessionStorage for tab-lived storage
  try {
    const raw = sessionStorage.getItem(SESSION_KEYS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return parsed[provider];
    }
  } catch {
    // Ignore sessionStorage errors
  }
  return undefined;
}

export function setSessionKey(provider: 'direct_gemini' | 'openai' | 'anthropic', key: string | undefined): void {
  const mapKey = provider === 'direct_gemini' ? 'directGeminiKey' : provider === 'openai' ? 'openaiKey' : 'anthropicKey';
  if (key) {
    memoryApiKeys[mapKey] = key;
    try {
      const raw = sessionStorage.getItem(SESSION_KEYS_STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      parsed[provider] = key;
      sessionStorage.setItem(SESSION_KEYS_STORAGE_KEY, JSON.stringify(parsed));
    } catch {
      // Ignore sessionStorage errors
    }
  } else {
    delete memoryApiKeys[mapKey];
    try {
      const raw = sessionStorage.getItem(SESSION_KEYS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        delete parsed[provider];
        sessionStorage.setItem(SESSION_KEYS_STORAGE_KEY, JSON.stringify(parsed));
      }
    } catch {
      // Ignore
    }
  }
}

export const DEFAULT_AI_CONFIG: AIProviderConfig = {
  activeProvider: 'offline_rules',
  openaiEndpoint: 'https://api.openai.com/v1',
  openaiModel: 'gpt-4o',
  anthropicModel: 'claude-3-5-sonnet-20241022',
  ollamaEndpoint: 'http://localhost:11434',
  ollamaModel: 'llama3.2',
  temperature: 0.7,
  maxTokens: 2048,
  telemetryEnabled: false,
  storeKeysLocally: false,
};

export function loadSettings(): AIProviderConfig {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_AI_CONFIG };
    const parsed = JSON.parse(raw);
    const config = { ...DEFAULT_AI_CONFIG, ...parsed, telemetryEnabled: false };

    // If storeKeysLocally is false, never load keys from localStorage
    if (!config.storeKeysLocally) {
      config.directGeminiKey = getSessionKey('direct_gemini') || '';
      config.openaiKey = getSessionKey('openai') || '';
      config.anthropicKey = getSessionKey('anthropic') || '';
    }
    return config;
  } catch {
    return { ...DEFAULT_AI_CONFIG };
  }
}

export function saveSettings(config: AIProviderConfig): void {
  try {
    // Clone config to sanitize
    const toPersist = { ...config, telemetryEnabled: false };

    if (!config.storeKeysLocally) {
      // Keep keys only in session memory
      setSessionKey('direct_gemini', config.directGeminiKey);
      setSessionKey('openai', config.openaiKey);
      setSessionKey('anthropic', config.anthropicKey);

      // Strip keys before persisting to localStorage
      delete toPersist.directGeminiKey;
      delete toPersist.openaiKey;
      delete toPersist.anthropicKey;
    }

    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(toPersist));
  } catch (err) {
    console.warn('Failed to save settings to localStorage:', err);
  }
}

export const getStoredSettings = loadSettings;
export const saveStoredSettings = saveSettings;

// Active project helper
export function getActiveProjectId(): string | null {
  try {
    return localStorage.getItem(ACTIVE_PROJECT_KEY);
  } catch {
    return null;
  }
}

export function setActiveProjectId(id: string): void {
  try {
    localStorage.setItem(ACTIVE_PROJECT_KEY, id);
  } catch (err) {
    console.warn('Failed to set active project ID:', err);
  }
}

// Check for collision before importing
export async function checkImportCollision(pkg: ExportPackage): Promise<{
  hasIdCollision: boolean;
  hasNameCollision: boolean;
  existingProject?: Project;
}> {
  if (!pkg?.project?.id) {
    return { hasIdCollision: false, hasNameCollision: false };
  }

  const existingById = await db.projects.get(pkg.project.id);
  const existingByName = await db.projects.where('name').equals(pkg.project.name).first();

  return {
    hasIdCollision: Boolean(existingById),
    hasNameCollision: Boolean(existingByName && existingByName.id !== pkg.project.id),
    existingProject: existingById || existingByName,
  };
}

// Export complete project as self-contained JSON
export async function exportProjectPackage(projectId: string): Promise<ExportPackage> {
  const project = await db.projects.get(projectId);
  if (!project) throw new Error(`Project with ID ${projectId} not found.`);

  const [
    evidence,
    research,
    communityInsights,
    competitors,
    experiments,
    interviews,
    features,
    roadmap,
    canvasNodes,
    canvasEdges,
    businessModel,
    gtmPlan,
    landingPage,
    decisions,
    risks,
    chatMessages,
  ] = await Promise.all([
    db.evidence.where('projectId').equals(projectId).toArray(),
    db.research.where('projectId').equals(projectId).toArray(),
    db.communityInsights.where('projectId').equals(projectId).toArray(),
    db.competitors.where('projectId').equals(projectId).toArray(),
    db.experiments.where('projectId').equals(projectId).toArray(),
    db.interviews.where('projectId').equals(projectId).toArray(),
    db.features.where('projectId').equals(projectId).toArray(),
    db.roadmap.where('projectId').equals(projectId).toArray(),
    db.canvasNodes.where('projectId').equals(projectId).toArray(),
    db.canvasEdges.where('projectId').equals(projectId).toArray(),
    db.businessModel.where('projectId').equals(projectId).first(),
    db.gtmPlan.where('projectId').equals(projectId).first(),
    db.landingPage.where('projectId').equals(projectId).first(),
    db.decisions.where('projectId').equals(projectId).toArray(),
    db.risks.where('projectId').equals(projectId).toArray(),
    db.chatMessages.where('projectId').equals(projectId).toArray(),
  ]);

  return {
    schemaVersion: 3,
    exportedAt: new Date().toISOString(),
    appVersion: '1.0.0',
    project,
    evidence,
    research,
    communityInsights,
    competitors,
    experiments,
    interviews,
    features,
    roadmap,
    canvasNodes,
    canvasEdges,
    businessModel,
    gtmPlan,
    landingPage,
    decisions,
    risks,
    chatMessages,
  };
}

// Import project package with rigorous validation and complete relationship remapping
export async function importProjectPackage(
  rawInput: unknown,
  options: { importAsNew?: boolean; customNewName?: string } = {}
): Promise<string> {
  // 1. Zod runtime validation
  const validation = validateExportPackage(rawInput);
  if (!validation.valid || !validation.data) {
    const errorDetails = validation.errors?.join('\n• ') || 'Schema validation failed.';
    throw new Error(`Import validation failed:\n• ${errorDetails}`);
  }

  const pkg = validation.data;

  // 2. Determine target project ID and whether to remap sub-entity IDs
  const existing = await db.projects.get(pkg.project.id);
  const shouldRemap = Boolean(options.importAsNew || (existing && options.importAsNew));

  let targetProjectId = pkg.project.id;
  let targetProject: Project = { ...pkg.project };

  // ID Maps for relationship preservation
  const nodeIdMap = new Map<string, string>();
  const evidenceIdMap = new Map<string, string>();
  const experimentIdMap = new Map<string, string>();
  const interviewIdMap = new Map<string, string>();
  const featureIdMap = new Map<string, string>();
  const decisionIdMap = new Map<string, string>();
  const riskIdMap = new Map<string, string>();
  const roadmapIdMap = new Map<string, string>();

  if (shouldRemap) {
    targetProjectId = generateId('proj');
    targetProject = {
      ...pkg.project,
      id: targetProjectId,
      name: options.customNewName || `${pkg.project.name} (Copy)`,
      updatedAt: Date.now(),
    };

    // Pre-populate ID maps for all sub-entities using secure generateId
    pkg.canvasNodes.forEach((node) => {
      nodeIdMap.set(node.id, generateId('node'));
    });
    pkg.evidence.forEach((ev) => {
      evidenceIdMap.set(ev.id, generateId('ev'));
    });
    pkg.experiments.forEach((exp) => {
      experimentIdMap.set(exp.id, generateId('exp'));
    });
    pkg.interviews.forEach((inv) => {
      interviewIdMap.set(inv.id, generateId('inv'));
    });
    pkg.features.forEach((feat) => {
      featureIdMap.set(feat.id, generateId('feat'));
    });
    pkg.decisions.forEach((dec) => {
      decisionIdMap.set(dec.id, generateId('dec'));
    });
    pkg.risks?.forEach((r) => {
      riskIdMap.set(r.id, generateId('risk'));
    });
    pkg.roadmap?.forEach((rm) => {
      roadmapIdMap.set(rm.id, generateId('rm'));
    });
  }

  // 3. Process records with relationship integrity remapping
  const remappedNodes: CanvasNode[] = pkg.canvasNodes.map((node) => ({
    ...node,
    id: nodeIdMap.get(node.id) || node.id,
    projectId: targetProjectId,
  }));

  const remappedEdges: CanvasEdge[] = pkg.canvasEdges.map((edge) => ({
    ...edge,
    id: shouldRemap ? generateId('edge') : edge.id,
    projectId: targetProjectId,
    fromNodeId: nodeIdMap.get(edge.fromNodeId) || edge.fromNodeId,
    toNodeId: nodeIdMap.get(edge.toNodeId) || edge.toNodeId,
  }));

  const remappedEvidence: EvidenceItem[] = pkg.evidence.map((ev) => ({
    ...ev,
    id: evidenceIdMap.get(ev.id) || ev.id,
    projectId: targetProjectId,
  }));

  const remappedExperiments: Experiment[] = pkg.experiments.map((exp) => ({
    ...exp,
    id: experimentIdMap.get(exp.id) || exp.id,
    projectId: targetProjectId,
    evidenceId: exp.evidenceId ? evidenceIdMap.get(exp.evidenceId) || exp.evidenceId : undefined,
  }));

  const remappedResearch: ResearchSource[] = pkg.research.map((res) => ({
    ...res,
    id: shouldRemap ? generateId('res') : res.id,
    projectId: targetProjectId,
    claimLinkedIds: res.claimLinkedIds?.map((cid) => evidenceIdMap.get(cid) || cid),
  }));

  const remappedDecisions: ProjectDecision[] = pkg.decisions.map((dec) => ({
    ...dec,
    id: decisionIdMap.get(dec.id) || dec.id,
    projectId: targetProjectId,
    evidenceConsideredIds: dec.evidenceConsideredIds?.map((eid) => evidenceIdMap.get(eid) || eid),
  }));

  const remappedRisks: RiskItem[] = (pkg.risks || []).map((risk) => ({
    ...risk,
    id: riskIdMap.get(risk.id) || risk.id,
    projectId: targetProjectId,
  }));

  const remappedInterviews: CustomerInterview[] = pkg.interviews.map((inv) => ({
    ...inv,
    id: interviewIdMap.get(inv.id) || inv.id,
    projectId: targetProjectId,
  }));

  const remappedFeatures: FeatureItem[] = pkg.features.map((feat) => ({
    ...feat,
    id: featureIdMap.get(feat.id) || feat.id,
    projectId: targetProjectId,
  }));

  const remappedRoadmap: RoadmapItem[] = pkg.roadmap.map((rm) => ({
    ...rm,
    id: roadmapIdMap.get(rm.id) || rm.id,
    projectId: targetProjectId,
    dependencies: rm.dependencies?.map((depId) => roadmapIdMap.get(depId) || depId),
  }));

  const remappedCompetitors: Competitor[] = pkg.competitors.map((comp) => ({
    ...comp,
    id: shouldRemap ? generateId('comp') : comp.id,
    projectId: targetProjectId,
  }));

  const remappedInsights: CommunityInsight[] = pkg.communityInsights.map((ins) => ({
    ...ins,
    id: shouldRemap ? generateId('ins') : ins.id,
    projectId: targetProjectId,
  }));

  // Validate relational integrity post-remap before persisting
  const integrityCheck = validateWorkspaceReferences({
    nodes: remappedNodes,
    edges: remappedEdges,
    evidence: remappedEvidence,
    experiments: remappedExperiments,
    research: remappedResearch,
    decisions: remappedDecisions,
    roadmap: remappedRoadmap,
  });

  if (!integrityCheck.valid) {
    console.warn('Workspace referential warnings detected upon import:', integrityCheck.warnings);
  }

  // 4. Perform atomic transactional replacement or insertion
  await db.transaction(
    'rw',
    [
      db.projects,
      db.evidence,
      db.research,
      db.communityInsights,
      db.competitors,
      db.experiments,
      db.interviews,
      db.features,
      db.roadmap,
      db.canvasNodes,
      db.canvasEdges,
      db.businessModel,
      db.gtmPlan,
      db.landingPage,
      db.decisions,
      db.risks,
      db.chatMessages,
    ],
    async () => {
      // Clear out targetProjectId if replacing
      await Promise.all([
        db.projects.delete(targetProjectId),
        db.evidence.where('projectId').equals(targetProjectId).delete(),
        db.research.where('projectId').equals(targetProjectId).delete(),
        db.communityInsights.where('projectId').equals(targetProjectId).delete(),
        db.competitors.where('projectId').equals(targetProjectId).delete(),
        db.experiments.where('projectId').equals(targetProjectId).delete(),
        db.interviews.where('projectId').equals(targetProjectId).delete(),
        db.features.where('projectId').equals(targetProjectId).delete(),
        db.roadmap.where('projectId').equals(targetProjectId).delete(),
        db.canvasNodes.where('projectId').equals(targetProjectId).delete(),
        db.canvasEdges.where('projectId').equals(targetProjectId).delete(),
        db.businessModel.where('projectId').equals(targetProjectId).delete(),
        db.gtmPlan.where('projectId').equals(targetProjectId).delete(),
        db.landingPage.where('projectId').equals(targetProjectId).delete(),
        db.decisions.where('projectId').equals(targetProjectId).delete(),
        db.risks.where('projectId').equals(targetProjectId).delete(),
        db.chatMessages.where('projectId').equals(targetProjectId).delete(),
      ]);

      // Bulk write all remapped records
      await db.projects.put(targetProject);
      if (remappedEvidence.length) await db.evidence.bulkPut(remappedEvidence);
      if (remappedResearch.length) await db.research.bulkPut(remappedResearch);
      if (remappedInsights.length) await db.communityInsights.bulkPut(remappedInsights);
      if (remappedCompetitors.length) await db.competitors.bulkPut(remappedCompetitors);
      if (remappedExperiments.length) await db.experiments.bulkPut(remappedExperiments);
      if (remappedInterviews.length) await db.interviews.bulkPut(remappedInterviews);
      if (remappedFeatures.length) await db.features.bulkPut(remappedFeatures);
      if (remappedRoadmap.length) await db.roadmap.bulkPut(remappedRoadmap);
      if (remappedNodes.length) await db.canvasNodes.bulkPut(remappedNodes);
      if (remappedEdges.length) await db.canvasEdges.bulkPut(remappedEdges);
      if (remappedDecisions.length) await db.decisions.bulkPut(remappedDecisions);
      if (remappedRisks.length) await db.risks.bulkPut(remappedRisks);

      if (pkg.businessModel) {
        await db.businessModel.put({
          ...pkg.businessModel,
          id: shouldRemap ? `bm_${targetProjectId}` : pkg.businessModel.id,
          projectId: targetProjectId,
        });
      }
      if (pkg.gtmPlan) {
        await db.gtmPlan.put({
          ...pkg.gtmPlan,
          id: shouldRemap ? `gtm_${targetProjectId}` : pkg.gtmPlan.id,
          projectId: targetProjectId,
        });
      }
      if (pkg.landingPage) {
        await db.landingPage.put({
          ...pkg.landingPage,
          id: shouldRemap ? `lp_${targetProjectId}` : pkg.landingPage.id,
          projectId: targetProjectId,
        });
      }
      if (pkg.chatMessages?.length) {
        await db.chatMessages.bulkPut(
          pkg.chatMessages.map((m) => ({
            ...m,
            id: shouldRemap ? `msg_${Math.random().toString(36).substring(2, 9)}` : m.id,
            projectId: targetProjectId,
          }))
        );
      }
    }
  );

  setActiveProjectId(targetProjectId);
  return targetProjectId;
}

// Delete an entire project and all associated sub-records
export async function deleteProject(projectId: string): Promise<void> {
  await db.transaction(
    'rw',
    [
      db.projects,
      db.evidence,
      db.research,
      db.communityInsights,
      db.competitors,
      db.experiments,
      db.interviews,
      db.features,
      db.roadmap,
      db.canvasNodes,
      db.canvasEdges,
      db.businessModel,
      db.gtmPlan,
      db.landingPage,
      db.decisions,
      db.risks,
      db.chatMessages,
    ],
    async () => {
      await Promise.all([
        db.projects.delete(projectId),
        db.evidence.where('projectId').equals(projectId).delete(),
        db.research.where('projectId').equals(projectId).delete(),
        db.communityInsights.where('projectId').equals(projectId).delete(),
        db.competitors.where('projectId').equals(projectId).delete(),
        db.experiments.where('projectId').equals(projectId).delete(),
        db.interviews.where('projectId').equals(projectId).delete(),
        db.features.where('projectId').equals(projectId).delete(),
        db.roadmap.where('projectId').equals(projectId).delete(),
        db.canvasNodes.where('projectId').equals(projectId).delete(),
        db.canvasEdges.where('projectId').equals(projectId).delete(),
        db.businessModel.where('projectId').equals(projectId).delete(),
        db.gtmPlan.where('projectId').equals(projectId).delete(),
        db.landingPage.where('projectId').equals(projectId).delete(),
        db.decisions.where('projectId').equals(projectId).delete(),
        db.risks.where('projectId').equals(projectId).delete(),
        db.chatMessages.where('projectId').equals(projectId).delete(),
      ]);
    }
  );

  const active = getActiveProjectId();
  if (active === projectId) {
    localStorage.removeItem(ACTIVE_PROJECT_KEY);
  }
}

// Get full project workspace
export async function getProjectWorkspace(projectId: string): Promise<ProjectWorkspace | null> {
  const project = await db.projects.get(projectId);
  if (!project) return null;

  const [
    evidence,
    research,
    communityInsights,
    competitors,
    experiments,
    interviews,
    features,
    roadmap,
    canvasNodes,
    canvasEdges,
    businessModel,
    gtmPlan,
    landingPage,
    decisions,
    risks,
  ] = await Promise.all([
    db.evidence.where('projectId').equals(projectId).toArray(),
    db.research.where('projectId').equals(projectId).toArray(),
    db.communityInsights.where('projectId').equals(projectId).toArray(),
    db.competitors.where('projectId').equals(projectId).toArray(),
    db.experiments.where('projectId').equals(projectId).toArray(),
    db.interviews.where('projectId').equals(projectId).toArray(),
    db.features.where('projectId').equals(projectId).toArray(),
    db.roadmap.where('projectId').equals(projectId).toArray(),
    db.canvasNodes.where('projectId').equals(projectId).toArray(),
    db.canvasEdges.where('projectId').equals(projectId).toArray(),
    db.businessModel.where('projectId').equals(projectId).first(),
    db.gtmPlan.where('projectId').equals(projectId).first(),
    db.landingPage.where('projectId').equals(projectId).first(),
    db.decisions.where('projectId').equals(projectId).toArray(),
    db.risks.where('projectId').equals(projectId).toArray(),
  ]);

  return {
    project,
    evidence,
    research,
    communityInsights,
    competitors,
    experiments,
    interviews,
    features,
    roadmap,
    canvasNodes,
    canvasEdges,
    businessModel,
    gtmPlan,
    landingPage,
    decisions,
    risks,
  };
}

// Run integrity diagnostics on a project
export async function runWorkspaceDiagnostics(projectId: string): Promise<{
  integrityOk: boolean;
  issues: string[];
  stats: Record<string, number>;
}> {
  const workspace = await getProjectWorkspace(projectId);
  if (!workspace) {
    return {
      integrityOk: false,
      issues: [`Project ${projectId} does not exist.`],
      stats: {},
    };
  }

  const check = validateWorkspaceReferences({
    nodes: workspace.canvasNodes,
    edges: workspace.canvasEdges,
    evidence: workspace.evidence,
    experiments: workspace.experiments,
    research: workspace.research,
    decisions: workspace.decisions,
    roadmap: workspace.roadmap,
  });

  return {
    integrityOk: check.valid,
    issues: check.warnings,
    stats: {
      evidenceCount: workspace.evidence.length,
      researchCount: workspace.research.length,
      communityInsightsCount: workspace.communityInsights.length,
      competitorsCount: workspace.competitors.length,
      experimentsCount: workspace.experiments.length,
      interviewsCount: workspace.interviews.length,
      featuresCount: workspace.features.length,
      roadmapCount: workspace.roadmap.length,
      canvasNodesCount: workspace.canvasNodes.length,
      canvasEdgesCount: workspace.canvasEdges.length,
      decisionsCount: workspace.decisions.length,
      risksCount: workspace.risks.length,
    },
  };
}

// Referential integrity helper used by import and diagnostics
export function validateWorkspaceReferences(params: {
  nodes?: CanvasNode[];
  edges?: CanvasEdge[];
  evidence?: EvidenceItem[];
  experiments?: Experiment[];
  research?: ResearchSource[];
  decisions?: ProjectDecision[];
  roadmap?: RoadmapItem[];
}): { valid: boolean; warnings: string[] } {
  const warnings: string[] = [];
  const nodes = params.nodes || [];
  const edges = params.edges || [];
  const evidence = params.evidence || [];
  const experiments = params.experiments || [];
  const research = params.research || [];
  const decisions = params.decisions || [];
  const roadmap = params.roadmap || [];

  const nodeIds = new Set(nodes.map((n) => n.id));
  const evidenceIds = new Set(evidence.map((e) => e.id));
  const roadmapIds = new Set(roadmap.map((r) => r.id));

  for (const edge of edges) {
    if (!nodeIds.has(edge.fromNodeId)) {
      warnings.push(`Canvas edge ${edge.id} references missing fromNodeId: ${edge.fromNodeId}`);
    }
    if (!nodeIds.has(edge.toNodeId)) {
      warnings.push(`Canvas edge ${edge.id} references missing toNodeId: ${edge.toNodeId}`);
    }
  }

  for (const exp of experiments) {
    if (exp.evidenceId && !evidenceIds.has(exp.evidenceId)) {
      warnings.push(`Experiment ${exp.id} links to missing evidenceId: ${exp.evidenceId}`);
    }
  }

  for (const res of research) {
    for (const cid of res.claimLinkedIds || []) {
      if (!evidenceIds.has(cid)) {
        warnings.push(`Research ${res.id} links to missing claim ID: ${cid}`);
      }
    }
  }

  for (const dec of decisions) {
    for (const eid of dec.evidenceConsideredIds || []) {
      if (!evidenceIds.has(eid)) {
        warnings.push(`Decision ${dec.id} references missing evidence ID: ${eid}`);
      }
    }
  }

  for (const rm of roadmap) {
    for (const dep of rm.dependencies || []) {
      if (!roadmapIds.has(dep)) {
        warnings.push(`Roadmap item ${rm.id} has missing dependency: ${dep}`);
      }
    }
  }

  return { valid: warnings.length === 0, warnings };
}
