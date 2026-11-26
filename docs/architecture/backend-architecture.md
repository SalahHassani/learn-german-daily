---

### 3. `docs/architecture/backend-architecture.md`

```markdown
# Backend Architecture — Learn German Daily (Milestone 8)

## Server-Only Boundary

Database access is implemented in Next.js server-only TypeScript modules:

- `src/db/index.ts` — Drizzle + `pg` pool initialization and `DATABASE_URL` validation. Marked with `import "server-only"`.
- `src/db/schema.ts` — Relational schema definitions and TypeScript types.
- `src/db/seed.ts` — Idempotent seed runner for local/development databases.
- `src/services/content/databaseContentRepository.ts` — Batched PostgreSQL queries and ancestry visibility checks.
- `src/services/content/databaseContentProvider.ts` — Provider wrapper over `DatabaseContentRepository`.

No database credentials or DB clients are ever imported into client components or browser bundles.

## Query Strategy & N+1 Avoidance

`DatabaseContentRepository.getPublishedLessonBySlug` verifies lesson and ancestor visibility first, then fetches visible sections, all blocks for those sections in a single `inArray` query, and deduplicated vocabulary, verb, exercise, and exercise-question records in batched queries rather than per-block or per-question queries.

## Configuration, Error Handling & Testing

- Configure `DATABASE_URL` (and optional `DATABASE_DIRECT_URL`, `CONTENT_PROVIDER`, `NEXT_PUBLIC_SITE_URL`) via `.env` (based on `.env.example`).
- Missing database configuration throws `DatabaseConfigurationError` with a safe message and never leaks connection strings, SQL statements, or internal stack traces to end users.
- Run database and provider tests against a dedicated test database or schema—never against production data.

