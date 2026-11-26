import {
  contentService,
  type ContentService,
} from "@/services/content/contentService";
import {
  PROGRESS_SCHEMA_VERSION,
  type ContinueLearningTarget,
  type ExerciseAttemptRecord,
  type LearnerProgressState,
  type LessonCompletionRecord,
  type ProgressLoadResult,
  type ProgressSaveResult,
  type RecordExerciseAttemptInput,
  type ScopeProgressSummary,
} from "@/types/progress";
import { LocalStorageProgressProvider } from "./localStorageProgressProvider";
import {
  getCourseProgress,
  getExerciseAttemptSummary,
  getLevelProgress,
  getOverallProgress,
  getWeekProgress,
  isLessonCompleted,
  resolveContinueLearningTarget,
} from "./progressCalculations";
import { createEmptyProgressState } from "./progressMigrations";
import type { ProgressProvider } from "./progressProvider";

export class ProgressService {
  private readonly provider: ProgressProvider;
  private readonly content: ContentService;
  private state: LearnerProgressState;
  private storageAvailable: boolean;
  private lastNoticeMessage?: string;
  private lastErrorMessage?: string;

  constructor(
    provider: ProgressProvider = new LocalStorageProgressProvider(),
    content: ContentService = contentService
  ) {
    this.provider = provider;
    this.content = content;
    this.state = createEmptyProgressState();
    this.storageAvailable = true;
  }

  public initialize(): ProgressLoadResult {
    const result = this.provider.loadProgress();
    this.state = result.state;
    this.storageAvailable = result.storageAvailable;
    this.lastNoticeMessage = result.notice?.message;
    this.lastErrorMessage = undefined;
    return result;
  }

  public getState(): LearnerProgressState {
    return this.state;
  }

  public isStorageAvailable(): boolean {
    return this.storageAvailable;
  }

  public getNoticeMessage(): string | undefined {
    return this.lastNoticeMessage;
  }

  public getLastErrorMessage(): string | undefined {
    return this.lastErrorMessage;
  }

  public isLessonCompleted(lessonId: string): boolean {
    return isLessonCompleted(this.state, lessonId);
  }

  public getLessonCompletionRecord(lessonId: string): LessonCompletionRecord | undefined {
    return this.state.lessonsById[lessonId];
  }

  public setLessonCompleted(
    lessonId: string,
    completed: boolean,
    nowIso: string = new Date().toISOString()
  ): { state: LearnerProgressState; saveResult: ProgressSaveResult } {
    if (!lessonId || lessonId.trim().length === 0) {
      return {
        state: this.state,
        saveResult: {
          saved: false,
          storageAvailable: this.storageAvailable,
          errorMessage: "Cannot update completion for an empty lesson identifier.",
        },
      };
    }

    const existing = this.state.lessonsById[lessonId];
    const nextRecord: LessonCompletionRecord = {
      lessonId,
      completed,
      updatedAt: nowIso,
      ...(completed
        ? { completedAt: existing?.completedAt ?? nowIso }
        : {}),
    };

    const nextState: LearnerProgressState = {
      schemaVersion: PROGRESS_SCHEMA_VERSION,
      updatedAt: nowIso,
      lessonsById: {
        ...this.state.lessonsById,
        [lessonId]: nextRecord,
      },
      exerciseAttempts: this.state.exerciseAttempts,
      ...(this.state.activity ? { activity: this.state.activity } : {}),
    };

    return this.commitState(nextState);
  }

  public recordLessonVisited(
    lessonId: string,
    nowIso: string = new Date().toISOString()
  ): { state: LearnerProgressState; saveResult: ProgressSaveResult } {
    if (!lessonId || lessonId.trim().length === 0) {
      return {
        state: this.state,
        saveResult: {
          saved: false,
          storageAvailable: this.storageAvailable,
        },
      };
    }

    const nextState: LearnerProgressState = {
      schemaVersion: PROGRESS_SCHEMA_VERSION,
      updatedAt: nowIso,
      lessonsById: this.state.lessonsById,
      exerciseAttempts: this.state.exerciseAttempts,
      activity: {
        lastVisitedLessonId: lessonId,
        lastVisitedAt: nowIso,
      },
    };

    return this.commitState(nextState);
  }

