import Link from "next/link";
import { HomeProgressOverview } from "@/components/progress/home-progress-overview";
import { NavigableCard } from "@/components/navigation/navigable-card";
import { contentService } from "@/services/content/contentService";

export default async function HomePage() {
  const levels = await contentService.getLevels();

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="space-y-12">
        <section aria-labelledby="hero-heading" className="space-y-4">
          <p className="text-xs font-semibold tracking-wider text-[#245B78] uppercase">
            Structured German Study
          </p>
          <h1
            id="hero-heading"
            className="font-[family-name:var(--font-heading)] text-4xl font-semibold tracking-tight text-[#17324D] sm:text-5xl"
          >
            Learn German Daily
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-[#263746]">
            A little German. Every day. Move steadily through CEFR levels, courses, weeks, and structured lessons with clear explanations and interactive practice.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href="/levels"
              className="inline-flex min-h-11 items-center justify-center rounded-md bg-[#17324D] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#245B78] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#245B78]"
            >
              Browse CEFR levels
            </Link>
          </div>
        </section>

        <HomeProgressOverview />

        <section aria-labelledby="cefr-levels-heading" className="space-y-4">
          <div className="flex items-baseline justify-between gap-4">
            <h2
              id="cefr-levels-heading"
              className="font-[family-name:var(--font-heading)] text-2xl font-semibold text-[#17324D]"
            >
              CEFR Levels
            </h2>
            <Link
              href="/levels"
              className="text-sm font-medium text-[#245B78] underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#245B78]"
            >
              All levels
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {levels.map((level) => (
              <NavigableCard
                key={level.id}
                href={`/levels/${level.slug}`}
                className="rounded-lg border border-[#D8E1E8] bg-[#FAFBFC] p-5 transition-colors hover:border-[#245B78] hover:bg-[#EEF3F6]/60"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-[family-name:var(--font-heading)] text-lg font-semibold text-[#17324D]">
                    {level.name}
                  </h3>
                  {level.status !== "published" ? (
                    <span className="inline-flex shrink-0 items-center rounded-md border border-[#D8E1E8] bg-[#EEF3F6] px-2 py-0.5 text-xs font-medium text-[#64748B]">
                      Coming soon
                    </span>
                  ) : null}
                </div>
                <p className="mt-2 text-sm text-[#263746]">{level.description}</p>
              </NavigableCard>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

