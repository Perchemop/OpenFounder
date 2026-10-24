import React from 'react';
import { Sparkles, Loader2 } from 'lucide-react';

interface AIAutoFillButtonProps {
  onClick: () => void | Promise<void>;
  isLoading?: boolean;
  label?: string;
  loadingLabel?: string;
  size?: 'xs' | 'sm' | 'md';
  variant?: 'subtle' | 'primary' | 'badge';
  title?: string;
  disabled?: boolean;
  className?: string;
}

export const AIAutoFillButton: React.FC<AIAutoFillButtonProps> = ({
  onClick,
  isLoading = false,
  label = 'AI Suggest',
  loadingLabel = 'Generating...',
  size = 'xs',
  variant = 'subtle',
  title = 'Generate smart suggestions with AI',
  disabled = false,
  className = '',
}) => {
  const sizeClasses = {
    xs: 'text-[11px] px-2 py-0.5 gap-1',
    sm: 'text-xs px-2.5 py-1 gap-1.5',
    md: 'text-xs px-3 py-1.5 gap-1.5 font-medium',
  }[size];

  const variantClasses = {
    subtle:
      'bg-indigo-50/80 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/80 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/80',
    primary:
      'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs border border-indigo-700 dark:border-indigo-500',
    badge:
      'bg-zinc-100 hover:bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700',
  }[variant];

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isLoading && !disabled) {
          onClick();
        }
      }}
      disabled={isLoading || disabled}
      title={title}
      className={`inline-flex items-center justify-center rounded-md font-medium transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${sizeClasses} ${variantClasses} ${className}`}
    >
      {isLoading ? (
        <Loader2 className="w-3 h-3 animate-spin shrink-0 text-current"  aria-hidden="true" />
      ) : (
        <Sparkles className="w-3 h-3 shrink-0 text-current"  aria-hidden="true" />
      )}
      <span>{isLoading ? loadingLabel : label}</span>
    </button>
  );
};
