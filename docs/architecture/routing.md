# Dynamic Routing Architecture

Dynamic routes:
- `/` (Homepage)
- `/levels` (CEFR Levels Directory)
- `/levels/[levelSlug]` (Level Courses View)
- `/courses/[courseSlug]` (Course Weeks View)
- `/courses/[courseSlug]/weeks/[weekSlug]` (Week Lessons View)
- `/lessons/[lessonSlug]` (Lesson Entry View)

Invalid slugs, hidden `draft` items, and empty collections render structured `StructuralState` or `not-found.tsx` views without exposing raw errors or unpublished content. `coming_soon` items display a clear `"Coming soon"` state without exposing lesson content.

