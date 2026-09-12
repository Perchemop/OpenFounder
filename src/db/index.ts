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
  AIChatMessage,
  ExportPackage,
  AIProviderConfig,
} from '../types';

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
  }
}

export const db = new OpenFounderDB();

// Local settings storage (localStorage)
const SETTINGS_STORAGE_KEY = 'openfounder_settings_v1';
const ACTIVE_PROJECT_KEY = 'openfounder_active_project_id';

export const DEFAULT_AI_CONFIG: AIProviderConfig = {
  activeProvider: 'offline_rules', // Default: 100% Free, zero-network, GitHub Pages ready
  openaiEndpoint: 'https://api.openai.com/v1',
  openaiModel: 'gpt-4o-mini',
  anthropicModel: 'claude-3-5-sonnet-20241022',
  ollamaEndpoint: 'http://localhost:11434',
  ollamaModel: 'llama3.2',
  temperature: 0.7,
  maxTokens: 2048,
  telemetryEnabled: false,
  storeKeysLocally: false, // Default: Session-only for maximum privacy & security
};

export function getStoredSettings(): AIProviderConfig {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return DEFAULT_AI_CONFIG;
    return { ...DEFAULT_AI_CONFIG, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_AI_CONFIG;
  }
}

export function saveStoredSettings(config: AIProviderConfig): void {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save settings to localStorage:', e);
  }
}

export function getActiveProjectId(): string | null {
  return localStorage.getItem(ACTIVE_PROJECT_KEY);
}

export function setActiveProjectId(id: string): void {
  localStorage.setItem(ACTIVE_PROJECT_KEY, id);
}

// Export whole project as JSON (Never exports sensitive API keys)
export async function exportProjectPackage(projectId: string): Promise<ExportPackage> {
  const project = await db.projects.get(projectId);
  if (!project) throw new Error('Project not found');

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
    businessModelList,
    gtmPlanList,
    landingPageList,
    decisions,
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
    db.businessModel.where('projectId').equals(projectId).toArray(),
    db.gtmPlan.where('projectId').equals(projectId).toArray(),
    db.landingPage.where('projectId').equals(projectId).toArray(),
    db.decisions.where('projectId').equals(projectId).toArray(),
    db.chatMessages.where('projectId').equals(projectId).toArray(),
  ]);

  return {
    schemaVersion: 1,
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
    businessModel: businessModelList[0],
    gtmPlan: gtmPlanList[0],
    landingPage: landingPageList[0],
    decisions,
    chatMessages,
  };
}

// Import project package with rigorous validation and duplicate collision prevention
export async function importProjectPackage(
  pkg: ExportPackage,
  options: { importAsNew?: boolean } = {}
): Promise<string> {
  if (!pkg || typeof pkg !== 'object') {
    throw new Error('Import file is empty or not valid JSON.');
  }
  if (!pkg.schemaVersion || pkg.schemaVersion > 2) {
    throw new Error(`Unsupported schema version: ${pkg.schemaVersion}. Please use an export from OpenFounder v1 or v2.`);
  }
  if (!pkg.project || typeof pkg.project !== 'object' || !pkg.project.id || !pkg.project.name) {
    throw new Error('Invalid project structure: Missing project definition or required identifiers.');
  }

  // Check if project already exists
  const existing = await db.projects.get(pkg.project.id);
  let targetProjectId = pkg.project.id;
  let targetProject = { ...pkg.project };

  if (existing && options.importAsNew) {
    targetProjectId = `proj_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    targetProject = {
      ...pkg.project,
      id: targetProjectId,
      name: `${pkg.project.name} (Imported Copy)`,
      updatedAt: Date.now(),
    };
  }

  // Use a transaction to safely overwrite or import
  await db.transaction('rw', [
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
    db.chatMessages,
  ], async () => {
    // Delete existing records with targetProjectId if overwriting
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
      db.chatMessages.where('projectId').equals(targetProjectId).delete(),
    ]);

    // Remap projectId if importing as new
    const remapId = <T extends { projectId: string; id: string }>(item: T): T => ({
      ...item,
      projectId: targetProjectId,
      id: targetProjectId === pkg.project.id ? item.id : `${item.id}_${Math.random().toString(36).substring(2, 6)}`,
    });

    // Insert new records
    await db.projects.put(targetProject);
    if (pkg.evidence?.length) await db.evidence.bulkPut(pkg.evidence.map(remapId));
    if (pkg.research?.length) await db.research.bulkPut(pkg.research.map(remapId));
    if (pkg.communityInsights?.length) await db.communityInsights.bulkPut(pkg.communityInsights.map(remapId));
    if (pkg.competitors?.length) await db.competitors.bulkPut(pkg.competitors.map(remapId));
    if (pkg.experiments?.length) await db.experiments.bulkPut(pkg.experiments.map(remapId));
    if (pkg.interviews?.length) await db.interviews.bulkPut(pkg.interviews.map(remapId));
    if (pkg.features?.length) await db.features.bulkPut(pkg.features.map(remapId));
    if (pkg.roadmap?.length) await db.roadmap.bulkPut(pkg.roadmap.map(remapId));
    if (pkg.canvasNodes?.length) await db.canvasNodes.bulkPut(pkg.canvasNodes.map(remapId));
    if (pkg.canvasEdges?.length) await db.canvasEdges.bulkPut(pkg.canvasEdges.map(remapId));
    if (pkg.businessModel) await db.businessModel.put({ ...pkg.businessModel, projectId: targetProjectId });
    if (pkg.gtmPlan) await db.gtmPlan.put({ ...pkg.gtmPlan, projectId: targetProjectId });
    if (pkg.landingPage) await db.landingPage.put({ ...pkg.landingPage, projectId: targetProjectId });
    if (pkg.decisions?.length) await db.decisions.bulkPut(pkg.decisions.map(remapId));
    if (pkg.chatMessages?.length) {
      await db.chatMessages.bulkPut(
        pkg.chatMessages.map((m) => ({ ...m, projectId: targetProjectId }))
      );
    }
  });

  setActiveProjectId(targetProjectId);
  return targetProjectId;
}

// Delete an entire project and all associated sub-records
export async function deleteProject(projectId: string): Promise<void> {
  await db.transaction('rw', [
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
    db.chatMessages,
  ], async () => {
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
      db.chatMessages.where('projectId').equals(projectId).delete(),
    ]);
  });

  const activeId = getActiveProjectId();
  if (activeId === projectId) {
    const remaining = await db.projects.toArray();
    if (remaining.length > 0) {
      setActiveProjectId(remaining[0].id);
    } else {
      localStorage.removeItem(ACTIVE_PROJECT_KEY);
    }
  }
}

// Clear all local database data
export async function wipeAllLocalData(): Promise<void> {
  await db.delete();
  await db.open();
  localStorage.removeItem(ACTIVE_PROJECT_KEY);
  localStorage.removeItem(SETTINGS_STORAGE_KEY);
}
