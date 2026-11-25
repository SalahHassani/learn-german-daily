import { Suspense } from "react";
import { contentService } from "@/services/content/contentService";
import { Breadcrumb } from "@/components/navigation/breadcrumb";
import { StructuralState } from "@/components/navigation/structural-state";
import { LessonEngine } from "@/components/lesson/lesson-engine";

type PageProps = {
  params: Promise<{ lessonSlug: string }>;
};

async function LessonContent({ params }: { params: PageProps["params"] }) {
  const { lessonSlug } = await params;
  const resolved = contentService.getLessonBySlug(lessonSlug);

  if (!resolved) {
    return (
      <>
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Levels", href: "/levels" },
            { label: lessonSlug },
          ]}
        />
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

  const { level, course, week, lesson } = resolved;
  const levelCode = level.slug.toUpperCase();

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

      <div className="mt-6">
        <LessonEngine resolvedLesson={resolved} />
      </div>
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

