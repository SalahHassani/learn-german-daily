import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b border-[#D8E1E8] bg-[#FAFBFC]">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="font-[family-name:var(--font-heading)] text-lg font-semibold text-[#17324D] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#245B78]"
        >
          Learn German Daily
        </Link>

        <nav aria-label="Primary navigation" className="flex flex-wrap items-center gap-4 sm:gap-6">
          <Link
            href="/levels"
            className="inline-flex min-h-11 items-center text-sm font-medium text-[#263746] transition-colors hover:text-[#17324D] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#245B78]"
          >
            Levels
          </Link>
          <Link
            href="/progress"
            className="inline-flex min-h-11 items-center text-sm font-medium text-[#263746] transition-colors hover:text-[#17324D] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#245B78]"
          >
            Progress
          </Link>
        </nav>
      </div>
    </header>
  );
}

