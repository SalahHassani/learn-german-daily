import Link from "next/link";
import { Card } from "@/components/ui/card";

export interface StructuralStateProps {
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
}

export function StructuralState({
  title,
  description,
  actionHref = "/levels",
  actionLabel = "Browse CEFR levels",
}: StructuralStateProps) {
  return (
    <Card surface="secondary" className="max-w-2xl">
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      <p className="mt-2 text-sm text-[var(--text-primary)]">{description}</p>
      <div className="mt-5 flex flex-wrap items-center gap-4">
        <Link
          href={actionHref}
          className="inline-flex h-11 items-center justify-center rounded-[var(--radius-md)] bg-[var(--accent-academic-blue)] px-5 text-sm font-medium text-white transition-colors hover:bg-[var(--accent-academic-blue-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-academic-blue)]"
        >
          {actionLabel}
        </Link>
        <Link
          href="/"
          className="text-sm font-medium text-[var(--accent-academic-blue)] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-academic-blue)]"
        >
          Return home
        </Link>
      </div>
    </Card>
  );
}

