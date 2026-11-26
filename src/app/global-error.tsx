"use client";

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ reset }: GlobalErrorProps) {
  return (
    <html lang="en">
      <body className="bg-[#FAFBFC] text-[#263746] antialiased">
        <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col justify-center px-4 py-12">
          <div className="space-y-4 rounded-xl border border-[#D8E1E8] bg-[#FAFBFC] p-6 sm:p-8">
            <h1 className="text-2xl font-semibold text-[#17324D]">
              Learn German Daily encountered an error
            </h1>
            <p className="text-sm leading-relaxed text-[#263746]">
              Please reload or retry to restore the application view.
            </p>
            <button
              type="button"
              onClick={() => reset()}
              className="min-h-11 rounded-md bg-[#17324D] px-4 py-2 text-sm font-medium text-white"
            >
              Reload view
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}

