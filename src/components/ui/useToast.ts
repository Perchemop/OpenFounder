import { useContext } from 'react';
import { useProject } from '../../context/ProjectContext';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastItem {
  id: string;
  title?: string;
  message: string;
  type: ToastType;
}

export interface ToastInput {
  title?: string;
  message: string;
  type?: ToastType;
}

/**
 * Lightweight toast hook. Toast state lives in ProjectContext so a single
 * container renders at the app root; this hook just exposes the API.
 */
export function useToast(): {
  toast: (input: ToastInput) => string;
  dismiss: (id: string) => void;
} {
  const ctx = useProject();
  return {
    toast: (input: ToastInput) => ctx.toast(input),
    dismiss: (id: string) => ctx.dismissToast(id),
  };
}
