import type {
  CEFRLevel,
  ContentDataset,
  Course,
  ExerciseDefinition,
  ResolvedCourseView,
  ResolvedLessonView,
  ResolvedLevelView,
  ResolvedWeekView,
  StructuredLesson,
  Week,
} from "@/types/content";
import { defaultContentProvider, type ContentProvider } from "./contentProvider";
import {
  isCoursePubliclyVisible,
  isDraftStatus,
  isLessonPubliclyVisible,
  isLevelPubliclyVisible,
  isWeekPubliclyVisible,
} from "./visibilityPolicy";

function sortByDisplayOrder<T extends { displayOrder: number }>(items: readonly T[]): T[] {
  return [...items].sort((a, b) => a.displayOrder - b.displayOrder);
}

export class ContentService {
  private readonly provider: ContentProvider;

  constructor(provider: ContentProvider = defaultContentProvider) {
    this.provider = provider;
  }

  private getDatasetSync(): ContentDataset {
    const data = this.provider.getDataset();
    if (data instanceof Promise) {
      throw new Error("Async provider used with synchronous ContentService accessor.");
    }
    return data;
  }

  getLevels(): CEFRLevel[] {
    const { levels } = this.getDatasetSync();
    return sortByDisplayOrder(levels.filter(isLevelPubliclyVisible));
  }

  getLevelBySlug(levelSlug: string): CEFRLevel | undefined {
    const { levels } = this.getDatasetSync();
    return levels.find((level) => level.slug === levelSlug && isLevelPubliclyVisible(level));
  }

  getCoursesByLevelSlug(levelSlug: string): Course[] {
    const level = this.getLevelBySlug(levelSlug);
    if (!level) {
      return [];
    }
    const { courses } = this.getDatasetSync();
    return sortByDisplayOrder(
      courses.filter((course) => course.levelId === level.id && isCoursePubliclyVisible(course, level))
    );
  }

  getCourseBySlug(courseSlug: string): ResolvedCourseView | undefined {
    const { levels, courses, weeks } = this.getDatasetSync();
    const course = courses.find((item) => item.slug === courseSlug);
    if (!course) {
      return undefined;
    }
    const level = levels.find((item) => item.id === course.levelId);
    if (!isCoursePubliclyVisible(course, level) || !level) {
      return undefined;
    }
    const visibleWeeks = sortByDisplayOrder(
      weeks.filter((week) => week.courseId === course.id && isWeekPubliclyVisible(week, course, level))
    );
    return { level, course, weeks: visibleWeeks };
  }

  getLevelViewBySlug(levelSlug: string): ResolvedLevelView | undefined {
    const level = this.getLevelBySlug(levelSlug);
    if (!level) {
      return undefined;
    }
    return { level, courses: this.getCoursesByLevelSlug(levelSlug) };
  }

  getWeeksByCourseSlug(courseSlug: string): Week[] {
    const resolved = this.getCourseBySlug(courseSlug);
    return resolved ? resolved.weeks : [];
  }

  getWeekBySlugs(courseSlug: string, weekSlug: string): ResolvedWeekView | undefined {
    const courseView = this.getCourseBySlug(courseSlug);
    if (!courseView) {
      return undefined;
    }
    const { levels, weeks, lessons } = this.getDatasetSync();
    const week = weeks.find(
      (item) => item.courseId === courseView.course.id && item.slug === weekSlug
    );
    const level = levels.find((item) => item.id === courseView.course.levelId);
    if (!week || !isWeekPubliclyVisible(week, courseView.course, level) || !level) {
      return undefined;
    }
    const visibleLessons = sortByDisplayOrder(
      lessons.filter(
        (lesson) =>
          lesson.weekId === week.id &&
          isLessonPubliclyVisible(lesson, week, courseView.course, level)
      )
    );
    return {
      level,
      course: courseView.course,
      week,
      lessons: visibleLessons,
    };
  }

  getLessonsByWeekSlugs(courseSlug: string, weekSlug: string): StructuredLesson[] {
    const weekView = this.getWeekBySlugs(courseSlug, weekSlug);
    return weekView ? weekView.lessons : [];
  }

  getLessonBySlug(lessonSlug: string): ResolvedLessonView | undefined {
    const { levels, courses, weeks, lessons } = this.getDatasetSync();
    const lesson = lessons.find((item) => item.slug === lessonSlug);
    if (!lesson) {
      return undefined;
    }

    const week = weeks.find((item) => item.id === lesson.weekId);
    const course = week ? courses.find((item) => item.id === week.courseId) : undefined;
    const level = course ? levels.find((item) => item.id === course.levelId) : undefined;

    if (!isLessonPubliclyVisible(lesson, week, course, level) || !week || !course || !level) {
      return undefined;
    }

    const siblingLessons = sortByDisplayOrder(
      lessons.filter(
        (item) =>
          item.weekId === week.id && isLessonPubliclyVisible(item, week, course, level)
      )
    );
    const currentIndex = siblingLessons.findIndex((item) => item.id === lesson.id);
    const previousLessonSlug =
      currentIndex > 0 ? siblingLessons[currentIndex - 1]?.slug : undefined;
    const nextLessonSlug =
      currentIndex >= 0 && currentIndex < siblingLessons.length - 1
        ? siblingLessons[currentIndex + 1]?.slug
        : undefined;

    const orderedLesson: StructuredLesson = {
      ...lesson,
      sections: [...lesson.sections].sort((a, b) => a.order - b.order),
    };

    return {
      level,
      course,
      week,
      lesson: orderedLesson,
      previousLessonSlug,
      nextLessonSlug,
    };
  }

  getExerciseById(exerciseId: string): ExerciseDefinition | undefined {
    const exercise = (this.getDatasetSync().exercises ?? []).find(
      (item) => item.id === exerciseId
    );
    if (!exercise || isDraftStatus(exercise.status)) {
      return undefined;
    }
    return exercise;
  }
}

export const contentService = new ContentService();

