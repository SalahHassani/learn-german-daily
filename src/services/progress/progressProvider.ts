import type {
  LearnerProgressState,
  ProgressLoadResult,
  ProgressSaveResult,
} from "@/types/progress";

export interface ProgressProvider {
  loadProgress(): ProgressLoadResult;
  saveProgress(state: LearnerProgressState): ProgressSaveResult;
  clearProgress(): ProgressSaveResult;
}

