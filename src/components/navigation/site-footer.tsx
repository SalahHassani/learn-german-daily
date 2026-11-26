import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-[#D8E1E8] bg-[#FAFBFC] py-8 text-sm text-[#64748B]">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <p>Learn German Daily · Structured CEFR practice</p>
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="text-[#263746] underline-offset-4 hover:underline"
          >
            Home
          </Link>
          <Link
            href="/progress"
            className="text-[#263746] underline-offset-4 hover:underline"
          >
            Progress
          </Link>
        </div>
      </div>
    </footer>
  );
}