  public recordExerciseAttempt(
    input: RecordExerciseAttemptInput
  ): {
    attempt: ExerciseAttemptRecord;
    state: LearnerProgressState;
    saveResult: ProgressSaveResult;
  } {
    const submittedAt = input.submittedAt ?? new Date().toISOString();
    const startedAt = input.startedAt ?? submittedAt;
    const existingCount = this.state.exerciseAttempts.filter(
      (item) => item.exerciseId === input.exerciseId
    ).length;
    const attemptNumber = existingCount + 1;
    const safePercentage = Math.max(0, Math.min(100, Math.round(input.percentage)));

    const attempt: ExerciseAttemptRecord = {
      attemptId: `att_${input.exerciseId}_${attemptNumber}_${Date.parse(submittedAt) || Date.now()}`,
      exerciseId: input.exerciseId,
      ...(input.lessonId ? { lessonId: input.lessonId } : {}),
      attemptNumber,
      startedAt,
      submittedAt,
      earnedPoints: Math.max(0, input.earnedPoints),
      totalPoints: Math.max(0, input.totalPoints),
      percentage: safePercentage,
      correctCount: Math.max(0, Math.floor(input.correctCount)),
      totalQuestions: Math.max(0, Math.floor(input.totalQuestions)),
    };

    const nextState: LearnerProgressState = {
      schemaVersion: PROGRESS_SCHEMA_VERSION,
      updatedAt: submittedAt,
      lessonsById: this.state.lessonsById,
      exerciseAttempts: [...this.state.exerciseAttempts, attempt],
      ...(this.state.activity ? { activity: this.state.activity } : {}),
    };

    const committed = this.commitState(nextState);
    return {
      attempt,
      state: committed.state,
      saveResult: committed.saveResult,
    };
  }

  public getExerciseAttempts(exerciseId: string): ExerciseAttemptRecord[] {
    return this.state.exerciseAttempts.filter((item) => item.exerciseId === exerciseId);
  }

  public getExerciseSummary(exerciseId: string) {
    return getExerciseAttemptSummary(this.state, exerciseId);
  }

  public getWeekProgress(courseSlug: string, weekSlug: string): ScopeProgressSummary {
    return getWeekProgress(this.content, this.state, courseSlug, weekSlug);
  }

  public getCourseProgress(courseSlug: string): ScopeProgressSummary {
    return getCourseProgress(this.content, this.state, courseSlug);
  }

  public getLevelProgress(levelSlug: string): ScopeProgressSummary {
    return getLevelProgress(this.content, this.state, levelSlug);
  }

  public getOverallProgress(): ScopeProgressSummary {
    return getOverallProgress(this.content, this.state);
  }

  public getContinueLearningTarget(): ContinueLearningTarget | null {
    return resolveContinueLearningTarget(this.content, this.state);
  }

  public clearAllProgress(): { state: LearnerProgressState; saveResult: ProgressSaveResult } {
    const empty = createEmptyProgressState();
    const clearResult = this.provider.clearProgress();
    this.state = empty;
    this.storageAvailable = clearResult.storageAvailable;
    this.lastErrorMessage = clearResult.errorMessage;
    return { state: empty, saveResult: clearResult };
  }

  private commitState(nextState: LearnerProgressState): {
    state: LearnerProgressState;
    saveResult: ProgressSaveResult;
  } {
    this.state = nextState;
    const saveResult = this.provider.saveProgress(nextState);
    this.storageAvailable = saveResult.storageAvailable;
    this.lastErrorMessage = saveResult.errorMessage;
    return { state: this.state, saveResult };
  }
}

export const progressService = new ProgressService();

