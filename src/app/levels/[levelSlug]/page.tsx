import { Suspense } from "react";
import { contentService } from "@/services/content/contentService";
import { getStatusLabel, isComingSoonStatus } from "@/services/content/visibilityPolicy";
import { Breadcrumb } from "@/components/navigation/breadcrumb";
import { NavigableCard } from "@/components/navigation/navigable-card";
import { StructuralState } from "@/components/navigation/structural-state";
import { Badge } from "@/components/ui/badge";

type PageProps = {
  params: Promise<{ levelSlug: string }>;
};

async function LevelContent({ params }: { params: PageProps["params"] }) {
  const { levelSlug } = await params;
  const resolved = await contentService.getLevelViewBySlug(levelSlug);

  if (!resolved || !resolved.level) {
    return (
      <>
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Levels", href: "/levels" },
            { label: levelSlug },
          ]}
        />
        <h1 className="text-3xl font-bold tracking-tight">Level not found</h1>
        <div className="mt-6">
          <StructuralState
            title="Unknown CEFR level"
            description={`No CEFR level matches "${levelSlug}".`}
          />
        </div>
      </>
    );
  }

  const { level, courses } = resolved;
  const levelCode = level.slug.toUpperCase();
  const levelStatusLabel = getStatusLabel(level.status);

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Levels", href: "/levels" },
          { label: levelCode },
        ]}
      />

      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{level.name}</h1>
        {levelStatusLabel ? <Badge tone="neutral">{levelStatusLabel}</Badge> : null}
      </div>
      <p className="mt-2 max-w-2xl text-base text-[var(--text-secondary)]">{level.description}</p>

      {isComingSoonStatus(level.status) ? (
        <div className="mt-8">
          <StructuralState
            title={`${levelCode} — Coming soon`}
            description={`Learning materials for ${level.name} are planned and not yet available.`}
            actionHref="/levels"
            actionLabel="Browse available levels"
          />
        </div>
      ) : (
        <section aria-labelledby="courses-heading" className="mt-10">
          <h2 id="courses-heading" className="text-2xl font-bold tracking-tight">
            Courses
          </h2>

          {courses.length === 0 ? (
            <div className="mt-6">
              <StructuralState
                title="No courses available yet"
                description={`There are currently no courses listed under ${levelCode}.`}
                actionHref="/levels"
                actionLabel="Back to all levels"
              />
            </div>
          ) : (
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              {courses.map((course) => {
                const courseStatusLabel = getStatusLabel(course.status);
                return (
                  <NavigableCard key={course.id} href={`/courses/${course.slug}`} surface="standard">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-xl font-semibold text-[var(--text-primary)]">{course.title}</h3>
                      {courseStatusLabel ? <Badge tone="neutral">{courseStatusLabel}</Badge> : null}
                    </div>
                    <p className="mt-2 text-sm text-[var(--text-primary)]">{course.description}</p>
                    <span className="mt-5 inline-block text-sm font-medium text-[var(--accent-academic-blue)] group-hover:underline">
                      Open {course.title}
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

export default function LevelPage({ params }: PageProps) {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <Suspense fallback={<p className="text-sm text-[var(--text-secondary)]">Loading level...</p>}>
        <LevelContent params={params} />
      </Suspense>
    </main>
  );
}

