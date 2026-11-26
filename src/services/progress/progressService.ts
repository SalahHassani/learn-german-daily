import type { ContentService } from "@/services/content/contentService";
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

function createEmptyScopeSummary(): ScopeProgressSummary {
  return {
    completedLessons: 0,
    totalPublishedLessons: 0,
    percentage: 0,
  };
}

export class ProgressService {
  private readonly provider: ProgressProvider;
  private readonly content?: ContentService;
  private state: LearnerProgressState;
  private storageAvailable: boolean;
  private lastNoticeMessage?: string;
  private lastErrorMessage?: string;

  constructor(
    provider: ProgressProvider = new LocalStorageProgressProvider(),
    content?: ContentService
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

  public async getWeekProgress(
    courseSlug: string,
    weekSlug: string
  ): Promise<ScopeProgressSummary> {
    if (!this.content) {
      return createEmptyScopeSummary();
    }
    return await getWeekProgress(this.content, this.state, courseSlug, weekSlug);
  }

  public async getCourseProgress(courseSlug: string): Promise<ScopeProgressSummary> {
    if (!this.content) {
      return createEmptyScopeSummary();
    }
    return await getCourseProgress(this.content, this.state, courseSlug);
  }

  public async getLevelProgress(levelSlug: string): Promise<ScopeProgressSummary> {
    if (!this.content) {
      return createEmptyScopeSummary();
    }
    return await getLevelProgress(this.content, this.state, levelSlug);
  }

  public async getOverallProgress(): Promise<ScopeProgressSummary> {
    if (!this.content) {
      return createEmptyScopeSummary();
    }
    return await getOverallProgress(this.content, this.state);
  }

  public async getContinueLearningTarget(): Promise<ContinueLearningTarget | null> {
    if (!this.content) {
      return null;
    }
    return await resolveContinueLearningTarget(this.content, this.state);
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

export function createProgressService(
  provider: ProgressProvider = new LocalStorageProgressProvider(),
  content?: ContentService
): ProgressService {
  return new ProgressService(provider, content);
}

export const progressService = createProgressService();

