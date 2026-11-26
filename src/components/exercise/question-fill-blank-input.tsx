"use client";

import type { FillInBlankQuestion } from "@/types/content";

type FillInBlankInputProps = {
  question: FillInBlankQuestion;
  value: string;
  disabled?: boolean;
  describedById?: string;
  onChange: (nextValue: string) => void;
};

export function FillInBlankInput({
  question,
  value,
  disabled = false,
  describedById,
  onChange,
}: FillInBlankInputProps) {
  const inputId = `${question.id}-fill-blank`;

  return (
    <div className="max-w-md">
      <label
        htmlFor={inputId}
        className="block text-xs font-medium tracking-wide text-[var(--text-secondary)] uppercase"
      >
        Your answer
      </label>
      <input
        id={inputId}
        type="text"
        value={value}
        disabled={disabled}
        placeholder={question.placeholder ?? "Type your answer"}
        aria-describedby={describedById}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1.5 min-h-11 w-full rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-white px-3.5 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:border-[var(--accent-academic-blue)] focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-academic-blue)] disabled:cursor-not-allowed disabled:opacity-75"
      />
    </div>
  );
}

