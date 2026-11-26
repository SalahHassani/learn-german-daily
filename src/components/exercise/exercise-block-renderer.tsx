import { contentService } from "@/services/content/contentService";
import { isComingSoonStatus } from "@/services/content/visibilityPolicy";
import { ExerciseRunner } from "./exercise-runner";

type ExerciseBlockRendererProps = {
  exerciseId: string;
  summary: string;
};

export function ExerciseBlockRenderer({ exerciseId, summary }: ExerciseBlockRendererProps) {
  const exercise = contentService.getExerciseById(exerciseId);

  if (!exercise) {
    return (
      <div
        role="status"
        className="rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-secondary)]/50 p-4 text-sm text-[var(--text-secondary)]"
      >
        <p className="font-medium text-[var(--text-primary)]">Exercise currently unavailable</p>
        <p className="mt-1">{summary}</p>
      </div>
    );
  }

  if (isComingSoonStatus(exercise.status)) {
    return (
      <div
        role="status"
        className="rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-secondary)]/50 p-4 text-sm text-[var(--text-secondary)]"
      >
        <p className="font-medium text-[var(--text-primary)]">
          {exercise.title} — Coming soon
        </p>
        <p className="mt-1">{exercise.instructions}</p>
      </div>
    );
  }

  return <ExerciseRunner exercise={exercise} />;
}

