import React, { useState, useEffect } from 'react';
import {
  Search,
  Layers,
  Scale,
  FlaskConical,
  Users,
  ListTodo,
  Milestone,
  FileText,
  Network,
  X,
  Plus,
  ArrowRight,
  ShieldAlert,
  Building2,
  MessageSquare,
  Target,
  Users2,
} from 'lucide-react';
import type { WorkspaceTab } from '../layout/Sidebar';
import type {
  EvidenceItem,
  Competitor,
  Experiment,
  FeatureItem,
  ResearchSource,
  CustomerInterview,
  RiskItem,
  RoadmapItem,
  Objective,
  Advisor,
  TeamMember,
  SkillRequirement,
} from '../../types';
import {
  groupSearchResults,
  searchWorkspace,
  type WorkspaceSearchKind,
} from '../../utils/workspaceSearch';
import {
  activateEntry,
  buildPaletteEntries,
  moveSelection,
} from '../../utils/paletteNavigation';
import { useFocusTrap } from '../../hooks/useFocusTrap';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (tab: WorkspaceTab) => void;
  onOpenNewProjectModal: () => void;
  evidence?: EvidenceItem[];
  competitors?: Competitor[];
  experiments?: Experiment[];
  features?: FeatureItem[];
  research?: ResearchSource[];
  interviews?: CustomerInterview[];
  risks?: RiskItem[];
  roadmap?: RoadmapItem[];
  objectives?: Objective[];
  advisors?: Advisor[];
  teamMembers?: TeamMember[];
  skillRequirements?: SkillRequirement[];
}

