"use client";

import { useState } from "react";
import type { ExerciseDefinition } from "@/types/content";
import {
  createInitialAnswerMap,
  evaluateExercise,
  validateQuestionAnswered,
  type ExerciseEvaluationSummary,
  type QuestionAnswerValue,
} from "@/services/exercise/exerciseEvaluator";
import { ExerciseQuestionCard } from "./exercise-question-card";
import { ExerciseResultsSummary } from "./exercise-results-summary";

type ExerciseRunnerProps = {
  exercise: ExerciseDefinition;
};

export function ExerciseRunner({ exercise }: ExerciseRunnerProps) {
  const orderedQuestions = [...exercise.questions].sort(
    (a, b) => a.displayOrder - b.displayOrder
  );

  const [attemptNumber, setAttemptNumber] = useState(1);
  const [answers, setAnswers] = useState<Record<string, QuestionAnswerValue>>(() =>
    createInitialAnswerMap(orderedQuestions)
  );
  const [questionErrors, setQuestionErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [resultSummary, setResultSummary] = useState<ExerciseEvaluationSummary | null>(
    null
  );

  const totalPoints = orderedQuestions.reduce(
    (sum, q) => sum + (Number.isFinite(q.points) && q.points > 0 ? q.points : 0),
    0
  );

  const isSubmitted = resultSummary !== null;

  const handleAnswerChange = (questionId: string, nextValue: QuestionAnswerValue) => {
    setAnswers((prev) => ({ ...prev, [questionId]: nextValue }));
    setQuestionErrors((prev) => {
      if (!prev[questionId]) {
        return prev;
      }
      const next = { ...prev };
      delete next[questionId];
      return next;
    });
    setFormError(null);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (orderedQuestions.length === 0) {
      setFormError("This exercise does not contain any questions yet.");
      return;
    }

    const nextErrors: Record<string, string> = {};
    for (const question of orderedQuestions) {
      const validationMessage = validateQuestionAnswered(question, answers[question.id]);
      if (validationMessage) {
        nextErrors[question.id] = validationMessage;
      }
    }

    if (Object.keys(nextErrors).length > 0) {
      setQuestionErrors(nextErrors);
      setFormError("Please complete all required questions before submitting.");
      return;
    }

    setQuestionErrors({});
    setFormError(null);
    setResultSummary(evaluateExercise(exercise, answers));
  };

  const handleRetry = () => {
    setAttemptNumber((prev) => prev + 1);
    setAnswers(createInitialAnswerMap(orderedQuestions));
    setQuestionErrors({});
    setFormError(null);
    setResultSummary(null);
  };

  const evaluationByQuestionId = new Map(
    resultSummary?.questionResults.map((res) => [res.questionId, res]) ?? []
  );

  return (
    <section
      aria-labelledby={`exercise-title-${exercise.id}`}
      className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-secondary)]/30 p-5 sm:p-7"
    >
      <header className="border-b border-[var(--border-subtle)] pb-4">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-medium text-[var(--text-secondary)]">
          <span className="uppercase tracking-wide">Interactive Exercise</span>
          <span>
            {orderedQuestions.length}{" "}
            {orderedQuestions.length === 1 ? "question" : "questions"} &middot; {totalPoints}{" "}
            {totalPoints === 1 ? "point" : "points"}
            {typeof exercise.estimatedDurationMinutes === "number"
              ? ` · ~${exercise.estimatedDurationMinutes} min`
              : ""}
          </span>
        </div>

        <h3
          id={`exercise-title-${exercise.id}`}
          className="mt-1.5 text-xl font-bold text-[var(--text-primary)] sm:text-2xl"
        >
          {exercise.title}
        </h3>
        <p className="mt-2 max-w-prose text-sm leading-relaxed text-[var(--text-primary)]">
          {exercise.instructions}
        </p>
      </header>

      {orderedQuestions.length === 0 ? (
        <p className="mt-5 text-sm text-[var(--text-secondary)]">
          No questions are available in this exercise yet.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          {orderedQuestions.map((question, index) => (
            <ExerciseQuestionCard
              key={question.id}
              question={question}
              questionNumber={index + 1}
              answer={answers[question.id]}
              evaluation={evaluationByQuestionId.get(question.id)}
              validationError={questionErrors[question.id]}
              isSubmitted={isSubmitted}
              onChangeAnswer={(nextVal) => handleAnswerChange(question.id, nextVal)}
            />
          ))}

          {formError ? (
            <p role="alert" className="text-sm font-medium text-[#B54747]">
              {formError}
            </p>
          ) : null}

          {!isSubmitted ? (
            <div className="pt-1">
              <button
                type="submit"
                className="inline-flex min-h-11 items-center justify-center rounded-[var(--radius-md)] bg-[var(--accent-academic-blue)] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--accent-academic-blue-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-academic-blue)]"
              >
                Submit answers
              </button>
            </div>
          ) : null}
        </form>
      )}

      {resultSummary ? (
        <div className="mt-6">
          <ExerciseResultsSummary
            summary={resultSummary}
            attemptNumber={attemptNumber}
            onRetry={handleRetry}
          />
        </div>
      ) : null}
    </section>
  );
}

