"use client";

import type {
  MultipleChoiceQuestion,
  SingleChoiceQuestion,
  TrueFalseQuestion,
} from "@/types/content";

type SingleChoiceInputProps = {
  question: SingleChoiceQuestion;
  selectedOptionId: string | null;
  disabled?: boolean;
  onChange: (optionId: string) => void;
};

export function SingleChoiceInput({
  question,
  selectedOptionId,
  disabled = false,
  onChange,
}: SingleChoiceInputProps) {
  return (
    <fieldset className="space-y-2.5">
      <legend className="sr-only">Choose one option for: {question.prompt}</legend>
      {question.options.map((option) => {
        const inputId = `${question.id}-opt-${option.id}`;
        const checked = selectedOptionId === option.id;
        return (
          <label
            key={option.id}
            htmlFor={inputId}
            className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-[var(--radius-md)] border px-4 py-2.5 text-sm transition-colors ${
              checked
                ? "border-[var(--accent-academic-blue)] bg-[var(--surface-secondary)] font-medium text-[var(--text-primary)]"
                : "border-[var(--border-subtle)] bg-white text-[var(--text-primary)] hover:border-[var(--accent-academic-blue)]/60"
            } ${disabled ? "cursor-not-allowed opacity-75" : ""}`}
          >
            <input
              id={inputId}
              type="radio"
              name={`question-${question.id}`}
              value={option.id}
              checked={checked}
              disabled={disabled}
              onChange={() => onChange(option.id)}
              className="h-4 w-4 accent-[var(--accent-academic-blue)]"
            />
            <span>{option.label}</span>
          </label>
        );
      })}
    </fieldset>
  );
}

type MultipleChoiceInputProps = {
  question: MultipleChoiceQuestion;
  selectedOptionIds: readonly string[];
  disabled?: boolean;
  onToggleOption: (optionId: string) => void;
};

export function MultipleChoiceInput({
  question,
  selectedOptionIds,
  disabled = false,
  onToggleOption,
}: MultipleChoiceInputProps) {
  const selectedSet = new Set(selectedOptionIds);

  return (
    <fieldset className="space-y-2.5">
      <legend className="sr-only">Select all matching options for: {question.prompt}</legend>
      {question.options.map((option) => {
        const inputId = `${question.id}-chk-${option.id}`;
        const checked = selectedSet.has(option.id);
        return (
          <label
            key={option.id}
            htmlFor={inputId}
            className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-[var(--radius-md)] border px-4 py-2.5 text-sm transition-colors ${
              checked
                ? "border-[var(--accent-academic-blue)] bg-[var(--surface-secondary)] font-medium text-[var(--text-primary)]"
                : "border-[var(--border-subtle)] bg-white text-[var(--text-primary)] hover:border-[var(--accent-academic-blue)]/60"
            } ${disabled ? "cursor-not-allowed opacity-75" : ""}`}
          >
            <input
              id={inputId}
              type="checkbox"
              value={option.id}
              checked={checked}
              disabled={disabled}
              onChange={() => onToggleOption(option.id)}
              className="h-4 w-4 accent-[var(--accent-academic-blue)]"
            />
            <span>{option.label}</span>
          </label>
        );
      })}
    </fieldset>
  );
}

type TrueFalseInputProps = {
  question: TrueFalseQuestion;
  selectedValue: boolean | null;
  disabled?: boolean;
  onChange: (value: boolean) => void;
};

export function TrueFalseInput({
  question,
  selectedValue,
  disabled = false,
  onChange,
}: TrueFalseInputProps) {
  const trueLabel = question.trueLabel ?? "True";
  const falseLabel = question.falseLabel ?? "False";

  const choices: { value: boolean; label: string }[] = [
    { value: true, label: trueLabel },
    { value: false, label: falseLabel },
  ];

  return (
    <fieldset className="grid gap-2.5 sm:grid-cols-2">
      <legend className="sr-only">Select True or False for: {question.prompt}</legend>
      {choices.map((choice) => {
        const inputId = `${question.id}-tf-${String(choice.value)}`;
        const checked = selectedValue === choice.value;
        return (
          <label
            key={String(choice.value)}
            htmlFor={inputId}
            className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-[var(--radius-md)] border px-4 py-2.5 text-sm transition-colors ${
              checked
                ? "border-[var(--accent-academic-blue)] bg-[var(--surface-secondary)] font-medium text-[var(--text-primary)]"
                : "border-[var(--border-subtle)] bg-white text-[var(--text-primary)] hover:border-[var(--accent-academic-blue)]/60"
            } ${disabled ? "cursor-not-allowed opacity-75" : ""}`}
          >
            <input
              id={inputId}
              type="radio"
              name={`question-${question.id}`}
              checked={checked}
              disabled={disabled}
              onChange={() => onChange(choice.value)}
              className="h-4 w-4 accent-[var(--accent-academic-blue)]"
            />
            <span>{choice.label}</span>
          </label>
        );
      })}
    </fieldset>
  );
}

