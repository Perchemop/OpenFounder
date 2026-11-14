/**
 * ImportDialog — standalone, accessible project-package importer
 * (audit findings DATA-03 + DATA-04, remediation Phase 4).
 *
 * It parses a `.json` export, validates it with `validateExportPackage`, and —
 * crucially — detects an id collision *before* anything is written, so the user
 * chooses between replacing the existing project or importing a copy with a new
 * id instead of silently destroying newer data.
 *
 * WIRING FOLLOW-UP (intentionally not done here): this dialog is not yet mounted
 * by `SettingsModal`. `SettingsModal` owns its data buttons and is edited by a
 * separate change, so it should be rewired to open this dialog and pass the
 * confirmed choice through to `importProjectPackage`:
 *
 *   const [importOpen, setImportOpen] = useState(false);
 *   ...
 *   <ImportDialog
 *     isOpen={importOpen}
 *     onClose={() => setImportOpen(false)}
 *     onCancel={() => setImportOpen(false)}
 *     onImport={async (pkg, { remap, newName, overwrite }) => {
 *       await importProjectPackage(pkg, {
 *         importAsNew: remap,
 *         customNewName: newName,
 *         overwrite,
 *       });
 *       await loadDbStats();
 *       onProjectUpdated();
 *     }}
 *   />
 *
 * `onImport` is declared as returning `void`, but because a function returning
 * `Promise<void>` is assignable to a `void`-returning prop, the handler may be
 * async. The dialog closes as soon as the choice is confirmed; the handler is
 * responsible for surfacing its own success/error feedback (for example a toast).
 */
import React, { useEffect, useId, useRef, useState } from 'react';
import { AlertTriangle, FileJson, Upload, X } from 'lucide-react';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { checkImportCollision, validateExportPackage } from '../../db';
import type { ExportPackage, Project } from '../../types';

/** The user's confirmed choice, handed back through `onImport`. */
export interface ImportDialogChoice {
  /** When true, import under a freshly generated project id (an independent copy). */
  remap: boolean;
  /** Name for the copy — only meaningful when `remap` is true. */
  newName?: string;
  /**
   * When true, deliberately replace the project that already owns the package's
   * id. Passed through to `importProjectPackage({ overwrite: true })`. This is
   * only set for the explicit "Replace" action in the collision flow.
   */
  overwrite?: boolean;
}

export interface ImportDialogProps {
  isOpen: boolean;
  /** Dismiss the dialog (Escape, the close button, backdrop, or after confirming). */
  onClose: () => void;
  /** Called with the validated package and the user's choice when they confirm. */
  onImport: (pkg: ExportPackage, options: ImportDialogChoice) => void;
  /** Called when the user explicitly cancels; falls back to `onClose` when omitted. */
  onCancel?: () => void;
}

type Stage = 'empty' | 'ready' | 'collision';