const RESULT_ICONS: Record<WorkspaceSearchKind, React.ComponentType<{ className?: string }>> = {
  evidence: Scale,
  research: Search,
  interview: MessageSquare,
  risk: ShieldAlert,
  roadmap: Milestone,
  objective: Target,
  advisor: Users2,
  team_member: Users,
  skill_requirement: Target,
  experiment: FlaskConical,
  competitor: Building2,
  feature: ListTodo,
};

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelectTab,
  onOpenNewProjectModal,
  evidence = [],
  competitors = [],
  experiments = [],
  features = [],
  research = [],
  interviews = [],
  risks = [],
  roadmap = [],
  objectives = [],
  advisors = [],
  teamMembers = [],
  skillRequirements = [],
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(-1);
  // Focus trap, initial focus, and Escape-to-close.
  const dialogRef = useFocusTrap<HTMLDivElement>(isOpen, onClose);

  useEffect(() => {
    if (isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setQuery('');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  const quickNavItems = [
    { id: 'dashboard' as WorkspaceTab, label: 'Dashboard Overview', icon: Layers },
    { id: 'phases' as WorkspaceTab, label: '10 Founder Guided Phases', icon: Layers },
    { id: 'evidence' as WorkspaceTab, label: 'Evidence Ledger & Assumptions', icon: Scale },
    { id: 'research' as WorkspaceTab, label: 'Research Sources & Findings', icon: Search },
    { id: 'competitors' as WorkspaceTab, label: 'Competitor Analysis Matrix', icon: Users },
    { id: 'validation' as WorkspaceTab, label: 'Validation Experiments & Tests', icon: FlaskConical },
    { id: 'interviews' as WorkspaceTab, label: 'Customer Interviews', icon: MessageSquare },
    { id: 'risks' as WorkspaceTab, label: 'Risk Register', icon: ShieldAlert },
    { id: 'canvas' as WorkspaceTab, label: 'Visual Project Canvas', icon: Network },
    { id: 'mvp' as WorkspaceTab, label: 'MVP MoSCoW Scoping', icon: ListTodo },
    { id: 'roadmap' as WorkspaceTab, label: 'Visual Roadmap', icon: Milestone },
    { id: 'documents' as WorkspaceTab, label: 'Export Reports (Markdown/JSON)', icon: FileText },
  ];

  const normalisedQuery = query.trim().toLowerCase();
  const filteredNav = quickNavItems.filter((item) =>
    item.label.toLowerCase().includes(normalisedQuery)
  );

  const resultGroups = groupSearchResults(
    searchWorkspace(query, {
      evidence,
      research,
      interviews,
      risks,
      roadmap,
      objectives,
      advisors,
      teamMembers,
      skillRequirements,
      experiments,
      competitors,
      features,
    })
  );

  const normalisedQuery = query.trim().toLowerCase();
  const paletteEntries = buildPaletteEntries(true, filteredNav.map((item) => item.id), resultGroups.flatMap((group) => group.items));

  const activateSelected = (index: number) => {
    const activation = activateEntry(paletteEntries[index]);
    if (activation.kind === 'project') {
      onOpenNewProjectModal();
      onClose();
      return;
    }
    if (activation.tab) {
      onSelectTab(activation.tab as WorkspaceTab);
      onClose();
    }
  };

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setSelectedIndex((current) => moveSelection(paletteEntries.length, current, 'forward'));
      return;
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setSelectedIndex((current) => moveSelection(paletteEntries.length, current, 'backward'));
      return;
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      activateSelected(selectedIndex);
      return;
    }
    if (event.key === 'Home') {
      event.preventDefault();
      setSelectedIndex(paletteEntries.length > 0 ? 0 : -1);
      return;
    }
    if (event.key === 'End') {
      event.preventDefault();
      setSelectedIndex(paletteEntries.length - 1);
    }
  };

  // Keep the selection inside the visible list when the result set changes.
  useEffect(() => {
    setSelectedIndex(paletteEntries.length > 0 ? 0 : -1);
  }, [paletteEntries.length]);

  const entryIdFor = (id: string) => id;
  const isSelected = (id: string) =>
    selectedIndex >= 0 && paletteEntries[selectedIndex]?.id === entryIdFor(id);

  const navRowClass = (id: string) =>
    `w-full flex items-center justify-between p-2 rounded-lg text-left transition-colors ${
      isSelected(id)
        ? 'bg-emerald-50 dark:bg-emerald-950/50 ring-1 ring-emerald-300 dark:ring-emerald-800 text-zinc-900 dark:text-zinc-100'
        : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100'
    }`;

  const resultRowClass = (id: string) =>
    `w-full text-left p-1.5 rounded flex items-start space-x-2 transition-colors ${
      isSelected(id)
        ? 'bg-emerald-50 dark:bg-emerald-950/50 ring-1 ring-emerald-300 dark:ring-emerald-800 text-zinc-900 dark:text-zinc-100'
        : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
    }`;

  const hasSearchQuery = normalisedQuery.length > 0;
  const hasAnyResult = filteredNav.length > 0 || resultGroups.length > 0;

  return (
    <div
      ref={dialogRef}
      tabIndex={-1}
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-start justify-center pt-20 p-4"
    >
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col max-h-[70vh]">
        {/* Search bar */}
        <div className="p-3 border-b border-zinc-200 dark:border-zinc-800 flex items-center space-x-2 bg-zinc-50 dark:bg-zinc-950">
          <Search className="w-4 h-4 text-zinc-400 shrink-0" />
          <input
            type="text"
            placeholder="Search claims, research, interviews, risks, roadmap..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleInputKeyDown}
            className="w-full bg-transparent text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none"
            autoFocus
          />
          <button onClick={onClose} className="p-1 text-zinc-400 hover:text-zinc-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results */}
        <div className="p-2 overflow-y-auto space-y-3 text-xs flex-1">
          {/* Action button */}
          <button
            id="palette-create-project"
            onClick={() => {
              onOpenNewProjectModal();
              onClose();
            }}
            onMouseEnter={() => setSelectedIndex(0)}
            className={`w-full flex items-center space-x-2 p-2 rounded-lg font-medium transition-colors text-left ${
              isSelected('create-project')
                ? 'bg-emerald-100 dark:bg-emerald-950/70 ring-1 ring-emerald-300 dark:ring-emerald-800 text-emerald-900 dark:text-emerald-200'
                : 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-950/60'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create New Project</span>
          </button>

          {/* Quick Navigation */}
          {filteredNav.length > 0 && (
            <div>
              <p className="px-2 text-[10px] uppercase font-semibold text-zinc-400 tracking-wider mb-1">
                Navigation
              </p>
              <div className="space-y-0.5">
                {filteredNav.slice(0, 6).map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      id={`palette-nav-${item.id}`}
                      onClick={() => {
                        onSelectTab(item.id);
                        onClose();
                      }}
                      onMouseEnter={() => setSelectedIndex(paletteEntries.findIndex((entry) => entry.id === `nav-${item.id}`))}
                      className={navRowClass(`nav-${item.id}`)}
                    >
                      <div className="flex items-center space-x-2">
                        <Icon className="w-3.5 h-3.5 text-zinc-400" />
                        <span>{item.label}</span>
                      </div>
                      <ArrowRight className="w-3 h-3 text-zinc-400" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Matches in workspace */}
          {normalisedQuery.length > 1 && resultGroups.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
              {resultGroups.map((group) => {
                const Icon = RESULT_ICONS[group.kind];
                return (
                  <div key={group.kind}>
                    <p className="px-2 text-[10px] uppercase font-semibold text-zinc-400 tracking-wider mb-1">
                      {group.label}
                    </p>
                    <div className="space-y-0.5">
                      {group.items.map((result) => (
                        <button
                          key={`${group.kind}-${result.id}`}
                          id={`palette-result-${group.kind}-${result.id}`}
                          onClick={() => {
                            onSelectTab(result.tab);
                            onClose();
                          }}
                          onMouseEnter={() => setSelectedIndex(paletteEntries.findIndex((entry) => entry.id === `result-${group.kind}-${result.id}`))}
                          className={resultRowClass(`result-${group.kind}-${result.id}`)}
                        >
                          <Icon className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
                          <span className="min-w-0">
                            <span className="block truncate">{result.title}</span>
                            {result.detail && (
                              <span className="block truncate text-[10px] text-zinc-400 capitalize">
                                {result.detail}
                              </span>
                            )}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {normalisedQuery.length > 1 && !hasAnyResult && (
            <p className="px-2 py-4 text-center text-zinc-500 dark:text-zinc-400">
              Nothing matches “{query.trim()}”. Try a claim, a customer, a risk, or a roadmap
              item.
            </p>
          )}

          {!hasSearchQuery && (
            <p className="px-2 pb-1 text-[10px] text-zinc-400">
              Searches evidence, research, interviews, risks, roadmap, experiments, competitors,
              and features.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
