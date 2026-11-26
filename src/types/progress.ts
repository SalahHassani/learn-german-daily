export const PROGRESS_STORAGE_KEY = "learn-german-daily:progress";
export const PROGRESS_SCHEMA_VERSION = 1;

export type LessonCompletionRecord = {
  lessonId: string;
  completed: boolean;
  completedAt?: string;
  updatedAt: string;
};

export type ExerciseAttemptRecord = {
  attemptId: string;
  exerciseId: string;
  lessonId?: string;
  attemptNumber: number;
  startedAt: string;
  submittedAt: string;
  earnedPoints: number;
  totalPoints: number;
  percentage: number;
  correctCount: number;
  totalQuestions: number;
};

export type RecentActivityMeta = {
  lastVisitedLessonId?: string;
  lastVisitedAt?: string;
};

export type LearnerProgressState = {
  schemaVersion: number;
  updatedAt: string;
  lessonsById: Record<string, LessonCompletionRecord>;
  exerciseAttempts: ExerciseAttemptRecord[];
  activity?: RecentActivityMeta;
};

export type ProgressStorageNotice = {
  kind: "info" | "warning";
  message: string;
};

export type ProgressLoadResult = {
  state: LearnerProgressState;
  storageAvailable: boolean;
  notice?: ProgressStorageNotice;
};

export type ProgressSaveResult = {
  saved: boolean;
  storageAvailable: boolean;
  errorMessage?: string;
};

export type RecordExerciseAttemptInput = {
  exerciseId: string;
  lessonId?: string;
  startedAt?: string;
  submittedAt?: string;
  earnedPoints: number;
  totalPoints: number;
  percentage: number;
  correctCount: number;
  totalQuestions: number;
};

export type ScopeProgressSummary = {
  completedLessons: number;
  totalPublishedLessons: number;
  percentage: number;
};

export type ContinueLearningTarget = {
  lessonSlug: string;
  lessonTitle: string;
  courseTitle: string;
  levelName: string;
  reason: "resume-incomplete" | "next-after-completed" | "first-published";
};

