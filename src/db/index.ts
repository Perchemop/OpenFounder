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
  Objective,
  Advisor,
  TeamMember,
  SkillRequirement,
  HiringRole,
  Candidate,
  AIChatMessage,
  ExportPackage,
  AIProviderConfig,
  ProjectWorkspace,
} from '../types';
import { validateExportPackage, validateWorkspaceReferences } from './validation';
import {
  remapAdvisor,
  remapHiringPipeline,
  remapObjective,
  remapRiskItem,
  remapRoadmapItem,
  remapSkillRequirement,
  remapTeamMember,
} from './importRemap';
import { CURRENT_APP_VERSION } from '../updateCheck';

export { validateWorkspaceReferences } from './validation';
export type {
  WorkspaceReferenceInput,
  WorkspaceReferenceResult,
} from './validation';

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
  objectives!: Table<Objective, string>;
  advisors!: Table<Advisor, string>;
  teamMembers!: Table<TeamMember, string>;
  skillRequirements!: Table<SkillRequirement, string>;
  hiringRoles!: Table<HiringRole, string>;
  candidates!: Table<Candidate, string>;
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
    this.version(4).stores({
      objectives: 'id, projectId, status, createdAt',
    });
    this.version(5).stores({
      advisors: 'id, projectId, createdAt',
    });
    this.version(6).stores({
      teamMembers: 'id, projectId, commitment, createdAt',
      skillRequirements: 'id, projectId, importance',
    });
    this.version(7).stores({
      hiringRoles: 'id, projectId, kind, createdAt',
      candidates: 'id, projectId, roleId, stage, createdAt',
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
  geminiModel: 'gemini-2.0-flash',
  geminiFallbackModels: [
    'gemini-2.0-flash',
    'gemini-2.0-flash-lite',
    'gemini-flash-latest',
    'gemini-1.5-flash',
  ],
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
    const toPersist = { ...config, telemetryEnabled: false };

    if (!config.storeKeysLocally) {
      setSessionKey('direct_gemini', config.directGeminiKey);
      setSessionKey('openai', config.openaiKey);
      setSessionKey('anthropic', config.anthropicKey);

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
    objectives,
    advisors,
    teamMembers,
    skillRequirements,
    hiringRoles,
    candidates,
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
    db.objectives.where('projectId').equals(projectId).toArray(),
    db.advisors.where('projectId').equals(projectId).toArray(),
    db.teamMembers.where('projectId').equals(projectId).toArray(),
    db.skillRequirements.where('projectId').equals(projectId).toArray(),
    db.hiringRoles.where('projectId').equals(projectId).toArray(),
    db.candidates.where('projectId').equals(projectId).toArray(),
    db.chatMessages.where('projectId').equals(projectId).toArray(),
  ]);

  return {
    schemaVersion: 7,
    exportedAt: new Date().toISOString(),
    appVersion: CURRENT_APP_VERSION,
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
    objectives,
    advisors,
    teamMembers,
    skillRequirements,
    hiringRoles,
    candidates,
    chatMessages,
  };
}

