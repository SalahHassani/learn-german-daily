# Lesson Engine Architecture (Milestones 4 & 5)

## End-to-End Flow
`Content Data (localContentData.ts / ContentProvider)` -> `ContentService + visibilityPolicy` -> `src/app/lessons/[lessonSlug]/page.tsx` -> `LessonEngine` -> `LessonHeader` + `LessonSectionNavigation` + `LessonSectionRenderer` -> `ContentBlockRenderer` -> Reusable Learning Block Components / `ExerciseBlockRenderer` + `LessonNavigation`.

The frontend does not hardcode lesson-specific components or educational copy per day or course. Adding lessons, content blocks, or exercises happens through structured content data and reusable components.

## Lesson Page Structure & Components
- **`LessonEngine` (`src/components/lesson/lesson-engine.tsx`):** Coordinates lesson presentation, `coming_soon` handling, empty section handling, and lesson footer navigation.
- **`LessonHeader` (`src/components/lesson/lesson-header.tsx`):** Displays course, week, CEFR level, lesson title, display order, optional duration, status badge when applicable, objectives, and description when present.
- **`LessonSectionNavigation` (`src/components/lesson/lesson-section-navigation.tsx`):** Renders navigation strictly for sections present on the lesson, ordered by `section.order`, with keyboard focus support and current section state.
- **`LessonSectionRenderer` (`src/components/lesson/lesson-section-renderer.tsx`):** Renders each `StructuredLessonSection` and handles empty block arrays gracefully.
- **`ContentBlockRenderer` (`src/components/lesson/content-block-renderer.tsx`):** Switches over `TypedContentBlock["kind"]` (`text`, `heading`, `vocabulary-item`, `vocabulary-list`, `verb-info`, `verb-conjugation`, `grammar-explanation`, `example-sentence`, `reading-passage`, `sentence-construction`, `exercise-reference`), handles unknown block types safely without crashing the lesson, and delegates `exercise-reference` blocks to `ExerciseBlockRenderer` (`src/components/exercise/exercise-block-renderer.tsx`).
- **Exercise Integration (`src/components/exercise/exercise-block-renderer.tsx` & `src/components/exercise/exercise-runner.tsx`):** Resolves referenced exercises via `ContentService.getExerciseById`, rendering an interactive `ExerciseRunner` when `published`, a `"Coming soon"` structural state when `coming_soon`, or a non-crashing unavailable state when missing or `draft`.
- **Learning Block Views:** `src/components/lesson/vocabulary-view.tsx`, `src/components/lesson/verb-view.tsx`, and `src/components/lesson/grammar-and-reading-blocks.tsx`. Audio players, speaking/listening exercises, user accounts, and persistent progress tracking remain out of scope.
- **`LessonNavigation` (`src/components/lesson/lesson-navigation.tsx`):** Provides links back to the parent week and to adjacent published/visible previous and next lessons using `ContentService` ordering.

## Full-Surface Navigable Cards
`NavigableCard` (`src/components/navigation/navigable-card.tsx`) wraps the full card surface in a single semantic Next.js `<Link>`, providing hover and keyboard `:focus-visible` states without nested links or buttons.

## Accessibility & Responsiveness
Targets WCAG 2.2 AA with semantic HTML landmarks, heading hierarchy, keyboard focus visibility, responsive containers, and overflow-safe layouts across mobile, tablet, laptop, and desktop widths.

## Extending Content
- **Add a lesson:** Add a `StructuredLesson` entry with a unique `id`, valid `weekId`, unique `slug` in the week, `displayOrder`, `status`, and ordered `sections` in `src/services/content/localContentData.ts`.
- **Add a content block type:** Add the variant to `TypedContentBlock` in `src/types/content.ts`, validate required fields in `src/services/content/contentValidator.ts`, and add a renderer branch in `src/components/lesson/content-block-renderer.tsx`.

