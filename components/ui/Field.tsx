'use client';

import { useId, type ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

type BaseProps = {
  label: string;
  error?: string;
  required?: boolean;
  className?: string;
};

const control =
  'peer w-full rounded-[var(--radius-sm)] border bg-blush-50/70 px-4 pb-2.5 pt-6 font-sans text-[0.9375rem] ' +
  'text-ink transition-all duration-200 outline-none placeholder:text-transparent ' +
  'focus:border-rose-400 focus:bg-white focus:ring-4 focus:ring-rose-300/25';

const labelBase =
  'pointer-events-none absolute left-4 top-4 origin-left font-sans text-[0.9375rem] text-muted ' +
  'transition-all duration-200 peer-focus:top-2 peer-focus:text-[0.6875rem] peer-focus:font-semibold ' +
  'peer-focus:tracking-wide peer-focus:text-plum-700 peer-[:not(:placeholder-shown)]:top-2 ' +
  'peer-[:not(:placeholder-shown)]:text-[0.6875rem] peer-[:not(:placeholder-shown)]:font-semibold ' +
  'peer-[:not(:placeholder-shown)]:tracking-wide peer-[:not(:placeholder-shown)]:text-plum-700';

function ErrorText({ id, children }: { id: string; children: ReactNode }) {
  return (
    <p id={id} role="alert" className="mt-1.5 flex items-center gap-1.5 font-sans text-xs text-rose-600">
      <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      {children}
    </p>
  );
}

export function TextField({
  label,
  error,
  required,
  className,
  as = 'input',
  ...rest
}: BaseProps &
  React.InputHTMLAttributes<HTMLInputElement> &
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & { as?: 'input' | 'textarea' }) {
  const id = useId();
  const errorId = `${id}-error`;

  const shared = {
    id,
    placeholder: label,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': error ? errorId : undefined,
    'aria-required': required,
    className: cn(control, error ? 'border-rose-500' : 'border-blush-200', className),
  };

  return (
    <div className="relative">
      <div className="relative">
        {as === 'textarea' ? (
          <textarea
            {...shared}
            rows={4}
            className={cn(shared.className, 'resize-y leading-relaxed')}
            {...(rest as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
          />
        ) : (
          <input {...shared} {...(rest as React.InputHTMLAttributes<HTMLInputElement>)} />
        )}
        <label htmlFor={id} className={labelBase}>
          {label}
          {/* rose-600, not rose-500 — the marker is 11-15px text and needs 4.5:1. */}
          {required && <span className="text-rose-600"> *</span>}
        </label>
      </div>
      {error && <ErrorText id={errorId}>{error}</ErrorText>}
    </div>
  );
}

export function SelectField({
  label,
  error,
  options,
  className,
  ...rest
}: BaseProps & { options: string[] } & React.SelectHTMLAttributes<HTMLSelectElement>) {
  const id = useId();
  const errorId = `${id}-error`;

  return (
    <div className="relative">
      <label
        htmlFor={id}
        className="mb-1.5 block font-sans text-[0.6875rem] font-semibold uppercase tracking-wide text-plum-700"
      >
        {label}
      </label>
      <select
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={cn(
          'w-full appearance-none rounded-[var(--radius-sm)] border bg-blush-50/70 px-4 py-3.5 font-sans text-[0.9375rem] text-ink outline-none transition-all duration-200 focus:border-rose-400 focus:bg-white focus:ring-4 focus:ring-rose-300/25',
          error ? 'border-rose-500' : 'border-blush-200',
          className,
        )}
        {...rest}
      >
        <option value="">No preference</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      {error && <ErrorText id={errorId}>{error}</ErrorText>}
    </div>
  );
}
