import assert from "node:assert/strict";
import test from "node:test";
import type { ContentDataset, ExerciseDefinition } from "../../../types/content";
import { LocalContentProvider } from "../contentProvider";
import { ContentService } from "../contentService";
import { collectContentValidationErrors } from "../contentValidator";
import {
  createInitialAnswerMap,
  evaluateExercise,
  normalizeFillBlankText,
  validateQuestionAnswered,
} from "../../exercise/exerciseEvaluator";

function buildSampleExercise(
  status: "draft" | "published" | "coming_soon" = "published"
): ExerciseDefinition {
  return {
    id: "ex_m5_sample",
    title: "A1 Greetings & Basics Check",
    instructions: "Complete all questions and submit your answers.",
    order: 1,
    status,
    explanation: "Review nouns, articles, and basic German word order.",
    questions: [
      {
        id: "q_single",
        questionType: "single-choice",
        displayOrder: 1,
        prompt: 'What is the German word for "house"?',
        points: 2,
        explanation: "Haus means house.",
        options: [
          { id: "opt_haus", label: "Haus" },
          { id: "opt_tisch", label: "Tisch" },
        ],
        correctOptionId: "opt_haus",
      },
      {
        id: "q_multi",
        questionType: "multiple-choice",
        displayOrder: 2,
        prompt: "Which words are definite German articles?",
        points: 3,
        explanation: "der, die, and das are definite articles.",
        options: [
          { id: "a_der", label: "der" },
          { id: "a_die", label: "die" },
          { id: "a_ein", label: "ein" },
        ],
        correctOptionIds: ["a_der", "a_die"],
      },
      {
        id: "q_tf",
        questionType: "true-false",
        displayOrder: 3,
        prompt: '"Das ist ein Buch." means "This is a book."',
        points: 1,
        trueLabel: "True",
        falseLabel: "False",
        correctValue: true,
      },
      {
        id: "q_blank",
        questionType: "fill-in-the-blank",
        displayOrder: 4,
        prompt: "Ich ___ Student.",
        points: 2,
        acceptedAnswers: ["bin", "Bin"],
        caseSensitive: false,
        trimWhitespace: true,
      },
      {
        id: "q_order",
        questionType: "sentence-ordering",
        displayOrder: 5,
        prompt: "Arrange the words into a valid German sentence.",
        points: 2,
        tokens: [
          { id: "t_bin", text: "bin" },
          { id: "t_ich", text: "Ich" },
          { id: "t_student", text: "Student." },
        ],
        correctOrderIds: ["t_ich", "t_bin", "t_student"],
      },
      {
        id: "q_match",
        questionType: "matching-pairs",
        displayOrder: 6,
        prompt: "Match each German word to its English meaning.",
        points: 2,
        pairs: [
          { id: "p_1", left: "Wasser", right: "Water" },
          { id: "p_2", left: "Buch", right: "Book" },
        ],
      },
    ],
  };
}

function buildDatasetWithExercise(
  exerciseStatus: "draft" | "published" | "coming_soon" = "published"
): ContentDataset {
  const exercise = buildSampleExercise(exerciseStatus);
  return {
    version: "m5.test",
    levels: [
      {
        id: "lvl_a1",
        slug: "a1",
        name: "Level A1",
        description: "A1",
        displayOrder: 1,
        status: "published",
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
    ],
    lessons: [
      {
        id: "lsn_1",
        weekId: "wk_1",
        slug: "day-1",
        title: "Day 1",
        description: "First lesson",
        objectives: [],
        displayOrder: 1,
        status: "published",
        sections: [
          {
            id: "sec_hw",
            key: "homework_assessment",
            title: "Homework & assessment",
            order: 1,
            blocks: [
              {
                id: "blk_ex_ref",
                kind: "exercise-reference",
                exerciseId: exercise.id,
                summary: "Practice greetings and articles.",
              },
            ],
          },
        ],
      },
    ],
    exercises: [exercise],
  };
}

test("Evaluates all six question types accurately including partial multiple-choice and German characters", () => {
  const exercise = buildSampleExercise("published");
  const partialAnswers = createInitialAnswerMap(exercise.questions);

  partialAnswers["q_single"] = { kind: "single-choice", selectedOptionId: "opt_haus" };
  partialAnswers["q_multi"] = { kind: "multiple-choice", selectedOptionIds: ["a_der"] };
  partialAnswers["q_tf"] = { kind: "true-false", selectedValue: true };
  partialAnswers["q_blank"] = { kind: "fill-in-the-blank", value: "  BIN  " };
  partialAnswers["q_order"] = {
    kind: "sentence-ordering",
    orderedTokenIds: ["t_ich", "t_bin", "t_student"],
  };
  partialAnswers["q_match"] = {
    kind: "matching-pairs",
    matches: { p_1: "Water", p_2: "Book" },
  };

  const summary = evaluateExercise(exercise, partialAnswers);
  assert.equal(summary.totalQuestions, 6);
  assert.equal(summary.correctCount, 5);
  assert.equal(summary.earnedPoints, 9);
  assert.equal(summary.totalPoints, 12);
  assert.equal(summary.percentage, 75);

  const multiResult = summary.questionResults.find((r) => r.questionId === "q_multi");
  assert.equal(multiResult?.isCorrect, false);
  assert.equal(multiResult?.pointsEarned, 0);

  assert.equal(normalizeFillBlankText("  Straße  "), "straße");
  assert.equal(normalizeFillBlankText("  Übung  "), "übung");
  assert.equal(normalizeFillBlankText("Straße", { caseSensitive: true }), "Straße");
});

test("Validation detects unanswered required questions and handles zero-question exercises safely", () => {
  const exercise = buildSampleExercise("published");
  const initialAnswers = createInitialAnswerMap(exercise.questions);
  const singleQuestion = exercise.questions[0]!;
  assert.ok(validateQuestionAnswered(singleQuestion, initialAnswers["q_single"]));

  const emptySummary = evaluateExercise(
    {
      id: "ex_empty",
      title: "Empty",
      instructions: "None",
      order: 1,
      status: "published",
      questions: [],
    },
    {}
  );
  assert.equal(emptySummary.totalQuestions, 0);
  assert.equal(emptySummary.totalPoints, 0);
  assert.equal(emptySummary.percentage, 0);
});

test("ContentService enforces draft and coming_soon visibility on exercises and validates dataset", async () => {
  const publishedDataset = buildDatasetWithExercise("published");
  assert.equal(collectContentValidationErrors(publishedDataset).length, 0);
  const pubService = new ContentService(new LocalContentProvider(publishedDataset));
  const publishedExercise = await pubService.getExerciseById("ex_m5_sample");
  assert.equal(publishedExercise?.id, "ex_m5_sample");

  const draftDataset = buildDatasetWithExercise("draft");
  const draftService = new ContentService(new LocalContentProvider(draftDataset));
  const draftExercise = await draftService.getExerciseById("ex_m5_sample");
  assert.equal(draftExercise, undefined);

  const soonDataset = buildDatasetWithExercise("coming_soon");
  const soonService = new ContentService(new LocalContentProvider(soonDataset));
  const soonExercise = await soonService.getExerciseById("ex_m5_sample");
  assert.equal(soonExercise?.status, "coming_soon");
});

