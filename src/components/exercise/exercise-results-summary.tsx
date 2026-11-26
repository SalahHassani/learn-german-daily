"use client";

import type { ExerciseEvaluationSummary } from "@/services/exercise/exerciseEvaluator";

type ExerciseResultsSummaryProps = {
  summary: ExerciseEvaluationSummary;
  attemptNumber: number;
  onRetry: () => void;
};

export function ExerciseResultsSummary({
  summary,
  attemptNumber,
  onRetry,
}: ExerciseResultsSummaryProps) {
  return (
    <div
      role="region"
      aria-label="Exercise results"
      aria-live="polite"
      className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-secondary)] p-5 sm:p-6"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold tracking-wide text-[var(--text-secondary)] uppercase">
            Attempt {attemptNumber} Results
          </p>
          <h4 className="mt-1 text-xl font-bold text-[var(--text-primary)]">
            Score: {summary.earnedPoints} / {summary.totalPoints} points ({summary.percentage}%)
          </h4>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            {summary.correctCount} of {summary.totalQuestions} questions answered correctly.
          </p>
        </div>

        <button
          type="button"
          onClick={onRetry}
          className="inline-flex min-h-11 items-center justify-center rounded-[var(--radius-md)] border border-[var(--accent-academic-blue)] bg-white px-4 py-2 text-sm font-medium text-[var(--accent-academic-blue)] transition-colors hover:bg-[var(--surface-secondary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-academic-blue)]"
        >
          Retry exercise
        </button>
      </div>

      {summary.explanation ? (
        <p className="mt-4 border-t border-[var(--border-subtle)] pt-3 text-sm text-[var(--text-primary)]">
          {summary.explanation}
        </p>
      ) : null}
    </div>
  );
}

