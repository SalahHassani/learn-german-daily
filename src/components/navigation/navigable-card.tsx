import Link from "next/link";
import type { ReactNode } from "react";

type CardSurface = "standard" | "secondary";

type NavigableCardProps = {
  href: string;
  children: ReactNode;
  surface?: CardSurface;
  className?: string;
};

const SURFACE_CLASSES: Record<CardSurface, string> = {
  standard: "bg-white border-[var(--border-subtle)] hover:border-[var(--accent-academic-blue)]",
  secondary:
    "bg-[var(--surface-secondary)] border-[var(--border-subtle)] hover:border-[var(--accent-academic-blue)]",
};

export function NavigableCard({
  href,
  children,
  surface = "standard",
  className = "",
}: NavigableCardProps) {
  return (
    <Link
      href={href}
      className={`group block cursor-pointer rounded-[var(--radius-lg)] border p-6 transition-colors hover:bg-[var(--surface-secondary)]/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-academic-blue)] active:bg-[var(--surface-secondary)] ${SURFACE_CLASSES[surface]} ${className}`}
    >
      {children}
    </Link>
  );
}

