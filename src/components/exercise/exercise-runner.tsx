"use client";

import { useRef, useState, type ComponentProps } from "react";
import { useProgress } from "@/components/progress/progress-provider-context";
import {
  createInitialAnswerMap,
  evaluateExercise,
  validateQuestionAnswered,
} from "@/services/exercise/exerciseEvaluator";
import type { ExerciseDefinition } from "@/types/content";
import { ExerciseQuestionCard } from "./exercise-question-card";
import { ExerciseResultsSummary } from "./exercise-results-summary";

type ExerciseAnswerMap = ReturnType<typeof createInitialAnswerMap>;
type ExerciseEvaluationSummary = ReturnType<typeof evaluateExercise>;
type QuestionCardProps = ComponentProps<typeof ExerciseQuestionCard>;
type QuestionAnswerValue = QuestionCardProps["answer"];
type EvaluatedQuestionResult = NonNullable<QuestionCardProps["evaluation"]>;

type ExerciseRunnerProps = {
  exercise: ExerciseDefinition;
  lessonId?: string;
};

function extractEvaluationMap(
  summary: ExerciseEvaluationSummary | null
): Map<string, EvaluatedQuestionResult> {
  const map = new Map<string, EvaluatedQuestionResult>();
  if (!summary || typeof summary !== "object") {
    return map;
  }

  const record = summary as Record<string, unknown>;
  const candidates = [
    record.results,
    record.questionResults,
    record.evaluations,
    record.items,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      for (const entry of candidate) {
        if (
          entry &&
          typeof entry === "object" &&
          "questionId" in entry &&
          typeof (entry as { questionId: unknown }).questionId === "string"
        ) {
          map.set(
            (entry as { questionId: string }).questionId,
            entry as EvaluatedQuestionResult
          );
        }
      }
      break;
    }
  }

  return map;
}

export function ExerciseRunner({ exercise, lessonId }: ExerciseRunnerProps) {
  const { recordExerciseAttempt } = useProgress();
  const startedAtRef = useRef<string>(new Date().toISOString());

  const [answers, setAnswers] = useState<ExerciseAnswerMap>(() =>
    createInitialAnswerMap(exercise.questions)
  );
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [summary, setSummary] = useState<ExerciseEvaluationSummary | null>(null);
  const [attemptNumber, setAttemptNumber] = useState<number>(1);

  const orderedQuestions = [...exercise.questions].sort(
    (a, b) => a.displayOrder - b.displayOrder
  );

  function handleAnswerChange(questionId: string, nextAnswer: QuestionAnswerValue) {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: nextAnswer as ExerciseAnswerMap[string],
    }));
    setValidationErrors((prev) => {
      if (!prev[questionId]) {
        return prev;
      }
      const next = { ...prev };
      delete next[questionId];
      return next;
    });
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors: Record<string, string> = {};
    for (const question of orderedQuestions) {
      const validationMessage = validateQuestionAnswered(question, answers[question.id]);
      if (typeof validationMessage === "string" && validationMessage.trim().length > 0) {
        nextErrors[question.id] = validationMessage;
      }
    }

    if (Object.keys(nextErrors).length > 0) {
      setValidationErrors(nextErrors);
      setSummary(null);
      return;
    }

    const evaluated = evaluateExercise(exercise, answers);
    const submittedAt = new Date().toISOString();

    recordExerciseAttempt({
      exerciseId: exercise.id,
      ...(lessonId ? { lessonId } : {}),
      startedAt: startedAtRef.current,
      submittedAt,
      earnedPoints: evaluated.earnedPoints,
      totalPoints: evaluated.totalPoints,
      percentage: evaluated.percentage,
      correctCount: evaluated.correctCount,
      totalQuestions: evaluated.totalQuestions,
    });

    setValidationErrors({});
    setSummary(evaluated);
  }

  function handleRetry() {
    startedAtRef.current = new Date().toISOString();
    setAnswers(createInitialAnswerMap(exercise.questions));
    setValidationErrors({});
    setSummary(null);
    setAttemptNumber((prev) => prev + 1);
  }

  const evaluationMap = extractEvaluationMap(summary);
  const isSubmitted = summary !== null;

  return (
    <section
      aria-label={exercise.title}
      className="space-y-6 rounded-xl border border-[#D8E1E8] bg-[#FAFBFC] p-5 sm:p-6"
    >
      <header className="space-y-1 border-b border-[#D8E1E8] pb-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs font-semibold tracking-wider text-[#245B78] uppercase">
            Practice Exercise · Attempt #{attemptNumber}
          </p>
          <span className="text-xs text-[#64748B]">
            {orderedQuestions.length}{" "}
            {orderedQuestions.length === 1 ? "question" : "questions"}
          </span>
        </div>
        <h3 className="font-[family-name:var(--font-heading)] text-xl font-semibold text-[#17324D]">
          {exercise.title}
        </h3>
        {exercise.instructions ? (
          <p className="text-sm text-[#263746]">{exercise.instructions}</p>
        ) : null}
      </header>

      {orderedQuestions.length === 0 ? (
        <p className="text-sm text-[#64748B]">
          No questions are configured for this exercise yet.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <div className="space-y-5">
            {orderedQuestions.map((question, index) => (
              <ExerciseQuestionCard
                key={question.id}
                question={question}
                questionNumber={index + 1}
                answer={answers[question.id] as QuestionAnswerValue}
                evaluation={evaluationMap.get(question.id)}
                validationError={validationErrors[question.id]}
                isSubmitted={isSubmitted}
                onChangeAnswer={(nextAnswer) =>
                  handleAnswerChange(question.id, nextAnswer)
                }
              />
            ))}
          </div>

          {summary ? (
            <ExerciseResultsSummary
              summary={summary}
              attemptNumber={attemptNumber}
              onRetry={handleRetry}
            />
          ) : (
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="submit"
                className="min-h-11 rounded-md bg-[#17324D] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#245B78] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#245B78]"
              >
                Check answers
              </button>
            </div>
          )}
        </form>
      )}
    </section>
  );
}

