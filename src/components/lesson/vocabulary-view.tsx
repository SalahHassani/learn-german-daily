import type { VocabularyEntry } from "@/types/content";
import { Badge } from "@/components/ui/badge";

type VocabularyItemViewProps = {
  item: VocabularyEntry;
};

export function VocabularyItemView({ item }: VocabularyItemViewProps) {
  return (
    <article className="rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-secondary)]/50 p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div className="flex flex-wrap items-baseline gap-2">
          {item.article ? (
            <span className="font-semibold text-[var(--accent-academic-blue)]">
              {item.article}
            </span>
          ) : null}
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">{item.germanWord}</h3>
          {item.plural ? (
            <span className="text-xs text-[var(--text-secondary)]">({item.plural})</span>
          ) : null}
        </div>
        <Badge tone="neutral">{item.partOfSpeech}</Badge>
      </div>

      <p className="mt-1.5 text-sm font-medium text-[var(--text-primary)]">{item.englishMeaning}</p>

      {item.pronunciationReference ? (
        <p className="mt-1 text-xs text-[var(--text-secondary)]">
          Pronunciation: {item.pronunciationReference}
        </p>
      ) : null}

      {item.exampleSentence ? (
        <div className="mt-3 border-t border-[var(--border-subtle)] pt-2.5 text-sm">
          <p className="font-medium text-[var(--text-primary)]">{item.exampleSentence.german}</p>
          {item.exampleSentence.english ? (
            <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
              {item.exampleSentence.english}
            </p>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

type VocabularyListViewProps = {
  items: readonly VocabularyEntry[];
};

export function VocabularyListView({ items }: VocabularyListViewProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {items.map((item) => (
        <VocabularyItemView key={item.id} item={item} />
      ))}
    </div>
  );
}

