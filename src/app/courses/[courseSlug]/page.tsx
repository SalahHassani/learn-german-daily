import { Suspense } from "react";
import Link from "next/link";
import { contentService } from "@/services/content/contentService";
import { getStatusLabel, isComingSoonStatus } from "@/services/content/visibilityPolicy";
import { Breadcrumb } from "@/components/navigation/breadcrumb";
import { StructuralState } from "@/components/navigation/structural-state";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type PageProps = {
  params: Promise<{ courseSlug: string }>;
};

async function CourseContent({ params }: { params: PageProps["params"] }) {
  const { courseSlug } = await params;
  const result = contentService.getCourseBySlug(courseSlug);

  if (!result) {
    return (
      <>
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Levels", href: "/levels" }, { label: courseSlug }]} />
        <h1 className="text-3xl font-bold tracking-tight">Course not found</h1>
        <div className="mt-6">
          <StructuralState
            title="Unknown course"
            description={`No course matches "${courseSlug}".`}
          />
        </div>
      </>
    );
  }

  const { level, course, weeks } = result;
  const levelCode = level.slug.toUpperCase();
  const courseStatusLabel = getStatusLabel(course.status);

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Levels", href: "/levels" },
          { label: levelCode, href: `/levels/${level.slug}` },
          { label: course.title },
        ]}
      />

      <div className="flex flex-wrap items-center gap-3">
        <Badge tone="accent">CEFR {levelCode}</Badge>
        {courseStatusLabel ? <Badge tone="neutral">{courseStatusLabel}</Badge> : null}
      </div>

      <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">{course.title}</h1>
      <p className="mt-3 max-w-2xl text-base text-[var(--text-primary)]">{course.description}</p>

      {isComingSoonStatus(course.status) ? (
        <div className="mt-8">
          <StructuralState
            title={`${course.title} — Coming soon`}
            description={`Weekly units and lessons for ${course.title} are planned and not yet available.`}
            actionHref={`/levels/${level.slug}`}
            actionLabel={`Back to ${levelCode}`}
          />
        </div>
      ) : (
        <section aria-labelledby="weeks-heading" className="mt-10">
          <h2 id="weeks-heading" className="text-2xl font-bold tracking-tight">
            Weeks
          </h2>

          {weeks.length === 0 ? (
            <div className="mt-6">
              <StructuralState
                title="No weeks scheduled yet"
                description={`${course.title} does not have week modules available yet.`}
                actionHref={`/levels/${level.slug}`}
                actionLabel={`Back to ${levelCode}`}
              />
            </div>
          ) : (
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {weeks.map((week) => {
                const weekStatusLabel = getStatusLabel(week.status);
                return (
                  <Card key={week.id} surface="standard" interactive>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-lg font-semibold">{week.title}</h3>
                      {weekStatusLabel ? <Badge tone="neutral">{weekStatusLabel}</Badge> : null}
                    </div>
                    <p className="mt-2 text-sm text-[var(--text-secondary)]">{week.theme}</p>
                    <div className="mt-4">
                      <Link
                        href={`/courses/${course.slug}/weeks/${week.slug}`}
                        className="text-sm font-medium text-[var(--accent-academic-blue)] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-academic-blue)]"
                      >
                        View {week.title} lessons
                      </Link>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </section>
      )}
    </>
  );
}

export default function CoursePage({ params }: PageProps) {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <Suspense fallback={<p className="text-sm text-[var(--text-secondary)]">Loading course...</p>}>
        <CourseContent params={params} />
      </Suspense>
    </main>
  );
}

