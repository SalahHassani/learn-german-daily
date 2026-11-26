import assert from "node:assert/strict";
import test from "node:test";
import type { ContentDataset } from "../../../types/content";
import {
  PROGRESS_SCHEMA_VERSION,
  PROGRESS_STORAGE_KEY,
} from "../../../types/progress";
import { LocalStorageProgressProvider } from "../../progress/localStorageProgressProvider";
import {
  getCourseProgress,
  getExerciseAttemptSummary,
  getLevelProgress,
  getOverallProgress,
  getWeekProgress,
  resolveContinueLearningTarget,
} from "../../progress/progressCalculations";
import { createEmptyProgressState, migrateOrNormalizeProgress } from "../../progress/progressMigrations";
import { ProgressService } from "../../progress/progressService";
import { LocalContentProvider } from "../contentProvider";
import { ContentService } from "../contentService";

function createMemoryStorage(options?: {
  throwOnGet?: boolean;
  throwOnSet?: boolean;
  failProbe?: boolean;
}) {
  const store = new Map<string, string>();
  const storage: Storage = {
    get length() {
      return store.size;
    },
    clear() {
      store.clear();
    },
    getItem(key: string) {
      if (options?.throwOnGet) {
        throw new Error("Storage read blocked");
      }
      return store.has(key) ? store.get(key)! : null;
    },
    key(index: number) {
      return Array.from(store.keys())[index] ?? null;
    },
    removeItem(key: string) {
      store.delete(key);
    },
    setItem(key: string, value: string) {
      if (options?.failProbe && key.includes("__probe__")) {
        throw new Error("Storage probe failed");
      }
      if (options?.throwOnSet) {
        throw new Error("QuotaExceededError");
      }
      store.set(key, value);
    },
  };
  return { storage, store };
}

function buildTestContentDataset(): ContentDataset {
  return {
    version: "m6.test",
    levels: [
      {
        id: "lvl_a1",
        slug: "a1",
        name: "Level A1",
        description: "A1",
        displayOrder: 1,
        status: "published",
      },
      {
        id: "lvl_a2",
        slug: "a2",
        name: "Level A2",
        description: "A2",
        displayOrder: 2,
        status: "coming_soon",
      },
    ],
    courses: [
      {
        id: "crs_a1_1",
        levelId: "lvl_a1",
        slug: "a1-1",
        title: "German A1.1",
        description: "A1.1",
        displayOrder: 1,
        status: "published",
      },
    ],
    weeks: [
      {
        id: "wk_1",
        courseId: "crs_a1_1",
        slug: "week-1",
        title: "Week 1",
        theme: "Basics",
        displayOrder: 1,
        status: "published",
      },
      {
        id: "wk_2",
        courseId: "crs_a1_1",
        slug: "week-2",
        title: "Week 2",
        theme: "Next",
        displayOrder: 2,
        status: "coming_soon",
      },
    ],
    lessons: [
      {
        id: "lsn_pub_1",
        weekId: "wk_1",
        slug: "day-1",
        title: "Day 1",
        description: "Published 1",
        objectives: [],
        displayOrder: 1,
        status: "published",
        sections: [],
      },
      {
        id: "lsn_pub_2",
        weekId: "wk_1",
        slug: "day-2",
        title: "Day 2",
        description: "Published 2",
        objectives: [],
        displayOrder: 2,
        status: "published",
        sections: [],
      },
      {
        id: "lsn_draft",
        weekId: "wk_1",
        slug: "day-draft",
        title: "Draft Lesson",
        description: "Draft",
        objectives: [],
        displayOrder: 3,
        status: "draft",
        sections: [],
      },
      {
        id: "lsn_soon",
        weekId: "wk_1",
        slug: "day-soon",
        title: "Coming Soon Lesson",
        description: "Soon",
        objectives: [],
        displayOrder: 4,
        status: "coming_soon",
        sections: [],
      },
    ],
  };
}

test("LocalStorageProgressProvider handles missing, malformed JSON, invalid schema, unsupported version, and unavailable storage", () => {
  const g = globalThis as { localStorage?: Storage };
  const originalStorage = g.localStorage;

  try {
    // Missing storage
    delete g.localStorage;
    const noStorageProvider = new LocalStorageProgressProvider();
    const noStorageRes = noStorageProvider.loadProgress();
    assert.equal(noStorageRes.storageAvailable, false);
    assert.deepEqual(noStorageRes.state.lessonsById, {});

    // Malformed JSON
    const { storage, store } = createMemoryStorage();
    g.localStorage = storage;
    store.set(PROGRESS_STORAGE_KEY, "{not-valid-json");
    const badJsonProvider = new LocalStorageProgressProvider();
    const badJsonRes = badJsonProvider.loadProgress();
    assert.equal(badJsonRes.storageAvailable, true);
    assert.ok(badJsonRes.notice?.message);
    assert.deepEqual(badJsonRes.state.lessonsById, {});

    // Unsupported schema version
    store.set(
      PROGRESS_STORAGE_KEY,
      JSON.stringify({ schemaVersion: 999, updatedAt: "2026-01-01T00:00:00.000Z", lessonsById: {}, exerciseAttempts: [] })
    );
    const futureVerRes = badJsonProvider.loadProgress();
    assert.ok(futureVerRes.notice?.message);
    assert.deepEqual(futureVerRes.state.lessonsById, {});

    // Storage write failure
    const { storage: quotaStorage } = createMemoryStorage({ throwOnSet: true });
    g.localStorage = quotaStorage;
    const quotaProvider = new LocalStorageProgressProvider();
    const saveRes = quotaProvider.saveProgress(createEmptyProgressState("2026-01-01T00:00:00.000Z"));
    assert.equal(saveRes.saved, false);
    assert.ok(saveRes.errorMessage);
  } finally {
    if (originalStorage) {
      g.localStorage = originalStorage;
    } else {
      delete g.localStorage;
    }
  }
});

