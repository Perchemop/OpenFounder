import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import type { ToastItem } from './useToast';

export interface ToastProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

const typeStyles: Record<ToastItem['type'], string> = {
  success:
    'border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-100',
  error:
    'border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/60 text-rose-900 dark:text-rose-100',
  warning:
    'border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-100',
  info:
    'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100',
};

const typeIcon: Record<ToastItem['type'], string> = {
  success: '✓',
  error: '!',
  warning: '!',
  info: 'i',
};

const ToastCard: React.FC<{ toast: ToastItem; onDismiss: (id: string) => void }> = ({
  toast,
  onDismiss,
}) => {
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const timer = window.setTimeout(() => onDismiss(toast.id), 5000);
    return () => window.clearTimeout(timer);
  }, [paused, toast.id, onDismiss]);

  return (
    <div
      role="status"
      aria-live="polite"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      tabIndex={0}
      className={`flex items-start gap-2 rounded-lg border shadow-lg px-3 py-2.5 text-xs ${typeStyles[toast.type]}`}
    >
      <span
        aria-hidden="true"
        className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-black/10 dark:bg-white/10 text-[10px] font-bold"
      >
        {typeIcon[toast.type]}
      </span>
      <div className="min-w-0 flex-1">
        {toast.title ? (
          <p className="font-semibold leading-tight">{toast.title}</p>
        ) : null}
        <p className="leading-snug opacity-90">{toast.message}</p>
      </div>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        aria-label="Dismiss notification"
        className="shrink-0 rounded p-0.5 opacity-60 hover:opacity-100 focus:outline-none focus:ring-1 focus:ring-current"
      >
        <X className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
    </div>
  );
};

export const Toast: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;
  return (
    <div
      className="fixed top-4 right-4 z-[60] flex w-80 max-w-[90vw] flex-col gap-2"
      aria-live="polite"
    >
      {toasts.map((t) => (
        <ToastCard key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

export default Toast;
