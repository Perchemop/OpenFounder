import React, { useState, useEffect, useCallback } from 'react';
import {
  Navbar,
} from './components/layout/Navbar';
import {
  Sidebar,
  type WorkspaceTab,
} from './components/layout/Sidebar';
import { AICofounderPanel } from './components/ai/AICofounderPanel';
import { NewProjectModal } from './components/modals/NewProjectModal';
import { SettingsModal } from './components/modals/SettingsModal';
import { CommandPalette } from './components/modals/CommandPalette';

// Pages
import { DashboardPage } from './pages/DashboardPage';
import { PhasesPage } from './pages/PhasesPage';
import { EvidencePage } from './pages/EvidencePage';
import { ResearchPage } from './pages/ResearchPage';
import { CompetitorsPage } from './pages/CompetitorsPage';
import { ValidationPage } from './pages/ValidationPage';
import { InterviewsPage } from './pages/InterviewsPage';
import { CanvasPage } from './pages/CanvasPage';
import { MVPPlannerPage } from './pages/MVPPlannerPage';
import { RoadmapPage } from './pages/RoadmapPage';
import { BusinessModelPage } from './pages/BusinessModelPage';
import { GTMPage } from './pages/GTMPage';
import { LandingPageStudio } from './pages/LandingPageStudio';
import { DocumentsPage } from './pages/DocumentsPage';

// Database & Types
import {
  db,
  getActiveProjectId,
  setActiveProjectId,
  getStoredSettings,
} from './db';
import { seedDemoProjectIfNeeded, createSyntheticDemoProject } from './data/sampleProject';
import { buildProjectContext } from './ai/contextBuilder';
import type {
  Project,
  EvidenceItem,
  Competitor,
  Experiment,
  FeatureItem,
  RoadmapItem,
  CustomerInterview,
  ResearchSource,
  AIProviderConfig,
} from './types';
import { Sparkles, Loader2 } from 'lucide-react';

