import * as React from "react";

const FIELD_BASE =
  "w-full rounded-[var(--radius-md)] border bg-[var(--bg-surface-card)] px-3.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-disabled)] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-academic-blue)] disabled:cursor-not-allowed disabled:bg-[var(--bg-surface-secondary)] disabled:text-[var(--text-disabled)]";

function getStateBorder(hasError?: boolean) {
  if (hasError) {
    return "border-[var(--status-error)] hover:border-[var(--status-error)]";
  }
  return "border-[var(--border-subtle)] hover:border-[var(--brand-navy)]";
}

export function FieldLabel({ htmlFor, children, className = "" }: { htmlFor: string; children: React.ReactNode; className?: string }) {
  return (
    <label htmlFor={htmlFor} className={`block text-sm font-medium text-[var(--brand-navy)] ${className}`}>
      {children}
    </label>
  );
}

export function FieldHelper({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <p id={id} className="mt-1.5 text-xs text-[var(--text-secondary)]">
      {children}
    </p>
  );
}

export function FieldError({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <p id={id} role="alert" className="mt-1.5 text-xs font-medium text-[var(--status-error)]">
      {children}
    </p>
  );
}

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
}

export function Input({ hasError, className = "", ...props }: InputProps) {
  return (
    <input
      aria-invalid={hasError || undefined}
      className={`h-11 ${FIELD_BASE} ${getStateBorder(hasError)} ${className}`}
      {...props}
    />
  );
}

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  hasError?: boolean;
}

export function Textarea({ hasError, rows = 4, className = "", ...props }: TextareaProps) {
  return (
    <textarea
      rows={rows}
      aria-invalid={hasError || undefined}
      className={`min-h-24 py-2.5 ${FIELD_BASE} ${getStateBorder(hasError)} ${className}`}
      {...props}
    />
  );
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  hasError?: boolean;
}

export function Select({ hasError, className = "", children, ...props }: SelectProps) {
  return (
    <select
      aria-invalid={hasError || undefined}
      className={`h-11 ${FIELD_BASE} ${getStateBorder(hasError)} ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}