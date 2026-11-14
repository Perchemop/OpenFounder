import React from 'react';
import {
  Compass,
  Plus,
  Sparkles,
  Settings,
  Search,
  Sun,
  Moon,
  CheckCircle2,
  Menu,
} from 'lucide-react';
import type { Project } from '../../types';
import { FOUNDER_PHASES } from '../../data/phases';

interface NavbarProps {
  currentProject: Project | null;
  projects: Project[];
  onSelectProject: (id: string) => void;
  onOpenNewProjectModal: () => void;
  onOpenSettingsModal: () => void;
  onOpenCommandPalette: () => void;
  onToggleAICofounder: () => void;
  isAIPanelOpen: boolean;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  isSidebarOpen?: boolean;
  onToggleSidebar?: () => void;
  sidebarToggleRef?: React.RefObject<HTMLButtonElement | null>;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentProject,
  projects,
  onSelectProject,
  onOpenNewProjectModal,
  onOpenSettingsModal,
  onOpenCommandPalette,
  onToggleAICofounder,
  isAIPanelOpen,
  theme,
  onToggleTheme,
  isSidebarOpen = false,
  onToggleSidebar,
  sidebarToggleRef,
}) => {
  const currentPhase = currentProject
    ? FOUNDER_PHASES[currentProject.currentPhaseIndex] || FOUNDER_PHASES[0]
    : null;

  return (
    <header className="h-14 border-b border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 backdrop-blur px-4 flex items-center justify-between sticky top-0 z-30 transition-colors min-w-0">
      {/* Brand & Project Selector */}
      <div className="flex items-center space-x-3 min-w-0">
        {/* Hamburger toggle (mobile drawer) */}
        <button
          ref={sidebarToggleRef}
          type="button"
          data-testid="sidebar-toggle"
          aria-label="Open navigation"
          aria-expanded={isSidebarOpen}
          aria-controls="app-sidebar"
          onClick={onToggleSidebar}
          className="md:hidden p-1.5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors shrink-0"
        >
          <Menu className="w-5 h-5" aria-hidden="true" />
        </button>

        <div className="flex items-center space-x-2 font-bold tracking-tight text-zinc-900 dark:text-zinc-100 text-lg select-none min-w-0">
          <div className="w-8 h-8 rounded-lg bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center text-white dark:text-zinc-900 shadow-sm shrink-0">
            <Compass className="w-4 h-4" aria-hidden="true" />
          </div>
          <span className="truncate">OpenFounder</span>
          <span className="hidden sm:inline-block text-[10px] uppercase font-semibold tracking-widest px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 shrink-0">
            FOSS
          </span>
        </div>

        <div className="h-4 w-px bg-zinc-300 dark:bg-zinc-700 mx-1 hidden sm:block shrink-0" />

        {/* Project Selector */}
        <div className="relative flex items-center min-w-0">
          <select
            id="project-selector-dropdown"
            aria-label="Select project"
            className="text-xs font-medium bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-md py-1.5 pl-2.5 pr-7 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-500 cursor-pointer max-w-[120px] sm:max-w-[180px] truncate"
            value={currentProject?.id || ''}
            onChange={(e) => onSelectProject(e.target.value)}
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
            {projects.length === 0 && <option value="">No Projects</option>}
          </select>

          <button
            id="btn-new-project-header"
            onClick={onOpenNewProjectModal}
            aria-label="Create New Project"
            className="ml-1.5 p-1.5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {/* Active Phase Badge */}
        {currentPhase && (
          <div className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-600 dark:text-zinc-300 shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" aria-hidden="true" />
            <span className="font-semibold text-zinc-900 dark:text-zinc-100">
              {currentPhase.name}
            </span>
          </div>
        )}
      </div>

      {/* Center / Right controls */}
      <div className="flex items-center space-x-2 shrink-0">
        {/* Command Palette trigger */}
        <button
          id="btn-command-palette-trigger"
          onClick={onOpenCommandPalette}
          className="hidden md:flex items-center space-x-2 text-xs text-zinc-700 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700/80 px-2.5 py-1.5 rounded-md border border-zinc-200 dark:border-zinc-700 transition-colors shrink-0"
        >
          <Search className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Search workspace...</span>
          <kbd className="font-mono text-[10px] bg-white dark:bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-300 dark:border-zinc-600 text-zinc-500">
            ⌘K
          </kbd>
        </button>

        {/* Theme Toggle */}
        <button
          id="btn-theme-toggle"
          onClick={onToggleTheme}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          className="p-1.5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors shrink-0"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Settings & Privacy Modal */}
        <button
          id="btn-settings-trigger"
          onClick={onOpenSettingsModal}
          title="Settings & Privacy"
          className="p-1.5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors relative shrink-0"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* AI Co-founder Toggle Button */}
        <button
          id="btn-toggle-ai-cofounder"
          onClick={onToggleAICofounder}
          aria-label="AI Co-Founder"
          className={`flex items-center space-x-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-md transition-all shadow-sm shrink-0 ${
            isAIPanelOpen
              ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
              : 'bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" aria-hidden="true" />
          <span className="hidden md:inline">AI Co-Founder</span>
        </button>
      </div>
    </header>
  );
};
