import { Suspense } from "react";
import { contentService } from "@/services/content/contentService";
import { getStatusLabel, isComingSoonStatus } from "@/services/content/visibilityPolicy";
import { Breadcrumb } from "@/components/navigation/breadcrumb";
import { NavigableCard } from "@/components/navigation/navigable-card";
import { StructuralState } from "@/components/navigation/structural-state";
import { Badge } from "@/components/ui/badge";

type PageProps = {
  params: Promise<{ courseSlug: string; weekSlug: string }>;
};

async function WeekContent({ params }: { params: PageProps["params"] }) {
  const { courseSlug, weekSlug } = await params;
  const result = contentService.getWeekBySlugs(courseSlug, weekSlug);

  if (!result) {
    return (
      <>
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Levels", href: "/levels" },
            { label: courseSlug },
            { label: weekSlug },
          ]}
        />
        <h1 className="text-3xl font-bold tracking-tight">Week not found</h1>
        <div className="mt-6">
          <StructuralState
            title="Unknown week"
            description={`No week "${weekSlug}" was found under course "${courseSlug}".`}
          />
        </div>
      </>
    );
  }

  const { level, course, week, lessons } = result;
  const levelCode = level.slug.toUpperCase();
  const weekStatusLabel = getStatusLabel(week.status);

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Levels", href: "/levels" },
          { label: levelCode, href: `/levels/${level.slug}` },
          { label: course.title, href: `/courses/${course.slug}` },
          { label: week.title },
        ]}
      />

      <p className="text-sm font-medium text-[var(--text-secondary)]">
        {course.title} &middot; CEFR {levelCode}
      </p>
      <div className="mt-1 flex flex-wrap items-center gap-3">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{week.title}</h1>
        {weekStatusLabel ? <Badge tone="neutral">{weekStatusLabel}</Badge> : null}
      </div>
      <p className="mt-2 max-w-2xl text-base text-[var(--text-secondary)]">{week.theme}</p>

      {isComingSoonStatus(week.status) ? (
        <div className="mt-8">
          <StructuralState
            title={`${week.title} — Coming soon`}
            description={`Daily lessons for ${week.title} in ${course.title} are planned and not yet available.`}
            actionHref={`/courses/${course.slug}`}
            actionLabel={`Back to ${course.title}`}
          />
        </div>
      ) : (
        <section aria-labelledby="lessons-heading" className="mt-10">
          <h2 id="lessons-heading" className="text-2xl font-bold tracking-tight">
            Lessons
          </h2>

          {lessons.length === 0 ? (
            <div className="mt-6">
              <StructuralState
                title="No lessons listed yet"
                description={`${week.title} in ${course.title} has no lessons available yet.`}
                actionHref={`/courses/${course.slug}`}
                actionLabel={`Back to ${course.title}`}
              />
            </div>
          ) : (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {lessons.map((lesson) => {
                const lessonStatusLabel = getStatusLabel(lesson.status);
                return (
                  <NavigableCard key={lesson.id} href={`/lessons/${lesson.slug}`} surface="standard">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-lg font-semibold text-[var(--text-primary)]">{lesson.title}</h3>
                      {lessonStatusLabel ? <Badge tone="neutral">{lessonStatusLabel}</Badge> : null}
                    </div>
                    <p className="mt-2 text-sm text-[var(--text-secondary)]">{lesson.description}</p>
                    <span className="mt-4 inline-block text-sm font-medium text-[var(--accent-academic-blue)] group-hover:underline">
                      Open {lesson.title}
                    </span>
                  </NavigableCard>
                );
              })}
            </div>
          )}
        </section>
      )}
    </>
  );
}

export default function WeekPage({ params }: PageProps) {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <Suspense fallback={<p className="text-sm text-[var(--text-secondary)]">Loading week...</p>}>
        <WeekContent params={params} />
      </Suspense>
    </main>
  );
}

