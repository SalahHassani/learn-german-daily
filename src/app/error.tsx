"use client";

import Link from "next/link";
import { useEffect } from "react";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    void error;
  }, [error]);

  return (
    <main className="mx-auto flex min-h-[60vh] w-full max-w-2xl flex-col justify-center px-4 py-12 sm:px-6">
      <div className="space-y-4 rounded-xl border border-[#D8E1E8] bg-[#FAFBFC] p-6 sm:p-8">
        <p className="text-xs font-semibold tracking-wider text-[#245B78] uppercase">
          Display Issue
        </p>
        <h1 className="font-[family-name:var(--font-heading)] text-2xl font-semibold text-[#17324D]">
          Something interrupted this view
        </h1>
        <p className="text-sm leading-relaxed text-[#263746]">
          We could not render this page cleanly. Your locally saved lesson completion and exercise history remain intact.
        </p>
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => reset()}
            className="min-h-11 rounded-md bg-[#17324D] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#245B78] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#245B78]"
          >
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex min-h-11 items-center justify-center rounded-md border border-[#D8E1E8] bg-[#EEF3F6] px-4 py-2 text-sm font-medium text-[#17324D] transition-colors hover:bg-[#D8E1E8]/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#245B78]"
          >
            Return home
          </Link>
        </div>
      </div>
    </main>
  );
}

