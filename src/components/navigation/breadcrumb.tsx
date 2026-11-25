import Link from "next/link";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className = "" }: BreadcrumbProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <nav aria-label="Breadcrumb" className={`mb-6 ${className}`}>
      <ol className="flex flex-wrap items-center gap-2 text-sm text-[var(--text-secondary)]">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="inline-flex items-center gap-2">
              {index > 0 ? (
                <span aria-hidden="true" className="text-[var(--border-subtle)] select-none">
                  /
                </span>
              ) : null}
              {isLast || !item.href ? (
                <span
                  aria-current={isLast ? "page" : undefined}
                  className={isLast ? "font-medium text-[var(--brand-navy)]" : "text-[var(--text-primary)]"}
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="rounded-[var(--radius-sm)] text-[var(--text-secondary)] transition-colors hover:text-[var(--accent-academic-blue)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-academic-blue)]"
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

