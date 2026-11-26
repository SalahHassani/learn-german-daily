"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { createEmptyProgressState } from "@/services/progress/progressMigrations";
import { progressService } from "@/services/progress/progressService";
import type {
  ContinueLearningTarget,
  ExerciseAttemptRecord,
  LearnerProgressState,
  ProgressSaveResult,
  RecordExerciseAttemptInput,
  ScopeProgressSummary,
} from "@/types/progress";

type ProgressContextValue = {
  state: LearnerProgressState;
  hydrated: boolean;
  storageAvailable: boolean;
  noticeMessage?: string;
  errorMessage?: string;
  isLessonCompleted: (lessonId: string) => boolean;
  setLessonCompleted: (lessonId: string, completed: boolean) => ProgressSaveResult;
  recordLessonVisited: (lessonId: string) => ProgressSaveResult;
  recordExerciseAttempt: (input: RecordExerciseAttemptInput) => {
    attempt: ExerciseAttemptRecord;
    saveResult: ProgressSaveResult;
  };
  getExerciseSummary: (exerciseId: string) => ReturnType<typeof progressService.getExerciseSummary>;
  getWeekProgress: (courseSlug: string, weekSlug: string) => ScopeProgressSummary;
  getCourseProgress: (courseSlug: string) => ScopeProgressSummary;
  getLevelProgress: (levelSlug: string) => ScopeProgressSummary;
  getOverallProgress: () => ScopeProgressSummary;
  getContinueLearningTarget: () => ContinueLearningTarget | null;
};

const EMPTY_SCOPE_SUMMARY: ScopeProgressSummary = {
  completedLessons: 0,
  totalPublishedLessons: 0,
  percentage: 0,
};

const ProgressContext = createContext<ProgressContextValue | null>(null);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<LearnerProgressState>(() => createEmptyProgressState());
  const [hydrated, setHydrated] = useState(false);
  const [storageAvailable, setStorageAvailable] = useState(true);
  const [noticeMessage, setNoticeMessage] = useState<string | undefined>(undefined);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;

    queueMicrotask(() => {
      if (cancelled) {
        return;
      }
      const loadResult = progressService.initialize();
      setState(loadResult.state);
      setStorageAvailable(loadResult.storageAvailable);
      setNoticeMessage(loadResult.notice?.message);
      setErrorMessage(progressService.getLastErrorMessage());
      setHydrated(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const setLessonCompleted = useCallback(
    (lessonId: string, completed: boolean): ProgressSaveResult => {
      const result = progressService.setLessonCompleted(lessonId, completed);
      setState(result.state);
      setStorageAvailable(result.saveResult.storageAvailable);
      setErrorMessage(result.saveResult.errorMessage);
      return result.saveResult;
    },
    []
  );

  const recordLessonVisited = useCallback((lessonId: string): ProgressSaveResult => {
    const result = progressService.recordLessonVisited(lessonId);
    setState(result.state);
    setStorageAvailable(result.saveResult.storageAvailable);
    setErrorMessage(result.saveResult.errorMessage);
    return result.saveResult;
  }, []);

  const recordExerciseAttempt = useCallback((input: RecordExerciseAttemptInput) => {
    const result = progressService.recordExerciseAttempt(input);
    setState(result.state);
    setStorageAvailable(result.saveResult.storageAvailable);
    setErrorMessage(result.saveResult.errorMessage);
    return {
      attempt: result.attempt,
      saveResult: result.saveResult,
    };
  }, []);

  const value = useMemo<ProgressContextValue>(
    () => ({
      state,
      hydrated,
      storageAvailable,
      noticeMessage,
      errorMessage,
      isLessonCompleted: (lessonId: string) =>
        hydrated ? progressService.isLessonCompleted(lessonId) : false,
      setLessonCompleted,
      recordLessonVisited,
      recordExerciseAttempt,
      getExerciseSummary: (exerciseId: string) =>
        hydrated
          ? progressService.getExerciseSummary(exerciseId)
          : { attemptCount: 0, attempts: [] },
      getWeekProgress: () => EMPTY_SCOPE_SUMMARY,
      getCourseProgress: () => EMPTY_SCOPE_SUMMARY,
      getLevelProgress: () => EMPTY_SCOPE_SUMMARY,
      getOverallProgress: () => EMPTY_SCOPE_SUMMARY,
      getContinueLearningTarget: () => null,
    }),
    [
      state,
      hydrated,
      storageAvailable,
      noticeMessage,
      errorMessage,
      setLessonCompleted,
      recordLessonVisited,
      recordExerciseAttempt,
    ]
  );

  return (
    <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>
  );
}

export function useProgress(): ProgressContextValue {
  const ctx = useContext(ProgressContext);
  if (!ctx) {
    throw new Error("useProgress must be used within ProgressProvider.");
  }
  return ctx;
}

