import type { TypedContentBlock } from "@/types/content";
import { ExerciseBlockRenderer } from "../exercise/exercise-block-renderer";
import {
  ExampleSentenceView,
  GrammarExplanationView,
  ReadingPassageView,
  SentenceConstructionView,
} from "./grammar-and-reading-blocks";
import { VerbConjugationView, VerbInfoView } from "./verb-view";
import { VocabularyItemView, VocabularyListView } from "./vocabulary-view";

type ContentBlockRendererProps = {
  block: TypedContentBlock;
  lessonId?: string;
};

export function ContentBlockRenderer({ block, lessonId }: ContentBlockRendererProps) {
  switch (block.kind) {
    case "heading": {
      if (block.level === 2) {
        return (
          <h2 className="font-[family-name:var(--font-heading)] text-xl font-semibold text-[#17324D]">
            {block.text}
          </h2>
        );
      }
      if (block.level === 3) {
        return (
          <h3 className="font-[family-name:var(--font-heading)] text-lg font-semibold text-[#17324D]">
            {block.text}
          </h3>
        );
      }
      return (
        <h4 className="font-[family-name:var(--font-heading)] text-base font-semibold text-[#17324D]">
          {block.text}
        </h4>
      );
    }
    case "text":
      return (
        <p className="text-base leading-relaxed text-[#263746]">
          {block.body}
        </p>
      );
    case "vocabulary-item":
      return <VocabularyItemView {...block} />;
    case "vocabulary-list":
      return <VocabularyListView {...block} />;
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
      return <GrammarExplanationView {...block} />;
    case "example-sentence":
      return <ExampleSentenceView {...block} />;
    case "reading-passage":
      return <ReadingPassageView {...block} />;
    case "sentence-construction":
      return <SentenceConstructionView {...block} />;
    case "exercise-reference":
      return <ExerciseBlockRenderer block={block} lessonId={lessonId} />;
    default: {
      const exhaustiveCheck: never = block;
      void exhaustiveCheck;
      return (
        <div className="rounded-lg border border-[#D8E1E8] bg-[#EEF3F6] p-4 text-sm text-[#64748B]">
          Unsupported lesson content block.
        </div>
      );
    }
  }
}

