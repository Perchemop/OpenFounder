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
  Activity,
  AlertTriangle,
} from 'lucide-react';
import type { AIProviderConfig, Project } from '../../types';
import {
  saveStoredSettings,
  exportProjectPackage,
  importProjectPackage,
  deleteProject,
  wipeAllLocalData,
  runWorkspaceDiagnostics,
  db,
} from '../../db';
import { getAIProvider } from '../../ai/providers';
import {
  GEMINI_MODEL_PRESETS,
  OPENAI_MODEL_PRESETS,
  ANTHROPIC_MODEL_PRESETS,
  OLLAMA_MODEL_PRESETS,
  parseFallbackModels,
  formatFallbackModels,
  DEFAULT_GEMINI_MODEL,
} from '../../ai/modelDefaults';

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
      const res = await provider.testConnection?.(localConfig) ?? { success: false, message: 'Test not supported' };
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
    if (confirm("WARNING: This will permanently erase ALL projects and data from this browser's local IndexedDB. Proceed?")) {
      await wipeAllLocalData();
      onProjectUpdated();
      onClose();
    }
  };

  const isGemini =
    localConfig.activeProvider === 'server_gemini' || localConfig.activeProvider === 'direct_gemini';

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-950">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Workspace Settings & Privacy Controls
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex border-b border-zinc-200 dark:border-zinc-800 px-4 bg-zinc-50/50 dark:bg-zinc-950/50 space-x-4 text-xs font-medium">
          {(
            [
              ['ai', Cpu, 'AI Providers'],
              ['privacy', Shield, 'Privacy & Storage'],
              ['data', HardDrive, 'Data & Backup'],
              ['diagnostics', Activity, 'Integrity Audit'],
            ] as const
          ).map(([key, Icon, label]) => (
            <button
              key={key}
              onClick={() => {
                setActiveTab(key);
                if (key === 'diagnostics' && !diagnosticsResult) handleRunDiagnostics();
              }}
              className={`py-2.5 border-b-2 transition-colors flex items-center space-x-1.5 ${
                activeTab === key
                  ? 'border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-100 font-semibold'
                  : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        <div className="p-5 overflow-y-auto flex-1 space-y-4 text-xs">
          {activeTab === 'ai' && (
            <div className="space-y-4">
              <div>
                <label className="block font-medium text-zinc-800 dark:text-zinc-200 mb-1">
                  Active Intelligence Engine
                </label>
                <select
                  value={localConfig.activeProvider}
                  onChange={(e) =>
                    setLocalConfig({ ...localConfig, activeProvider: e.target.value as AIProviderConfig['activeProvider'] })
                  }
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2 text-zinc-900 dark:text-zinc-100"
                >
                  <option value="server_gemini">Server Gemini (Zero-setup server proxy)</option>
                  <option value="direct_gemini">Direct Google Gemini API (Client-side key)</option>
                  <option value="openai">OpenAI / Compatible (Groq, OpenRouter, Mistral…)</option>
                  <option value="anthropic">Anthropic Claude (Direct API)</option>
                  <option value="ollama">Local Ollama (100% Offline & Private)</option>
                  <option value="offline_rules">Offline Rule-Based Co-Founder (Free)</option>
                </select>
              </div>

              {localConfig.activeProvider === 'direct_gemini' && (
                <div>
                  <label className="block font-medium text-zinc-800 dark:text-zinc-200 mb-1">Google Gemini API Key</label>
                  <input
                    type="password"
                    placeholder="AIzaSy..."
                    value={localConfig.directGeminiKey || ''}
                    onChange={(e) => setLocalConfig({ ...localConfig, directGeminiKey: e.target.value })}
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2 font-mono text-zinc-900 dark:text-zinc-100"
                  />
                  <p className="text-[11px] text-zinc-500 mt-1">Stored in browser localStorage only.</p>
                </div>
              )}

              {isGemini && (
                <div className="space-y-3 p-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/30">
                  <div>
                    <label className="block font-medium text-zinc-800 dark:text-zinc-200 mb-1">Primary Gemini Model</label>
                    <select
                      value={localConfig.geminiModel || DEFAULT_GEMINI_MODEL}
                      onChange={(e) => setLocalConfig({ ...localConfig, geminiModel: e.target.value })}
                      className="w-full bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2 text-zinc-900 dark:text-zinc-100"
                    >
                      {GEMINI_MODEL_PRESETS.map((p) => (
                        <option key={p.value} value={p.value}>{p.label}</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      placeholder="Or type a custom model id…"
                      value={localConfig.geminiModel || ''}
                      onChange={(e) => setLocalConfig({ ...localConfig, geminiModel: e.target.value })}
                      className="mt-1.5 w-full bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2 font-mono text-[11px] text-zinc-900 dark:text-zinc-100"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-zinc-800 dark:text-zinc-200 mb-1">
                      Fallback Models <span className="font-normal text-zinc-500">(comma-separated, tried on 429/503)</span>
                    </label>
                    <textarea
                      rows={2}
                      placeholder="gemini-2.0-flash-lite, gemini-flash-latest, gemini-1.5-flash"
                      value={formatFallbackModels(localConfig.geminiFallbackModels)}
                      onChange={(e) =>
                        setLocalConfig({
                          ...localConfig,
                          geminiFallbackModels: parseFallbackModels(e.target.value),
                        })
                      }
                      className="w-full bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2 font-mono text-[11px] text-zinc-900 dark:text-zinc-100"
                    />
                  </div>
                </div>
              )}

              {localConfig.activeProvider === 'openai' && (
                <div className="space-y-3">
                  <div>
                    <label className="block font-medium text-zinc-800 dark:text-zinc-200 mb-1">API Endpoint</label>
                    <input
                      type="text"
                      placeholder="https://api.openai.com/v1"
                      value={localConfig.openaiEndpoint || ''}
                      onChange={(e) => setLocalConfig({ ...localConfig, openaiEndpoint: e.target.value })}
                      className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2 font-mono text-zinc-900 dark:text-zinc-100"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-zinc-800 dark:text-zinc-200 mb-1">API Key</label>
                    <input
                      type="password"
                      placeholder="sk-..."
                      value={localConfig.openaiKey || ''}
                      onChange={(e) => setLocalConfig({ ...localConfig, openaiKey: e.target.value })}
                      className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2 font-mono text-zinc-900 dark:text-zinc-100"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-zinc-800 dark:text-zinc-200 mb-1">Model</label>
                    <input
                      type="text"
                      list="openai-model-presets"
                      placeholder="gpt-4o"
                      value={localConfig.openaiModel || ''}
                      onChange={(e) => setLocalConfig({ ...localConfig, openaiModel: e.target.value })}
                      className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2 font-mono text-zinc-900 dark:text-zinc-100"
                    />
                    <datalist id="openai-model-presets">
                      {OPENAI_MODEL_PRESETS.map((p) => (
                        <option key={p.value} value={p.value}>{p.label}</option>
                      ))}
                    </datalist>
                  </div>
                </div>
              )}

              {localConfig.activeProvider === 'anthropic' && (
                <div className="space-y-3">
                  <div>
                    <label className="block font-medium text-zinc-800 dark:text-zinc-200 mb-1">Anthropic API Key</label>
                    <input
                      type="password"
                      placeholder="sk-ant-..."
                      value={localConfig.anthropicKey || ''}
                      onChange={(e) => setLocalConfig({ ...localConfig, anthropicKey: e.target.value })}
                      className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2 font-mono text-zinc-900 dark:text-zinc-100"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-zinc-800 dark:text-zinc-200 mb-1">Model</label>
                    <input
                      type="text"
                      list="anthropic-model-presets"
                      placeholder="claude-3-5-sonnet-20241022"
                      value={localConfig.anthropicModel || ''}
                      onChange={(e) => setLocalConfig({ ...localConfig, anthropicModel: e.target.value })}
                      className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2 font-mono text-zinc-900 dark:text-zinc-100"
                    />
                    <datalist id="anthropic-model-presets">
                      {ANTHROPIC_MODEL_PRESETS.map((p) => (
                        <option key={p.value} value={p.value}>{p.label}</option>
                      ))}
                    </datalist>
                  </div>
                </div>
              )}

              {localConfig.activeProvider === 'ollama' && (
                <div className="space-y-3">
                  <div>
                    <label className="block font-medium text-zinc-800 dark:text-zinc-200 mb-1">Ollama Endpoint</label>
                    <input
                      type="text"
                      placeholder="http://localhost:11434"
                      value={localConfig.ollamaEndpoint || ''}
                      onChange={(e) => setLocalConfig({ ...localConfig, ollamaEndpoint: e.target.value })}
                      className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2 font-mono text-zinc-900 dark:text-zinc-100"
                    />
                    <p className="text-[11px] text-zinc-500 mt-1">
                      Ensure CORS is enabled: <code>OLLAMA_ORIGINS="*" ollama serve</code>
                    </p>
                  </div>
                  <div>
                    <label className="block font-medium text-zinc-800 dark:text-zinc-200 mb-1">Ollama Model</label>
                    <input
                      type="text"
                      list="ollama-model-presets"
                      placeholder="llama3.2"
                      value={localConfig.ollamaModel || ''}
                      onChange={(e) => setLocalConfig({ ...localConfig, ollamaModel: e.target.value })}
                      className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2 font-mono text-zinc-900 dark:text-zinc-100"
                    />
                    <datalist id="ollama-model-presets">
                      {OLLAMA_MODEL_PRESETS.map((p) => (
                        <option key={p.value} value={p.value}>{p.label}</option>
                      ))}
                    </datalist>
                  </div>
                </div>
              )}

              {localConfig.activeProvider === 'offline_rules' && (
                <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300">
                  <p className="font-semibold mb-1">100% Offline & Free Mode Active</p>
                  <p className="text-[11px]">
                    Deterministic heuristic prompts and assumption audits — no external APIs or token charges.
                  </p>
                </div>
              )}

              {localConfig.activeProvider !== 'offline_rules' && (
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-zinc-200 dark:border-zinc-800">
                  <div>
                    <label className="block font-medium text-zinc-800 dark:text-zinc-200 mb-1">
                      Temperature{' '}
                      <span className="font-normal text-zinc-500">
                        ({(localConfig.temperature ?? 0.7).toFixed(2)})
                      </span>
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={localConfig.temperature ?? 0.7}
                      onChange={(e) =>
                        setLocalConfig({
                          ...localConfig,
                          temperature: parseFloat(e.target.value),
                        })
                      }
                      className="w-full accent-zinc-800 dark:accent-zinc-200"
                    />
                    <div className="flex justify-between text-[10px] text-zinc-500 mt-0.5">
                      <span>Focused</span>
                      <span>Creative</span>
                    </div>
                  </div>
                  <div>
                    <label className="block font-medium text-zinc-800 dark:text-zinc-200 mb-1">
                      Max tokens
                    </label>
                    <input
                      type="number"
                      min={256}
                      max={8192}
                      step={256}
                      value={localConfig.maxTokens ?? 2048}
                      onChange={(e) =>
                        setLocalConfig({
                          ...localConfig,
                          maxTokens: Math.max(256, Math.min(8192, parseInt(e.target.value, 10) || 2048)),
                        })
                      }
                      className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2 font-mono text-zinc-900 dark:text-zinc-100"
                    />
                    <p className="text-[10px] text-zinc-500 mt-0.5">256 – 8192 (default 2048)</p>
                  </div>
                </div>
              )}

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

          {activeTab === 'privacy' && (
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 space-y-2">
                <div className="flex items-center space-x-2 font-semibold text-zinc-900 dark:text-zinc-100">
                  <Shield className="w-4 h-4 text-emerald-500" />
                  <span>Privacy First Principle</span>
                </div>
                <p className="text-[11px] text-zinc-600 dark:text-zinc-300 leading-relaxed">
                  Project data is stored locally in IndexedDB. Nothing is sent to third parties unless you configure an external AI provider.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-zinc-800 dark:text-zinc-200">Local Database Record Count</h4>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(dbStats).map(([table, count]) => (
                    <div key={table} className="p-2 bg-zinc-50 dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 text-center">
                      <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{count}</div>
                      <div className="text-[10px] uppercase font-mono text-zinc-500">{table}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'data' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-zinc-800 dark:text-zinc-200">Export / Import Project</h4>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={handleExportJson}
                    disabled={!currentProject}
                    className="flex items-center space-x-1.5 px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-md font-medium disabled:opacity-40"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export JSON</span>
                  </button>
                  <label className="flex items-center space-x-1.5 px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-md font-medium cursor-pointer">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Import JSON</span>
                    <input type="file" accept=".json" className="hidden" onChange={handleImportJson} />
                  </label>
                </div>
                {importStatus && <p className="text-[11px] text-zinc-600 dark:text-zinc-400">{importStatus}</p>}
              </div>
              <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
                <h4 className="font-semibold text-red-600 dark:text-red-400 flex items-center space-x-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Danger Zone</span>
                </h4>
                <button
                  onClick={handleDeleteProject}
                  disabled={!currentProject}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 hover:bg-red-100 rounded-md font-medium disabled:opacity-40"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Current Project</span>
                </button>
                <button
                  onClick={handleWipeAll}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 hover:bg-red-100 rounded-md font-medium"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Wipe All Local Data</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'diagnostics' && (
            <div className="space-y-4">
              <button
                onClick={handleRunDiagnostics}
                disabled={runningDiagnostics || !currentProject}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 rounded-md font-medium disabled:opacity-40"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${runningDiagnostics ? 'animate-spin' : ''}`} />
                <span>Run Diagnostics</span>
              </button>
              {diagnosticsResult && (
                <div className="space-y-3">
                  <div
                    className={`p-3 rounded-lg border ${
                      diagnosticsResult.integrityOk
                        ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800'
                        : 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800'
                    }`}
                  >
                    <p className="font-semibold">
                      {diagnosticsResult.integrityOk ? 'Integrity OK' : 'Issues detected'}
                    </p>
                    {diagnosticsResult.issues.length > 0 && (
                      <ul className="mt-1 list-disc list-inside text-[11px]">
                        {diagnosticsResult.issues.map((issue, i) => (
                          <li key={i}>{issue}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {Object.entries(diagnosticsResult.stats).map(([k, v]) => (
                      <div key={k} className="p-2 bg-zinc-50 dark:bg-zinc-800/60 rounded-lg text-[11px]">
                        <span className="text-zinc-500 font-mono">{k}: </span>
                        <span className="font-bold">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-950">
          <span className="text-[11px] text-zinc-500">OpenFounder v1.0.0 (MIT FOSS)</span>
          <div className="flex items-center space-x-2">
            <button onClick={onClose} className="px-3 py-1.5 text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 rounded-lg">
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
