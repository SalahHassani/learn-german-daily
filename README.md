# Learn German Daily

A little German. Every day.

## Milestones
- **Milestone 0:** Project foundation, routing skeleton, types, and `ContentService` contract.
- **Milestone 1:** Academic editorial brand identity, 50-30-10-10 tokens, typography, and reusable UI primitives.
- **Milestone 2:** Global navigation, breadcrumbs, structural hierarchy pages (`Level -> Course -> Week -> Lesson`), and not-found/empty states.
- **Milestone 3:** Typed content model (`CEFRLevel -> Course -> Week -> Lesson -> Sections -> ContentBlocks`), `ContentProvider` / `ContentService` boundary, validation, and `draft` / `published` / `coming_soon` visibility rules.
- **Milestone 4:** Reusable `LessonEngine`, section and block renderers, adjacent lesson navigation, full-surface navigable cards, lesson engine tests, and architecture documentation.

## Documentation
- [Lesson Engine Architecture](docs/architecture/lesson-engine.md) — `LessonEngine`, section/block renderers, full-card navigation pattern, accessibility, and authoring guide.
- [Content Model & Publishing System](docs/architecture/content-model-and-publishing.md) — Entity schemas, section/block types, publishing statuses (`draft`, `published`, `coming_soon`), validation, and authoring rules.
- [Navigation & Learning Hierarchy](docs/architecture/navigation-and-hierarchy.md) — Global chrome, breadcrumbs, full-card links, and hierarchy flow (`Level -> Course -> Week -> Lesson`).
- [Dynamic Routing Architecture](docs/architecture/routing.md) — App Router dynamic routes, empty/not-found states, and visibility handling.
- [Development Setup](docs/development/setup.md) — Local environment and workflow notes.

## Commands
- `npm run dev` — Start local development server
- `npm test` — Run automated lesson engine tests
- `npm run lint` — Run ESLint
- `npx tsc --noEmit` — Run TypeScript check
- `npm run build` — Run production build

