# Dynamic Routing Architecture

Dynamic routes:
- `/` (Homepage)
- `/levels` (CEFR Levels Directory)
- `/levels/[levelSlug]` (Level Courses View)
- `/courses/[courseSlug]` (Course Weeks View)
- `/courses/[courseSlug]/weeks/[weekSlug]` (Week Lessons View)
- `/lessons/[lessonSlug]` (Lesson Structural Entry)

Invalid slugs and empty collections render structured `StructuralState` or `not-found.tsx` views without exposing raw errors.

