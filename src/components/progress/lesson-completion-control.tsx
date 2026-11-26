"use client";

import { useState } from "react";
import { useProgress } from "./progress-provider-context";

type LessonCompletionControlProps = {
  lessonId: string;
  lessonTitle: string;
};

export function LessonCompletionControl({
  lessonId,
  lessonTitle,
}: LessonCompletionControlProps) {
  const {
    hydrated,
    isLessonCompleted,
    setLessonCompleted,
    storageAvailable,
    noticeMessage,
    errorMessage,
  } = useProgress();
  const [statusAnnouncement, setStatusAnnouncement] = useState<string>("");

  const completed = hydrated ? isLessonCompleted(lessonId) : false;

  function handleMarkComplete() {
    const result = setLessonCompleted(lessonId, true);
    if (result.saved || !result.storageAvailable) {
      setStatusAnnouncement(`Marked "${lessonTitle}" as completed.`);
    }
  }

  function handleMarkIncomplete() {
    const result = setLessonCompleted(lessonId, false);
    if (result.saved || !result.storageAvailable) {
      setStatusAnnouncement(`Marked "${lessonTitle}" as incomplete.`);
    }
  }

  return (
    <section
      aria-label="Lesson completion status"
      className="rounded-lg border border-[#D8E1E8] bg-[#EEF3F6] p-4 sm:p-5"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span
              className={
                completed
                  ? "inline-flex items-center rounded-md bg-[#3F765B] px-2.5 py-0.5 text-xs font-medium text-white"
                  : "inline-flex items-center rounded-md border border-[#D8E1E8] bg-[#FAFBFC] px-2.5 py-0.5 text-xs font-medium text-[#64748B]"
              }
            >
              {completed ? "Completed" : "Incomplete"}
            </span>
            <span className="text-sm font-medium text-[#263746]">
              {completed
                ? "You have marked this lesson complete."
                : "Mark this lesson complete when you finish studying."}
            </span>
          </div>
          {!storageAvailable || noticeMessage || errorMessage ? (
            <p className="text-xs text-[#64748B]">
              {errorMessage ??
                noticeMessage ??
                "Progress cannot be saved in this browser session."}
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {!completed ? (
            <button
              type="button"
              onClick={handleMarkComplete}
              className="min-h-11 rounded-md bg-[#17324D] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#245B78] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#245B78]"
            >
              Mark lesson complete
            </button>
          ) : (
            <button
              type="button"
              onClick={handleMarkIncomplete}
              className="min-h-11 rounded-md border border-[#D8E1E8] bg-[#FAFBFC] px-3.5 py-2 text-sm font-medium text-[#263746] transition-colors hover:border-[#245B78] hover:text-[#17324D] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#245B78]"
            >
              Mark as incomplete
            </button>
          )}
        </div>
      </div>

      <p role="status" aria-live="polite" className="sr-only">
        {statusAnnouncement}
      </p>
    </section>
  );
}

