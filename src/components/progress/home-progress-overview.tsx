"use client";

import Link from "next/link";
import { ProgressBar } from "./progress-bar";
import { useProgress } from "./progress-provider-context";

export function HomeProgressOverview() {
  const {
    hydrated,
    getOverallProgress,
    getContinueLearningTarget,
    storageAvailable,
    noticeMessage,
  } = useProgress();

  const overall = getOverallProgress();
  const target = getContinueLearningTarget();
  const hasCompletedAny = hydrated && overall.completedLessons > 0;

  return (
    <section
      aria-label="Learner progress"
      className="rounded-xl border border-[#D8E1E8] bg-[#EEF3F6] p-6 sm:p-8"
    >
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl space-y-3">
          <p className="text-xs font-semibold tracking-wider text-[#245B78] uppercase">
            Local Browser Progress
          </p>
          <h2 className="font-[family-name:var(--font-heading)] text-2xl font-semibold text-[#17324D]">
            {hasCompletedAny
              ? "Continue your German study"
              : "Start learning German step by step"}
          </h2>
          <p className="text-sm leading-relaxed text-[#263746]">
            {hasCompletedAny
              ? `You have completed ${overall.completedLessons} of ${overall.totalPublishedLessons} published lessons (${overall.percentage}%). Progress is stored in this browser without an account.`
              : "Work through published lessons at your own pace and explicitly mark lessons complete as you go. Progress is saved locally in this browser without an account."}
          </p>

          {overall.totalPublishedLessons > 0 ? (
            <div className="pt-1">
              <ProgressBar
                label="Overall published lessons completed"
                completed={hydrated ? overall.completedLessons : 0}
                total={overall.totalPublishedLessons}
                percentage={hydrated ? overall.percentage : 0}
              />
            </div>
          ) : null}

          {!storageAvailable || noticeMessage ? (
            <p className="text-xs text-[#64748B]">
              {noticeMessage ??
                "Local storage is unavailable in this browser; progress will not persist across reloads."}
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {target ? (
            <Link
              href={`/lessons/${target.lessonSlug}`}
              className="inline-flex min-h-11 items-center justify-center rounded-md bg-[#17324D] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#245B78] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#245B78]"
            >
              {hasCompletedAny
                ? `Continue: ${target.lessonTitle}`
                : `Start: ${target.lessonTitle}`}
            </Link>
          ) : null}
          <Link
            href="/progress"
            className="inline-flex min-h-11 items-center justify-center rounded-md border border-[#D8E1E8] bg-[#FAFBFC] px-4 py-2.5 text-sm font-medium text-[#17324D] transition-colors hover:border-[#245B78] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#245B78]"
          >
            View progress overview
          </Link>
        </div>
      </div>
    </section>
  );
}

