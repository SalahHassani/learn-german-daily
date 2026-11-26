"use client";

import { ProgressBar } from "./progress-bar";
import { useProgress } from "./progress-provider-context";

export function LessonCompletionBadge({ lessonId }: { lessonId: string }) {
  const { hydrated, isLessonCompleted } = useProgress();
  const completed = hydrated && isLessonCompleted(lessonId);

  return (
    <span
      className={
        completed
          ? "inline-flex items-center rounded-md bg-[#3F765B] px-2 py-0.5 text-xs font-medium text-white"
          : "inline-flex items-center rounded-md border border-[#D8E1E8] bg-[#EEF3F6] px-2 py-0.5 text-xs font-medium text-[#64748B]"
      }
    >
      {completed ? "Completed" : "Incomplete"}
    </span>
  );
}

export function WeekProgressSummary({
  courseSlug,
  weekSlug,
}: {
  courseSlug: string;
  weekSlug: string;
}) {
  const { hydrated, getWeekProgress } = useProgress();
  const summary = getWeekProgress(courseSlug, weekSlug);

  if (summary.totalPublishedLessons === 0) {
    return (
      <p className="mt-2 text-xs text-[#64748B]">No published lessons yet</p>
    );
  }

  return (
    <div className="mt-3">
      <ProgressBar
        label="Week lesson progress"
        completed={hydrated ? summary.completedLessons : 0}
        total={summary.totalPublishedLessons}
        percentage={hydrated ? summary.percentage : 0}
      />
    </div>
  );
}

export function CourseProgressSummary({ courseSlug }: { courseSlug: string }) {
  const { hydrated, getCourseProgress } = useProgress();
  const summary = getCourseProgress(courseSlug);

  if (summary.totalPublishedLessons === 0) {
    return (
      <p className="mt-2 text-xs text-[#64748B]">No published lessons yet</p>
    );
  }

  return (
    <div className="mt-3">
      <ProgressBar
        label="Course lesson progress"
        completed={hydrated ? summary.completedLessons : 0}
        total={summary.totalPublishedLessons}
        percentage={hydrated ? summary.percentage : 0}
      />
    </div>
  );
}

export function LevelProgressSummary({ levelSlug }: { levelSlug: string }) {
  const { hydrated, getLevelProgress } = useProgress();
  const summary = getLevelProgress(levelSlug);

  if (summary.totalPublishedLessons === 0) {
    return (
      <p className="mt-2 text-xs text-[#64748B]">No published lessons yet</p>
    );
  }

  return (
    <div className="mt-3">
      <ProgressBar
        label="Level lesson progress"
        completed={hydrated ? summary.completedLessons : 0}
        total={summary.totalPublishedLessons}
        percentage={hydrated ? summary.percentage : 0}
      />
    </div>
  );
}

