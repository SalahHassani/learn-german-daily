import "server-only";

import { asc, eq, inArray } from "drizzle-orm";
import { getDb } from "@/db";
import {
  cefrLevels,
  contentBlocks,
  courses,
  exerciseQuestions,
  exercises,
  lessons,
  lessonSections,
  verbItems,
  vocabularyItems,
  weeks,
  type PublishingStatusValue,
} from "@/db/schema";

export interface AssembledLessonBundle {
  lesson: typeof lessons.$inferSelect;
  week: typeof weeks.$inferSelect;
  course: typeof courses.$inferSelect;
  level: typeof cefrLevels.$inferSelect;
  sections: Array<{
    section: typeof lessonSections.$inferSelect;
    blocks: Array<{
      block: typeof contentBlocks.$inferSelect;
      vocabulary: typeof vocabularyItems.$inferSelect | null;
      verb: typeof verbItems.$inferSelect | null;
      exercise: {
        exercise: typeof exercises.$inferSelect;
        questions: Array<typeof exerciseQuestions.$inferSelect>;
      } | null;
    }>;
  }>;
}

function isPubliclyVisibleStatus(status: PublishingStatusValue): boolean {
  return status === "published" || status === "coming_soon";
}

function isFullyPublishedContent(status: PublishingStatusValue): boolean {
  return status === "published";
}

export class DatabaseContentRepository {
  async listPublicLevels() {
    const db = getDb();
    const rows = await db
      .select()
      .from(cefrLevels)
      .orderBy(asc(cefrLevels.sortOrder), asc(cefrLevels.code));
    return rows.filter((row) => isPubliclyVisibleStatus(row.status));
  }

  async listPublicCoursesByLevelSlug(levelSlug: string) {
    const db = getDb();
    const [level] = await db
      .select()
      .from(cefrLevels)
      .where(eq(cefrLevels.slug, levelSlug))
      .limit(1);

    if (!level || !isPubliclyVisibleStatus(level.status)) {
      return [];
    }

    const courseRows = await db
      .select()
      .from(courses)
      .where(eq(courses.levelId, level.id))
      .orderBy(asc(courses.sortOrder), asc(courses.title));

    return courseRows.filter((c) => isPubliclyVisibleStatus(c.status));
  }

  async listPublicWeeksByCourseSlug(courseSlug: string) {
    const db = getDb();
    const [course] = await db
      .select()
      .from(courses)
      .where(eq(courses.slug, courseSlug))
      .limit(1);

    if (!course || !isPubliclyVisibleStatus(course.status)) {
      return [];
    }

    const [level] = await db
      .select()
      .from(cefrLevels)
      .where(eq(cefrLevels.id, course.levelId))
      .limit(1);

    if (!level || !isPubliclyVisibleStatus(level.status)) {
      return [];
    }

    const weekRows = await db
      .select()
      .from(weeks)
      .where(eq(weeks.courseId, course.id))
      .orderBy(asc(weeks.sortOrder), asc(weeks.weekNumber));

    return weekRows.filter((w) => isPubliclyVisibleStatus(w.status));
  }

