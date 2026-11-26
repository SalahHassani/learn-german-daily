# Learner Progress & Lesson Completion Architecture (Milestone 6)

## Architecture
UI components and engines (`LessonEngine`, `ExerciseRunner`, cards, homepage, `/progress`) consume `ProgressContext` / `ProgressService` rather than calling `localStorage` directly:

`Lesson / Exercise / UI` -> `ProgressContext` -> `ProgressService` -> `ProgressProvider` (`LocalStorageProgressProvider`) -> Browser `localStorage` (`learn-german-daily:progress`)

Educational content (`ContentService`) and learner progress (`ProgressService`) remain separated: `ContentService` answers what content exists and is published; `ProgressService` tracks completion, exercise attempts, and recent lesson visits.

## Data Model & Schema Versioning
- **Storage key:** `learn-german-daily:progress`
- **Schema version:** `PROGRESS_SCHEMA_VERSION = 1`
- **State (`LearnerProgressState`):** `schemaVersion`, `updatedAt`, `lessonsById` (`lessonId`, `completed`, `completedAt`, `updatedAt`), `exerciseAttempts` (`attemptId`, `exerciseId`, `lessonId`, `attemptNumber`, `startedAt`, `submittedAt`, `earnedPoints`, `totalPoints`, `percentage`, `correctCount`, `totalQuestions`), and optional `activity` (`lastVisitedLessonId`, `lastVisitedAt`).
- **Migrations & Error Handling:** `progressMigrations.ts` validates stored structures, upgrades older schema versions deterministically, and resets safely on unsupported versions, invalid structures, malformed JSON, or unavailable/quota-restricted `localStorage` without crashing lessons or exercises.

## Rules, Calculations & Continue Learning
- **Explicit Completion:** Lessons are only marked complete or incomplete via explicit user action (`Mark lesson complete` / `Mark as incomplete`). Opening, scrolling, or submitting/passing an exercise never auto-completes a lesson, and reopening a completed lesson preserves completion state.
- **Exercise Attempts:** Every quiz submission records an `ExerciseAttemptRecord` (including retries) with score and timestamp summaries while keeping attempt history separate from lesson completion.
- **Published-Only Calculations:** Week, course, level, and overall progress divide completed published lessons by total published lessons in scope, excluding `draft` and `coming_soon` lessons and guarding against zero-lesson division.
- **Continue Learning:** Uses `lastVisitedLessonId` to resume an incomplete lesson, advance to the next published lesson when completed, or start at the first available published lesson when no progress exists.

## Privacy, Local Storage & Future API Migration
Progress is non-sensitive local browser activity data stored without user accounts, authentication, or cross-device sync, so data does not automatically transfer across browsers or devices. Replacing `localStorage` later requires implementing `ProgressProvider` against a backend API while keeping `ProgressService` and UI components intact.