export async function importProjectPackage(
  rawInput: unknown,
  options: { importAsNew?: boolean; customNewName?: string } = {}
): Promise<string> {
  const validation = validateExportPackage(rawInput);
  if (!validation.valid || !validation.data) {
    const errorDetails = validation.errors?.join('\n• ') || 'Schema validation failed.';
    throw new Error(`Import validation failed:\n• ${errorDetails}`);
  }
  const pkg = validation.data;
  const shouldRemap = Boolean(options.importAsNew);

  let targetProjectId = pkg.project.id;
  let targetProject: Project = { ...pkg.project };

  if (shouldRemap) {
    targetProjectId = generateId('proj');
    targetProject = {
      ...pkg.project,
      id: targetProjectId,
      name: options.customNewName || `${pkg.project.name} (Copy)`,
      updatedAt: Date.now(),
    };
  }

  await db.transaction(
    'rw',
    [
      db.projects, db.evidence, db.research, db.communityInsights, db.competitors,
      db.experiments, db.interviews, db.features, db.roadmap, db.canvasNodes,
      db.canvasEdges, db.businessModel, db.gtmPlan, db.landingPage, db.decisions,
      db.risks, db.objectives, db.advisors, db.teamMembers, db.skillRequirements,
      db.hiringRoles, db.candidates, db.chatMessages,
    ],
    async () => {
      if (!shouldRemap) {
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
          db.objectives.where('projectId').equals(targetProjectId).delete(),
          db.advisors.where('projectId').equals(targetProjectId).delete(),
          db.teamMembers.where('projectId').equals(targetProjectId).delete(),
          db.skillRequirements.where('projectId').equals(targetProjectId).delete(),
          db.hiringRoles.where('projectId').equals(targetProjectId).delete(),
          db.candidates.where('projectId').equals(targetProjectId).delete(),
          db.chatMessages.where('projectId').equals(targetProjectId).delete(),
        ]);
      }

      const remapId = (id: string, prefix: string) => (shouldRemap ? generateId(prefix) : id);

      await db.projects.put(targetProject);

      if (pkg.evidence?.length) {
        await db.evidence.bulkPut(
          pkg.evidence.map((e) => ({
            ...e,
            id: remapId(e.id, 'ev'),
            projectId: targetProjectId,
          }))
        );
      }
      if (pkg.research?.length) {
        await db.research.bulkPut(
          pkg.research.map((r) => ({
            ...r,
            id: remapId(r.id, 'res'),
            projectId: targetProjectId,
          }))
        );
      }
      if (pkg.competitors?.length) {
        await db.competitors.bulkPut(
          pkg.competitors.map((c) => ({
            ...c,
            id: remapId(c.id, 'comp'),
            projectId: targetProjectId,
          }))
        );
      }
      if (pkg.experiments?.length) {
        await db.experiments.bulkPut(
          pkg.experiments.map((e) => ({
            ...e,
            id: remapId(e.id, 'exp'),
            projectId: targetProjectId,
          }))
        );
      }
      if (pkg.interviews?.length) {
        await db.interviews.bulkPut(
          pkg.interviews.map((i) => ({
            ...i,
            id: remapId(i.id, 'inv'),
            projectId: targetProjectId,
          }))
        );
      }
      if (pkg.features?.length) {
        await db.features.bulkPut(
          pkg.features.map((f) => ({
            ...f,
            id: remapId(f.id, 'feat'),
            projectId: targetProjectId,
          }))
        );
      }
      if (pkg.roadmap?.length) {
        await db.roadmap.bulkPut(
          pkg.roadmap.map((item) => remapRoadmapItem(item, targetProjectId, remapId))
        );
      }
      if (pkg.canvasNodes?.length) {
        await db.canvasNodes.bulkPut(
          pkg.canvasNodes.map((n) => ({
            ...n,
            id: remapId(n.id, 'node'),
            projectId: targetProjectId,
          }))
        );
      }
      if (pkg.canvasEdges?.length) {
        await db.canvasEdges.bulkPut(
          pkg.canvasEdges.map((e) => ({
            ...e,
            id: remapId(e.id, 'edge'),
            projectId: targetProjectId,
          }))
        );
      }
      if (pkg.decisions?.length) {
        await db.decisions.bulkPut(
          pkg.decisions.map((d) => ({
            ...d,
            id: remapId(d.id, 'dec'),
            projectId: targetProjectId,
          }))
        );
      }
      if (pkg.risks?.length) {
        await db.risks.bulkPut(
          pkg.risks.map((item) => remapRiskItem(item, targetProjectId, remapId))
        );
      }
      if (pkg.objectives?.length) {
        await db.objectives.bulkPut(
          pkg.objectives.map((objective) => remapObjective(objective, targetProjectId, remapId))
        );
      }
      if (pkg.advisors?.length) {
        await db.advisors.bulkPut(
          pkg.advisors.map((advisor) => remapAdvisor(advisor, targetProjectId, remapId))
        );
      }
      if (pkg.teamMembers?.length) {
        await db.teamMembers.bulkPut(
          pkg.teamMembers.map((member) => remapTeamMember(member, targetProjectId, remapId))
        );
      }
      if (pkg.skillRequirements?.length) {
        await db.skillRequirements.bulkPut(
          pkg.skillRequirements.map((entry) => remapSkillRequirement(entry, targetProjectId, remapId))
        );
      }
      if (pkg.hiringRoles?.length || pkg.candidates?.length) {
        const { roles, candidates } = remapHiringPipeline(
          pkg.hiringRoles ?? [],
          pkg.candidates ?? [],
          targetProjectId,
          remapId
        );
        if (roles.length) await db.hiringRoles.bulkPut(roles);
        if (candidates.length) await db.candidates.bulkPut(candidates);
      }
      if (pkg.communityInsights?.length) {
        await db.communityInsights.bulkPut(
          pkg.communityInsights.map((i) => ({
            ...i,
            id: remapId(i.id, 'ins'),
            projectId: targetProjectId,
          }))
        );
      }
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
            id: remapId(m.id, 'msg'),
            projectId: targetProjectId,
          }))
        );
      }
    }
  );

  return targetProjectId;
}

