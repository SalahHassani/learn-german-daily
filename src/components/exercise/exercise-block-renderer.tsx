import { contentService } from "@/services/content/contentService";
import type { TypedContentBlock } from "@/types/content";
import { ExerciseRunner } from "./exercise-runner";

type ExerciseReferenceBlock = Extract<
  TypedContentBlock,
  { kind: "exercise-reference" }
>;

type ExerciseBlockRendererProps = {
  block: ExerciseReferenceBlock;
  lessonId?: string;
};

export function ExerciseBlockRenderer({
  block,
  lessonId,
}: ExerciseBlockRendererProps) {
  const exercise = contentService.getExerciseById(block.exerciseId);

  if (!exercise) {
    return (
      <div className="rounded-lg border border-[#D8E1E8] bg-[#EEF3F6] p-4">
        <p className="text-sm font-medium text-[#17324D]">{block.summary}</p>
        <p className="mt-1 text-xs text-[#64748B]">
          Practice exercise is currently unavailable.
        </p>
      </div>
    );
  }

  if (exercise.status === "coming_soon") {
    return (
      <div className="rounded-lg border border-[#D8E1E8] bg-[#EEF3F6] p-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-semibold text-[#17324D]">{exercise.title}</p>
          <span className="inline-flex items-center rounded-md border border-[#D8E1E8] bg-[#FAFBFC] px-2 py-0.5 text-xs font-medium text-[#64748B]">
            Coming soon
          </span>
        </div>
        <p className="mt-1 text-sm text-[#263746]">{block.summary}</p>
      </div>
    );
  }

  return <ExerciseRunner exercise={exercise} lessonId={lessonId} />;
}

