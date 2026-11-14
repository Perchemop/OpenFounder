import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useFocusTrap } from '../../hooks/useFocusTrap';

export interface ConfirmDialogProps {
  isOpen: boolean;
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export interface ConfirmOptions {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
}

/**
 * Accessible confirmation dialog. Controlled via props; use the `useConfirm`
 * hook for a promise-based API that mirrors `window.confirm`.
 */
export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title = 'Confirm',
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = false,
  onConfirm,
  onCancel,
}) => {
  const dialogRef = useFocusTrap<HTMLDivElement>(isOpen, onCancel);

  if (!isOpen) return null;

  return (
    <div
      ref={dialogRef}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-start justify-center p-4 pt-16 overflow-y-auto"
    >
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl max-w-md w-full shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800">
          <h2
            id="confirm-dialog-title"
            className="text-sm font-semibold text-zinc-900 dark:text-zinc-100"
          >
            {title}
          </h2>
          <button
            onClick={onCancel}
            className="p-1 text-zinc-400 hover:text-zinc-600"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4">
          <p className="text-xs text-zinc-700 dark:text-zinc-300">{message}</p>
        </div>

        <div className="flex items-center justify-end gap-2 p-4 border-t border-zinc-200 dark:border-zinc-800">
          <button
            onClick={onCancel}
            className="px-3 py-1.5 rounded-lg text-xs text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold text-white ${
              destructive
                ? 'bg-rose-600 hover:bg-rose-700'
                : 'bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 hover:opacity-90'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export function useConfirm(): {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  dialog: React.ReactNode;
} {
  const [state, setState] = useState<{
    open: boolean;
    options: ConfirmOptions;
    resolve: (value: boolean) => void;
  } | null>(null);

  const confirm = (options: ConfirmOptions): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
      setState({ open: true, options, resolve });
    });
  };

  const handleConfirm = () => {
    state?.resolve(true);
    setState(null);
  };

  const handleCancel = () => {
    state?.resolve(false);
    setState(null);
  };

  const dialog = state ? (
    <ConfirmDialog
      isOpen={state.open}
      title={state.options.title}
      message={state.options.message}
      confirmLabel={state.options.confirmLabel}
      cancelLabel={state.options.cancelLabel}
      destructive={state.options.destructive}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    />
  ) : null;

  return { confirm, dialog };
}

export default ConfirmDialog;