/**
 * Temporary structural navigation data for Milestone 2 only.
 * Models CEFR Level -> Course -> Week -> Lesson hierarchy for route navigation
 * before Milestone 3 introduces the full content system and publishing workflow.
 */

export interface StructuralLesson {
  slug: string;
  title: string;
  weekSlug: string;
  courseSlug: string;
  levelSlug: string;
  availabilityLabel?: string;
  previousLessonSlug?: string;
  nextLessonSlug?: string;
}

export interface StructuralWeek {
  slug: string;
  title: string;
  summary: string;
  courseSlug: string;
  levelSlug: string;
  availabilityLabel?: string;
  lessons: StructuralLesson[];
}

export interface StructuralCourse {
  slug: string;
  title: string;
  summary: string;
  levelSlug: string;
  availabilityLabel?: string;
  weeks: StructuralWeek[];
}

export interface StructuralLevel {
  slug: string;
  code: string;
  name: string;
  summary: string;
  availabilityLabel?: string;
  courses: StructuralCourse[];
}

export const M2_STRUCTURAL_LEVELS: StructuralLevel[] = [
  {
    slug: "a1",
    code: "A1",
    name: "Level A1 — Beginner",
    summary: "Foundational everyday expressions, introductions, and basic sentence structure.",
    availabilityLabel: "Initial structure active",
    courses: [
      {
        slug: "a1-1",
        title: "German A1.1",
        summary: "First part of the A1 sequence covering core greetings, personal details, and daily routines.",
        levelSlug: "a1",
        availabilityLabel: "Structure ready",
        weeks: [
          {
            slug: "week-1",
            title: "Week 1",
            summary: "First week structure within A1.1.",
            courseSlug: "a1-1",
            levelSlug: "a1",
            availabilityLabel: "Structure ready",
            lessons: [
              {
                slug: "a1-1-1-1",
                title: "Lesson 1",
                weekSlug: "week-1",
                courseSlug: "a1-1",
                levelSlug: "a1",
                availabilityLabel: "Placeholder ready",
                nextLessonSlug: "a1-1-1-2",
              },
              {
                slug: "a1-1-1-2",
                title: "Lesson 2",
                weekSlug: "week-1",
                courseSlug: "a1-1",
                levelSlug: "a1",
                availabilityLabel: "Placeholder ready",
                previousLessonSlug: "a1-1-1-1",
              },
            ],
          },
        ],
      },
      {
        slug: "a1-2",
        title: "German A1.2",
        summary: "Second part of the A1 sequence extending everyday communication and structure.",
        levelSlug: "a1",
        availabilityLabel: "Planned",
        weeks: [],
      },
    ],
  },
  {
    slug: "a2",
    code: "A2",
    name: "Level A2 — Elementary",
    summary: "Routine tasks, familiar topics, and direct exchange of everyday information.",
    availabilityLabel: "Planned",
    courses: [],
  },
  {
    slug: "b1",
    code: "B1",
    name: "Level B1 — Intermediate",
    summary: "Clear standard input on familiar matters encountered in study, work, or travel.",
    availabilityLabel: "Planned",
    courses: [],
  },
  {
    slug: "b2",
    code: "B2",
    name: "Level B2 — Upper Intermediate",
    summary: "Complex texts on concrete and abstract topics and structured technical discussion.",
    availabilityLabel: "Planned",
    courses: [],
  },
  {
    slug: "c1",
    code: "C1",
    name: "Level C1 — Advanced",
    summary: "Demanding, longer texts and implicit meaning with flexible academic expression.",
    availabilityLabel: "Planned",
    courses: [],
  },
  {
    slug: "c2",
    code: "C2",
    name: "Level C2 — Mastery",
    summary: "Ease of comprehension and nuanced expression across academic and cultural contexts.",
    availabilityLabel: "Planned",
    courses: [],
  },
];

export function getAllLevels(): StructuralLevel[] {
  return M2_STRUCTURAL_LEVELS;
}

export function getLevelBySlug(levelSlug: string): StructuralLevel | undefined {
  return M2_STRUCTURAL_LEVELS.find((level) => level.slug === levelSlug);
}

export function getCourseBySlug(courseSlug: string): { level: StructuralLevel; course: StructuralCourse } | undefined {
  for (const level of M2_STRUCTURAL_LEVELS) {
    const course = level.courses.find((item) => item.slug === courseSlug);
    if (course) {
      return { level, course };
    }
  }
  return undefined;
}

export function getWeekBySlugs(
  courseSlug: string,
  weekSlug: string
): { level: StructuralLevel; course: StructuralCourse; week: StructuralWeek } | undefined {
  const found = getCourseBySlug(courseSlug);
  if (!found) {
    return undefined;
  }
  const week = found.course.weeks.find((item) => item.slug === weekSlug);
  if (!week) {
    return undefined;
  }
  return { level: found.level, course: found.course, week };
}

export function getLessonBySlug(lessonSlug: string):
  | { level: StructuralLevel; course: StructuralCourse; week: StructuralWeek; lesson: StructuralLesson }
  | undefined {
  for (const level of M2_STRUCTURAL_LEVELS) {
    for (const course of level.courses) {
      for (const week of course.weeks) {
        const lesson = week.lessons.find((item) => item.slug === lessonSlug);
        if (lesson) {
          return { level, course, week, lesson };
        }
      }
    }
  }
  return undefined;
}