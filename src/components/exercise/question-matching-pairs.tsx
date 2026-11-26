"use client";

import { useState } from "react";
import type { MatchingPairsQuestion } from "@/types/content";

type MatchingPairsInputProps = {
  question: MatchingPairsQuestion;
  matches: Record<string, string>;
  disabled?: boolean;
  onChangeMatches: (nextMatches: Record<string, string>) => void;
};

export function MatchingPairsInput({
  question,
  matches,
  disabled = false,
  onChangeMatches,
}: MatchingPairsInputProps) {
  const [selectedPairId, setSelectedPairId] = useState<string | null>(
    question.pairs[0]?.id ?? null
  );

  const rightChoices = question.pairs.map((pair) => pair.right);

  const handleSelectRight = (rightValue: string) => {
    if (disabled || !selectedPairId) {
      return;
    }
    const next: Record<string, string> = { ...matches };
    for (const [key, val] of Object.entries(next)) {
      if (val === rightValue && key !== selectedPairId) {
        delete next[key];
      }
    }
    next[selectedPairId] = rightValue;
    onChangeMatches(next);
  };

  const handleClearMatch = (pairId: string) => {
    if (disabled) {
      return;
    }
    const next = { ...matches };
    delete next[pairId];
    onChangeMatches(next);
  };

  return (
    <div className="space-y-4">
      <p className="text-xs font-medium text-[var(--text-secondary)]">
        Select an item on the left, then choose its matching item on the right. You can change or
        clear any match before submitting.
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2" role="group" aria-label="Left items">
          <p className="text-xs font-semibold tracking-wide text-[var(--text-secondary)] uppercase">
            Items
          </p>
          {question.pairs.map((pair) => {
            const isSelected = selectedPairId === pair.id;
            const matchedRight = matches[pair.id];
            return (
              <div
                key={pair.id}
                className={`flex items-center justify-between gap-2 rounded-[var(--radius-md)] border p-3 transition-colors ${
                  isSelected
                    ? "border-[var(--accent-academic-blue)] bg-[var(--surface-secondary)]"
                    : "border-[var(--border-subtle)] bg-white"
                }`}
              >
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => setSelectedPairId(pair.id)}
                  aria-pressed={isSelected}
                  className="flex-1 text-left text-sm font-medium text-[var(--text-primary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-academic-blue)]"
                >
                  <span>{pair.left}</span>
                  <span className="mt-0.5 block text-xs text-[var(--text-secondary)]">
                    {matchedRight ? `Matched: ${matchedRight}` : "Not matched yet"}
                  </span>
                </button>

                {matchedRight ? (
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => handleClearMatch(pair.id)}
                    aria-label={`Clear match for ${pair.left}`}
                    className="inline-flex min-h-8 items-center rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-white px-2.5 py-1 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-academic-blue)] disabled:opacity-50"
                  >
                    Clear
                  </button>
                ) : null}
              </div>
            );
          })}
        </div>

        <div className="space-y-2" role="group" aria-label="Right match choices">
          <p className="text-xs font-semibold tracking-wide text-[var(--text-secondary)] uppercase">
            Matches
          </p>
          {rightChoices.map((rightLabel, idx) => {
            const activeMatchForSelected =
              selectedPairId ? matches[selectedPairId] === rightLabel : false;
            return (
              <button
                key={`${idx}-${rightLabel}`}
                type="button"
                disabled={disabled || !selectedPairId}
                onClick={() => handleSelectRight(rightLabel)}
                aria-pressed={activeMatchForSelected}
                className={`flex min-h-11 w-full items-center justify-between rounded-[var(--radius-md)] border px-4 py-2.5 text-left text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-academic-blue)] disabled:cursor-not-allowed disabled:opacity-60 ${
                  activeMatchForSelected
                    ? "border-[var(--accent-academic-blue)] bg-[var(--accent-academic-blue)] font-medium text-white"
                    : "border-[var(--border-subtle)] bg-white text-[var(--text-primary)] hover:border-[var(--accent-academic-blue)] hover:bg-[var(--surface-secondary)]/60"
                }`}
              >
                <span>{rightLabel}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

