import Link from "next/link";
import { siteConfig } from "@/config/site";
import { contentService } from "@/services/content/contentService";
import { getStatusLabel } from "@/services/content/visibilityPolicy";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Divider } from "@/components/ui/divider";

const JOURNEY_STEPS = [
  {
    step: "1. CEFR Level",
    detail: "Broad proficiency bands from A1 through C2 establish clear progression scope.",
  },
  {
    step: "2. Course",
    detail: "Focused course sequences organize study blocks within each CEFR level.",
  },
  {
    step: "3. Week",
    detail: "Weekly segments group structured daily study sessions at a steady pace.",
  },
  {
    step: "4. Lesson",
    detail: "Individual lesson routes provide dedicated study entry points along the hierarchy.",
  },
];

export default function HomePage() {
  const levels = contentService.getLevels();

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <section aria-labelledby="hero-heading" className="max-w-3xl">
        <p className="text-sm font-medium text-[var(--accent-academic-blue)]">{siteConfig.tagline}</p>
        <h1 id="hero-heading" className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          {siteConfig.name}
        </h1>
        <p className="mt-4 text-base leading-relaxed text-[var(--text-primary)] sm:text-lg">
          A calm, structured German-learning environment built around CEFR levels, courses, weeks, and lessons.
          Designed for focused daily study without clutter.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <Link
            href="/levels"
            className="inline-flex h-11 items-center justify-center rounded-[var(--radius-md)] bg-[var(--accent-academic-blue)] px-5 text-sm font-medium text-white transition-colors hover:bg-[var(--accent-academic-blue-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-academic-blue)]"
          >
            Explore courses and levels
          </Link>
        </div>
      </section>

      <Divider className="my-12" />

      <section aria-labelledby="journey-heading">
        <h2 id="journey-heading" className="text-2xl font-bold tracking-tight">
          Learning structure
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-[var(--text-secondary)] sm:text-base">
          Navigate step by step from proficiency levels down to individual lessons.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {JOURNEY_STEPS.map((item) => (
            <Card key={item.step} surface="secondary">
              <h3 className="text-base font-semibold">{item.step}</h3>
              <p className="mt-2 text-sm text-[var(--text-primary)]">{item.detail}</p>
            </Card>
          ))}
        </div>
      </section>

      <section aria-labelledby="levels-entry-heading" className="mt-14">
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
          <div>
            <h2 id="levels-entry-heading" className="text-2xl font-bold tracking-tight">
              CEFR levels
            </h2>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              Select a level to view its courses and hierarchy.
            </p>
          </div>
          <Link
            href="/levels"
            className="text-sm font-medium text-[var(--accent-academic-blue)] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-academic-blue)]"
          >
            View all levels
          </Link>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {levels.map((level) => {
            const statusLabel = getStatusLabel(level.status);
            return (
              <Card key={level.id} surface="standard" interactive>
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-lg font-semibold">{level.name}</h3>
                  {statusLabel ? <Badge tone="neutral">{statusLabel}</Badge> : null}
                </div>
                <p className="mt-2 text-sm text-[var(--text-secondary)]">{level.description}</p>
                <div className="mt-4">
                  <Link
                    href={`/levels/${level.slug}`}
                    className="text-sm font-medium text-[var(--accent-academic-blue)] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-academic-blue)]"
                  >
                    Open {level.slug.toUpperCase()}
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      </section>
    </main>
  );
}

