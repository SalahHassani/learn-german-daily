import type { StructuredLessonSection } from "@/types/content";
import { StructuralState } from "@/components/navigation/structural-state";
import { ContentBlockRenderer } from "./content-block-renderer";

type LessonSectionRendererProps = {
  section: StructuredLessonSection;
};

export function LessonSectionRenderer({ section }: LessonSectionRendererProps) {
  const headingId = `lesson-section-heading-${section.id}`;
  const hasBlocks = Array.isArray(section.blocks) && section.blocks.length > 0;

  return (
    <section
      id={`lesson-section-${section.id}`}
      aria-labelledby={headingId}
      className="scroll-mt-20 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-white p-6 sm:p-8"
    >
      <div className="border-b border-[var(--border-subtle)] pb-4">
        <p className="text-xs font-medium tracking-wide text-[var(--text-secondary)] uppercase">
          {section.key.replace(/_/g, " ")}
        </p>
        <h2 id={headingId} className="mt-1 text-2xl font-bold tracking-tight">
          {section.title}
        </h2>
      </div>

      <div className="mt-6 space-y-6">
        {hasBlocks ? (
          section.blocks.map((block) => <ContentBlockRenderer key={block.id} block={block} />)
        ) : (
          <StructuralState
            title="Section content pending"
            description={`No learning blocks have been added to "${section.title}" yet.`}
          />
        )}
      </div>
    </section>
  );
}

