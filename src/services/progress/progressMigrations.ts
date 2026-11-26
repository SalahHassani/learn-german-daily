import {
  PROGRESS_SCHEMA_VERSION,
  type ExerciseAttemptRecord,
  type LearnerProgressState,
  type LessonCompletionRecord,
  type RecentActivityMeta,
} from "@/types/progress";

export type NormalizedProgressPayload = {
  state: LearnerProgressState;
  recoveredFromIssue: boolean;
  warningMessage?: string;
};

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isFiniteNonNegativeNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

function sanitizeLessonRecord(
  lessonId: string,
  raw: unknown
): LessonCompletionRecord | null {
  if (!isNonEmptyString(lessonId) || !raw || typeof raw !== "object") {
    return null;
  }
  const obj = raw as Record<string, unknown>;
  if (typeof obj.completed !== "boolean") {
    return null;
  }
  const now = new Date().toISOString();
  const updatedAt = isNonEmptyString(obj.updatedAt) ? obj.updatedAt : now;
  const completedAt =
    obj.completed && isNonEmptyString(obj.completedAt)
      ? obj.completedAt
      : obj.completed
        ? updatedAt
        : undefined;

  return {
    lessonId,
    completed: obj.completed,
    ...(completedAt ? { completedAt } : {}),
    updatedAt,
  };
}

function sanitizeAttemptRecord(
  raw: unknown,
  fallbackIndex: number
): ExerciseAttemptRecord | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }
  const obj = raw as Record<string, unknown>;
  if (!isNonEmptyString(obj.exerciseId)) {
    return null;
  }
  if (
    !isFiniteNonNegativeNumber(obj.earnedPoints) ||
    !isFiniteNonNegativeNumber(obj.totalPoints) ||
    !isFiniteNonNegativeNumber(obj.percentage) ||
    !isFiniteNonNegativeNumber(obj.correctCount) ||
    !isFiniteNonNegativeNumber(obj.totalQuestions)
  ) {
    return null;
  }

  const now = new Date().toISOString();
  const attemptId = isNonEmptyString(obj.attemptId)
    ? obj.attemptId
    : `attempt_${fallbackIndex + 1}`;
  const attemptNumber =
    typeof obj.attemptNumber === "number" &&
    Number.isFinite(obj.attemptNumber) &&
    obj.attemptNumber >= 1
      ? Math.floor(obj.attemptNumber)
      : fallbackIndex + 1;

  const submittedAt = isNonEmptyString(obj.submittedAt) ? obj.submittedAt : now;
  const startedAt = isNonEmptyString(obj.startedAt) ? obj.startedAt : submittedAt;

  return {
    attemptId,
    exerciseId: obj.exerciseId,
    ...(isNonEmptyString(obj.lessonId) ? { lessonId: obj.lessonId } : {}),
    attemptNumber,
    startedAt,
    submittedAt,
    earnedPoints: obj.earnedPoints,
    totalPoints: obj.totalPoints,
    percentage: Math.min(100, Math.round(obj.percentage)),
    correctCount: Math.floor(obj.correctCount),
    totalQuestions: Math.floor(obj.totalQuestions),
  };
}

function sanitizeActivity(raw: unknown): RecentActivityMeta | undefined {
  if (!raw || typeof raw !== "object") {
    return undefined;
  }
  const obj = raw as Record<string, unknown>;
  if (!isNonEmptyString(obj.lastVisitedLessonId)) {
    return undefined;
  }
  return {
    lastVisitedLessonId: obj.lastVisitedLessonId,
    ...(isNonEmptyString(obj.lastVisitedAt) ? { lastVisitedAt: obj.lastVisitedAt } : {}),
  };
}

export function createEmptyProgressState(
  nowIso: string = "1970-01-01T00:00:00.000Z"
): LearnerProgressState {
  return {
    schemaVersion: PROGRESS_SCHEMA_VERSION,
    updatedAt: nowIso,
    lessonsById: {},
    exerciseAttempts: [],
  };
}

function extractValidRecords(recordObj: Record<string, unknown>): {
  lessonsById: Record<string, LessonCompletionRecord>;
  exerciseAttempts: ExerciseAttemptRecord[];
  activity?: RecentActivityMeta;
} {
  const lessonsById: Record<string, LessonCompletionRecord> = {};
  if (recordObj.lessonsById && typeof recordObj.lessonsById === "object") {
    for (const [lessonId, entry] of Object.entries(
      recordObj.lessonsById as Record<string, unknown>
    )) {
      const clean = sanitizeLessonRecord(lessonId, entry);
      if (clean) {
        lessonsById[lessonId] = clean;
      }
    }
  }

  const exerciseAttempts: ExerciseAttemptRecord[] = [];
  if (Array.isArray(recordObj.exerciseAttempts)) {
    recordObj.exerciseAttempts.forEach((rawAttempt, index) => {
      const clean = sanitizeAttemptRecord(rawAttempt, index);
      if (clean) {
        exerciseAttempts.push(clean);
      }
    });
  }

  const activity = sanitizeActivity(recordObj.activity);
  return { lessonsById, exerciseAttempts, activity };
}

export function migrateOrNormalizeProgress(
  rawInput: unknown,
  nowIso: string = new Date().toISOString()
): NormalizedProgressPayload {
  if (!rawInput || typeof rawInput !== "object") {
    return {
      state: createEmptyProgressState(nowIso),
      recoveredFromIssue: true,
      warningMessage:
        "Stored learning progress had an unexpected format and was reset to a clean state.",
    };
  }

  const obj = rawInput as Record<string, unknown>;
  const version = obj.schemaVersion;

  if (
    typeof version !== "number" ||
    !Number.isInteger(version) ||
    version < 1 ||
    version > PROGRESS_SCHEMA_VERSION
  ) {
    return {
      state: createEmptyProgressState(nowIso),
      recoveredFromIssue: true,
      warningMessage:
        "Stored learning progress uses an unsupported schema version; starting fresh locally.",
    };
  }

  // Version 1 is the current baseline schema; future versions (2, 3, ...) can step here.
  const { lessonsById, exerciseAttempts, activity } = extractValidRecords(obj);
  const updatedAt = isNonEmptyString(obj.updatedAt) ? obj.updatedAt : nowIso;

  return {
    state: {
      schemaVersion: PROGRESS_SCHEMA_VERSION,
      updatedAt,
      lessonsById,
      exerciseAttempts,
      ...(activity ? { activity } : {}),
    },
    recoveredFromIssue: false,
  };
}

