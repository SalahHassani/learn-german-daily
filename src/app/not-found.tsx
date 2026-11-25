import { StructuralState } from "@/components/navigation/structural-state";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight">Page not found</h1>
      <p className="mt-2 max-w-2xl text-base text-[var(--text-secondary)]">
        The requested route or learning hierarchy item could not be found.
      </p>
      <div className="mt-8">
        <StructuralState
          title="Unavailable route"
          description="Select a CEFR level from the directory to explore available courses and structure."
          actionHref="/levels"
          actionLabel="Explore CEFR levels"
        />
      </div>
    </main>
  );
}