export async function deleteProject(projectId: string): Promise<void> {
  await db.transaction('rw', db.tables, async () => {
    await db.projects.delete(projectId);
    for (const table of db.tables) {
      if (table.name !== 'projects' && table.schema.indexes.some((i) => i.name === 'projectId')) {
        await (table as any).where('projectId').equals(projectId).delete();
      }
    }
  });
}

export async function wipeAllLocalData(): Promise<void> {
  await db.delete();
  await db.open();
}

export async function runWorkspaceDiagnostics(projectId: string): Promise<{
  integrityOk: boolean;
  issues: string[];
  stats: Record<string, number>;
}> {
  const stats: Record<string, number> = {};
  const issues: string[] = [];
  const project = await db.projects.get(projectId);
  if (!project) {
    return { integrityOk: false, issues: ['Project not found'], stats };
  }
  stats.evidenceCount = await db.evidence.where('projectId').equals(projectId).count();
  stats.researchCount = await db.research.where('projectId').equals(projectId).count();
  stats.competitorsCount = await db.competitors.where('projectId').equals(projectId).count();
  stats.experimentsCount = await db.experiments.where('projectId').equals(projectId).count();
  stats.interviewsCount = await db.interviews.where('projectId').equals(projectId).count();
  stats.featuresCount = await db.features.where('projectId').equals(projectId).count();
  stats.roadmapCount = await db.roadmap.where('projectId').equals(projectId).count();
  stats.canvasNodesCount = await db.canvasNodes.where('projectId').equals(projectId).count();
  stats.canvasEdgesCount = await db.canvasEdges.where('projectId').equals(projectId).count();
  stats.decisionsCount = await db.decisions.where('projectId').equals(projectId).count();
  stats.risksCount = await db.risks.where('projectId').equals(projectId).count();
  stats.objectivesCount = await db.objectives.where('projectId').equals(projectId).count();
  stats.advisorsCount = await db.advisors.where('projectId').equals(projectId).count();
  stats.teamMembersCount = await db.teamMembers.where('projectId').equals(projectId).count();
  stats.skillRequirementsCount = await db.skillRequirements
    .where('projectId')
    .equals(projectId)
    .count();
  stats.hiringRolesCount = await db.hiringRoles.where('projectId').equals(projectId).count();
  stats.candidatesCount = await db.candidates.where('projectId').equals(projectId).count();

  const [nodes, edges, evidence, experiments, roadmap] = await Promise.all([
    db.canvasNodes.where('projectId').equals(projectId).toArray(),
    db.canvasEdges.where('projectId').equals(projectId).toArray(),
    db.evidence.where('projectId').equals(projectId).toArray(),
    db.experiments.where('projectId').equals(projectId).toArray(),
    db.roadmap.where('projectId').equals(projectId).toArray(),
  ]);

  const integrity = validateWorkspaceReferences({
    nodes,
    edges,
    evidence,
    experiments,
    roadmap,
  });
  issues.push(...integrity.warnings);

  return { integrityOk: issues.length === 0, issues, stats };
}
