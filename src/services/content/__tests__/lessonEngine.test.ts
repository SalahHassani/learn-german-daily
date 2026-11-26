import assert from "node:assert/strict";
import test from "node:test";
import type { ContentDataset, TypedContentBlock } from "../../../types/content";
import { LocalContentProvider } from "../contentProvider";
import { ContentService } from "../contentService";
import { LOCAL_CONTENT_DATASET } from "../localContentData";
import { collectContentValidationErrors } from "../contentValidator";
import {
  isComingSoonStatus,
  isLessonPubliclyVisible,
  isPublishedStatus,
} from "../visibilityPolicy";

function buildTestDataset(): ContentDataset {
  return {
    version: "m4.test",
    levels: [
      {
        id: "lvl_test_a1",
        slug: "a1",
        name: "Level A1",
        description: "Test A1 level",
        displayOrder: 1,
        status: "published",
      },
      {
        id: "lvl_test_draft",
        slug: "draft-level",
        name: "Draft Level",
        description: "Hidden level",
        displayOrder: 2,
        status: "draft",
      },
    ],
    courses: [
      {
        id: "crs_test_a1_1",
        levelId: "lvl_test_a1",
        slug: "a1-1",
        title: "German A1.1",
        description: "Test course",
        displayOrder: 1,
        status: "published",
      },
    ],
    weeks: [
      {
        id: "wk_test_1",
        courseId: "crs_test_a1_1",
        slug: "week-1",
        title: "Week 1",
        theme: "Greetings",
        displayOrder: 1,
        status: "published",
      },
    ],
    lessons: [
      {
        id: "lsn_test_1",
        weekId: "wk_test_1",
        slug: "lesson-one",
        title: "Lesson One",
        description: "First published lesson",
        objectives: ["Greet someone"],
        displayOrder: 1,
        status: "published",
        sections: [
          {
            id: "sec_vocab",
            key: "vocabulary",
            title: "Vocabulary",
            order: 2,
            blocks: [
              {
                id: "blk_vocab_1",
                kind: "vocabulary-item",
                item: {
                  id: "v1",
                  germanWord: "Hallo",
                  partOfSpeech: "phrase",
                  englishMeaning: "Hello",
                },
              },
            ],
          },
          {
            id: "sec_rev",
            key: "revision",
            title: "Revision",
            order: 1,
            blocks: [
              {
                id: "blk_text_1",
                kind: "text",
                body: "Welcome to lesson one.",
              },
            ],
          },
        ],
      },
      {
        id: "lsn_test_2",
        weekId: "wk_test_1",
        slug: "lesson-two",
        title: "Lesson Two",
        description: "Second published lesson",
        objectives: [],
        displayOrder: 2,
        status: "published",
        sections: [],
      },
      {
        id: "lsn_test_draft",
        weekId: "wk_test_1",
        slug: "lesson-draft",
        title: "Draft Lesson",
        description: "Should never be public",
        objectives: [],
        displayOrder: 3,
        status: "draft",
        sections: [],
      },
      {
        id: "lsn_test_soon",
        weekId: "wk_test_1",
        slug: "lesson-coming-soon",
        title: "Lesson Three",
        description: "Planned lesson",
        objectives: [],
        displayOrder: 4,
        status: "coming_soon",
        sections: [],
      },
    ],
  };
}

test("Lesson section ordering and adjacent lesson navigation work via ContentService", async () => {
  const provider = new LocalContentProvider(buildTestDataset());
  const service = new ContentService(provider);

  const first = await service.getLessonBySlug("lesson-one");
  assert.ok(first, "Expected lesson-one to resolve");
  assert.equal(first.lesson.sections[0]?.id, "sec_rev", "Expected lower order section first");
  assert.equal(first.lesson.sections[1]?.id, "sec_vocab", "Expected higher order section second");
  assert.equal(first.previousLessonSlug, undefined);
  assert.equal(first.nextLessonSlug, "lesson-two");

  const second = await service.getLessonBySlug("lesson-two");
  assert.ok(second, "Expected lesson-two to resolve");
  assert.equal(second.previousLessonSlug, "lesson-one");
  assert.equal(second.nextLessonSlug, "lesson-coming-soon");
});

test("Draft lessons are excluded and coming_soon lessons respect visibility rules", async () => {
  const dataset = buildTestDataset();
  const provider = new LocalContentProvider(dataset);
  const service = new ContentService(provider);

  assert.equal(await service.getLessonBySlug("lesson-draft"), undefined);
  assert.equal(isPublishedStatus("published"), true);
  assert.equal(isComingSoonStatus("coming_soon"), true);

  const weekLessons = await service.getLessonsByWeekSlugs("a1-1", "week-1");
  assert.deepEqual(
    weekLessons.map((l) => l.slug),
    ["lesson-one", "lesson-two", "lesson-coming-soon"]
  );

  const draftLevel = dataset.levels.find((l) => l.slug === "draft-level");
  const sampleLesson = dataset.lessons[0]!;
  assert.equal(
    isLessonPubliclyVisible(sampleLesson, dataset.weeks[0], dataset.courses[0], draftLevel),
    false
  );
});

test("Content block variants and optional fields validate cleanly", () => {
  const dataset = buildTestDataset();
  const extraBlocks: TypedContentBlock[] = [
    {
      id: "blk_verb_1",
      kind: "verb-info",
      verb: {
        id: "vb_sein",
        infinitive: "sein",
        englishMeaning: "to be",
      },
    },
    {
      id: "blk_conj_1",
      kind: "verb-conjugation",
      infinitive: "sein",
      forms: { ich: "bin", du: "bist" },
    },
    {
      id: "blk_gram_1",
      kind: "grammar-explanation",
      ruleTitle: "Verb Position",
      explanation: "Conjugated verb takes second position.",
    },
    {
      id: "blk_ex_1",
      kind: "exercise-reference",
      exerciseId: "ex_m5_placeholder",
      summary: "Prepared for Milestone 5 exercises.",
    },
  ];
  dataset.lessons[0]!.sections[0]!.blocks.push(...extraBlocks);
  assert.equal(collectContentValidationErrors(dataset).length, 0);
});

test("Local dataset initializes and invalid slugs return undefined", async () => {
  const service = new ContentService(new LocalContentProvider(LOCAL_CONTENT_DATASET));
  const levels = await service.getLevels();
  assert.ok(levels.length > 0);
  assert.equal(await service.getLessonBySlug("non-existent-lesson"), undefined);
});

