import { contentService } from "@/services/content/contentService";
import { getStatusLabel } from "@/services/content/visibilityPolicy";
import { Breadcrumb } from "@/components/navigation/breadcrumb";
import { NavigableCard } from "@/components/navigation/navigable-card";
import { Badge } from "@/components/ui/badge";

export default function LevelsDirectoryPage() {
  const levels = contentService.getLevels();

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Levels" }]} />

      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">CEFR Levels</h1>
      <p className="mt-2 max-w-2xl text-base text-[var(--text-secondary)]">
        Browse CEFR proficiency levels from A1 to C2 and enter each level&apos;s course structure.
      </p>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {levels.map((level) => {
          const statusLabel = getStatusLabel(level.status);
          return (
            <NavigableCard key={level.id} href={`/levels/${level.slug}`} surface="standard">
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-xl font-semibold text-[var(--text-primary)]">{level.name}</h2>
                {statusLabel ? <Badge tone="neutral">{statusLabel}</Badge> : null}
              </div>
              <p className="mt-2 text-sm text-[var(--text-primary)]">{level.description}</p>
              <span className="mt-5 inline-block text-sm font-medium text-[var(--accent-academic-blue)] group-hover:underline">
                View {level.slug.toUpperCase()} courses
              </span>
            </NavigableCard>
          );
        })}
      </div>
    </main>
  );
}

