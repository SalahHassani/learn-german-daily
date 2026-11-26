import {
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export type PublishingStatusValue = "draft" | "published" | "coming_soon";

export const cefrLevels = pgTable("cefr_levels", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  code: text("code").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  status: text("status").$type<PublishingStatusValue>().notNull().default("draft"),
  version: integer("version").notNull().default(1),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const courses = pgTable("courses", {
  id: text("id").primaryKey(),
  levelId: text("level_id")
    .notNull()
    .references(() => cefrLevels.id, { onDelete: "cascade" }),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  summary: text("summary").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  status: text("status").$type<PublishingStatusValue>().notNull().default("draft"),
  version: integer("version").notNull().default(1),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const weeks = pgTable(
  "weeks",
  {
    id: text("id").primaryKey(),
    courseId: text("course_id")
      .notNull()
      .references(() => courses.id, { onDelete: "cascade" }),
    slug: text("slug").notNull(),
    weekNumber: integer("week_number").notNull(),
    title: text("title").notNull(),
    summary: text("summary").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    status: text("status").$type<PublishingStatusValue>().notNull().default("draft"),
    version: integer("version").notNull().default(1),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("weeks_course_slug_idx").on(table.courseId, table.slug),
    uniqueIndex("weeks_course_number_idx").on(table.courseId, table.weekNumber),
  ]
);

export const lessons = pgTable("lessons", {
  id: text("id").primaryKey(),
  weekId: text("week_id")
    .notNull()
    .references(() => weeks.id, { onDelete: "cascade" }),
  slug: text("slug").notNull().unique(),
  dayNumber: integer("day_number"),
  title: text("title").notNull(),
  summary: text("summary").notNull(),
  estimatedMinutes: integer("estimated_minutes"),
  sortOrder: integer("sort_order").notNull().default(0),
  status: text("status").$type<PublishingStatusValue>().notNull().default("draft"),
  version: integer("version").notNull().default(1),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const lessonSections = pgTable(
  "lesson_sections",
  {
    id: text("id").primaryKey(),
    lessonId: text("lesson_id")
      .notNull()
      .references(() => lessons.id, { onDelete: "cascade" }),
    category: text("category").notNull(),
    title: text("title").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    status: text("status").$type<PublishingStatusValue>().notNull().default("draft"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("lesson_sections_lesson_sort_idx").on(table.lessonId, table.sortOrder),
  ]
);

export const vocabularyItems = pgTable("vocabulary_items", {
  id: text("id").primaryKey(),
  word: text("word").notNull(),
  partOfSpeech: text("part_of_speech").notNull(),
  article: text("article"),
  pluralForm: text("plural_form"),
  englishMeaning: text("english_meaning").notNull(),
  exampleSentence: text("example_sentence"),
  pronunciationRef: text("pronunciation_ref"),
  audioRef: text("audio_ref"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const verbItems = pgTable("verb_items", {
  id: text("id").primaryKey(),
  infinitive: text("infinitive").notNull(),
  englishMeaning: text("english_meaning").notNull(),
  praeteritum: text("praeteritum"),
  partizipIi: text("partizip_ii"),
  conjugations: jsonb("conjugations").$type<Record<string, unknown>>().notNull().default({}),
  exampleSentences: jsonb("example_sentences").$type<unknown[]>().notNull().default([]),
  audioRef: text("audio_ref"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const exercises = pgTable("exercises", {
  id: text("id").primaryKey(),
  lessonId: text("lesson_id").references(() => lessons.id, { onDelete: "set null" }),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  instructions: text("instructions").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  status: text("status").$type<PublishingStatusValue>().notNull().default("draft"),
  version: integer("version").notNull().default(1),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const exerciseQuestions = pgTable(
  "exercise_questions",
  {
    id: text("id").primaryKey(),
    exerciseId: text("exercise_id")
      .notNull()
      .references(() => exercises.id, { onDelete: "cascade" }),
    questionType: text("question_type").notNull(),
    prompt: text("prompt").notNull(),
    points: integer("points").notNull().default(1),
    hint: text("hint"),
    explanation: text("explanation"),
    sortOrder: integer("sort_order").notNull().default(0),
    questionData: jsonb("question_data").$type<Record<string, unknown>>().notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("exercise_questions_exercise_sort_idx").on(
      table.exerciseId,
      table.sortOrder
    ),
  ]
);

export const contentBlocks = pgTable(
  "content_blocks",
  {
    id: text("id").primaryKey(),
    sectionId: text("section_id")
      .notNull()
      .references(() => lessonSections.id, { onDelete: "cascade" }),
    blockType: text("block_type").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    payload: jsonb("payload").$type<Record<string, unknown>>().notNull().default({}),
    vocabularyId: text("vocabulary_id").references(() => vocabularyItems.id, {
      onDelete: "set null",
    }),
    verbId: text("verb_id").references(() => verbItems.id, {
      onDelete: "set null",
    }),
    exerciseId: text("exercise_id").references(() => exercises.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("content_blocks_section_sort_idx").on(table.sectionId, table.sortOrder),
  ]
);

