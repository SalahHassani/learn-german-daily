"use client";

import type { SentenceOrderingQuestion } from "@/types/content";

type SentenceOrderingInputProps = {
  question: SentenceOrderingQuestion;
  orderedTokenIds: readonly string[];
  disabled?: boolean;
  onChangeOrder: (nextIds: string[]) => void;
};

export function SentenceOrderingInput({
  question,
  orderedTokenIds,
  disabled = false,
  onChangeOrder,
}: SentenceOrderingInputProps) {
  const tokenMap = new Map(question.tokens.map((t) => [t.id, t]));
  const currentIds =
    orderedTokenIds.length === question.tokens.length
      ? [...orderedTokenIds]
      : question.tokens.map((t) => t.id);

  const moveToken = (index: number, delta: -1 | 1) => {
    const targetIndex = index + delta;
    if (targetIndex < 0 || targetIndex >= currentIds.length) {
      return;
    }
    const next = [...currentIds];
    const [moved] = next.splice(index, 1);
    if (!moved) {
      return;
    }
    next.splice(targetIndex, 0, moved);
    onChangeOrder(next);
  };

  const resetOrder = () => {
    onChangeOrder(question.tokens.map((t) => t.id));
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-medium text-[var(--text-secondary)]">
          Arrange items in order using the move buttons or keyboard.
        </p>
        <button
          type="button"
          disabled={disabled}
          onClick={resetOrder}
          className="inline-flex min-h-9 items-center rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-white px-3 py-1 text-xs font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--surface-secondary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-academic-blue)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          Reset order
        </button>
      </div>

      <ol className="space-y-2" aria-label={`Sentence items for ${question.prompt}`}>
        {currentIds.map((tokenId, idx) => {
          const token = tokenMap.get(tokenId);
          const labelText = token?.text ?? tokenId;
          return (
            <li
              key={tokenId}
              className="flex items-center justify-between gap-3 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-white px-4 py-2.5"
            >
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-[var(--text-secondary)]">
                  {idx + 1}.
                </span>
                <span className="text-sm font-medium text-[var(--text-primary)]">{labelText}</span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={disabled || idx === 0}
                  aria-label={`Move ${labelText} up`}
                  onClick={() => moveToken(idx, -1)}
                  className="inline-flex min-h-9 min-w-9 items-center justify-center rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-secondary)] text-xs font-semibold text-[var(--text-primary)] transition-colors hover:border-[var(--accent-academic-blue)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-academic-blue)] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  &uarr;
                </button>
                <button
                  type="button"
                  disabled={disabled || idx === currentIds.length - 1}
                  aria-label={`Move ${labelText} down`}
                  onClick={() => moveToken(idx, 1)}
                  className="inline-flex min-h-9 min-w-9 items-center justify-center rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-secondary)] text-xs font-semibold text-[var(--text-primary)] transition-colors hover:border-[var(--accent-academic-blue)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-academic-blue)] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  &darr;
                </button>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

