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
} from 'lucide-react';
import type { WorkspaceTab } from '../layout/Sidebar';
import type { EvidenceItem, Competitor, Experiment, FeatureItem } from '../../types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (tab: WorkspaceTab) => void;
  onOpenNewProjectModal: () => void;
  evidence?: EvidenceItem[];
  competitors?: Competitor[];
  experiments?: Experiment[];
  features?: FeatureItem[];
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelectTab,
  onOpenNewProjectModal,
  evidence = [],
  competitors = [],
  experiments = [],
  features = [],
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else setQuery('');
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const quickNavItems = [
    { id: 'dashboard' as WorkspaceTab, label: 'Dashboard Overview', icon: Layers },
    { id: 'phases' as WorkspaceTab, label: '10 Founder Guided Phases', icon: Layers },
    { id: 'evidence' as WorkspaceTab, label: 'Evidence Ledger & Assumptions', icon: Scale },
    { id: 'research' as WorkspaceTab, label: 'Research Sources & Findings', icon: Search },
    { id: 'competitors' as WorkspaceTab, label: 'Competitor Analysis Matrix', icon: Users },
    { id: 'validation' as WorkspaceTab, label: 'Validation Experiments & Tests', icon: FlaskConical },
    { id: 'canvas' as WorkspaceTab, label: 'Visual Project Canvas', icon: Network },
    { id: 'mvp' as WorkspaceTab, label: 'MVP MoSCoW Scoping', icon: ListTodo },
    { id: 'roadmap' as WorkspaceTab, label: 'Visual Roadmap', icon: Milestone },
    { id: 'documents' as WorkspaceTab, label: 'Export Reports (Markdown/JSON)', icon: FileText },
  ];

  const filteredNav = quickNavItems.filter((item) =>
    item.label.toLowerCase().includes(query.toLowerCase())
  );

  const matchedEvidence = evidence.filter((e) =>
    e.claim.toLowerCase().includes(query.toLowerCase())
  );
  const matchedCompetitors = competitors.filter((c) =>
    c.name.toLowerCase().includes(query.toLowerCase())
  );
  const matchedExperiments = experiments.filter((ex) =>
    ex.hypothesis.toLowerCase().includes(query.toLowerCase())
  );
  const matchedFeatures = features.filter((f) =>
    f.title.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-start justify-center pt-20 p-4">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col max-h-[70vh]">
        {/* Search bar */}
        <div className="p-3 border-b border-zinc-200 dark:border-zinc-800 flex items-center space-x-2 bg-zinc-50 dark:bg-zinc-950">
          <Search className="w-4 h-4 text-zinc-400 shrink-0" />
          <input
            type="text"
            placeholder="Type a command, page, or search claims & competitors..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
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
            onClick={() => {
              onOpenNewProjectModal();
              onClose();
            }}
            className="w-full flex items-center space-x-2 p-2 rounded-lg text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-950/60 font-medium transition-colors text-left"
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
                      onClick={() => {
                        onSelectTab(item.id);
                        onClose();
                      }}
                      className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors text-left"
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

          {/* Matches in Workspace */}
          {query.trim().length > 1 && (
            <div className="space-y-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
              {matchedEvidence.length > 0 && (
                <div>
                  <p className="px-2 text-[10px] uppercase font-semibold text-zinc-400 tracking-wider mb-1">
                    Evidence Claims ({matchedEvidence.length})
                  </p>
                  {matchedEvidence.slice(0, 3).map((ev) => (
                    <button
                      key={ev.id}
                      onClick={() => {
                        onSelectTab('evidence');
                        onClose();
                      }}
                      className="w-full text-left p-1.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 truncate text-zinc-700 dark:text-zinc-300 block"
                    >
                      [{ev.status}] {ev.claim}
                    </button>
                  ))}
                </div>
              )}

              {matchedCompetitors.length > 0 && (
                <div>
                  <p className="px-2 text-[10px] uppercase font-semibold text-zinc-400 tracking-wider mb-1">
                    Competitors ({matchedCompetitors.length})
                  </p>
                  {matchedCompetitors.slice(0, 3).map((comp) => (
                    <button
                      key={comp.id}
                      onClick={() => {
                        onSelectTab('competitors');
                        onClose();
                      }}
                      className="w-full text-left p-1.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 truncate text-zinc-700 dark:text-zinc-300 block"
                    >
                      {comp.name} — {comp.pricingModel}
                    </button>
                  ))}
                </div>
              )}

              {matchedFeatures.length > 0 && (
                <div>
                  <p className="px-2 text-[10px] uppercase font-semibold text-zinc-400 tracking-wider mb-1">
                    Features ({matchedFeatures.length})
                  </p>
                  {matchedFeatures.slice(0, 3).map((feat) => (
                    <button
                      key={feat.id}
                      onClick={() => {
                        onSelectTab('mvp');
                        onClose();
                      }}
                      className="w-full text-left p-1.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 truncate text-zinc-700 dark:text-zinc-300 block"
                    >
                      [{feat.priority.toUpperCase()}] {feat.title}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
