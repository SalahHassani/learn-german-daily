"use client";

import Link from "next/link";
import { Breadcrumb } from "@/components/navigation/breadcrumb";
import { ProgressBar } from "@/components/progress/progress-bar";
import { useProgress } from "@/components/progress/progress-provider-context";

export type PublishedCourseItem = {
  levelId: string;
  levelName: string;
  levelSlug: string;
  courseId: string;
  courseSlug: string;
  courseTitle: string;
};

export type PublishedLessonItem = {
  levelId: string;
  levelName: string;
  levelSlug: string;
  courseId: string;
  courseSlug: string;
  courseTitle: string;
  weekId: string;
  weekSlug: string;
  weekTitle: string;
  lessonId: string;
  lessonSlug: string;
  lessonTitle: string;
};

type ProgressOverviewClientProps = {
  publishedCourses: PublishedCourseItem[];
  publishedLessons: PublishedLessonItem[];
};

export function ProgressOverviewClient({
  publishedCourses,
  publishedLessons,
}: ProgressOverviewClientProps) {
  const {
    hydrated,
    state,
    storageAvailable,
    noticeMessage,
    isLessonCompleted,
    getCourseProgress,
    getOverallProgress,
    getContinueLearningTarget,
  } = useProgress();

  const overall = getOverallProgress();
  const continueTarget = getContinueLearningTarget();

  const completedCount = hydrated
    ? publishedLessons.filter((item) => isLessonCompleted(item.lessonId)).length
    : 0;
  const remainingCount = Math.max(0, publishedLessons.length - completedCount);

  const recentAttempts = hydrated
    ? [...state.exerciseAttempts].reverse().slice(0, 10)
    : [];

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="space-y-8">
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Progress" },
          ]}
        />

        <header className="space-y-3 border-b border-[#D8E1E8] pb-6">
          <p className="text-xs font-semibold tracking-wider text-[#245B78] uppercase">
            Learner Progress Overview
          </p>
          <h1 className="font-[family-name:var(--font-heading)] text-3xl font-semibold text-[#17324D]">
            Your German Learning Progress
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-[#263746]">
            Progress is saved locally in this browser without an account. It does not automatically transfer across different browsers or devices.
          </p>

          {!storageAvailable || noticeMessage ? (
            <div
              role="status"
              className="rounded-md border border-[#D8E1E8] bg-[#EEF3F6] p-3 text-xs text-[#263746]"
            >
              {noticeMessage ??
                "Local storage is unavailable in this browser; changes cannot be persisted."}
            </div>
          ) : null}

          {continueTarget ? (
            <div className="pt-2">
              <Link
                href={`/lessons/${continueTarget.lessonSlug}`}
                className="inline-flex min-h-11 items-center justify-center rounded-md bg-[#17324D] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#245B78] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#245B78]"
              >
                Continue with {continueTarget.lessonTitle}
              </Link>
            </div>
          ) : null}
        </header>

        <section
          aria-label="Overall progress summary"
          className="grid grid-cols-1 gap-4 sm:grid-cols-3"
        >
          <div className="rounded-lg border border-[#D8E1E8] bg-[#EEF3F6] p-4">
            <p className="text-xs font-medium text-[#64748B]">Completed Published Lessons</p>
            <p className="mt-1 font-[family-name:var(--font-heading)] text-2xl font-semibold text-[#17324D]">
              {completedCount} / {overall.totalPublishedLessons}
            </p>
          </div>
          <div className="rounded-lg border border-[#D8E1E8] bg-[#EEF3F6] p-4">
            <p className="text-xs font-medium text-[#64748B]">Remaining Published Lessons</p>
            <p className="mt-1 font-[family-name:var(--font-heading)] text-2xl font-semibold text-[#17324D]">
              {remainingCount}
            </p>
          </div>
          <div className="rounded-lg border border-[#D8E1E8] bg-[#EEF3F6] p-4">
            <p className="text-xs font-medium text-[#64748B]">Current Focus Level</p>
            <p className="mt-1 font-[family-name:var(--font-heading)] text-2xl font-semibold text-[#17324D]">
              {continueTarget?.levelName ?? "CEFR A1"}
            </p>
          </div>
        </section>

        <section aria-label="Course progress" className="space-y-4">
          <h2 className="font-[family-name:var(--font-heading)] text-xl font-semibold text-[#17324D]">
            Course Progress
          </h2>
          {publishedCourses.length === 0 ? (
            <p className="rounded-lg border border-[#D8E1E8] bg-[#FAFBFC] p-4 text-sm text-[#64748B]">
              No published courses available yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {publishedCourses.map((item) => {
                const summary = getCourseProgress(item.courseSlug);
                return (
                  <div
                    key={item.courseId}
                    className="rounded-lg border border-[#D8E1E8] bg-[#FAFBFC] p-5 space-y-3"
                  >
                    <div className="flex items-baseline justify-between gap-2">
                      <Link
                        href={`/courses/${item.courseSlug}`}
                        className="font-[family-name:var(--font-heading)] text-lg font-semibold text-[#17324D] underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#245B78]"
                      >
                        {item.courseTitle}
                      </Link>
                      <span className="text-xs font-medium text-[#64748B]">
                        {item.levelName}
                      </span>
                    </div>
                    <ProgressBar
                      label={`${item.courseTitle} published lesson completion`}
                      completed={hydrated ? summary.completedLessons : 0}
                      total={summary.totalPublishedLessons}
                      percentage={hydrated ? summary.percentage : 0}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section aria-label="Published lessons status" className="space-y-4">
          <h2 className="font-[family-name:var(--font-heading)] text-xl font-semibold text-[#17324D]">
            Published Lessons
          </h2>
          {publishedLessons.length === 0 ? (
            <p className="rounded-lg border border-[#D8E1E8] bg-[#FAFBFC] p-4 text-sm text-[#64748B]">
              No published lessons available yet.
            </p>
          ) : (
            <ul className="divide-y divide-[#D8E1E8] rounded-lg border border-[#D8E1E8] bg-[#FAFBFC]">
              {publishedLessons.map((item) => {
                const done = hydrated && isLessonCompleted(item.lessonId);
                return (
                  <li
                    key={item.lessonId}
                    className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <Link
                        href={`/lessons/${item.lessonSlug}`}
                        className="text-sm font-medium text-[#17324D] underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#245B78]"
                      >
                        {item.lessonTitle}
                      </Link>
                      <p className="text-xs text-[#64748B]">
                        {item.courseTitle} · {item.weekTitle}
                      </p>
                    </div>
                    <span
                      className={
                        done
                          ? "inline-flex w-fit items-center rounded-md bg-[#3F765B] px-2.5 py-1 text-xs font-medium text-white"
                          : "inline-flex w-fit items-center rounded-md border border-[#D8E1E8] bg-[#EEF3F6] px-2.5 py-1 text-xs font-medium text-[#64748B]"
                      }
                    >
                      {done ? "Completed" : "Not completed"}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section aria-label="Recent exercise attempts" className="space-y-4">
          <h2 className="font-[family-name:var(--font-heading)] text-xl font-semibold text-[#17324D]">
            Recent Exercise Attempts
          </h2>
          {recentAttempts.length === 0 ? (
            <p className="rounded-lg border border-[#D8E1E8] bg-[#FAFBFC] p-4 text-sm text-[#64748B]">
              No exercise attempts recorded yet. Completing an exercise does not automatically mark a lesson complete.
            </p>
          ) : (
            <ul className="divide-y divide-[#D8E1E8] rounded-lg border border-[#D8E1E8] bg-[#FAFBFC]">
              {recentAttempts.map((attempt) => (
                <li
                  key={attempt.attemptId}
                  className="flex flex-col gap-1 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-sm font-medium text-[#17324D]">
                      Exercise: {attempt.exerciseId} (Attempt #{attempt.attemptNumber})
                    </p>
                    <p className="text-xs text-[#64748B]">
                      Submitted: {new Date(attempt.submittedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <p className="text-sm font-medium text-[#263746]">
                    {attempt.percentage}% ({attempt.earnedPoints}/{attempt.totalPoints} pts)
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}

