# Learn German Daily

A little German. Every day.

## Milestones
- **Milestone 0:** Project foundation, routing skeleton, types, and `ContentService` contract.
- **Milestone 1:** Academic editorial brand identity, 50-30-10-10 tokens, typography, and reusable UI primitives.
- **Milestone 2:** Global navigation, breadcrumbs, structural hierarchy pages (`Level -> Course -> Week -> Lesson`), and not-found/empty states.
- **Milestone 3:** Typed content model (`CEFRLevel -> Course -> Week -> Lesson -> Sections -> ContentBlocks`), `ContentProvider` / `ContentService` boundary, validation, and `draft` / `published` / `coming_soon` visibility rules.
- **Milestone 4:** Reusable `LessonEngine`, section and block renderers, adjacent lesson navigation, full-surface navigable cards, lesson engine tests, and architecture documentation.
- **Milestone 5:** Reusable interactive exercise and quiz engine supporting six question types (`single-choice`, `multiple-choice`, `true-false`, `fill-in-the-blank`, `sentence-ordering`, `matching-pairs`), client-side evaluation, scoring, feedback, session retry, exercise tests, and documentation.
- **Milestone 6:** Local-only learner progress and lesson completion system using `localStorage` (`learn-german-daily:progress`) with schema versioning, explicit lesson completion, persistent exercise attempt history, published-only hierarchy progress calculations, continue-learning support, `/progress` overview, progress tests, and documentation.

## Documentation
- [Learner Progress Architecture](docs/architecture/progress-system.md) — Progress service, `localStorage` persistence, schema versioning, explicit completion rules, attempt history, progress calculations, and future API migration.
- [Exercise Engine Architecture](docs/architecture/exercise-engine.md) — Data model, six question types, evaluation, scoring, feedback, retry, accessibility, and authoring guide.
- [Lesson Engine Architecture](docs/architecture/lesson-engine.md) — `LessonEngine`, section/block renderers, exercise integration, and navigation.
- [Content Model & Publishing System](docs/architecture/content-model-and-publishing.md) — Entity schemas, section/block/exercise types, publishing statuses, and validation rules.
- [Navigation & Learning Hierarchy](docs/architecture/navigation-and-hierarchy.md) — Global chrome, breadcrumbs, full-card links, and hierarchy flow.
- [Dynamic Routing Architecture](docs/architecture/routing.md) — App Router dynamic routes, empty/not-found states, and visibility handling.
- [Development Setup](docs/development/setup.md) — Local environment and workflow notes.

## Commands
- `npm run dev` — Start local development server
- `npm test` — Run automated lesson, exercise, and progress engine tests
- `npm run lint` — Run ESLint
- `npx tsc --noEmit` — Run TypeScript check
- `npm run build` — Run production build

