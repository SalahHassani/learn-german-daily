import type { ContentService } from "@/services/content/contentService";
import type {
  ContinueLearningTarget,
  ExerciseAttemptRecord,
  LearnerProgressState,
  ScopeProgressSummary,
} from "@/types/progress";

export function calculateRatioPercentage(completed: number, total: number): number {
  if (!Number.isFinite(completed) || !Number.isFinite(total) || total <= 0 || completed <= 0) {
    return 0;
  }
  const boundedCompleted = Math.min(completed, total);
  return Math.round((boundedCompleted / total) * 100);
}

export function isLessonCompleted(
  state: LearnerProgressState,
  lessonId: string
): boolean {
  if (!lessonId) {
    return false;
  }
  return state.lessonsById[lessonId]?.completed === true;
}

export function getPublishedLessonsForWeek(
  contentService: ContentService,
  courseSlug: string,
  weekSlug: string
) {
  const weekView = contentService.getWeekBySlugs(courseSlug, weekSlug);
  if (!weekView) {
    return [];
  }
  return weekView.lessons.filter((lesson) => lesson.status === "published");
}

export function getWeekProgress(
  contentService: ContentService,
  state: LearnerProgressState,
  courseSlug: string,
  weekSlug: string
): ScopeProgressSummary {
  const publishedLessons = getPublishedLessonsForWeek(contentService, courseSlug, weekSlug);
  const totalPublishedLessons = publishedLessons.length;
  const completedLessons = publishedLessons.filter((lesson) =>
    isLessonCompleted(state, lesson.id)
  ).length;

  return {
    completedLessons,
    totalPublishedLessons,
    percentage: calculateRatioPercentage(completedLessons, totalPublishedLessons),
  };
}

export function getPublishedLessonsForCourse(
  contentService: ContentService,
  courseSlug: string
) {
  const courseView = contentService.getCourseBySlug(courseSlug);
  if (!courseView) {
    return [];
  }
  const lessons = [];
  for (const week of courseView.weeks) {
    if (week.status !== "published") {
      continue;
    }
    const weekLessons = contentService.getLessonsByWeekSlugs(courseSlug, week.slug);
    for (const lesson of weekLessons) {
      if (lesson.status === "published") {
        lessons.push(lesson);
      }
    }
  }
  return lessons;
}

export function getCourseProgress(
  contentService: ContentService,
  state: LearnerProgressState,
  courseSlug: string
): ScopeProgressSummary {
  const publishedLessons = getPublishedLessonsForCourse(contentService, courseSlug);
  const totalPublishedLessons = publishedLessons.length;
  const completedLessons = publishedLessons.filter((lesson) =>
    isLessonCompleted(state, lesson.id)
  ).length;

  return {
    completedLessons,
    totalPublishedLessons,
    percentage: calculateRatioPercentage(completedLessons, totalPublishedLessons),
  };
}

export function getPublishedLessonsForLevel(
  contentService: ContentService,
  levelSlug: string
) {
  const levelView = contentService.getLevelViewBySlug(levelSlug);
  if (!levelView) {
    return [];
  }
  const lessons = [];
  for (const course of levelView.courses) {
    if (course.status !== "published") {
      continue;
    }
    lessons.push(...getPublishedLessonsForCourse(contentService, course.slug));
  }
  return lessons;
}

export function getLevelProgress(
  contentService: ContentService,
  state: LearnerProgressState,
  levelSlug: string
): ScopeProgressSummary {
  const publishedLessons = getPublishedLessonsForLevel(contentService, levelSlug);
  const totalPublishedLessons = publishedLessons.length;
  const completedLessons = publishedLessons.filter((lesson) =>
    isLessonCompleted(state, lesson.id)
  ).length;

  return {
    completedLessons,
    totalPublishedLessons,
    percentage: calculateRatioPercentage(completedLessons, totalPublishedLessons),
  };
}

export function getAllPublishedLessonsOrdered(contentService: ContentService) {
  const ordered = [];
  for (const level of contentService.getLevels()) {
    if (level.status !== "published") {
      continue;
    }
    for (const course of contentService.getCoursesByLevelSlug(level.slug)) {
      if (course.status !== "published") {
        continue;
      }
      for (const week of contentService.getWeeksByCourseSlug(course.slug)) {
        if (week.status !== "published") {
          continue;
        }
        for (const lesson of contentService.getLessonsByWeekSlugs(course.slug, week.slug)) {
          if (lesson.status === "published") {
            ordered.push({
              level,
              course,
              week,
              lesson,
            });
          }
        }
      }
    }
  }
  return ordered;
}

export function getOverallProgress(
  contentService: ContentService,
  state: LearnerProgressState
): ScopeProgressSummary {
  const allPublished = getAllPublishedLessonsOrdered(contentService);
  const totalPublishedLessons = allPublished.length;
  const completedLessons = allPublished.filter(({ lesson }) =>
    isLessonCompleted(state, lesson.id)
  ).length;

  return {
    completedLessons,
    totalPublishedLessons,
    percentage: calculateRatioPercentage(completedLessons, totalPublishedLessons),
  };
}

export function getExerciseAttemptSummary(
  state: LearnerProgressState,
  exerciseId: string
): {
  attemptCount: number;
  latestAttempt?: ExerciseAttemptRecord;
  bestScorePercentage?: number;
  mostRecentSubmittedAt?: string;
  attempts: ExerciseAttemptRecord[];
} {
  const attempts = state.exerciseAttempts.filter(
    (attempt) => attempt.exerciseId === exerciseId
  );
  if (attempts.length === 0) {
    return {
      attemptCount: 0,
      attempts: [],
    };
  }

  const latestAttempt = attempts[attempts.length - 1];
  let bestScorePercentage = 0;
  for (const item of attempts) {
    if (item.percentage > bestScorePercentage) {
      bestScorePercentage = item.percentage;
    }
  }

  return {
    attemptCount: attempts.length,
    latestAttempt,
    bestScorePercentage,
    mostRecentSubmittedAt: latestAttempt?.submittedAt,
    attempts,
  };
}

export function resolveContinueLearningTarget(
  contentService: ContentService,
  state: LearnerProgressState
): ContinueLearningTarget | null {
  const orderedPublished = getAllPublishedLessonsOrdered(contentService);
  if (orderedPublished.length === 0) {
    return null;
  }

  const lastVisitedId = state.activity?.lastVisitedLessonId;
  if (lastVisitedId) {
    const visitedIndex = orderedPublished.findIndex(
      (entry) => entry.lesson.id === lastVisitedId
    );
    if (visitedIndex >= 0) {
      const visitedEntry = orderedPublished[visitedIndex]!;
      if (!isLessonCompleted(state, visitedEntry.lesson.id)) {
        return {
          lessonSlug: visitedEntry.lesson.slug,
          lessonTitle: visitedEntry.lesson.title,
          courseTitle: visitedEntry.course.title,
          levelName: visitedEntry.level.name,
          reason: "resume-incomplete",
        };
      }

      const nextEntry = orderedPublished[visitedIndex + 1];
      if (nextEntry) {
        return {
          lessonSlug: nextEntry.lesson.slug,
          lessonTitle: nextEntry.lesson.title,
          courseTitle: nextEntry.course.title,
          levelName: nextEntry.level.name,
          reason: "next-after-completed",
        };
      }
    }
  }

  const firstEntry = orderedPublished[0]!;
  return {
    lessonSlug: firstEntry.lesson.slug,
    lessonTitle: firstEntry.lesson.title,
    courseTitle: firstEntry.course.title,
    levelName: firstEntry.level.name,
    reason: "first-published",
  };
}

