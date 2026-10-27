import React from 'react';
import { ProjectProvider, useProject } from './context/ProjectContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
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
import { RisksPage } from './pages/RisksPage';
import { GoalsPage } from './pages/GoalsPage';
import { AdvisorsPage } from './pages/AdvisorsPage';
import { TeamPage } from './pages/TeamPage';
import { HiringPage } from './pages/HiringPage';

import { Sparkles, Loader2 } from 'lucide-react';

function AppContent() {
  const {
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
    objectives,
    advisors,
    teamMembers,
    skillRequirements,
    hiringRoles,
    candidates,
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
  } = useProject();

  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500"  aria-hidden="true" />
        <span className="text-xs font-medium font-mono">
          Initializing OpenFounder workspace...
        </span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white transition-colors">
      {/* Skip to main content for keyboard and screen-reader users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-4 py-2 rounded font-semibold"
      >
        Skip to main content
      </a>
      <Navbar
        currentProject={currentProject}
        projects={projects}
        onSelectProject={selectProject}
        onOpenNewProjectModal={() => setIsNewProjectModalOpen(true)}
        onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onToggleAICofounder={() => setIsAIPanelOpen(!isAIPanelOpen)}
        isAIPanelOpen={isAIPanelOpen}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          unverifiedCount={unverifiedEvidenceCount}
          activeExperimentCount={activeExperimentsCount}
          openRisksCount={openRisksCount}
        />

        <main id="main-content" className="flex-1 overflow-y-auto relative">
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
                  risks={risks}
                  onSelectTab={setActiveTab}
                  onOpenAICofounderWithPrompt={openAICofounderWithPrompt}
                />
              )}

              {activeTab === 'phases' && (
                <PhasesPage
                  project={currentProject}
                  onProjectUpdated={refreshProjects}
                  onOpenAICofounderWithPrompt={openAICofounderWithPrompt}
                />
              )}

              {activeTab === 'evidence' && (
                <EvidencePage
                  projectId={currentProject.id}
                  evidence={evidence}
                  onEvidenceUpdated={reloadCurrentProjectData}
                  onOpenAICofounderWithPrompt={openAICofounderWithPrompt}
                />
              )}

              {activeTab === 'risks' && (
                <RisksPage
                  projectId={currentProject.id}
                  risks={risks}
                  onRisksUpdated={reloadCurrentProjectData}
                  onOpenAICofounderWithPrompt={openAICofounderWithPrompt}
                />
              )}

              {activeTab === 'research' && (
                <ResearchPage
                  projectId={currentProject.id}
                  research={research}
                  onResearchUpdated={reloadCurrentProjectData}
                  onOpenAICofounderWithPrompt={openAICofounderWithPrompt}
                />
              )}

              {activeTab === 'competitors' && (
                <CompetitorsPage
                  projectId={currentProject.id}
                  competitors={competitors}
                  onCompetitorsUpdated={reloadCurrentProjectData}
                  onOpenAICofounderWithPrompt={openAICofounderWithPrompt}
                />
              )}

              {activeTab === 'validation' && (
                <ValidationPage
                  projectId={currentProject.id}
                  experiments={experiments}
                  onExperimentsUpdated={reloadCurrentProjectData}
                  onOpenAICofounderWithPrompt={openAICofounderWithPrompt}
                />
              )}

              {activeTab === 'interviews' && (
                <InterviewsPage
                  projectId={currentProject.id}
                  interviews={interviews}
                  onInterviewsUpdated={reloadCurrentProjectData}
                  onOpenAICofounderWithPrompt={openAICofounderWithPrompt}
                />
              )}

              {activeTab === 'canvas' && (
                <CanvasPage projectId={currentProject.id} />
              )}

              {activeTab === 'mvp' && (
                <MVPPlannerPage
                  projectId={currentProject.id}
                  features={features}
                  onFeaturesUpdated={reloadCurrentProjectData}
                  onOpenAICofounderWithPrompt={openAICofounderWithPrompt}
                />
              )}

              {activeTab === 'roadmap' && (
                <RoadmapPage
                  projectId={currentProject.id}
                  roadmap={roadmap}
                  onRoadmapUpdated={reloadCurrentProjectData}
                />
              )}

              {activeTab === 'goals' && (
                <GoalsPage
                  projectId={currentProject.id}
                  objectives={objectives}
                  onGoalsUpdated={reloadCurrentProjectData}
                  onOpenAICofounderWithPrompt={openAICofounderWithPrompt}
                />
              )}

              {activeTab === 'advisors' && (
                <AdvisorsPage
                  projectId={currentProject.id}
                  advisors={advisors}
                  onAdvisorsUpdated={reloadCurrentProjectData}
                  onOpenAICofounderWithPrompt={openAICofounderWithPrompt}
                />
              )}

              {activeTab === 'team' && (
                <TeamPage
                  projectId={currentProject.id}
                  members={teamMembers}
                  requirements={skillRequirements}
                  onTeamUpdated={reloadCurrentProjectData}
                  onOpenAICofounderWithPrompt={openAICofounderWithPrompt}
                />
              )}

              {activeTab === 'hiring' && (
                <HiringPage
                  projectId={currentProject.id}
                  roles={hiringRoles}
                  candidates={candidates}
                  onHiringUpdated={reloadCurrentProjectData}
                  onOpenAICofounderWithPrompt={openAICofounderWithPrompt}
                />
              )}

              {activeTab === 'business' && (
                <BusinessModelPage
                  project={currentProject}
                  onOpenAICofounderWithPrompt={openAICofounderWithPrompt}
                />
              )}

              {activeTab === 'gtm' && (
                <GTMPage
                  project={currentProject}
                  onOpenAICofounderWithPrompt={openAICofounderWithPrompt}
                />
              )}

              {activeTab === 'landing' && (
                <LandingPageStudio
                  project={currentProject}
                  onOpenAICofounderWithPrompt={openAICofounderWithPrompt}
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
                  objectives={objectives}
                  risks={risks}
                />
              )}
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-4">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                No active project selected
              </h2>
              <p className="text-xs text-zinc-500 max-w-sm">
                Create a new idea workspace to begin recording evidence and
                testing your riskiest assumptions.
              </p>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setIsNewProjectModalOpen(true)}
                  className="px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg text-xs font-semibold hover:opacity-90 transition-opacity"
                >
                  Create New Project
                </button>
                <button
                  onClick={loadDemoProject}
                  className="px-4 py-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-semibold hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                >
                  Load Demo Workspace (TradePulse)
                </button>
              </div>
            </div>
          )}
        </main>

        <AICofounderPanel
          isOpen={isAIPanelOpen}
          onClose={() => setIsAIPanelOpen(false)}
          project={currentProject}
          projectContext={projectContextString}
          config={aiConfig}
          onOpenSettings={() => setIsSettingsModalOpen(true)}
          queuedPrompt={queuedAIPrompt}
          onClearQueuedPrompt={clearQueuedAIPrompt}
        />
      </div>

      {!isAIPanelOpen && currentProject && (
        <button
          onClick={() => setIsAIPanelOpen(true)}
          className="fixed bottom-5 right-5 z-20 flex items-center space-x-2 px-3.5 py-2.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all text-xs font-semibold group cursor-pointer"
          title="Open AI Co-founder (Ctrl+J)"
        >
          <Sparkles className="w-4 h-4 text-amber-400 group-hover:rotate-12 transition-transform"  aria-hidden="true" />
          <span>Ask AI Co-Founder</span>
          <span className="text-[10px] font-mono opacity-60 ml-1">⌘J</span>
        </button>
      )}

      <NewProjectModal
        isOpen={isNewProjectModalOpen}
        onClose={() => setIsNewProjectModalOpen(false)}
        onProjectCreated={async (newProj) => {
          setIsNewProjectModalOpen(false);
          await refreshProjects();
          if (newProj?.id) {
            await selectProject(newProj.id);
          }
          setActiveTab('dashboard');
        }}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        currentProject={currentProject}
        onProjectUpdated={refreshProjects}
        config={aiConfig}
        onConfigUpdated={setAiConfig}
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
        research={research}
        interviews={interviews}
        risks={risks}
        roadmap={roadmap}
        objectives={objectives}
        advisors={advisors}
        teamMembers={teamMembers}
        skillRequirements={skillRequirements}
        hiringRoles={hiringRoles}
        candidates={candidates}
      />
    </div>
  );
}

export default function App() {
  return (
    <ProjectProvider>
      <AppContent />
    </ProjectProvider>
  );
}
