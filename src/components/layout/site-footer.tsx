import Link from "next/link";
import { siteConfig } from "@/config/site";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-[var(--border-subtle)] bg-[var(--bg-surface-secondary)]">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div>
          <p className="font-[var(--font-heading)] text-base font-bold text-[var(--brand-navy)]">
            {siteConfig.name}
          </p>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">{siteConfig.tagline}</p>
          <p className="mt-2 text-xs text-[var(--text-secondary)]">
            &copy; {siteConfig.name}. All rights reserved.
          </p>
        </div>

        <nav aria-label="Footer" className="flex items-center gap-6 text-sm font-medium">
          <Link
            href="/"
            className="rounded-[var(--radius-sm)] text-[var(--text-primary)] transition-colors hover:text-[var(--accent-academic-blue)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-academic-blue)]"
          >
            Home
          </Link>
          <Link
            href="/levels"
            className="rounded-[var(--radius-sm)] text-[var(--text-primary)] transition-colors hover:text-[var(--accent-academic-blue)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-academic-blue)]"
          >
            Levels
          </Link>
        </nav>
      </div>
    </footer>
  );
}

