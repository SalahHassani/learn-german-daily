import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { DatabaseConfigurationError, getDatabaseUrl } from "../../../db/index";
import { DatabaseContentProvider } from "../databaseContentProvider";
import {
  DatabaseContentRepository,
  type AssembledLessonBundle,
} from "../databaseContentRepository";

describe("Milestone 8 database content layer", () => {
  it("throws DatabaseConfigurationError when DATABASE_URL is missing", () => {
    const previous = process.env.DATABASE_URL;
    delete process.env.DATABASE_URL;

    try {
      assert.throws(() => getDatabaseUrl(), DatabaseConfigurationError);
    } finally {
      if (previous !== undefined) {
        process.env.DATABASE_URL = previous;
      }
    }
  });

  it("delegates provider methods to the repository without N+1 queries", async () => {
    const mockBundle: AssembledLessonBundle = {
      lesson: {
        id: "lesson-a1-w1-d1",
        weekId: "week-a1-1",
        slug: "day-1-greetings",
        dayNumber: 1,
        title: "Day 1 — Greetings",
        summary: "Basic German greetings.",
        estimatedMinutes: 15,
        sortOrder: 1,
        status: "published",
        version: 1,
        publishedAt: new Date("2026-01-01T00:00:00.000Z"),
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
        updatedAt: new Date("2026-01-01T00:00:00.000Z"),
      },
      week: {
        id: "week-a1-1",
        courseId: "course-a1-core",
        slug: "week-1",
        weekNumber: 1,
        title: "Week 1",
        summary: "First steps.",
        sortOrder: 1,
        status: "published",
        version: 1,
        publishedAt: new Date("2026-01-01T00:00:00.000Z"),
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
        updatedAt: new Date("2026-01-01T00:00:00.000Z"),
      },
      course: {
        id: "course-a1-core",
        levelId: "level-a1",
        slug: "a1-core",
        title: "A1 Core",
        summary: "Core beginner course.",
        sortOrder: 1,
        status: "published",
        version: 1,
        publishedAt: new Date("2026-01-01T00:00:00.000Z"),
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
        updatedAt: new Date("2026-01-01T00:00:00.000Z"),
      },
      level: {
        id: "level-a1",
        slug: "a1",
        code: "A1",
        title: "Level A1 — Beginner",
        description: "Beginner CEFR level.",
        sortOrder: 1,
        status: "published",
        version: 1,
        publishedAt: new Date("2026-01-01T00:00:00.000Z"),
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
        updatedAt: new Date("2026-01-01T00:00:00.000Z"),
      },
      sections: [],
    };

    const stubRepo = {
      listPublicLevels: async () => [mockBundle.level],
      listPublicCoursesByLevelSlug: async () => [mockBundle.course],
      listPublicWeeksByCourseSlug: async () => [mockBundle.week],
      getPublishedLessonBySlug: async (slug: string) =>
        slug === "day-1-greetings" ? mockBundle : null,
    } as unknown as DatabaseContentRepository;

    const provider = new DatabaseContentProvider(stubRepo);

    const levels = await provider.getLevels();
    assert.equal(levels.length, 1);
    assert.equal(levels[0]?.slug, "a1");

    const lesson = await provider.getPublishedLessonBySlug("day-1-greetings");
    assert.equal(lesson?.lesson.title, "Day 1 — Greetings");

    const draftOrMissing = await provider.getPublishedLessonBySlug("draft-lesson");
    assert.equal(draftOrMissing, null);
  });
});

