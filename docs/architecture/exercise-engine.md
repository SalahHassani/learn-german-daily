# Interactive Exercise & Quiz Engine Architecture (Milestone 5)

## End-to-End Flow
`Lesson Content` -> `ContentService` -> `LessonEngine` -> `exercise-reference` block -> `ExerciseBlockRenderer` -> `ExerciseDefinition` (`ContentService.getExerciseById`) -> `ExerciseRunner` -> `ExerciseQuestionCard` + type-specific question input -> `exerciseEvaluator.ts` -> Feedback, score summary, and session retry.

All exercise definitions and questions live in structured content data (`src/services/content/localContentData.ts`) and are validated by `src/services/content/contentValidator.ts`. React components do not hardcode question banks, answers, or lesson-specific UI.

## Supported Exercise / Question Types
1. **`single-choice`:** One option selected; full points when matching `correctOptionId`.
2. **`multiple-choice`:** Multi-select checkboxes; evaluated as an exact set match against `correctOptionIds` (no partial credit by default).
3. **`true-false`:** Binary selection (`correctValue`); full points when matched.
4. **`fill-in-the-blank`:** Text input checked against `acceptedAnswers` with optional whitespace trimming (`trimWhitespace`) and German locale case-folding (`toLocaleLowerCase("de-DE")`) when `caseSensitive` is false, preserving `ä`, `ö`, `ü`, and `ß`.
5. **`sentence-ordering`:** Token sequence ordered via accessible move up/down and reset controls (no drag-and-drop required); checked against `correctOrderIds`.
6. **`matching-pairs`:** Left-to-right pair selection and clearing via accessible buttons/keyboard (no drag-and-drop required); checked against each pair's expected `right` value.

## Scoring, Feedback & Retry
- **Scoring:** Sums `points` across ordered questions (`earnedPoints / totalPoints` and rounded percentage). Incorrect answers earn `0` points. Zero-question or zero-point sets safely yield `0%`.
- **Feedback:** Displays `Correct` or `Incorrect` using `#3F765B` and `#B54747` paired with explicit text indicators, expected answers when incorrect, and `explanation` text strictly from content data.
- **Retry & Session Boundaries:** Attempt state and answers live in component state and reset completely on retry. No `localStorage` persistence, lesson completion tracking, streaks, accounts, or backend APIs are introduced in M5.

## Answer Security Trade-Offs
Evaluation runs client-side in pure TypeScript (`src/services/exercise/exerciseEvaluator.ts`) because the platform currently has no backend server or database. Client-delivered exercise data is inspectable in the browser; if server-side grading or hidden answer keys are needed later, grading can be moved behind a server boundary while keeping the data model and evaluator contract intact.

## Adding New Exercises & Question Types
- **Add an exercise:** Add an `ExerciseDefinition` entry to `exercises` in `src/services/content/localContentData.ts` and reference its `id` from a lesson's `exercise-reference` content block.
- **Add a question type:** Extend `ExerciseQuestion` in `src/types/content.ts`, add validation rules in `src/services/content/contentValidator.ts`, add evaluation logic in `src/services/exercise/exerciseEvaluator.ts`, and render it in `ExerciseQuestionCard` (`src/components/exercise/exercise-question-card.tsx`).

