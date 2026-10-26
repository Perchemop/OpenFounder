interface FilterChipProps<T extends string> {
  label: string;
  value: T;
  count?: number;
  isActive: boolean;
  onSelect: (value: T) => void;
}

/**
 * A single filter chip. Filter state is held locally by the page (no URL
 * params), so the selection survives re-renders within the session.
 */
export function FilterChip<T extends string>({
  label,
  value,
  count,
  isActive,
  onSelect,
}: FilterChipProps<T>) {
  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      aria-pressed={isActive}
      className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
        isActive
          ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
      }`}
    >
      {label}
      {typeof count === 'number' ? ` (${count})` : ''}
    </button>
  );
}
