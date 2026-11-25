import * as React from "react";

type ButtonVariant = "primary" | "secondary" | "outline" | "text";
type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--accent-academic-blue)] text-white border border-[var(--accent-academic-blue)] hover:bg-[var(--accent-academic-blue-hover)] hover:border-[var(--accent-academic-blue-hover)]",
  secondary:
    "bg-[var(--bg-surface-secondary)] text-[var(--brand-navy)] border border-[var(--border-subtle)] hover:bg-[#E2EBF1]",
  outline:
    "bg-[var(--bg-surface-card)] text-[var(--accent-academic-blue)] border border-[var(--accent-academic-blue)] hover:bg-[var(--bg-surface-secondary)]",
  text:
    "bg-transparent text-[var(--accent-academic-blue)] border border-transparent hover:bg-[var(--bg-surface-secondary)]",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "h-9 px-3.5 text-sm rounded-[var(--radius-sm)]",
  md: "h-11 px-5 text-sm rounded-[var(--radius-md)]",
  lg: "h-12 px-6 text-base rounded-[var(--radius-md)]",
};

export function Button({
  type = "button",
  variant = "primary",
  size = "md",
  disabled,
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-academic-blue)] disabled:cursor-not-allowed disabled:bg-[var(--bg-surface-secondary)] disabled:text-[var(--text-disabled)] disabled:border-[var(--border-subtle)] ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}