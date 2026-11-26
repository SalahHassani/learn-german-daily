"use client";

import { useEffect } from "react";
import { LessonCompletionControl } from "@/components/progress/lesson-completion-control";
import { useProgress } from "@/components/progress/progress-provider-context";
import type {
  CEFRLevel,
  Course,
  StructuredLesson,
  Week,
} from "@/types/content";
import { LessonHeader } from "./lesson-header";
import { LessonNavigation } from "./lesson-navigation";
import { LessonSectionNavigation } from "./lesson-section-navigation";
import { LessonSectionRenderer } from "./lesson-section-renderer";

type AdjacentLessonSummary = {
  slug: string;
  title: string;
};

type LessonEngineProps = {
  lesson: StructuredLesson;
  levelName: string;
  levelSlug: string;
  courseTitle: string;
  courseSlug: string;
  weekTitle: string;
  weekSlug: string;
  previousLesson?: AdjacentLessonSummary;
  nextLesson?: AdjacentLessonSummary;
};

export function LessonEngine({
  lesson,
  levelName,
  levelSlug,
  courseTitle,
  courseSlug,
  weekTitle,
  weekSlug,
  previousLesson,
  nextLesson,
}: LessonEngineProps) {
  const { recordLessonVisited } = useProgress();

  const level = {
    id: levelSlug,
    slug: levelSlug,
    name: levelName,
    title: levelName,
  } as unknown as CEFRLevel;

  const course = {
    id: courseSlug,
    slug: courseSlug,
    title: courseTitle,
    name: courseTitle,
  } as unknown as Course;

  const week = {
    id: weekSlug,
    slug: weekSlug,
    title: weekTitle,
    name: weekTitle,
  } as unknown as Week;

  useEffect(() => {
    if (lesson.status === "published") {
      recordLessonVisited(lesson.id);
    }
  }, [lesson.id, lesson.status, recordLessonVisited]);

  const sortedSections = [...lesson.sections].sort((a, b) => a.order - b.order);

  return (
    <article className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="space-y-8">
        <LessonHeader
          level={level}
          course={course}
          week={week}
          lesson={lesson}
        />

        {lesson.status === "coming_soon" ? (
          <section
            aria-label="Lesson status"
            className="rounded-lg border border-[#D8E1E8] bg-[#EEF3F6] p-6"
          >
            <h2 className="font-[family-name:var(--font-heading)] text-lg font-semibold text-[#17324D]">
              Coming soon
            </h2>
            <p className="mt-2 text-sm text-[#263746]">
              This lesson is scheduled in the curriculum roadmap and is not yet published.
            </p>
          </section>
        ) : (
          <>
            <LessonSectionNavigation sections={sortedSections} />

            {sortedSections.length === 0 ? (
              <section
                aria-label="Lesson content"
                className="rounded-lg border border-[#D8E1E8] bg-[#FAFBFC] p-6"
              >
                <p className="text-sm text-[#64748B]">
                  No study sections have been added to this lesson yet.
                </p>
              </section>
            ) : (
              <div className="space-y-10">
                {sortedSections.map((section) => (
                  <LessonSectionRenderer
                    key={section.id}
                    section={section}
                  />
                ))}
              </div>
            )}

            <LessonCompletionControl
              lessonId={lesson.id}
              lessonTitle={lesson.title}
            />
          </>
        )}

        <LessonNavigation
          course={course}
          week={week}
          previousLessonSlug={previousLesson?.slug}
          nextLessonSlug={nextLesson?.slug}
        />
      </div>
    </article>
  );
}