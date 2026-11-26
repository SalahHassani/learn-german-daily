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

export async function getPublishedLessonsForWeek(
  contentService: ContentService,
  courseSlug: string,
  weekSlug: string
) {
  const weekView = await contentService.getWeekBySlugs(courseSlug, weekSlug);
  if (!weekView) {
    return [];
  }
  return weekView.lessons.filter((lesson) => lesson.status === "published");
}

export async function getWeekProgress(
  contentService: ContentService,
  state: LearnerProgressState,
  courseSlug: string,
  weekSlug: string
): Promise<ScopeProgressSummary> {
  const publishedLessons = await getPublishedLessonsForWeek(
    contentService,
    courseSlug,
    weekSlug
  );
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

export async function getPublishedLessonsForCourse(
  contentService: ContentService,
  courseSlug: string
) {
  const courseView = await contentService.getCourseBySlug(courseSlug);
  if (!courseView) {
    return [];
  }
  const lessons = [];
  for (const week of courseView.weeks) {
    if (week.status !== "published") {
      continue;
    }
    const weekLessons = await contentService.getLessonsByWeekSlugs(courseSlug, week.slug);
    for (const lesson of weekLessons) {
      if (lesson.status === "published") {
        lessons.push(lesson);
      }
    }
  }
  return lessons;
}

export async function getCourseProgress(
  contentService: ContentService,
  state: LearnerProgressState,
  courseSlug: string
): Promise<ScopeProgressSummary> {
  const publishedLessons = await getPublishedLessonsForCourse(contentService, courseSlug);
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

export async function getPublishedLessonsForLevel(
  contentService: ContentService,
  levelSlug: string
) {
  const levelView = await contentService.getLevelViewBySlug(levelSlug);
  if (!levelView) {
    return [];
  }
  const lessons = [];
  for (const course of levelView.courses) {
    if (course.status !== "published") {
      continue;
    }
    lessons.push(...(await getPublishedLessonsForCourse(contentService, course.slug)));
  }
  return lessons;
}

export async function getLevelProgress(
  contentService: ContentService,
  state: LearnerProgressState,
  levelSlug: string
): Promise<ScopeProgressSummary> {
  const publishedLessons = await getPublishedLessonsForLevel(contentService, levelSlug);
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

export async function getAllPublishedLessonsOrdered(contentService: ContentService) {
  const ordered = [];
  const levels = await contentService.getLevels();
  for (const level of levels) {
    if (level.status !== "published") {
      continue;
    }
    const courses = await contentService.getCoursesByLevelSlug(level.slug);
    for (const course of courses) {
      if (course.status !== "published") {
        continue;
      }
      const weeks = await contentService.getWeeksByCourseSlug(course.slug);
      for (const week of weeks) {
        if (week.status !== "published") {
          continue;
        }
        const lessons = await contentService.getLessonsByWeekSlugs(course.slug, week.slug);
        for (const lesson of lessons) {
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

export async function getOverallProgress(
  contentService: ContentService,
  state: LearnerProgressState
): Promise<ScopeProgressSummary> {
  const allPublished = await getAllPublishedLessonsOrdered(contentService);
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

export async function resolveContinueLearningTarget(
  contentService: ContentService,
  state: LearnerProgressState
): Promise<ContinueLearningTarget | null> {
  const orderedPublished = await getAllPublishedLessonsOrdered(contentService);
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