export default function App() {
  // Theme state
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

  const toggleTheme = () => {
    setTheme((t) => (t === 'light' ? 'dark' : 'light'));
  };

  // State
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('dashboard');
  const [loading, setLoading] = useState(true);

  // Entities for current project
  const [evidence, setEvidence] = useState<EvidenceItem[]>([]);
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [features, setFeatures] = useState<FeatureItem[]>([]);
  const [roadmap, setRoadmap] = useState<RoadmapItem[]>([]);
  const [interviews, setInterviews] = useState<CustomerInterview[]>([]);
  const [research, setResearch] = useState<ResearchSource[]>([]);

  // AI & Modals
  const [aiConfig, setAiConfig] = useState<AIProviderConfig>(getStoredSettings);
  const [isAIPanelOpen, setIsAIPanelOpen] = useState(false);
  const [queuedAIPrompt, setQueuedAIPrompt] = useState<string | null>(null);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Initial load
  useEffect(() => {
    async function initApp() {
      try {
        setLoading(true);
        const activeId = await seedDemoProjectIfNeeded();
        const allProjects = await db.projects.toArray();
        setProjects(allProjects);

        const activeProj = allProjects.find((p) => p.id === activeId) || allProjects[0] || null;
        setCurrentProject(activeProj);
      } catch (err) {
        console.error('Failed to initialize OpenFounder database:', err);
      } finally {
        setLoading(false);
      }
    }

    initApp();
  }, []);

  // Reload current project data
  const loadProjectData = useCallback(async (projId: string) => {
    const [
      evList,
      compList,
      expList,
      featList,
      roadList,
      intList,
      resList,
    ] = await Promise.all([
      db.evidence.where('projectId').equals(projId).toArray(),
      db.competitors.where('projectId').equals(projId).toArray(),
      db.experiments.where('projectId').equals(projId).toArray(),
      db.features.where('projectId').equals(projId).toArray(),
      db.roadmap.where('projectId').equals(projId).toArray(),
      db.interviews.where('projectId').equals(projId).toArray(),
      db.research.where('projectId').equals(projId).toArray(),
    ]);

    setEvidence(evList);
    setCompetitors(compList);
    setExperiments(expList);
    setFeatures(featList);
    setRoadmap(roadList);
    setInterviews(intList);
    setResearch(resList);
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
    }
  }, [currentProject, loadProjectData]);

  // Project selection
  const handleSelectProject = async (id: string) => {
    setActiveProjectId(id);
    const found = projects.find((p) => p.id === id);
    if (found) {
      setCurrentProject(found);
    }
  };

  const handleRefreshProjects = async () => {
    const all = await db.projects.toArray();
    setProjects(all);
    const activeId = getActiveProjectId();
    const active = all.find((p) => p.id === activeId) || all[0] || null;
    setCurrentProject(active);
    if (active) {
      loadProjectData(active.id);
    }
  };

  const handleOpenAICofounderWithPrompt = (prompt: string) => {
    setQueuedAIPrompt(prompt);
    setIsAIPanelOpen(true);
  };

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K -> Command Palette
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
      // Cmd/Ctrl + J -> Toggle AI Co-founder
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'j') {
        e.preventDefault();
        setIsAIPanelOpen((prev) => !prev);
      }
      // Escape
      if (e.key === 'Escape') {
        setIsNewProjectModalOpen(false);
        setIsSettingsModalOpen(false);
        setIsCommandPaletteOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const projectContext = buildProjectContext({
    project: currentProject,
    evidence,
    competitors,
    experiments,
    features,
    research,
  });

  const unverifiedEvidenceCount = evidence.filter(
    (e) => e.status === 'unverified' || e.status === 'assumption'
  ).length;
  const activeExperimentsCount = experiments.filter((e) => e.status === 'running').length;

  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
        <span className="text-xs font-medium font-mono">Initializing OpenFounder workspace...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white transition-colors">
      {/* Top Navbar */}
      <Navbar
        currentProject={currentProject}
        projects={projects}
        onSelectProject={handleSelectProject}
        onOpenNewProjectModal={() => setIsNewProjectModalOpen(true)}
        onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onToggleAICofounder={() => setIsAIPanelOpen((prev) => !prev)}
        isAIPanelOpen={isAIPanelOpen}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Main Workspace Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          unverifiedCount={unverifiedEvidenceCount}
          activeExperimentCount={activeExperimentsCount}
        />

        {/* Central Content Canvas */}
        <main className="flex-1 overflow-y-auto relative">
          {currentProject ? (
            <>
              {activeTab === 'dashboard' && (
                <DashboardPage
                  project={currentProject}
                  evidence={evidence}
                  experiments={experiments}
                  competitors={competitors}
                  features={features}
                  research={research}
                  onSelectTab={setActiveTab}
                  onOpenAICofounderWithPrompt={handleOpenAICofounderWithPrompt}
                />
              )}

              {activeTab === 'phases' && (
                <PhasesPage
                  project={currentProject}
                  onPhaseUpdated={handleRefreshProjects}
                  onOpenAICofounderWithPrompt={handleOpenAICofounderWithPrompt}
                />
              )}

              {activeTab === 'evidence' && (
                <EvidencePage
                  projectId={currentProject.id}
                  evidence={evidence}
                  onEvidenceUpdated={() => loadProjectData(currentProject.id)}
                  onOpenAICofounderWithPrompt={handleOpenAICofounderWithPrompt}
                />
              )}

              {activeTab === 'research' && (
                <ResearchPage
                  projectId={currentProject.id}
                  research={research}
                  onResearchUpdated={() => loadProjectData(currentProject.id)}
                  onOpenAICofounderWithPrompt={handleOpenAICofounderWithPrompt}
                />
              )}

              {activeTab === 'competitors' && (
                <CompetitorsPage
                  projectId={currentProject.id}
                  competitors={competitors}
                  onCompetitorsUpdated={() => loadProjectData(currentProject.id)}
                  onOpenAICofounderWithPrompt={handleOpenAICofounderWithPrompt}
                />
              )}

              {activeTab === 'validation' && (
                <ValidationPage
                  projectId={currentProject.id}
                  experiments={experiments}
                  onExperimentsUpdated={() => loadProjectData(currentProject.id)}
                  onOpenAICofounderWithPrompt={handleOpenAICofounderWithPrompt}
                />
              )}

              {activeTab === 'interviews' && (
                <InterviewsPage
                  projectId={currentProject.id}
                  interviews={interviews}
                  onInterviewsUpdated={() => loadProjectData(currentProject.id)}
                  onOpenAICofounderWithPrompt={handleOpenAICofounderWithPrompt}
                />
              )}

              {activeTab === 'canvas' && <CanvasPage projectId={currentProject.id} />}

              {activeTab === 'mvp' && (
                <MVPPlannerPage
                  projectId={currentProject.id}
                  features={features}
                  onFeaturesUpdated={() => loadProjectData(currentProject.id)}
                  onOpenAICofounderWithPrompt={handleOpenAICofounderWithPrompt}
                />
              )}

              {activeTab === 'roadmap' && (
                <RoadmapPage
                  projectId={currentProject.id}
                  roadmap={roadmap}
                  onRoadmapUpdated={() => loadProjectData(currentProject.id)}
                />
              )}

              {activeTab === 'business' && (
                <BusinessModelPage
                  project={currentProject}
                  onOpenAICofounderWithPrompt={handleOpenAICofounderWithPrompt}
                />
              )}

              {activeTab === 'gtm' && (
                <GTMPage
                  project={currentProject}
                  onOpenAICofounderWithPrompt={handleOpenAICofounderWithPrompt}
                />
              )}

              {activeTab === 'landing' && (
                <LandingPageStudio
                  project={currentProject}
                  onOpenAICofounderWithPrompt={handleOpenAICofounderWithPrompt}
                />
              )}

              {activeTab === 'documents' && (
                <DocumentsPage
                  project={currentProject}
                  evidence={evidence}
                  experiments={experiments}
                  competitors={competitors}
                  features={features}
                  research={research}
                />
              )}
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-4">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                No active project selected
              </h2>
              <p className="text-xs text-zinc-500 max-w-sm">
                Create a new idea workspace to begin recording evidence and testing your riskiest assumptions.
              </p>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setIsNewProjectModalOpen(true)}
                  className="px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg text-xs font-semibold hover:opacity-90 transition-opacity"
                >
                  Create New Project
                </button>
                <button
                  onClick={async () => {
                    const id = await createSyntheticDemoProject();
                    setActiveProjectId(id);
                    await handleRefreshProjects();
                  }}
                  className="px-4 py-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-semibold hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                >
                  Load Demo Workspace (TradePulse)
                </button>
              </div>
            </div>
          )}
        </main>

        {/* Right Docked / Sliding AI Co-Founder Panel */}
        <AICofounderPanel
          isOpen={isAIPanelOpen}
          onClose={() => setIsAIPanelOpen(false)}
          project={currentProject}
          projectContext={projectContext}
          config={aiConfig}
          onOpenSettings={() => setIsSettingsModalOpen(true)}
          queuedPrompt={queuedAIPrompt}
          onClearQueuedPrompt={() => setQueuedAIPrompt(null)}
        />
      </div>

      {/* Floating AI Co-founder trigger button when panel is closed */}
      {!isAIPanelOpen && currentProject && (
        <button
          onClick={() => setIsAIPanelOpen(true)}
          className="fixed bottom-5 right-5 z-20 flex items-center space-x-2 px-3.5 py-2.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all text-xs font-semibold group cursor-pointer"
          title="Open AI Co-founder (Ctrl+J)"
        >
          <Sparkles className="w-4 h-4 text-amber-400 group-hover:rotate-12 transition-transform" />
          <span>Ask AI Co-Founder</span>
          <span className="text-[10px] font-mono opacity-60 ml-1">⌘J</span>
        </button>
      )}

      {/* Modals */}
      <NewProjectModal
        isOpen={isNewProjectModalOpen}
        onClose={() => setIsNewProjectModalOpen(false)}
        onProjectCreated={async (newProj) => {
          setIsNewProjectModalOpen(false);
          await handleRefreshProjects();
          setCurrentProject(newProj);
          setActiveTab('dashboard');
        }}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        currentProject={currentProject}
        onProjectUpdated={handleRefreshProjects}
        config={aiConfig}
        onConfigUpdated={(updated) => setAiConfig(updated)}
      />

      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelectTab={setActiveTab}
        onOpenNewProjectModal={() => {
          setIsCommandPaletteOpen(false);
          setIsNewProjectModalOpen(true);
        }}
        evidence={evidence}
        competitors={competitors}
        experiments={experiments}
        features={features}
      />
    </div>
  );
}
