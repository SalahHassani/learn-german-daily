import type {
  CEFRLevel,
  Course,
  Lesson,
  LessonContent,
  Week,
} from "@/types/curriculum";

/**
 * Abstract content retrieval contract.
 *
 * Phase 1: Structured local content provider.
 * Phase 2: FastAPI and PostgreSQL-backed provider.
 */
export interface ContentService {
  getLevels(): Promise<CEFRLevel[]>;

  getLevelBySlug(slug: string): Promise<CEFRLevel | null>;

  getCourseBySlug(slug: string): Promise<Course | null>;

  getWeekBySlug(
    courseSlug: string,
    weekSlug: string
  ): Promise<Week | null>;

  getLessonBySlug(
    lessonSlug: string
  ): Promise<{
    lesson: Lesson;
    content: LessonContent | null;
  } | null>;
}
