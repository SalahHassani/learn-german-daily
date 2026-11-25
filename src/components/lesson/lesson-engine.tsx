"use client";

import { useState } from "react";
import type { ResolvedLessonView } from "@/types/content";
import { isComingSoonStatus } from "@/services/content/visibilityPolicy";
import { StructuralState } from "@/components/navigation/structural-state";
import { LessonHeader } from "./lesson-header";
import { LessonSectionNavigation } from "./lesson-section-navigation";
import { LessonSectionRenderer } from "./lesson-section-renderer";
import { LessonNavigation } from "./lesson-navigation";

type LessonEngineProps = {
  resolvedLesson: ResolvedLessonView;
};

export function LessonEngine({ resolvedLesson }: LessonEngineProps) {
  const { level, course, week, lesson, previousLessonSlug, nextLessonSlug } = resolvedLesson;
  const orderedSections = [...lesson.sections].sort((a, b) => a.order - b.order);
  const [activeSectionId, setActiveSectionId] = useState<string | undefined>(
    orderedSections[0]?.id
  );
  const isComingSoon = isComingSoonStatus(lesson.status);

  return (
    <div>
      <LessonHeader level={level} course={course} week={week} lesson={lesson} />

      {isComingSoon ? (
        <div className="mt-8">
          <StructuralState
            title={`${lesson.title} — Coming soon`}
            description={`Lesson content for ${lesson.title} in ${week.title} is planned and not yet available.`}
            actionHref={`/courses/${course.slug}/weeks/${week.slug}`}
            actionLabel={`Back to ${week.title}`}
          />
        </div>
      ) : (
        <>
          <LessonSectionNavigation
            sections={orderedSections}
            activeSectionId={activeSectionId}
            onSelectSection={setActiveSectionId}
          />

          {orderedSections.length === 0 ? (
            <div className="mt-8">
              <StructuralState
                title="Lesson sections pending"
                description={`No structured sections have been published for ${lesson.title} yet.`}
                actionHref={`/courses/${course.slug}/weeks/${week.slug}`}
                actionLabel={`Back to ${week.title}`}
              />
            </div>
          ) : (
            <div className="mt-8 space-y-6">
              {orderedSections.map((section) => (
                <LessonSectionRenderer key={section.id} section={section} />
              ))}
            </div>
          )}
        </>
      )}

      <LessonNavigation
        course={course}
        week={week}
        previousLessonSlug={previousLessonSlug}
        nextLessonSlug={nextLessonSlug}
      />
    </div>
  );
}

