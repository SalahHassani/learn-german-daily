import Link from "next/link";
import { getAllLevels } from "@/services/content/m2StructuralData";
import { Breadcrumb } from "@/components/navigation/breadcrumb";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function LevelsDirectoryPage() {
  const levels = getAllLevels();

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Levels" }]} />

      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">CEFR Levels</h1>
      <p className="mt-2 max-w-2xl text-base text-[var(--text-secondary)]">
        Browse CEFR proficiency levels from A1 to C2 and enter each level&apos;s course structure.
      </p>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {levels.map((level) => (
          <Card key={level.slug} surface="standard" interactive>
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-xl font-semibold">{level.name}</h2>
              {level.availabilityLabel ? <Badge tone="accent">{level.availabilityLabel}</Badge> : null}
            </div>
            <p className="mt-2 text-sm text-[var(--text-primary)]">{level.summary}</p>
            <div className="mt-5">
              <Link
                href={`/levels/${level.slug}`}
                className="text-sm font-medium text-[var(--accent-academic-blue)] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-academic-blue)]"
              >
                View {level.code} courses
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </main>
  );
}

