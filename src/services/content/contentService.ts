import "server-only";

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

const EMPTY_DATASET: ContentDataset = {
  version: "1",
  levels: [],
  courses: [],
  weeks: [],
  lessons: [],
  exercises: [],
};

export class ContentService {
  private readonly provider: ContentProvider;

  constructor(provider: ContentProvider = defaultContentProvider) {
    this.provider = provider;
  }

  private async getDatasetSafe(): Promise<ContentDataset> {
    const dataset = await this.provider.getDataset();
    if (!dataset) {
      return EMPTY_DATASET;
    }

    return {
      version: dataset.version ?? EMPTY_DATASET.version,
      levels: Array.isArray(dataset.levels) ? dataset.levels : [],
      courses: Array.isArray(dataset.courses) ? dataset.courses : [],
      weeks: Array.isArray(dataset.weeks) ? dataset.weeks : [],
      lessons: Array.isArray(dataset.lessons) ? dataset.lessons : [],
      exercises: Array.isArray(dataset.exercises) ? dataset.exercises : [],
    };
  }

  async getLevels(): Promise<CEFRLevel[]> {
    const { levels } = await this.getDatasetSafe();
    return sortByDisplayOrder(levels.filter(isLevelPubliclyVisible));
  }

  async getLevelBySlug(levelSlug: string): Promise<CEFRLevel | undefined> {
    if (!levelSlug) {
      return undefined;
    }

    const { levels } = await this.getDatasetSafe();
    return levels.find((level) => level.slug === levelSlug && isLevelPubliclyVisible(level));
  }

  async getCoursesByLevelSlug(levelSlug: string): Promise<Course[]> {
    if (!levelSlug) {
      return [];
    }

    const { levels, courses } = await this.getDatasetSafe();
    const level = levels.find(
      (item) => item.slug === levelSlug && isLevelPubliclyVisible(item)
    );
    if (!level) {
      return [];
    }

    return sortByDisplayOrder(
      courses.filter(
        (course) => course.levelId === level.id && isCoursePubliclyVisible(course, level)
      )
    );
  }

  async getCourseBySlug(courseSlug: string): Promise<ResolvedCourseView | undefined> {
    if (!courseSlug) {
      return undefined;
    }

    const { levels, courses, weeks } = await this.getDatasetSafe();
    const course = courses.find((item) => item.slug === courseSlug);
    if (!course) {
      return undefined;
    }

    const level = levels.find((item) => item.id === course.levelId);
    if (!level || !isCoursePubliclyVisible(course, level)) {
      return undefined;
    }

    const visibleWeeks = sortByDisplayOrder(
      weeks.filter(
        (week) => week.courseId === course.id && isWeekPubliclyVisible(week, course, level)
      )
    );

    return { level, course, weeks: visibleWeeks };
  }

  async getLevelViewBySlug(levelSlug: string): Promise<ResolvedLevelView | undefined> {
    if (!levelSlug) {
      return undefined;
    }

    const { levels, courses } = await this.getDatasetSafe();
    const level = levels.find(
      (item) => item.slug === levelSlug && isLevelPubliclyVisible(item)
    );
    if (!level) {
      return undefined;
    }

    const visibleCourses = sortByDisplayOrder(
      courses.filter(
        (course) => course.levelId === level.id && isCoursePubliclyVisible(course, level)
      )
    );

    return { level, courses: visibleCourses };
  }

  async getWeeksByCourseSlug(courseSlug: string): Promise<Week[]> {
    const resolved = await this.getCourseBySlug(courseSlug);
    return resolved ? resolved.weeks : [];
  }

  async getWeekBySlugs(
    courseSlug: string,
    weekSlug: string
  ): Promise<ResolvedWeekView | undefined> {
    if (!courseSlug || !weekSlug) {
      return undefined;
    }

    const { levels, courses, weeks, lessons } = await this.getDatasetSafe();
    const course = courses.find((item) => item.slug === courseSlug);
    if (!course) {
      return undefined;
    }

    const level = levels.find((item) => item.id === course.levelId);
    if (!level || !isCoursePubliclyVisible(course, level)) {
      return undefined;
    }

    const week = weeks.find(
      (item) => item.courseId === course.id && item.slug === weekSlug
    );
    if (!week || !isWeekPubliclyVisible(week, course, level)) {
      return undefined;
    }

    const visibleLessons = sortByDisplayOrder(
      lessons.filter(
        (lesson) =>
          lesson.weekId === week.id &&
          isLessonPubliclyVisible(lesson, week, course, level)
      )
    );

    return {
      level,
      course,
      week,
      lessons: visibleLessons,
    };
  }

  async getLessonsByWeekSlugs(
    courseSlug: string,
    weekSlug: string
  ): Promise<StructuredLesson[]> {
    const weekView = await this.getWeekBySlugs(courseSlug, weekSlug);
    return weekView ? weekView.lessons : [];
  }

  async getLessonBySlug(lessonSlug: string): Promise<ResolvedLessonView | undefined> {
    if (!lessonSlug) {
      return undefined;
    }

    const { levels, courses, weeks, lessons } = await this.getDatasetSafe();
    const lesson = lessons.find((item) => item.slug === lessonSlug);
    if (!lesson) {
      return undefined;
    }

    const week = weeks.find((item) => item.id === lesson.weekId);
    const course = week ? courses.find((item) => item.id === week.courseId) : undefined;
    const level = course ? levels.find((item) => item.id === course.levelId) : undefined;

    if (!week || !course || !level || !isLessonPubliclyVisible(lesson, week, course, level)) {
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
      sections: Array.isArray(lesson.sections)
        ? [...lesson.sections].sort((a, b) => a.order - b.order)
        : [],
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

  async getExerciseById(exerciseId: string): Promise<ExerciseDefinition | undefined> {
    if (!exerciseId) {
      return undefined;
    }

    const { exercises = [] } = await this.getDatasetSafe();
    const exercise = exercises.find((item) => item.id === exerciseId);
    if (!exercise || isDraftStatus(exercise.status)) {
      return undefined;
    }
    return exercise;
  }
}

export function createContentService(
  provider: ContentProvider = defaultContentProvider
): ContentService {
  return new ContentService(provider);
}

export const contentService = createContentService();

