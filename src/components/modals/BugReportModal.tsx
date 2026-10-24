import React, { useState } from 'react';
import { X, ExternalLink, Copy, Check, Bug } from 'lucide-react';
import {
  buildBugReport,
  buildIssueUrl,
  type BugReportInput,
  type BugReportPayload,
} from '../../bugReport';
import { useFocusTrap } from '../../hooks/useFocusTrap';

export const GITHUB_REPOSITORY = 'Perchemop/OpenFounder';
export const BUG_REPORT_LABELS = ['bug', 'user-report'];

export interface BugReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  input: Omit<BugReportInput, 'userNotes' | 'includeDiagnostics'>;
}

/**
 * Preview-then-send bug report. The app never holds a GitHub token: the user
 * opens the pre-filled issue URL in their own session, so what leaves the
 * machine is visible and reviewable first.
 */
export const BugReportModal: React.FC<BugReportModalProps> = ({ isOpen, onClose, input }) => {
  const dialogRef = useFocusTrap<HTMLDivElement>(isOpen, onClose);
  const [notes, setNotes] = useState('');
  const [includeDiagnostics, setIncludeDiagnostics] = useState(true);
  const [copied, setCopied] = useState(false);

  const payload: BugReportPayload = buildBugReport({
    ...input,
    userNotes: notes,
    includeDiagnostics,
  });
  const issueUrl = buildIssueUrl(payload, GITHUB_REPOSITORY, BUG_REPORT_LABELS);

  const copyPayload = async () => {
    try {
      await navigator.clipboard.writeText(`${payload.title}\n\n${payload.body}`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={dialogRef}
      tabIndex={-1}
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-start justify-center p-4 pt-16 overflow-y-auto"
    >
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl max-w-2xl w-full shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center space-x-2">
            <Bug className="w-4 h-4 text-amber-500" />
            <span>Report a problem</span>
          </h2>
          <button onClick={onClose} className="p-1 text-zinc-400 hover:text-zinc-600" aria-label="Close">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
            Review exactly what would be published. Nothing is sent automatically: the button opens
            GitHub in your own session, so you stay in control and no token is stored by this app.
          </p>

          <label className="block">
            <span className="block text-[10px] uppercase tracking-wider text-zinc-500 mb-1">
              What were you doing? (optional)
            </span>
            <textarea
              rows={3}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="I was promoting a claim in the evidence ledger when…"
              className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded px-2 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </label>

          <label className="flex items-start space-x-2 text-[11px] text-zinc-600 dark:text-zinc-400">
            <input
              type="checkbox"
              checked={includeDiagnostics}
              onChange={(event) => setIncludeDiagnostics(event.target.checked)}
              className="mt-0.5"
            />
            <span>
              Include environment details (app version, browser, language, timezone). Your claims,
              notes, and project content are never included.
            </span>
          </label>

          <div>
            <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">Preview</p>
            <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 p-3 max-h-72 overflow-y-auto">
              <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 break-words">
                {payload.title}
              </p>
              <pre className="mt-2 text-[10px] font-mono whitespace-pre-wrap break-words text-zinc-600 dark:text-zinc-400">
                {payload.body}
              </pre>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 border-t border-zinc-200 dark:border-zinc-800">
          <button
            onClick={copyPayload}
            className="inline-flex items-center space-x-1.5 text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy instead'}</span>
          </button>
          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-3 py-2 rounded-lg text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              Cancel
            </button>
            <a
              href={issueUrl}
              target="_blank"
              rel="noreferrer noopener"
              onClick={onClose}
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-semibold hover:opacity-90"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open GitHub issue</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
