import { Suspense } from "react";
import Link from "next/link";
import { contentService } from "@/services/content/contentService";
import { getStatusLabel, isComingSoonStatus } from "@/services/content/visibilityPolicy";
import { Breadcrumb } from "@/components/navigation/breadcrumb";
import { StructuralState } from "@/components/navigation/structural-state";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Divider } from "@/components/ui/divider";

type PageProps = {
  params: Promise<{ lessonSlug: string }>;
};

async function LessonContent({ params }: { params: PageProps["params"] }) {
  const { lessonSlug } = await params;
  const result = contentService.getLessonBySlug(lessonSlug);

  if (!result) {
    return (
      <>
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Levels", href: "/levels" }, { label: lessonSlug }]} />
        <h1 className="text-3xl font-bold tracking-tight">Lesson not found</h1>
        <div className="mt-6">
          <StructuralState
            title="Unknown lesson"
            description={`No lesson matches "${lessonSlug}".`}
          />
        </div>
      </>
    );
  }

  const { level, course, week, lesson, previousLessonSlug, nextLessonSlug } = result;
  const levelCode = level.slug.toUpperCase();
  const lessonStatusLabel = getStatusLabel(lesson.status);

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Levels", href: "/levels" },
          { label: levelCode, href: `/levels/${level.slug}` },
          { label: course.title, href: `/courses/${course.slug}` },
          { label: week.title, href: `/courses/${course.slug}/weeks/${week.slug}` },
          { label: lesson.title },
        ]}
      />

      <p className="text-sm font-medium text-[var(--text-secondary)]">
        {course.title} &middot; {week.title}
      </p>
      <div className="mt-1 flex flex-wrap items-center gap-3">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{lesson.title}</h1>
        {lessonStatusLabel ? <Badge tone="neutral">{lessonStatusLabel}</Badge> : null}
      </div>

      {isComingSoonStatus(lesson.status) ? (
        <div className="mt-8">
          <StructuralState
            title={`${lesson.title} — Coming soon`}
            description={`Lesson content for ${lesson.title} in ${week.title} is planned and not yet available.`}
            actionHref={`/courses/${course.slug}/weeks/${week.slug}`}
            actionLabel={`Back to ${week.title}`}
          />
        </div>
      ) : (
        <Card surface="secondary" className="mt-8 max-w-3xl">
          <h2 className="text-lg font-semibold">Lesson content structure ready</h2>
          <p className="mt-2 text-sm text-[var(--text-primary)]">{lesson.description}</p>
          <p className="mt-2 text-xs text-[var(--text-secondary)]">
            Lesson ID: {lesson.id} &middot; Configured sections: {lesson.sections.length}
          </p>
        </Card>
      )}

      <Divider className="my-8" />

      <nav aria-label="Lesson hierarchy navigation" className="flex flex-wrap items-center justify-between gap-4 text-sm font-medium">
        <div className="flex flex-wrap items-center gap-4">
          <Link
            href={`/courses/${course.slug}/weeks/${week.slug}`}
            className="text-[var(--accent-academic-blue)] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-academic-blue)]"
          >
            Back to {week.title}
          </Link>
          <Link
            href={`/courses/${course.slug}`}
            className="text-[var(--text-secondary)] hover:text-[var(--accent-academic-blue)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-academic-blue)]"
          >
            Back to {course.title}
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {previousLessonSlug ? (
            <Link
              href={`/lessons/${previousLessonSlug}`}
              className="text-[var(--accent-academic-blue)] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-academic-blue)]"
            >
              Previous lesson
            </Link>
          ) : null}
          {nextLessonSlug ? (
            <Link
              href={`/lessons/${nextLessonSlug}`}
              className="text-[var(--accent-academic-blue)] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-academic-blue)]"
            >
              Next lesson
            </Link>
          ) : null}
        </div>
      </nav>
    </>
  );
}

export default function LessonPage({ params }: PageProps) {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <Suspense fallback={<p className="text-sm text-[var(--text-secondary)]">Loading lesson...</p>}>
        <LessonContent params={params} />
      </Suspense>
    </main>
  );
}

