"use client";

import type { StructuredLessonSection } from "@/types/content";

type LessonSectionNavigationProps = {
  sections: readonly StructuredLessonSection[];
  activeSectionId?: string;
  onSelectSection?: (sectionId: string) => void;
};

export function LessonSectionNavigation({
  sections,
  activeSectionId,
  onSelectSection,
}: LessonSectionNavigationProps) {
  const orderedSections = [...sections].sort((a, b) => a.order - b.order);

  if (orderedSections.length === 0) {
    return null;
  }

  return (
    <nav
      aria-label="Lesson sections"
      className="sticky top-0 z-10 -mx-4 mt-8 border-y border-[var(--border-subtle)] bg-[var(--bg-canvas)]/95 px-4 py-3 backdrop-blur-xs sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"
    >
      <div className="mx-auto flex max-w-6xl items-center gap-2 overflow-x-auto pb-0.5">
        <span className="shrink-0 text-xs font-semibold tracking-wide text-[var(--text-secondary)] uppercase">
          Sections:
        </span>
        <ul className="flex items-center gap-2">
          {orderedSections.map((section) => {
            const isCurrent = activeSectionId === section.id;
            return (
              <li key={section.id} className="shrink-0">
                <a
                  href={`#lesson-section-${section.id}`}
                  onClick={() => onSelectSection?.(section.id)}
                  aria-current={isCurrent ? "location" : undefined}
                  className={`inline-flex min-h-9 items-center rounded-[var(--radius-md)] border px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-academic-blue)] ${
                    isCurrent
                      ? "border-[var(--accent-academic-blue)] bg-[var(--accent-academic-blue)] text-white"
                      : "border-[var(--border-subtle)] bg-white text-[var(--text-primary)] hover:border-[var(--accent-academic-blue)] hover:bg-[var(--surface-secondary)]"
                  }`}
                >
                  {section.title}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}