  async getPublishedLessonBySlug(lessonSlug: string): Promise<AssembledLessonBundle | null> {
    const db = getDb();

    const [lesson] = await db
      .select()
      .from(lessons)
      .where(eq(lessons.slug, lessonSlug))
      .limit(1);

    if (!lesson || !isFullyPublishedContent(lesson.status)) {
      return null;
    }

    const [week] = await db
      .select()
      .from(weeks)
      .where(eq(weeks.id, lesson.weekId))
      .limit(1);

    if (!week || !isPubliclyVisibleStatus(week.status)) {
      return null;
    }

    const [course] = await db
      .select()
      .from(courses)
      .where(eq(courses.id, week.courseId))
      .limit(1);

    if (!course || !isPubliclyVisibleStatus(course.status)) {
      return null;
    }

    const [level] = await db
      .select()
      .from(cefrLevels)
      .where(eq(cefrLevels.id, course.levelId))
      .limit(1);

    if (!level || !isPubliclyVisibleStatus(level.status)) {
      return null;
    }

    const sectionRows = await db
      .select()
      .from(lessonSections)
      .where(eq(lessonSections.lessonId, lesson.id))
      .orderBy(asc(lessonSections.sortOrder));

    const visibleSections = sectionRows.filter((s) => s.status !== "draft");
    if (visibleSections.length === 0) {
      return {
        lesson,
        week,
        course,
        level,
        sections: [],
      };
    }

    const sectionIds = visibleSections.map((s) => s.id);
    const blockRows = await db
      .select()
      .from(contentBlocks)
      .where(inArray(contentBlocks.sectionId, sectionIds))
      .orderBy(asc(contentBlocks.sortOrder));

    const vocabIds = Array.from(
      new Set(blockRows.map((b) => b.vocabularyId).filter((id): id is string => Boolean(id)))
    );
    const verbIds = Array.from(
      new Set(blockRows.map((b) => b.verbId).filter((id): id is string => Boolean(id)))
    );
    const exerciseIds = Array.from(
      new Set(blockRows.map((b) => b.exerciseId).filter((id): id is string => Boolean(id)))
    );

    const [vocabRows, verbRows, exerciseRows, questionRows] = await Promise.all([
      vocabIds.length > 0
        ? db.select().from(vocabularyItems).where(inArray(vocabularyItems.id, vocabIds))
        : Promise.resolve([]),
      verbIds.length > 0
        ? db.select().from(verbItems).where(inArray(verbItems.id, verbIds))
        : Promise.resolve([]),
      exerciseIds.length > 0
        ? db.select().from(exercises).where(inArray(exercises.id, exerciseIds))
        : Promise.resolve([]),
      exerciseIds.length > 0
        ? db
            .select()
            .from(exerciseQuestions)
            .where(inArray(exerciseQuestions.exerciseId, exerciseIds))
            .orderBy(asc(exerciseQuestions.sortOrder))
        : Promise.resolve([]),
    ]);

    const vocabMap = new Map(vocabRows.map((v) => [v.id, v]));
    const verbMap = new Map(verbRows.map((v) => [v.id, v]));
    const questionsByExercise = new Map<
      string,
      Array<typeof exerciseQuestions.$inferSelect>
    >();

    for (const q of questionRows) {
      const list = questionsByExercise.get(q.exerciseId) ?? [];
      list.push(q);
      questionsByExercise.set(q.exerciseId, list);
    }

    const exerciseBundleMap = new Map<
      string,
      {
        exercise: typeof exercises.$inferSelect;
        questions: Array<typeof exerciseQuestions.$inferSelect>;
      }
    >();

    for (const ex of exerciseRows) {
      if (isFullyPublishedContent(ex.status)) {
        exerciseBundleMap.set(ex.id, {
          exercise: ex,
          questions: questionsByExercise.get(ex.id) ?? [],
        });
      }
    }

    const blocksBySection = new Map<
      string,
      AssembledLessonBundle["sections"][number]["blocks"]
    >();

    for (const b of blockRows) {
      const list = blocksBySection.get(b.sectionId) ?? [];
      list.push({
        block: b,
        vocabulary: b.vocabularyId ? vocabMap.get(b.vocabularyId) ?? null : null,
        verb: b.verbId ? verbMap.get(b.verbId) ?? null : null,
        exercise: b.exerciseId ? exerciseBundleMap.get(b.exerciseId) ?? null : null,
      });
      blocksBySection.set(b.sectionId, list);
    }

    return {
      lesson,
      week,
      course,
      level,
      sections: visibleSections.map((section) => ({
        section,
        blocks: blocksBySection.get(section.id) ?? [],
      })),
    };
  }
}

