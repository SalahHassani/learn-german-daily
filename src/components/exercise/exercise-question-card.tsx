"use client";

import type { ExerciseQuestion } from "@/types/content";
import type {
  EvaluatedQuestionResult,
  QuestionAnswerValue,
} from "@/services/exercise/exerciseEvaluator";
import {
  MultipleChoiceInput,
  SingleChoiceInput,
  TrueFalseInput,
} from "./question-choice-inputs";
import { FillInBlankInput } from "./question-fill-blank-input";
import { SentenceOrderingInput } from "./question-sentence-ordering";
import { MatchingPairsInput } from "./question-matching-pairs";

type ExerciseQuestionCardProps = {
  question: ExerciseQuestion;
  questionNumber: number;
  answer: QuestionAnswerValue | undefined;
  evaluation?: EvaluatedQuestionResult;
  validationError?: string;
  isSubmitted: boolean;
  onChangeAnswer: (nextAnswer: QuestionAnswerValue) => void;
};

export function ExerciseQuestionCard({
  question,
  questionNumber,
  answer,
  evaluation,
  validationError,
  isSubmitted,
  onChangeAnswer,
}: ExerciseQuestionCardProps) {
  const hintId = `${question.id}-hint`;
  const errorId = `${question.id}-error`;
  const describedByIds = [
    question.hint ? hintId : null,
    validationError ? errorId : null,
  ]
    .filter(Boolean)
    .join(" ");

  const toggleMultipleOption = (optionId: string) => {
    const current =
      answer && answer.kind === "multiple-choice" ? [...answer.selectedOptionIds] : [];
    const exists = current.includes(optionId);
    const nextIds = exists
      ? current.filter((id) => id !== optionId)
      : [...current, optionId];
    onChangeAnswer({ kind: "multiple-choice", selectedOptionIds: nextIds });
  };

  return (
    <article className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-white p-5 sm:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <span className="text-xs font-semibold tracking-wide text-[var(--text-secondary)] uppercase">
          Question {questionNumber}
        </span>
        <span className="text-xs font-medium text-[var(--text-secondary)]">
          {question.points} {question.points === 1 ? "point" : "points"}
        </span>
      </div>

      <h3 className="mt-2 text-base font-semibold text-[var(--text-primary)] sm:text-lg">
        {question.prompt}
      </h3>

      {question.hint ? (
        <p id={hintId} className="mt-1.5 text-xs text-[var(--text-secondary)]">
          Hint: {question.hint}
        </p>
      ) : null}

      <div className="mt-4">
        {question.questionType === "single-choice" ? (
          <SingleChoiceInput
            question={question}
            selectedOptionId={
              answer && answer.kind === "single-choice" ? answer.selectedOptionId : null
            }
            disabled={isSubmitted}
            onChange={(selectedOptionId) =>
              onChangeAnswer({ kind: "single-choice", selectedOptionId })
            }
          />
        ) : null}

        {question.questionType === "multiple-choice" ? (
          <MultipleChoiceInput
            question={question}
            selectedOptionIds={
              answer && answer.kind === "multiple-choice" ? answer.selectedOptionIds : []
            }
            disabled={isSubmitted}
            onToggleOption={toggleMultipleOption}
          />
        ) : null}

        {question.questionType === "true-false" ? (
          <TrueFalseInput
            question={question}
            selectedValue={
              answer && answer.kind === "true-false" ? answer.selectedValue : null
            }
            disabled={isSubmitted}
            onChange={(selectedValue) =>
              onChangeAnswer({ kind: "true-false", selectedValue })
            }
          />
        ) : null}

        {question.questionType === "fill-in-the-blank" ? (
          <FillInBlankInput
            question={question}
            value={answer && answer.kind === "fill-in-the-blank" ? answer.value : ""}
            disabled={isSubmitted}
            describedById={describedByIds || undefined}
            onChange={(value) => onChangeAnswer({ kind: "fill-in-the-blank", value })}
          />
        ) : null}

        {question.questionType === "sentence-ordering" ? (
          <SentenceOrderingInput
            question={question}
            orderedTokenIds={
              answer && answer.kind === "sentence-ordering"
                ? answer.orderedTokenIds
                : question.tokens.map((t) => t.id)
            }
            disabled={isSubmitted}
            onChangeOrder={(orderedTokenIds) =>
              onChangeAnswer({ kind: "sentence-ordering", orderedTokenIds })
            }
          />
        ) : null}

        {question.questionType === "matching-pairs" ? (
          <MatchingPairsInput
            question={question}
            matches={answer && answer.kind === "matching-pairs" ? answer.matches : {}}
            disabled={isSubmitted}
            onChangeMatches={(matches) => onChangeAnswer({ kind: "matching-pairs", matches })}
          />
        ) : null}
      </div>

      {validationError ? (
        <p
          id={errorId}
          role="alert"
          className="mt-3 text-sm font-medium text-[#B54747]"
        >
          {validationError}
        </p>
      ) : null}

      {isSubmitted && evaluation ? (
        <div
          role="status"
          aria-live="polite"
          className={`mt-5 rounded-[var(--radius-md)] border p-4 text-sm ${
            evaluation.isCorrect
              ? "border-[#3F765B] bg-[#3F765B]/10 text-[var(--text-primary)]"
              : "border-[#B54747] bg-[#B54747]/10 text-[var(--text-primary)]"
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span
              className={`font-semibold ${
                evaluation.isCorrect ? "text-[#3F765B]" : "text-[#B54747]"
              }`}
            >
              {evaluation.isCorrect ? "Correct" : "Incorrect"}
            </span>
            <span className="text-xs font-medium text-[var(--text-secondary)]">
              {evaluation.pointsEarned} / {evaluation.pointsPossible} pts
            </span>
          </div>

          {!evaluation.isCorrect ? (
            <p className="mt-2 text-sm text-[var(--text-primary)]">
              <span className="font-medium">Expected answer:</span>{" "}
              {evaluation.expectedAnswerSummary}
            </p>
          ) : null}

          {evaluation.explanation ? (
            <p className="mt-2 text-sm text-[var(--text-primary)]">{evaluation.explanation}</p>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

