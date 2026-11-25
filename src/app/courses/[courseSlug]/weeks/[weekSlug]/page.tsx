import { Suspense } from "react";
import Link from "next/link";
import { getWeekBySlugs } from "@/services/content/m2StructuralData";
import { Breadcrumb } from "@/components/navigation/breadcrumb";
import { StructuralState } from "@/components/navigation/structural-state";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type PageProps = {
  params: Promise<{ courseSlug: string; weekSlug: string }>;
};

async function WeekContent({ params }: { params: PageProps["params"] }) {
  const { courseSlug, weekSlug } = await params;
  const result = getWeekBySlugs(courseSlug, weekSlug);

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

  const { level, course, week } = result;

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Levels", href: "/levels" },
          { label: level.code, href: `/levels/${level.slug}` },
          { label: course.title, href: `/courses/${course.slug}` },
          { label: week.title },
        ]}
      />

      <p className="text-sm font-medium text-[var(--text-secondary)]">
        {course.title} &middot; CEFR {level.code}
      </p>
      <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">{week.title}</h1>
      <p className="mt-2 max-w-2xl text-base text-[var(--text-secondary)]">{week.summary}</p>

      <section aria-labelledby="lessons-heading" className="mt-10">
        <h2 id="lessons-heading" className="text-2xl font-bold tracking-tight">
          Lessons
        </h2>

        {week.lessons.length === 0 ? (
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
            {week.lessons.map((lesson) => (
              <Card key={lesson.slug} surface="standard" interactive>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-lg font-semibold">{lesson.title}</h3>
                  {lesson.availabilityLabel ? <Badge tone="neutral">{lesson.availabilityLabel}</Badge> : null}
                </div>
                <div className="mt-4">
                  <Link
                    href={`/lessons/${lesson.slug}`}
                    className="text-sm font-medium text-[var(--accent-academic-blue)] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-academic-blue)]"
                  >
                    Open {lesson.title}
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
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

