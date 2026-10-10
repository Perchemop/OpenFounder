import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import {
  db,
  getActiveProjectId,
  setActiveProjectId,
  getStoredSettings,
  saveStoredSettings,
} from '../db';
import { seedDemoProjectIfNeeded, createSyntheticDemoProject } from '../data/sampleProject';
import { buildProjectContext } from '../ai/contextBuilder';
import type {
  Project,
  EvidenceItem,
  Competitor,
  Experiment,
  FeatureItem,
  RoadmapItem,
  CustomerInterview,
  ResearchSource,
  RiskItem,
  AIProviderConfig,
} from '../types';
import type { WorkspaceTab } from '../components/layout/Sidebar';

// ---------------------------------------------------------------------------
// Context shape
// ---------------------------------------------------------------------------

export interface ProjectContextValue {
  // Core
  loading: boolean;
  projects: Project[];
  currentProject: Project | null;
  activeTab: WorkspaceTab;
  setActiveTab: (tab: WorkspaceTab) => void;

  // Entities for the active project
  evidence: EvidenceItem[];
  competitors: Competitor[];
  experiments: Experiment[];
  features: FeatureItem[];
  roadmap: RoadmapItem[];
  interviews: CustomerInterview[];
  research: ResearchSource[];
  risks: RiskItem[];

  // Derived
  projectContextString: string;
  unverifiedEvidenceCount: number;
  activeExperimentsCount: number;
  openRisksCount: number;

  // Theme
  theme: 'light' | 'dark';
  toggleTheme: () => void;

  // AI
  aiConfig: AIProviderConfig;
  setAiConfig: (config: AIProviderConfig) => void;
  isAIPanelOpen: boolean;
  setIsAIPanelOpen: (open: boolean) => void;
  queuedAIPrompt: string | null;
  openAICofounderWithPrompt: (prompt: string) => void;
  clearQueuedAIPrompt: () => void;

  // Modals
  isNewProjectModalOpen: boolean;
  setIsNewProjectModalOpen: (open: boolean) => void;
  isSettingsModalOpen: boolean;
  setIsSettingsModalOpen: (open: boolean) => void;
  isCommandPaletteOpen: boolean;
  setIsCommandPaletteOpen: (open: boolean) => void;

  // Actions
  selectProject: (id: string) => Promise<void>;
  refreshProjects: () => Promise<void>;
  reloadCurrentProjectData: () => Promise<void>;
  loadDemoProject: () => Promise<void>;
}

