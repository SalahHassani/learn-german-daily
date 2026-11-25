import * as React from "react";

type CardSurface = "standard" | "secondary" | "elevated";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  surface?: CardSurface;
  interactive?: boolean;
}

const SURFACE_CLASSES: Record<CardSurface, string> = {
  standard: "bg-[var(--bg-surface-card)] border border-[var(--border-subtle)]",
  secondary: "bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)]",
  elevated: "bg-[var(--bg-surface-card)] border border-[var(--border-subtle)] shadow-[0_6px_20px_-8px_rgba(23,50,77,0.12)]",
};

export function Card({
  surface = "standard",
  interactive = false,
  className = "",
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={`rounded-[var(--radius-lg)] p-5 sm:p-6 ${SURFACE_CLASSES[surface]} ${interactive ? "transition-colors hover:border-[var(--accent-academic-blue)] focus-within:border-[var(--accent-academic-blue)]" : ""} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}