export type ContentStatus = "draft" | "published" | "coming_soon";

export interface LessonContentBlock {
  id: string;
  kind: string;
  payload: Record<string, unknown>;
}

export interface LessonSection {
  id: string;
  key:
    | "revision"
    | "vocabulary"
    | "verbs"
    | "grammar"
    | "reading"
    | "sentence_construction"
    | "homework_assessment";
  title: string;
  blocks: LessonContentBlock[];
}

export interface LessonContent {
  lessonId: string;
  sections: LessonSection[];
}

export interface Lesson {
  id: string;
  weekId: string;
  slug: string;
  title: string;
  description: string;
  objectives: string[];
  displayOrder: number;
  status: ContentStatus;
}

export interface Week {
  id: string;
  courseId: string;
  slug: string;
  title: string;
  theme: string;
  displayOrder: number;
  status: ContentStatus;
}

export interface Course {
  id: string;
  levelId: string;
  slug: string;
  title: string;
  description: string;
  displayOrder: number;
  status: ContentStatus;
}

export interface CEFRLevel {
  id: string;
  slug: string;
  name: string;
  description: string;
  displayOrder: number;
  status: ContentStatus;
}