const ProjectContext = createContext<ProjectContextValue | null>(null);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function ProjectProvider({ children }: { children: ReactNode }) {
  // Theme
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('openfounder_theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('openfounder_theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === 'light' ? 'dark' : 'light'));
  }, []);

  // Core project state
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('dashboard');
  const [loading, setLoading] = useState(true);

  // Entities
  const [evidence, setEvidence] = useState<EvidenceItem[]>([]);
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [features, setFeatures] = useState<FeatureItem[]>([]);
  const [roadmap, setRoadmap] = useState<RoadmapItem[]>([]);
  const [interviews, setInterviews] = useState<CustomerInterview[]>([]);
  const [research, setResearch] = useState<ResearchSource[]>([]);
  const [risks, setRisks] = useState<RiskItem[]>([]);

  // AI & modals
  const [aiConfig, setAiConfigState] = useState<AIProviderConfig>(getStoredSettings);
  const [isAIPanelOpen, setIsAIPanelOpen] = useState(false);
  const [queuedAIPrompt, setQueuedAIPrompt] = useState<string | null>(null);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  const setAiConfig = useCallback((config: AIProviderConfig) => {
    setAiConfigState(config);
    saveStoredSettings(config);
  }, []);

  // Initial load
  useEffect(() => {
    async function initApp() {
      try {
        setLoading(true);
        const activeId = await seedDemoProjectIfNeeded();
        const allProjects = await db.projects.toArray();
        setProjects(allProjects);

        const activeProj =
          allProjects.find((p) => p.id === activeId) || allProjects[0] || null;
        setCurrentProject(activeProj);
      } catch (err) {
        console.error('Failed to initialize OpenFounder database:', err);
      } finally {
        setLoading(false);
      }
    }

    initApp();
  }, []);

  // Load entities when current project changes
  const loadProjectData = useCallback(async (projId: string) => {
    const [
      evList,
      compList,
      expList,
      featList,
      roadList,
      intList,
      resList,
      riskList,
    ] = await Promise.all([
      db.evidence.where('projectId').equals(projId).toArray(),
      db.competitors.where('projectId').equals(projId).toArray(),
      db.experiments.where('projectId').equals(projId).toArray(),
      db.features.where('projectId').equals(projId).toArray(),
      db.roadmap.where('projectId').equals(projId).toArray(),
      db.interviews.where('projectId').equals(projId).toArray(),
      db.research.where('projectId').equals(projId).toArray(),
      db.risks.where('projectId').equals(projId).toArray(),
    ]);

    setEvidence(evList);
    setCompetitors(compList);
    setExperiments(expList);
    setFeatures(featList);
    setRoadmap(roadList);
    setInterviews(intList);
    setResearch(resList);
    setRisks(riskList);
  }, []);

  useEffect(() => {
    if (currentProject) {
      loadProjectData(currentProject.id);
    } else {
      setEvidence([]);
      setCompetitors([]);
      setExperiments([]);
      setFeatures([]);
      setRoadmap([]);
      setInterviews([]);
      setResearch([]);
      setRisks([]);
    }
  }, [currentProject, loadProjectData]);

  // Actions
  const selectProject = useCallback(
    async (id: string) => {
      setActiveProjectId(id);
      const found = projects.find((p) => p.id === id);
      if (found) {
        setCurrentProject(found);
      }
    },
    [projects]
  );

  const refreshProjects = useCallback(async () => {
    const all = await db.projects.toArray();
    setProjects(all);
    const activeId = getActiveProjectId();
    const active = all.find((p) => p.id === activeId) || all[0] || null;
    setCurrentProject(active);
    if (active) {
      await loadProjectData(active.id);
    }
  }, [loadProjectData]);

  const reloadCurrentProjectData = useCallback(async () => {
    if (currentProject) {
      await loadProjectData(currentProject.id);
    }
  }, [currentProject, loadProjectData]);

  const loadDemoProject = useCallback(async () => {
    const id = await createSyntheticDemoProject();
    setActiveProjectId(id);
    await refreshProjects();
  }, [refreshProjects]);

  const openAICofounderWithPrompt = useCallback((prompt: string) => {
    setQueuedAIPrompt(prompt);
    setIsAIPanelOpen(true);
  }, []);

  const clearQueuedAIPrompt = useCallback(() => {
    setQueuedAIPrompt(null);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'j') {
        e.preventDefault();
        setIsAIPanelOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsNewProjectModalOpen(false);
        setIsSettingsModalOpen(false);
        setIsCommandPaletteOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Derived values
  const projectContextString = useMemo(
    () =>
      buildProjectContext({
        project: currentProject,
        evidence,
        competitors,
        experiments,
        features,
        research,
        risks,
      }),
    [currentProject, evidence, competitors, experiments, features, research, risks]
  );

  const unverifiedEvidenceCount = useMemo(
    () =>
      evidence.filter(
        (e) => e.status === 'unverified' || e.status === 'assumption'
      ).length,
    [evidence]
  );

  const activeExperimentsCount = useMemo(
    () => experiments.filter((e) => e.status === 'running').length,
    [experiments]
  );

  const openRisksCount = useMemo(
    () => risks.filter((r) => r.status === 'open' || r.status === 'testing').length,
    [risks]
  );

  const value = useMemo<ProjectContextValue>(
    () => ({
      loading,
      projects,
      currentProject,
      activeTab,
      setActiveTab,
      evidence,
      competitors,
      experiments,
      features,
      roadmap,
      interviews,
      research,
      risks,
      projectContextString,
      unverifiedEvidenceCount,
      activeExperimentsCount,
      openRisksCount,
      theme,
      toggleTheme,
      aiConfig,
      setAiConfig,
      isAIPanelOpen,
      setIsAIPanelOpen,
      queuedAIPrompt,
      openAICofounderWithPrompt,
      clearQueuedAIPrompt,
      isNewProjectModalOpen,
      setIsNewProjectModalOpen,
      isSettingsModalOpen,
      setIsSettingsModalOpen,
      isCommandPaletteOpen,
      setIsCommandPaletteOpen,
      selectProject,
      refreshProjects,
      reloadCurrentProjectData,
      loadDemoProject,
    }),
    [
      loading,
      projects,
      currentProject,
      activeTab,
      evidence,
      competitors,
      experiments,
      features,
      roadmap,
      interviews,
      research,
      risks,
      projectContextString,
      unverifiedEvidenceCount,
      activeExperimentsCount,
      openRisksCount,
      theme,
      toggleTheme,
      aiConfig,
      setAiConfig,
      isAIPanelOpen,
      queuedAIPrompt,
      openAICofounderWithPrompt,
      clearQueuedAIPrompt,
      isNewProjectModalOpen,
      isSettingsModalOpen,
      isCommandPaletteOpen,
      selectProject,
      refreshProjects,
      reloadCurrentProjectData,
      loadDemoProject,
    ]
  );

  return (
    <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useProject(): ProjectContextValue {
  const ctx = useContext(ProjectContext);
  if (!ctx) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return ctx;
}
