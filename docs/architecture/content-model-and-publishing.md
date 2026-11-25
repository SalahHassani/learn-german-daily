# Content Model & Publishing System (Milestones 3 & 4)

## Learning Hierarchy
`CEFR Level -> Course -> Week -> Lesson -> Lesson Sections -> Content Blocks`

The hierarchy is data-driven and supports any number of levels, courses, weeks, lessons, sections, and content blocks without creating per-week or per-day route folders or hardcoding counts.

## Core Entities & Stable IDs
- **CEFRLevel (`src/types/curriculum.ts`):** `id`, `slug`, `name`, `description`, `displayOrder`, `status`.
- **Course (`src/types/curriculum.ts`):** `id`, `levelId`, `slug`, `title`, `description`, `displayOrder`, `status`.
- **Week (`src/types/curriculum.ts`):** `id`, `courseId`, `slug`, `title`, `theme`, `displayOrder`, `status`.
- **Lesson (`src/types/curriculum.ts` & `src/types/content.ts`):** `id`, `weekId`, `slug`, `title`, `description`, `objectives`, `displayOrder`, `status`, plus optional `estimatedDurationMinutes`, `version`, and `sections: StructuredLessonSection[]`.
- **Lesson Sections (`StructuredLessonSection`):** `id`, `key` (`revision`, `vocabulary`, `verbs`, `grammar`, `reading`, `sentence_construction`, `homework_assessment`), `title`, `order`, and `blocks: TypedContentBlock[]`. Multiple sections of the same key are supported; speaking and listening sections are excluded in the initial platform.
- **Content Blocks (`TypedContentBlock`):** Discriminated union on `kind` (`text`, `heading`, `vocabulary-item`, `vocabulary-list`, `verb-info`, `verb-conjugation`, `grammar-explanation`, `example-sentence`, `reading-passage`, `sentence-construction`, `exercise-reference`).

Stable `id` values separate identity from display titles and URL slugs so internal relationships remain intact across title or slug changes.

## Vocabulary, Verbs & Optional Audio Fields
- **Vocabulary (`VocabularyEntry`):** Supports nouns, verbs, adjectives, adverbs, phrases, and other entries with optional `article` (`der`, `die`, `das`), `plural`, `exampleSentence`, `pronunciationReference`, and optional nullable `audioReference`.
- **Verbs (`VerbEntry`):** Supports `infinitive`, `englishMeaning`, optional `prateritum`, `partizipII`, `conjugation`, `exampleSentence`, and optional nullable `audioReference`.
- **Audio Preparation:** `AudioReference` fields are stored as optional nullable data (`url`, `assetKey`, `durationSeconds`). No audio player, play button, audio control, or speaking/listening UI is rendered.

## Storage, Provider & Service Boundary
- **Local Data (`src/services/content/localContentData.ts`):** Supplies the local `ContentDataset` (`version`, `levels`, `courses`, `weeks`, `lessons`) without a database, backend API, authentication, or CMS.
- **Validation (`src/services/content/contentValidator.ts`):** Validates unique IDs, scoped slug uniqueness, valid parent references, valid statuses (`draft`, `published`, `coming_soon`), valid `displayOrder`, required entity/block fields, and draft parent-child consistency.
- **Provider & Service (`src/services/content/contentProvider.ts`, `src/services/content/contentService.ts`):** `ContentProvider` (`LocalContentProvider`) abstracts storage so a future API or database provider can replace the local source without rewriting route components. `ContentService` sorts by `displayOrder` and enforces visibility rules.

## Publishing Statuses & Visibility Rules
- **`draft`:** Hidden from public listings and blocked on direct lookups/routes. A `draft` parent also blocks public visibility of its descendants.
- **`coming_soon`:** Appears in roadmaps with a `"Coming soon"` label and renders a `"Coming soon"` structural state without exposing unpublished lesson content, paywalls, or unlock/completion states.
- **`published`:** Publicly accessible when all ancestor levels, courses, and weeks are also publicly visible.

## Initial Roadmap
- **Levels:** `a1` (`published`); `a2`, `b1`, `b2`, `c1`, `c2` (`coming_soon`).
- **A1 Courses:** `a1-1` (`published`); `a1-2` (`coming_soon`).
- **A1.1 Weeks:** `week-1` (`published`); `week-2`, `week-3`, `week-4` (`coming_soon`).
- **Week 1 Lessons:** `day-1` (`published`); `day-2` through `day-7` (`coming_soon`).

## Authoring & Maintenance Guide
- **Add a level, course, week, or lesson:** Append a record with a unique `id`, valid parent ID (`levelId`, `courseId`, `weekId`), unique `slug` in scope, `displayOrder`, and `status` in `src/services/content/localContentData.ts`.
- **Update publishing status:** Change the entity's `status` field (`draft`, `published`, `coming_soon`) in the content source—never hardcode status checks per slug in page components.
- **Milestone 4 & 5 integration:** `LessonEngine` renders `StructuredLesson.sections` and `TypedContentBlock` records from `contentService`; `exercise-reference` blocks prepare integration points for Milestone 5 interactive exercises.

