import { Suspense } from "react";
import Link from "next/link";
import { getLessonBySlug } from "@/services/content/m2StructuralData";
import { Breadcrumb } from "@/components/navigation/breadcrumb";
import { StructuralState } from "@/components/navigation/structural-state";
import { Card } from "@/components/ui/card";
import { Divider } from "@/components/ui/divider";

type PageProps = {
  params: Promise<{ lessonSlug: string }>;
};

async function LessonContent({ params }: { params: PageProps["params"] }) {
  const { lessonSlug } = await params;
  const result = getLessonBySlug(lessonSlug);

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

  const { level, course, week, lesson } = result;

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Levels", href: "/levels" },
          { label: level.code, href: `/levels/${level.slug}` },
          { label: course.title, href: `/courses/${course.slug}` },
          { label: week.title, href: `/courses/${course.slug}/weeks/${week.slug}` },
          { label: lesson.title },
        ]}
      />

      <p className="text-sm font-medium text-[var(--text-secondary)]">
        {course.title} &middot; {week.title}
      </p>
      <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">{lesson.title}</h1>

      <Card surface="secondary" className="mt-8 max-w-3xl">
        <h2 className="text-lg font-semibold">Lesson workspace structure</h2>
        <p className="mt-2 text-sm text-[var(--text-primary)]">
          Structural entry point reserved for upcoming lesson modules. Lesson content and interactive exercises are
          introduced in a later milestone.
        </p>
      </Card>

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
          {lesson.previousLessonSlug ? (
            <Link
              href={`/lessons/${lesson.previousLessonSlug}`}
              className="text-[var(--accent-academic-blue)] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-academic-blue)]"
            >
              Previous lesson
            </Link>
          ) : null}
          {lesson.nextLessonSlug ? (
            <Link
              href={`/lessons/${lesson.nextLessonSlug}`}
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

