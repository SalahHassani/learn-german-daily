import {
  PROGRESS_STORAGE_KEY,
  type LearnerProgressState,
  type ProgressLoadResult,
  type ProgressSaveResult,
} from "@/types/progress";
import type { ProgressProvider } from "./progressProvider";
import {
  createEmptyProgressState,
  migrateOrNormalizeProgress,
} from "./progressMigrations";

function resolveLocalStorage(): Storage | null {
  if (typeof globalThis === "undefined") {
    return null;
  }
  const maybeWindow = (globalThis as { window?: { localStorage?: Storage } }).window;
  const candidate =
    maybeWindow && "localStorage" in maybeWindow
      ? maybeWindow.localStorage
      : (globalThis as { localStorage?: Storage }).localStorage;

  if (!candidate) {
    return null;
  }

  try {
    const probeKey = `${PROGRESS_STORAGE_KEY}:__probe__`;
    candidate.setItem(probeKey, "1");
    candidate.removeItem(probeKey);
    return candidate;
  } catch {
    return null;
  }
}

export class LocalStorageProgressProvider implements ProgressProvider {
  private readonly storageKey: string;

  constructor(storageKey: string = PROGRESS_STORAGE_KEY) {
    this.storageKey = storageKey;
  }

  public loadProgress(): ProgressLoadResult {
    const storage = resolveLocalStorage();
    if (!storage) {
      return {
        state: createEmptyProgressState(),
        storageAvailable: false,
        notice: {
          kind: "warning",
          message:
            "Browser storage is unavailable. You can still study lessons and try exercises, but progress will not be saved.",
        },
      };
    }

    try {
      const rawText = storage.getItem(this.storageKey);
      if (rawText === null || rawText.trim().length === 0) {
        return {
          state: createEmptyProgressState(),
          storageAvailable: true,
        };
      }

      const parsed: unknown = JSON.parse(rawText);
      const normalized = migrateOrNormalizeProgress(parsed);
      return {
        state: normalized.state,
        storageAvailable: true,
        ...(normalized.recoveredFromIssue && normalized.warningMessage
          ? {
              notice: {
                kind: "warning",
                message: normalized.warningMessage,
              },
            }
          : {}),
      };
    } catch {
      return {
        state: createEmptyProgressState(),
        storageAvailable: true,
        notice: {
          kind: "warning",
          message:
            "Saved progress could not be read due to corrupted browser data. A fresh local progress state is active.",
        },
      };
    }
  }

  public saveProgress(state: LearnerProgressState): ProgressSaveResult {
    const storage = resolveLocalStorage();
    if (!storage) {
      return {
        saved: false,
        storageAvailable: false,
        errorMessage:
          "Browser storage is unavailable, so progress changes could not be saved.",
      };
    }

    try {
      storage.setItem(this.storageKey, JSON.stringify(state));
      return {
        saved: true,
        storageAvailable: true,
      };
    } catch {
      return {
        saved: false,
        storageAvailable: true,
        errorMessage:
          "Unable to save progress to browser storage (storage limit or restricted access).",
      };
    }
  }

  public clearProgress(): ProgressSaveResult {
    const storage = resolveLocalStorage();
    if (!storage) {
      return {
        saved: false,
        storageAvailable: false,
        errorMessage: "Browser storage is unavailable.",
      };
    }

    try {
      storage.removeItem(this.storageKey);
      return {
        saved: true,
        storageAvailable: true,
      };
    } catch {
      return {
        saved: false,
        storageAvailable: true,
        errorMessage: "Unable to clear progress from browser storage.",
      };
    }
  }
}

