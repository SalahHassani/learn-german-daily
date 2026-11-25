import Link from "next/link";
import type { Course, Week } from "@/types/content";
import { Divider } from "@/components/ui/divider";

type LessonNavigationProps = {
  course: Course;
  week: Week;
  previousLessonSlug?: string;
  nextLessonSlug?: string;
};

export function LessonNavigation({
  course,
  week,
  previousLessonSlug,
  nextLessonSlug,
}: LessonNavigationProps) {
  const weekHref = `/courses/${course.slug}/weeks/${week.slug}`;

  return (
    <div className="mt-12">
      <Divider className="mb-8" />
      <nav
        aria-label="Lesson navigation"
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href={weekHref}
            className="inline-flex min-h-11 items-center rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-white px-4 py-2 text-sm font-medium text-[var(--text-primary)] transition-colors hover:border-[var(--accent-academic-blue)] hover:bg-[var(--surface-secondary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-academic-blue)]"
          >
            Back to {week.title}
          </Link>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 sm:justify-end">
          {previousLessonSlug ? (
            <Link
              href={`/lessons/${previousLessonSlug}`}
              className="inline-flex min-h-11 items-center rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-white px-4 py-2 text-sm font-medium text-[var(--accent-academic-blue)] transition-colors hover:border-[var(--accent-academic-blue)] hover:bg-[var(--surface-secondary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-academic-blue)]"
            >
              Previous lesson
            </Link>
          ) : null}

          {nextLessonSlug ? (
            <Link
              href={`/lessons/${nextLessonSlug}`}
              className="inline-flex min-h-11 items-center rounded-[var(--radius-md)] bg-[var(--accent-academic-blue)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--accent-academic-blue-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-academic-blue)]"
            >
              Next lesson
            </Link>
          ) : null}
        </div>
      </nav>
    </div>
  );
}

