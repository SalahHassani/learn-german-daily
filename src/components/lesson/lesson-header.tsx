import type { CEFRLevel, Course, StructuredLesson, Week } from "@/types/content";
import { Badge } from "@/components/ui/badge";
import { getStatusLabel } from "@/services/content/visibilityPolicy";

type LessonHeaderProps = {
  level: CEFRLevel;
  course: Course;
  week: Week;
  lesson: StructuredLesson;
};

export function LessonHeader({ level, course, week, lesson }: LessonHeaderProps) {
  const levelCode = level.slug.toUpperCase();
  const statusLabel = getStatusLabel(lesson.status);

  return (
    <header className="max-w-3xl">
      <div className="flex flex-wrap items-center gap-2 text-sm font-medium text-[var(--text-secondary)]">
        <span>{course.title}</span>
        <span aria-hidden="true">&middot;</span>
        <span>{week.title}</span>
        <span aria-hidden="true">&middot;</span>
        <span>CEFR {levelCode}</span>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-3">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{lesson.title}</h1>
        <Badge tone="accent">Lesson {lesson.displayOrder}</Badge>
        {typeof lesson.estimatedDurationMinutes === "number" ? (
          <Badge tone="neutral">{lesson.estimatedDurationMinutes} min</Badge>
        ) : null}
        {statusLabel ? <Badge tone="neutral">{statusLabel}</Badge> : null}
      </div>

      {lesson.description ? (
        <p className="mt-3 text-base leading-relaxed text-[var(--text-primary)] sm:text-lg">
          {lesson.description}
        </p>
      ) : null}
    </header>
  );
}

