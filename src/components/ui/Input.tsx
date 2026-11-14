import React, { useId } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  wrapperClassName?: string;
  inputClassName?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      id,
      wrapperClassName = '',
      inputClassName = '',
      className = '',
      ...rest
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const errorId = error ? `${inputId}-error` : undefined;

    return (
      <div className={`flex flex-col gap-1 ${wrapperClassName} ${className}`}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={errorId}
          className={`w-full bg-white dark:bg-zinc-800 border rounded px-2 py-1.5 text-xs
            text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1
            ${error ? 'border-rose-500 focus:ring-rose-500' : 'border-zinc-200 dark:border-zinc-700 focus:ring-emerald-500'}
            ${inputClassName}`}
          {...rest}
        />
        {error && (
          <p id={errorId} role="alert" className="text-[11px] text-rose-600">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;