export const ImportDialog: React.FC<ImportDialogProps> = ({
  isOpen,
  onClose,
  onImport,
  onCancel,
}) => {
  const dialogRef = useFocusTrap<HTMLDivElement>(isOpen, onClose);
  const titleId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [stage, setStage] = useState<Stage>('empty');
  const [fileName, setFileName] = useState<string | null>(null);
  const [pkg, setPkg] = useState<ExportPackage | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [existingProject, setExistingProject] = useState<Project | null>(null);
  const [copyName, setCopyName] = useState('');
  const [checking, setChecking] = useState(false);

  // Reset the whole flow whenever the dialog opens or closes, so a previous
  // file never leaks into a new import.
  useEffect(() => {
    setStage('empty');
    setFileName(null);
    setPkg(null);
    setParseError(null);
    setValidationErrors([]);
    setExistingProject(null);
    setCopyName('');
    setChecking(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [isOpen]);

  const handleCancel = () => {
    onCancel?.();
    onClose();
  };

  const handleFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setParseError(null);
    setValidationErrors([]);
    setExistingProject(null);
    setPkg(null);
    setStage('empty');

    let raw: unknown;
    try {
      raw = JSON.parse(await file.text());
    } catch {
      setParseError('That file is not valid JSON. Choose an exported OpenFounder package (.json).');
      return;
    }

    const result = validateExportPackage(raw);
    if (!result.valid || !result.data) {
      setValidationErrors(result.errors ?? ['Schema validation failed.']);
      return;
    }

    const validated = result.data;
    setPkg(validated);
    setCopyName(`${validated.project.name} (Copy)`);

    // Collision detection happens before any write. `checkImportCollision`
    // reports the id collision and hands back the existing project so the user
    // can see exactly what they would be replacing.
    setChecking(true);
    try {
      const collision = await checkImportCollision(validated);
      if (collision.hasIdCollision && collision.existingProject) {
        setExistingProject(collision.existingProject);
        setStage('collision');
      } else {
        setStage('ready');
      }
    } finally {
      setChecking(false);
    }
  };

  const confirm = (choice: ImportDialogChoice) => {
    if (!pkg) return;
    onImport(pkg, choice);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      ref={dialogRef}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950">
          <h2
            id={titleId}
            className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center space-x-2"
          >
            <FileJson className="w-4 h-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
            <span>Import project package</span>
          </h2>
          <button
            type="button"
            onClick={handleCancel}
            aria-label="Close import dialog"
            className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4 overflow-y-auto flex-1 text-xs">
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
            Choose an exported OpenFounder <code>.json</code> package. The file is validated before
            anything is written, and you are asked before an existing project is replaced.
          </p>

          <label className="block">
            <span className="block text-[10px] uppercase tracking-wider text-zinc-500 mb-1">
              Package file
            </span>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFile}
              aria-label="Choose an OpenFounder package file"
              className="block w-full text-xs text-zinc-700 dark:text-zinc-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border file:border-zinc-200 dark:file:border-zinc-700 file:bg-zinc-100 dark:file:bg-zinc-800 file:text-xs file:font-semibold file:text-zinc-700 dark:file:text-zinc-200 hover:file:bg-zinc-200 dark:hover:file:bg-zinc-700"
            />
          </label>

          {fileName && (
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              Selected:{' '}
              <span className="font-medium text-zinc-700 dark:text-zinc-300">{fileName}</span>
            </p>
          )}

          {checking && (
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              Checking for an existing project…
            </p>
          )}

          {parseError && (
            <div
              role="alert"
              className="flex items-start space-x-2 rounded-lg border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/50 p-3 text-[11px] text-rose-700 dark:text-rose-300"
            >
              <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" aria-hidden="true" />
              <span>{parseError}</span>
            </div>
          )}

          {validationErrors.length > 0 && (
            <div
              role="alert"
              className="rounded-lg border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/50 p-3 text-[11px] text-rose-700 dark:text-rose-300"
            >
              <p className="font-semibold mb-1 flex items-center space-x-1.5">
                <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
                <span>This package cannot be imported</span>
              </p>
              <ul className="list-disc list-inside space-y-0.5 max-h-40 overflow-y-auto">
                {validationErrors.map((error) => (
                  <li key={error}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          {stage === 'ready' && pkg && (
            <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 p-3">
              <p className="font-semibold text-zinc-800 dark:text-zinc-200">{pkg.project.name}</p>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                Exported {new Date(pkg.exportedAt).toLocaleString()} · {pkg.evidence.length} evidence ·{' '}
                {pkg.competitors.length} competitors
              </p>
            </div>
          )}

          {stage === 'collision' && existingProject && pkg && (
            <div className="space-y-3">
              <div className="rounded-lg border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/50 p-3 text-[11px] text-amber-800 dark:text-amber-300">
                <p className="font-semibold flex items-center space-x-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>A project with this id already exists</span>
                </p>
                <p className="mt-1">
                  Replacing it will overwrite{' '}
                  <span className="font-semibold">&ldquo;{existingProject.name}&rdquo;</span> and all of
                  its data with the contents of this package. To keep both, import as a copy instead.
                </p>
              </div>

              <label className="block">
                <span className="block text-[10px] uppercase tracking-wider text-zinc-500 mb-1">
                  Name for the copy
                </span>
                <input
                  type="text"
                  value={copyName}
                  onChange={(event) => setCopyName(event.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <span className="block mt-1 text-[10px] text-zinc-500">
                  Only used when you choose &ldquo;Import as copy&rdquo;.
                </span>
              </label>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-2 p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950">
          <button
            type="button"
            onClick={handleCancel}
            className="px-3 py-2 rounded-lg text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            Cancel
          </button>

          {stage === 'ready' && (
            <button
              type="button"
              onClick={() => confirm({ remap: false })}
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-semibold hover:opacity-90"
            >
              <Upload className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Import project</span>
            </button>
          )}

          {stage === 'collision' && (
            <>
              <button
                type="button"
                onClick={() =>
                  confirm({
                    remap: true,
                    newName: copyName.trim() || `${pkg?.project.name ?? 'Project'} (Copy)`,
                  })
                }
                className="px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                Import as copy
              </button>
              <button
                type="button"
                onClick={() => confirm({ remap: false, overwrite: true })}
                className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold"
              >
                <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Replace</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImportDialog;
