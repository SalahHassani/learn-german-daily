import * as React from "react";

type BadgeTone = "neutral" | "accent" | "success" | "error";

const TONE_CLASSES: Record<BadgeTone, string> = {
  neutral: "bg-[var(--bg-surface-secondary)] text-[var(--brand-navy)] border-[var(--border-subtle)]",
  accent: "bg-[#E6F0F5] text-[var(--accent-academic-blue)] border-[#C4D8E2]",
  success: "bg-[#EAF3EE] text-[var(--status-success)] border-[#C3DDD0]",
  error: "bg-[#F9ECEC] text-[var(--status-error)] border-[#E6C3C3]",
};

export function Badge({ tone = "neutral", children, className = "" }: { tone?: BadgeTone; children: React.ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${TONE_CLASSES[tone]} ${className}`}>
      {children}
    </span>
  );
}

export function StatusIndicator({ tone = "neutral", label }: { tone?: BadgeTone; label: string }) {
  const dotColor =
    tone === "success" ? "bg-[var(--status-success)]" :
    tone === "error" ? "bg-[var(--status-error)]" :
    tone === "accent" ? "bg-[var(--accent-academic-blue)]" :
    "bg-[var(--text-secondary)]";
  return (
    <span className="inline-flex items-center gap-2 text-xs font-medium text-[var(--text-primary)]">
      <span aria-hidden="true" className={`h-2 w-2 rounded-full ${dotColor}`} />
      <span>{label}</span>
    </span>
  );
}