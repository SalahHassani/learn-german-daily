# Content Provider Migration — Learn German Daily (Milestone 8)

## Provider & Service Transition

The content layer transitions from synchronous in-memory lookups toward asynchronous PostgreSQL retrieval while keeping existing UI renderers (`LessonEngine`, `ContentBlockRenderer`, `ExerciseRunner`) decoupled from database table structures:

```text
Next.js Server Components / Loaders
        │
        ▼
  ContentService (async)
        │
        ├──▶ DatabaseContentProvider ──▶ DatabaseContentRepository ──▶ PostgreSQL
        └──▶ LocalContentProvider (retained during M8 transition)

        