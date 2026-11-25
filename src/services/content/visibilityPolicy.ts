import type {
  CEFRLevel,
  ContentStatus,
  Course,
  StructuredLesson,
  Week,
} from "@/types/content";

export function isDraftStatus(status: ContentStatus): boolean {
  return status === "draft";
}

export function isComingSoonStatus(status: ContentStatus): boolean {
  return status === "coming_soon";
}

export function isPublishedStatus(status: ContentStatus): boolean {
  return status === "published";
}

export function isEntityVisibleInRoadmap(status: ContentStatus): boolean {
  return status === "published" || status === "coming_soon";
}

export function isLevelPubliclyVisible(level: CEFRLevel): boolean {
  return isEntityVisibleInRoadmap(level.status);
}

export function isCoursePubliclyVisible(course: Course, parentLevel?: CEFRLevel): boolean {
  if (!parentLevel || !isLevelPubliclyVisible(parentLevel)) {
    return false;
  }
  return isEntityVisibleInRoadmap(course.status);
}

export function isWeekPubliclyVisible(
  week: Week,
  parentCourse?: Course,
  parentLevel?: CEFRLevel
): boolean {
  if (!parentCourse || !isCoursePubliclyVisible(parentCourse, parentLevel)) {
    return false;
  }
  return isEntityVisibleInRoadmap(week.status);
}

export function isLessonPubliclyVisible(
  lesson: StructuredLesson,
  parentWeek?: Week,
  parentCourse?: Course,
  parentLevel?: CEFRLevel
): boolean {
  if (!parentWeek || !isWeekPubliclyVisible(parentWeek, parentCourse, parentLevel)) {
    return false;
  }
  return isEntityVisibleInRoadmap(lesson.status);
}

export function getStatusLabel(status: ContentStatus): string | undefined {
  if (status === "coming_soon") {
    return "Coming soon";
  }
  return undefined;
}

