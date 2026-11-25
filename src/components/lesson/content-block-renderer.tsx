import type { TypedContentBlock } from "@/types/content";
import {
  ExampleSentenceView,
  ExerciseReferenceView,
  GrammarExplanationView,
  ReadingPassageView,
  SentenceConstructionView,
} from "./grammar-and-reading-blocks";
import { VerbConjugationView, VerbInfoView } from "./verb-view";
import { VocabularyItemView, VocabularyListView } from "./vocabulary-view";

type ContentBlockRendererProps = {
  block: TypedContentBlock;
};

export function ContentBlockRenderer({ block }: ContentBlockRendererProps) {
  switch (block.kind) {
    case "text":
      return (
        <p className="max-w-prose text-base leading-relaxed text-[var(--text-primary)]">
          {block.body}
        </p>
      );

    case "heading":
      if (block.level === 2) {
        return <h2 className="text-2xl font-bold tracking-tight">{block.text}</h2>;
      }
      if (block.level === 4) {
        return <h4 className="text-base font-semibold">{block.text}</h4>;
      }
      return <h3 className="text-xl font-semibold">{block.text}</h3>;

    case "vocabulary-item":
      return <VocabularyItemView item={block.item} />;

    case "vocabulary-list":
      return <VocabularyListView items={block.items} />;

    case "verb-info":
      return <VerbInfoView verb={block.verb} />;

    case "verb-conjugation":
      return (
        <VerbConjugationView
          infinitive={block.infinitive}
          forms={block.forms}
          notes={block.notes}
        />
      );

    case "grammar-explanation":
      return (
        <GrammarExplanationView
          ruleTitle={block.ruleTitle}
          explanation={block.explanation}
          examples={block.examples}
        />
      );

    case "example-sentence":
      return <ExampleSentenceView german={block.german} english={block.english} />;

    case "reading-passage":
      return (
        <ReadingPassageView
          title={block.title}
          germanText={block.germanText}
          translationNote={block.translationNote}
        />
      );

    case "sentence-construction":
      return (
        <SentenceConstructionView prompt={block.prompt} targetHint={block.targetHint} />
      );

    case "exercise-reference":
      return (
        <ExerciseReferenceView exerciseId={block.exerciseId} summary={block.summary} />
      );

    default: {
      const unknownBlock = block as { id?: string; kind?: string };
      return (
        <div
          role="status"
          className="rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-secondary)] p-4 text-sm text-[var(--text-secondary)]"
        >
          Unsupported content block{unknownBlock.kind ? ` (${unknownBlock.kind})` : ""} skipped.
        </div>
      );
    }
  }
}

