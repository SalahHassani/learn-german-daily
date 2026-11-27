import assert from "node:assert/strict";
import { test } from "node:test";
import {
  importContentPackage,
  previewContentPackageImport,
  type ExistingContentSnapshot,
} from "../contentImportService";
import { validateContentPackage } from "../packageValidator";
import type { ContentPackageV1 } from "../../../types/contentPackage";

function buildValidSyntheticPackage(
  overrides: Partial<ContentPackageV1> = {}
): ContentPackageV1 {
  return {
    formatVersion: "1.0.0",
    packageId: "pkg-m9-synthetic-01",
    metadata: {
      title: "Synthetic M9 Test Package",
      source: "m9-test-suite",
    },
    publishing: {
      mode: "import_only",
      allowPublishedUpdate: false,
    },
    levels: [
      {
        code: "A1",
        title: "Level A1",
        order: 1,
        status: "published",
      },
      {
        code: "A2",
        title: "Level A2",
        order: 2,
        status: "coming_soon",
      },
    ],
    entities: {
      vocabulary: [
        {
          id: "vocab-test-01",
          slug: "vocab-test-01",
          language: "de",
          term: "WortFixture",
          translation: "Word Fixture",
          status: "draft",
        },
      ],
      verbs: [
        {
          id: "verb-test-01",
          slug: "verb-test-01",
          language: "de",
          lemma: "verbFixture",
          meaning: "to test verb fixture",
          conjugations: [{ person: "1s", tense: "present", form: "verbFixtureIch" }],
          status: "draft",
        },
      ],
      exercises: [
        {
          id: "ex-test-01",
          slug: "ex-test-01",
          title: "Exercise Fixture",
          category: "practice",
          status: "draft",
          questions: [
            {
              id: "q-test-01",
              questionType: "single_choice",
              prompt: "Select fixture option A",
              options: ["Option A", "Option B"],
              correctAnswer: "Option A",
              acceptedAnswers: ["Option A"],
            },
          ],
        },
      ],
    },
    courses: [
      {
        id: "course-test-a1-1",
        slug: "course-test-a1-1",
        title: "Course A1.1 Fixture",
        levelCode: "A1",
        order: 1,
        status: "published",
        weeks: [
          {
            id: "week-test-1",
            slug: "week-test-1",
            title: "Week 1 Fixture",
            order: 1,
            status: "draft",
            lessons: [
              {
                id: "lesson-test-1",
                slug: "lesson-test-1",
                title: "Lesson 1 Fixture",
                order: 1,
                status: "draft",
                sections: [
                  {
                    id: "sec-test-1",
                    slug: "sec-test-1",
                    title: "Section 1 Fixture",
                    order: 1,
                    status: "draft",
                    blocks: [
                      {
                        id: "blk-test-1",
                        order: 1,
                        kind: "vocabulary",
                        vocabularyId: "vocab-test-01",
                        status: "draft",
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
    ...overrides,
  };
}

function emptySnapshot(): ExistingContentSnapshot {
  return {
    levelIds: new Set(),
    publishedLevelIds: new Set(),
    courseIds: new Set(),
    publishedCourseIds: new Set(),
    weekIds: new Set(),
    publishedWeekIds: new Set(),
    lessonIds: new Set(),
    publishedLessonIds: new Set(),
    sectionIds: new Set(),
    publishedSectionIds: new Set(),
    blockIds: new Set(),
    publishedBlockIds: new Set(),
    vocabIds: new Set(),
    verbIds: new Set(),
    exerciseIds: new Set(),
    publishedExerciseIds: new Set(),
    questionIds: new Set(),
  };
}

test("accepts a valid synthetic package across CEFR levels and educational entities", () => {
  const pkg = buildValidSyntheticPackage();
  const result = validateContentPackage(pkg);
  assert.equal(result.valid, true);
  assert.equal(result.errors.length, 0);
});

test("rejects unsupported package version, missing required fields, and invalid exercise questions", () => {
  const unsupportedVersion = validateContentPackage(
    buildValidSyntheticPackage({
      formatVersion: "9.9.9" as ContentPackageV1["formatVersion"],
    })
  );
  assert.equal(unsupportedVersion.valid, false);
  assert.ok(unsupportedVersion.errors.some((e) => e.code === "UNSUPPORTED_PACKAGE_VERSION"));

  const missingTitle = validateContentPackage({
    formatVersion: "1.0.0",
    packageId: "pkg-missing-title",
    metadata: {},
    levels: [],
    courses: [],
  });
  assert.equal(missingTitle.valid, false);
  assert.ok(missingTitle.errors.some((e) => e.code === "MISSING_METADATA_TITLE"));

  const invalidQuestion = buildValidSyntheticPackage({
    entities: {
      exercises: [
        {
          id: "ex-bad-q",
          slug: "ex-bad-q",
          title: "Bad Question Exercise",
          category: "homework",
          status: "draft",
          questions: [
            {
              id: "q-bad-1",
              questionType: "single_choice",
              prompt: "Missing answer prompt",
              correctAnswer: "",
            },
          ],
        },
      ],
    },
  });
  const badExerciseResult = validateContentPackage(invalidQuestion);
  assert.equal(badExerciseResult.valid, false);
  assert.ok(badExerciseResult.errors.some((e) => e.code === "MISSING_CORRECT_ANSWER"));
});

test("rejects broken parent-child curriculum references, duplicate IDs, and unpublished parents", () => {
  const brokenRefPkg = buildValidSyntheticPackage();
  brokenRefPkg.courses[0].weeks[0].lessons[0].sections[0].blocks[0].vocabularyId =
    "non-existent-vocab";
  const brokenRefResult = validateContentPackage(brokenRefPkg);
  assert.equal(brokenRefResult.valid, false);
  assert.ok(brokenRefResult.errors.some((e) => e.code === "BROKEN_VOCAB_REF"));

  const dupIdPkg = buildValidSyntheticPackage();
  dupIdPkg.courses[0].weeks[0].lessons[0].sections[0].blocks.push({
    id: "blk-test-1",
    order: 2,
    kind: "text",
    body: "Duplicate block id",
    status: "draft",
  });
  const dupResult = validateContentPackage(dupIdPkg);
  assert.equal(dupResult.valid, false);
  assert.ok(dupResult.errors.some((e) => e.code === "DUPLICATE_IDENTIFIER"));

  const unpublishedParentPkg = buildValidSyntheticPackage();
  unpublishedParentPkg.courses[0].weeks[0].status = "draft";
  unpublishedParentPkg.courses[0].weeks[0].lessons[0].status = "published";
  const publishRuleResult = validateContentPackage(unpublishedParentPkg);
  assert.equal(publishRuleResult.valid, false);
  assert.ok(publishRuleResult.errors.some((e) => e.code === "PARENT_NOT_PUBLISHED"));
});

test("detects published content conflicts in preview and aborts without writing", async () => {
  const pkg = buildValidSyntheticPackage();
  const snapshot = emptySnapshot();
  snapshot.courseIds.add("course-test-a1-1");
  snapshot.publishedCourseIds.add("course-test-a1-1");

  const preview = await previewContentPackageImport(pkg, {
    snapshotLoader: async () => snapshot,
    allowPublishedUpdate: false,
  });

  assert.equal(preview.valid, true);
  assert.equal(preview.canProceed, false);
  assert.ok(preview.summary.conflict >= 1);

  const aborted = await importContentPackage(pkg, {
    snapshotLoader: async () => snapshot,
    allowPublishedUpdate: false,
  });

  assert.equal(aborted.applied, false);
  assert.equal(aborted.rolledBack, false);
});

test("dry-run returns preview without applying database writes", async () => {
  const pkg = buildValidSyntheticPackage();
  const dryRunResult = await importContentPackage(pkg, {
    dryRun: true,
    snapshotLoader: async () => emptySnapshot(),
  });

  assert.equal(dryRunResult.preview.canProceed, true);
  assert.equal(dryRunResult.applied, false);
  assert.equal(dryRunResult.rolledBack, false);
});

test(
  "live PostgreSQL integration: initial import, safe re-import, update, and rollback",
  { skip: !process.env.DATABASE_URL },
  async () => {
    const pkg = buildValidSyntheticPackage({
      packageId: "pkg-m9-live-integration",
    });

    const firstImport = await importContentPackage(pkg);
    assert.equal(firstImport.applied, true);
    assert.equal(firstImport.rolledBack, false);

    const secondImport = await importContentPackage(pkg, {
      allowPublishedUpdate: true,
    });
    assert.equal(secondImport.applied, true);

    const rolledBackImport = await importContentPackage(pkg, {
      allowPublishedUpdate: true,
      forceFailureBeforeCommit: true,
    });
    assert.equal(rolledBackImport.applied, false);
    assert.equal(rolledBackImport.rolledBack, true);
  }
);

