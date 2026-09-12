import React, { useState, useEffect } from 'react';
import {
  X,
  Cpu,
  Shield,
  HardDrive,
  Download,
  Upload,
  Trash2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Sliders,
  Activity,
  AlertTriangle,
} from 'lucide-react';
import type { AIProviderConfig, Project } from '../../types';
import {
  getStoredSettings,
  saveStoredSettings,
  exportProjectPackage,
  importProjectPackage,
  deleteProject,
  wipeAllLocalData,
  runWorkspaceDiagnostics,
  db,
} from '../../db';
import { getAIProvider } from '../../ai/providers';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProject: Project | null;
  onProjectUpdated: () => void;
  config: AIProviderConfig;
  onConfigUpdated: (config: AIProviderConfig) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  currentProject,
  onProjectUpdated,
  config,
  onConfigUpdated,
}) => {
  const [activeTab, setActiveTab] = useState<'ai' | 'privacy' | 'data' | 'diagnostics'>('ai');
  const [localConfig, setLocalConfig] = useState<AIProviderConfig>(config);
  const [testStatus, setTestStatus] = useState<{ testing: boolean; result?: { success: boolean; message: string } }>({
    testing: false,
  });
  const [dbStats, setDbStats] = useState<{ [key: string]: number }>({});
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [diagnosticsResult, setDiagnosticsResult] = useState<{
    integrityOk: boolean;
    issues: string[];
    stats: Record<string, number>;
  } | null>(null);
  const [runningDiagnostics, setRunningDiagnostics] = useState(false);

  useEffect(() => {
    setLocalConfig(config);
    loadDbStats();
  }, [isOpen, config]);

  const handleRunDiagnostics = async () => {
    if (!currentProject) return;
    setRunningDiagnostics(true);
    try {
      const res = await runWorkspaceDiagnostics(currentProject.id);
      setDiagnosticsResult(res);
    } catch (err: any) {
      setDiagnosticsResult({
        integrityOk: false,
        issues: [err.message || 'Diagnostics check failed'],
        stats: {},
      });
    } finally {
      setRunningDiagnostics(false);
    }
  };

  const loadDbStats = async () => {
    try {
      const [projCount, evCount, resCount, compCount, expCount, featCount] = await Promise.all([
        db.projects.count(),
        db.evidence.count(),
        db.research.count(),
        db.competitors.count(),
        db.experiments.count(),
        db.features.count(),
      ]);
      setDbStats({
        projects: projCount,
        evidence: evCount,
        research: resCount,
        competitors: compCount,
        experiments: expCount,
        features: featCount,
      });
    } catch {
      // ignore
    }
  };

  if (!isOpen) return null;

  const handleSaveSettings = () => {
    saveStoredSettings(localConfig);
    onConfigUpdated(localConfig);
    onClose();
  };

  const handleTestConnection = async () => {
    setTestStatus({ testing: true });
    try {
      const provider = getAIProvider(localConfig.activeProvider);
      const res = await provider.testConnection(localConfig);
      setTestStatus({ testing: false, result: res });
    } catch (e: any) {
      setTestStatus({
        testing: false,
        result: { success: false, message: e.message || 'Connection test failed.' },
      });
    }
  };

  const handleExportJson = async () => {
    if (!currentProject) return;
    try {
      const pkg = await exportProjectPackage(currentProject.id);
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(pkg, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `${currentProject.name.toLowerCase().replace(/\s+/g, '_')}_backup.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (e: any) {
      alert(`Export failed: ${e.message}`);
    }
  };

  const handleImportJson = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const pkg = JSON.parse(text);
      await importProjectPackage(pkg);
      setImportStatus(`Successfully imported project: "${pkg.project.name}"`);
      await loadDbStats();
      onProjectUpdated();
    } catch (err: any) {
      setImportStatus(`Import failed: ${err.message}`);
    }
  };

  const handleDeleteProject = async () => {
    if (!currentProject) return;
    if (confirm(`Are you sure you want to delete "${currentProject.name}"? This action cannot be undone.`)) {
      await deleteProject(currentProject.id);
      onProjectUpdated();
      onClose();
    }
  };

  const handleWipeAll = async () => {
    if (confirm('WARNING: This will permanently erase ALL projects and data from this browser\'s local IndexedDB. Proceed?')) {
      await wipeAllLocalData();
      onProjectUpdated();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-950">
          <div className="flex items-center space-x-2">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Workspace Settings & Privacy Controls
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab selector */}
        <div className="flex border-b border-zinc-200 dark:border-zinc-800 px-4 bg-zinc-50/50 dark:bg-zinc-950/50 space-x-4 text-xs font-medium">
          <button
            onClick={() => setActiveTab('ai')}
            className={`py-2.5 border-b-2 transition-colors flex items-center space-x-1.5 ${
              activeTab === 'ai'
                ? 'border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-100 font-semibold'
                : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>AI Providers</span>
          </button>
          <button
            onClick={() => setActiveTab('privacy')}
            className={`py-2.5 border-b-2 transition-colors flex items-center space-x-1.5 ${
              activeTab === 'privacy'
                ? 'border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-100 font-semibold'
                : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Privacy & Storage</span>
          </button>
          <button
            onClick={() => setActiveTab('data')}
            className={`py-2.5 border-b-2 transition-colors flex items-center space-x-1.5 ${
              activeTab === 'data'
                ? 'border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-100 font-semibold'
                : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            <HardDrive className="w-3.5 h-3.5" />
            <span>Data & Backup</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('diagnostics');
              if (!diagnosticsResult) {
                handleRunDiagnostics();
              }
            }}
            className={`py-2.5 border-b-2 transition-colors flex items-center space-x-1.5 ${
              activeTab === 'diagnostics'
                ? 'border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-100 font-semibold'
                : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Integrity Audit</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4 text-xs">
          {/* TAB: AI PROVIDERS */}
          {activeTab === 'ai' && (
            <div className="space-y-4">
              <div>
                <label className="block font-medium text-zinc-800 dark:text-zinc-200 mb-1">
                  Active Intelligence Engine
                </label>
                <select
                  value={localConfig.activeProvider}
                  onChange={(e) =>
                    setLocalConfig({ ...localConfig, activeProvider: e.target.value as any })
                  }
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2 text-zinc-900 dark:text-zinc-100"
                >
                  <option value="server_gemini">Server Gemini (Zero-setup server proxy with GEMINI_API_KEY)</option>
                  <option value="direct_gemini">Direct Google Gemini API (Client-side key)</option>
                  <option value="openai">OpenAI / Compatible (Groq, OpenRouter, Mistral, Together)</option>
                  <option value="ollama">Local Ollama (localhost:11434 - 100% Offline & Private)</option>
                  <option value="offline_rules">Offline Rule-Based Co-Founder (Free, No API key needed)</option>
                </select>
              </div>

              {localConfig.activeProvider === 'direct_gemini' && (
                <div>
                  <label className="block font-medium text-zinc-800 dark:text-zinc-200 mb-1">
                    Google Gemini API Key
                  </label>
                  <input
                    type="password"
                    placeholder="AIzaSy..."
                    value={localConfig.directGeminiKey || ''}
                    onChange={(e) =>
                      setLocalConfig({ ...localConfig, directGeminiKey: e.target.value })
                    }
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2 font-mono text-zinc-900 dark:text-zinc-100"
                  />
                  <p className="text-[11px] text-zinc-500 mt-1">
                    Key is stored in your browser's private localStorage and never sent anywhere else.
                  </p>
                </div>
              )}

              {localConfig.activeProvider === 'openai' && (
                <div className="space-y-3">
                  <div>
                    <label className="block font-medium text-zinc-800 dark:text-zinc-200 mb-1">
                      API Endpoint
                    </label>
                    <input
                      type="text"
                      placeholder="https://api.openai.com/v1"
                      value={localConfig.openaiEndpoint || ''}
                      onChange={(e) =>
                        setLocalConfig({ ...localConfig, openaiEndpoint: e.target.value })
                      }
                      className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2 font-mono text-zinc-900 dark:text-zinc-100"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-zinc-800 dark:text-zinc-200 mb-1">
                      API Key
                    </label>
                    <input
                      type="password"
                      placeholder="sk-..."
                      value={localConfig.openaiKey || ''}
                      onChange={(e) =>
                        setLocalConfig({ ...localConfig, openaiKey: e.target.value })
                      }
                      className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2 font-mono text-zinc-900 dark:text-zinc-100"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-zinc-800 dark:text-zinc-200 mb-1">
                      Model Name
                    </label>
                    <input
                      type="text"
                      placeholder="gpt-4o-mini"
                      value={localConfig.openaiModel || ''}
                      onChange={(e) =>
                        setLocalConfig({ ...localConfig, openaiModel: e.target.value })
                      }
                      className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2 font-mono text-zinc-900 dark:text-zinc-100"
                    />
                  </div>
                </div>
              )}

              {localConfig.activeProvider === 'ollama' && (
                <div className="space-y-3">
                  <div>
                    <label className="block font-medium text-zinc-800 dark:text-zinc-200 mb-1">
                      Ollama Endpoint
                    </label>
                    <input
                      type="text"
                      placeholder="http://localhost:11434"
                      value={localConfig.ollamaEndpoint || ''}
                      onChange={(e) =>
                        setLocalConfig({ ...localConfig, ollamaEndpoint: e.target.value })
                      }
                      className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2 font-mono text-zinc-900 dark:text-zinc-100"
                    />
                    <p className="text-[11px] text-zinc-500 mt-1">
                      Ensure Ollama is running with CORS enabled (e.g. <code>OLLAMA_ORIGINS="*" ollama serve</code>).
                    </p>
                  </div>
                  <div>
                    <label className="block font-medium text-zinc-800 dark:text-zinc-200 mb-1">
                      Ollama Model
                    </label>
                    <input
                      type="text"
                      placeholder="llama3.2"
                      value={localConfig.ollamaModel || ''}
                      onChange={(e) =>
                        setLocalConfig({ ...localConfig, ollamaModel: e.target.value })
                      }
                      className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2 font-mono text-zinc-900 dark:text-zinc-100"
                    />
                  </div>
                </div>
              )}

              {localConfig.activeProvider === 'offline_rules' && (
                <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300">
                  <p className="font-semibold mb-1">100% Offline & Free Mode Active</p>
                  <p className="text-[11px]">
                    OpenFounder uses deterministic heuristic prompts and assumption audits without calling external APIs or incurring token charges.
                  </p>
                </div>
              )}

              {/* Connection Tester */}
              <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={testStatus.testing}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-md font-medium text-zinc-800 dark:text-zinc-200 transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${testStatus.testing ? 'animate-spin' : ''}`} />
                  <span>Test Provider Connection</span>
                </button>

                {testStatus.result && (
                  <div
                    className={`text-[11px] flex items-center space-x-1 ${
                      testStatus.result.success
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-amber-600 dark:text-amber-400'
                    }`}
                  >
                    {testStatus.result.success ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : (
                      <AlertCircle className="w-3.5 h-3.5" />
                    )}
                    <span>{testStatus.result.message}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: PRIVACY & STORAGE */}
          {activeTab === 'privacy' && (
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 space-y-2">
                <div className="flex items-center space-x-2 font-semibold text-zinc-900 dark:text-zinc-100">
                  <Shield className="w-4 h-4 text-emerald-500" />
                  <span>Privacy First Principle</span>
                </div>
                <p className="text-[11px] text-zinc-600 dark:text-zinc-300 leading-relaxed">
                  Your project data, assumptions, customer transcripts, and roadmaps are stored locally inside this browser using <strong>IndexedDB</strong>. No information is transmitted to third-party servers unless you configure an external AI provider.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-zinc-800 dark:text-zinc-200">
                  Local Database Record Count
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(dbStats).map(([table, count]) => (
                    <div
                      key={table}
                      className="p-2 bg-zinc-50 dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 text-center"
                    >
                      <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                        {count}
                      </div>
                      <div className="text-[10px] uppercase font-mono text-zinc-500">
                        {table}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-600 dark:text-zinc-400 space-y-1">
                <p><strong>Telemetry:</strong> 0% (Disabled completely)</p>
                <p><strong>Third-Party Analytics:</strong> None (No Google Analytics, Meta Pixel, or trackers)</p>
                <p><strong>Vendor Lock-in:</strong> None (Export full JSON at any time)</p>
              </div>
            </div>
          )}

          {/* TAB: DATA & BACKUP */}
          {activeTab === 'data' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-zinc-800 dark:text-zinc-200">
                  Export / Backup
                </h4>
                <p className="text-[11px] text-zinc-500">
                  Download the current project workspace as an open JSON package containing all evidence, competitors, canvas maps, and roadmap items.
                </p>
                <button
                  type="button"
                  onClick={handleExportJson}
                  disabled={!currentProject}
                  className="flex items-center space-x-1.5 px-3 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg font-medium hover:opacity-90 disabled:opacity-40 transition-opacity"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export "{currentProject?.name || 'Project'}" as JSON</span>
                </button>
              </div>

              <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
                <h4 className="font-semibold text-zinc-800 dark:text-zinc-200">
                  Import Project
                </h4>
                <p className="text-[11px] text-zinc-500">
                  Restore or import a previously exported OpenFounder JSON backup file.
                </p>
                <label className="inline-flex items-center space-x-1.5 px-3 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-lg font-medium cursor-pointer transition-colors">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Select JSON File to Import</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportJson}
                    className="hidden"
                  />
                </label>
                {importStatus && (
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400">
                    {importStatus}
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
                <h4 className="font-semibold text-rose-600 dark:text-rose-400">
                  Danger Zone
                </h4>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={handleDeleteProject}
                    disabled={!currentProject}
                    className="flex items-center space-x-1.5 px-3 py-1.5 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800 rounded-lg hover:bg-rose-100 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Current Project</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleWipeAll}
                    className="flex items-center space-x-1.5 px-3 py-1.5 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Wipe All Local Storage</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB: INTEGRITY & DIAGNOSTICS */}
          {activeTab === 'diagnostics' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-zinc-800 dark:text-zinc-200">
                    Workspace Structural Health & Diagnostics
                  </h4>
                  <p className="text-[11px] text-zinc-500">
                    Automated audit for broken evidence references, orphaned canvas nodes/edges, and database integrity.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleRunDiagnostics}
                  disabled={runningDiagnostics || !currentProject}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg text-xs font-medium hover:opacity-90 disabled:opacity-40 transition-opacity"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${runningDiagnostics ? 'animate-spin' : ''}`} />
                  <span>{runningDiagnostics ? 'Auditing...' : 'Run Diagnostics'}</span>
                </button>
              </div>

              {diagnosticsResult ? (
                <div className="space-y-3">
                  <div
                    className={`p-3.5 rounded-xl border flex items-start space-x-3 ${
                      diagnosticsResult.integrityOk
                        ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                        : 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200'
                    }`}
                  >
                    {diagnosticsResult.integrityOk ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                    )}
                    <div className="space-y-1">
                      <div className="font-semibold text-xs">
                        {diagnosticsResult.integrityOk
                          ? 'Workspace Integrity: Healthy (0 Issues Found)'
                          : `Integrity Warnings: ${diagnosticsResult.issues.length} Issues Detected`}
                      </div>
                      <p className="text-[11px] opacity-90">
                        {diagnosticsResult.integrityOk
                          ? 'All canvas graph connections, experiment links, and evidence relationships are valid.'
                          : 'The following relational discrepancies were found:'}
                      </p>
                      {diagnosticsResult.issues.length > 0 && (
                        <ul className="list-disc pl-4 space-y-0.5 text-[11px] mt-1.5">
                          {diagnosticsResult.issues.map((issue, idx) => (
                            <li key={idx}>{issue}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>

                  {/* Stats table */}
                  <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
                    <div className="p-2.5 bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 font-semibold text-[11px] text-zinc-700 dark:text-zinc-300">
                      Project Database Record Counts
                    </div>
                    <div className="p-3 grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                      {Object.entries(diagnosticsResult.stats).map(([k, v]) => (
                        <div key={k} className="p-2 bg-zinc-50 dark:bg-zinc-800/60 rounded-lg">
                          <span className="text-zinc-500 font-mono capitalize">
                            {k.replace('Count', '')}:{' '}
                          </span>
                          <span className="font-bold text-zinc-800 dark:text-zinc-200">{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl space-y-2">
                  <Activity className="w-6 h-6 text-zinc-400 mx-auto" />
                  <p className="text-zinc-500 text-xs">
                    Click "Run Diagnostics" to verify workspace relational consistency.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-950">
          <span className="text-[11px] text-zinc-500">
            OpenFounder v1.0.0 (MIT FOSS)
          </span>
          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveSettings}
              className="px-4 py-2 text-xs font-semibold bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg hover:opacity-90 transition-opacity"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
