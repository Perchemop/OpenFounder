import React from 'react';
import {
  LayoutDashboard,
  Layers,
  Scale,
  Search,
  Users,
  FlaskConical,
  MessageSquareQuote,
  Network,
  ListTodo,
  Milestone,
  Receipt,
  Megaphone,
  Globe,
  FileText,
  ShieldAlert,
  Shield,
  Target,
  Users2,
} from 'lucide-react';

export type WorkspaceTab =
  | 'dashboard'
  | 'phases'
  | 'evidence'
  | 'research'
  | 'competitors'
  | 'validation'
  | 'interviews'
  | 'canvas'
  | 'mvp'
  | 'roadmap'
  | 'goals'
  | 'advisors'
  | 'team'
  | 'business'
  | 'gtm'
  | 'landing'
  | 'documents'
  | 'risks';

interface SidebarProps {
  activeTab: WorkspaceTab;
  onSelectTab: (tab: WorkspaceTab) => void;
  unverifiedCount?: number;
  activeExperimentCount?: number;
  openRisksCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  unverifiedCount = 0,
  activeExperimentCount = 0,
  openRisksCount = 0,
}) => {
  const mainNav = [
    { id: 'dashboard' as WorkspaceTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'phases' as WorkspaceTab, label: 'Founder Phases', icon: Layers, badge: '10 Steps' },
  ];

  const workspaceNav = [
    {
      id: 'evidence' as WorkspaceTab,
      label: 'Evidence Ledger',
      icon: Scale,
      alertBadge: unverifiedCount > 0 ? `${unverifiedCount} unverified` : undefined,
    },
    {
      id: 'risks' as WorkspaceTab,
      label: 'Risk Register',
      icon: ShieldAlert,
      alertBadge: openRisksCount > 0 ? `${openRisksCount} open` : undefined,
    },
    { id: 'research' as WorkspaceTab, label: 'Research & Sources', icon: Search },
    { id: 'competitors' as WorkspaceTab, label: 'Competitor Matrix', icon: Users },
    {
      id: 'validation' as WorkspaceTab,
      label: 'Validation & Tests',
      icon: FlaskConical,
      activeBadge: activeExperimentCount > 0 ? `${activeExperimentCount} live` : undefined,
    },
    { id: 'interviews' as WorkspaceTab, label: 'Customer Discovery', icon: MessageSquareQuote },
    { id: 'canvas' as WorkspaceTab, label: 'Visual Canvas', icon: Network },
    { id: 'mvp' as WorkspaceTab, label: 'MVP Scope & MoSCoW', icon: ListTodo },
    { id: 'roadmap' as WorkspaceTab, label: 'Visual Roadmap', icon: Milestone },
    { id: 'goals' as WorkspaceTab, label: 'Goals & Scorecard', icon: Target },
    { id: 'advisors' as WorkspaceTab, label: 'Advisors & Mentors', icon: Users2 },
    { id: 'team' as WorkspaceTab, label: 'Team & Skills', icon: Users },
    { id: 'business' as WorkspaceTab, label: 'Business Model', icon: Receipt },
    { id: 'gtm' as WorkspaceTab, label: 'Go-To-Market Plan', icon: Megaphone },
    { id: 'landing' as WorkspaceTab, label: 'Landing Page Studio', icon: Globe },
    { id: 'documents' as WorkspaceTab, label: 'Reports & Exports', icon: FileText },
  ];

  return (
    <aside className="w-64 border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-950/70 p-3 flex flex-col justify-between shrink-0 select-none overflow-y-auto">
      <div className="space-y-6">
        {/* Core Navigation */}
        <div className="space-y-1">
          <p className="px-2.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1.5">
            Overview
          </p>
          {mainNav.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200/60 dark:hover:bg-zinc-800/60'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                      isActive
                        ? 'bg-zinc-700 text-zinc-200 dark:bg-zinc-300 dark:text-zinc-800'
                        : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Workspaces */}
        <div className="space-y-1">
          <p className="px-2.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1.5">
            Workspaces
          </p>
          {workspaceNav.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors group ${
                  isActive
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200/60 dark:hover:bg-zinc-800/60'
                }`}
              >
                <div className="flex items-center space-x-2.5 min-w-0">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.alertBadge && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded font-medium bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 shrink-0">
                    {item.alertBadge}
                  </span>
                )}
                {item.activeBadge && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded font-medium bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 shrink-0">
                    {item.activeBadge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Local Privacy & Storage Footer */}
      <div className="pt-4 mt-4 border-t border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center space-x-2 text-[11px] text-zinc-500 dark:text-zinc-400 px-2">
          <Shield className="w-3.5 h-3.5 text-emerald-500 shrink-0" aria-hidden="true" />
          <span>Local-first · 100% in-browser IndexedDB</span>
        </div>
      </div>
    </aside>
  );
};