test("Migration and normalization preserve valid records and recover cleanly", () => {
  const normalized = migrateOrNormalizeProgress(
    {
      schemaVersion: PROGRESS_SCHEMA_VERSION,
      updatedAt: "2026-02-01T10:00:00.000Z",
      lessonsById: {
        lsn_pub_1: {
          lessonId: "lsn_pub_1",
          completed: true,
          completedAt: "2026-02-01T10:00:00.000Z",
          updatedAt: "2026-02-01T10:00:00.000Z",
        },
        bad_entry: { completed: "yes" },
      },
      exerciseAttempts: [
        {
          attemptId: "a1",
          exerciseId: "ex_1",
          attemptNumber: 1,
          startedAt: "2026-02-01T09:50:00.000Z",
          submittedAt: "2026-02-01T10:00:00.000Z",
          earnedPoints: 4,
          totalPoints: 5,
          percentage: 80,
          correctCount: 4,
          totalQuestions: 5,
        },
      ],
    },
    "2026-02-01T10:00:00.000Z"
  );

  assert.equal(normalized.state.lessonsById["lsn_pub_1"]?.completed, true);
  assert.equal(normalized.state.lessonsById["bad_entry"], undefined);
  assert.equal(normalized.state.exerciseAttempts.length, 1);
});

test("ProgressService supports explicit completion, undo, separate exercise attempts, and published-only progress calculations", async () => {
  const g = globalThis as { localStorage?: Storage };
  const originalStorage = g.localStorage;
  const { storage } = createMemoryStorage();
  g.localStorage = storage;

  try {
    const content = new ContentService(new LocalContentProvider(buildTestContentDataset()));
    const service = new ProgressService(new LocalStorageProgressProvider(), content);
    service.initialize();

    // Opening a lesson does not mark it complete
    service.recordLessonVisited("lsn_pub_1", "2026-03-01T08:00:00.000Z");
    assert.equal(service.isLessonCompleted("lsn_pub_1"), false);
    const initialWeek = await getWeekProgress(content, service.getState(), "a1-1", "week-1");
    assert.equal(initialWeek.completedLessons, 0);
    assert.equal(initialWeek.totalPublishedLessons, 2);

    // Recording an exercise attempt does not mark lesson complete, and retries keep history
    service.recordExerciseAttempt({
      exerciseId: "ex_greetings",
      lessonId: "lsn_pub_1",
      earnedPoints: 2,
      totalPoints: 4,
      percentage: 50,
      correctCount: 1,
      totalQuestions: 2,
      submittedAt: "2026-03-01T08:05:00.000Z",
    });
    service.recordExerciseAttempt({
      exerciseId: "ex_greetings",
      lessonId: "lsn_pub_1",
      earnedPoints: 4,
      totalPoints: 4,
      percentage: 100,
      correctCount: 2,
      totalQuestions: 2,
      submittedAt: "2026-03-01T08:10:00.000Z",
    });

    assert.equal(service.isLessonCompleted("lsn_pub_1"), false);
    const attemptSummary = getExerciseAttemptSummary(service.getState(), "ex_greetings");
    assert.equal(attemptSummary.attemptCount, 2);
    assert.equal(attemptSummary.latestAttempt?.percentage, 100);
    assert.equal(attemptSummary.bestScorePercentage, 100);

    // Explicit lesson completion and undo
    service.setLessonCompleted("lsn_pub_1", true, "2026-03-01T08:15:00.000Z");
    assert.equal(service.isLessonCompleted("lsn_pub_1"), true);
    const completedWeek = await getWeekProgress(content, service.getState(), "a1-1", "week-1");
    const completedCourse = await getCourseProgress(content, service.getState(), "a1-1");
    const completedLevel = await getLevelProgress(content, service.getState(), "a1");
    const completedOverall = await getOverallProgress(content, service.getState());
    assert.equal(completedWeek.completedLessons, 1);
    assert.equal(completedWeek.percentage, 50);
    assert.equal(completedCourse.percentage, 50);
    assert.equal(completedLevel.percentage, 50);
    assert.equal(completedOverall.percentage, 50);

    // Next lesson suggested after completing visited lesson
    const nextTarget = await resolveContinueLearningTarget(content, service.getState());
    assert.equal(nextTarget?.lessonSlug, "day-2");
    assert.equal(nextTarget?.reason, "next-after-completed");

    // Undo completion
    service.setLessonCompleted("lsn_pub_1", false, "2026-03-01T08:20:00.000Z");
    assert.equal(service.isLessonCompleted("lsn_pub_1"), false);
    const undoneWeek = await getWeekProgress(content, service.getState(), "a1-1", "week-1");
    assert.equal(undoneWeek.completedLessons, 0);
  } finally {
    if (originalStorage) {
      g.localStorage = originalStorage;
    } else {
      delete g.localStorage;
    }
  }
});

