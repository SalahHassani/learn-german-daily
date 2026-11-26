import type {
  ExerciseDefinition,
  ExerciseQuestion,
  FillInBlankQuestion,
  MatchingPairsQuestion,
  MultipleChoiceQuestion,
  SentenceOrderingQuestion,
  SingleChoiceQuestion,
  TrueFalseQuestion,
} from "@/types/content";

export type QuestionAnswerValue =
  | { kind: "single-choice"; selectedOptionId: string | null }
  | { kind: "multiple-choice"; selectedOptionIds: readonly string[] }
  | { kind: "true-false"; selectedValue: boolean | null }
  | { kind: "fill-in-the-blank"; value: string }
  | { kind: "sentence-ordering"; orderedTokenIds: readonly string[] }
  | { kind: "matching-pairs"; matches: Record<string, string> };

export type EvaluatedQuestionResult = {
  questionId: string;
  displayOrder: number;
  prompt: string;
  isCorrect: boolean;
  pointsEarned: number;
  pointsPossible: number;
  explanation?: string;
  expectedAnswerSummary: string;
  userAnswerSummary: string;
};

export type ExerciseEvaluationSummary = {
  exerciseId: string;
  exerciseTitle: string;
  totalQuestions: number;
  correctCount: number;
  earnedPoints: number;
  totalPoints: number;
  percentage: number;
  explanation?: string;
  questionResults: EvaluatedQuestionResult[];
};

export function createInitialAnswerMap(
  questions: readonly ExerciseQuestion[]
): Record<string, QuestionAnswerValue> {
  const ordered = [...questions].sort((a, b) => a.displayOrder - b.displayOrder);
  const initial: Record<string, QuestionAnswerValue> = {};

  for (const question of ordered) {
    switch (question.questionType) {
      case "single-choice":
        initial[question.id] = { kind: "single-choice", selectedOptionId: null };
        break;
      case "multiple-choice":
        initial[question.id] = { kind: "multiple-choice", selectedOptionIds: [] };
        break;
      case "true-false":
        initial[question.id] = { kind: "true-false", selectedValue: null };
        break;
      case "fill-in-the-blank":
        initial[question.id] = { kind: "fill-in-the-blank", value: "" };
        break;
      case "sentence-ordering":
        initial[question.id] = {
          kind: "sentence-ordering",
          orderedTokenIds: question.tokens.map((t) => t.id),
        };
        break;
      case "matching-pairs":
        initial[question.id] = { kind: "matching-pairs", matches: {} };
        break;
    }
  }

  return initial;
}

export function normalizeFillBlankText(
  input: string,
  options: { trimWhitespace?: boolean; caseSensitive?: boolean } = {}
): string {
  const shouldTrim = options.trimWhitespace !== false;
  const shouldCaseNormalize = options.caseSensitive !== true;

  let normalized = shouldTrim ? input.trim() : input;
  if (shouldCaseNormalize) {
    normalized = normalized.toLocaleLowerCase("de-DE");
  }
  return normalized;
}

export function validateQuestionAnswered(
  question: ExerciseQuestion,
  answer: QuestionAnswerValue | undefined
): string | null {
  if (!answer) {
    return "Please provide an answer before submitting.";
  }

  switch (question.questionType) {
    case "single-choice":
      return answer.kind === "single-choice" && Boolean(answer.selectedOptionId)
        ? null
        : "Select one answer option.";
    case "multiple-choice":
      return answer.kind === "multiple-choice" && answer.selectedOptionIds.length > 0
        ? null
        : "Select at least one option.";
    case "true-false":
      return answer.kind === "true-false" && typeof answer.selectedValue === "boolean"
        ? null
        : "Choose True or False.";
    case "fill-in-the-blank":
      return answer.kind === "fill-in-the-blank" && answer.value.trim().length > 0
        ? null
        : "Enter a response in the blank field.";
    case "sentence-ordering":
      return answer.kind === "sentence-ordering" &&
        answer.orderedTokenIds.length === question.tokens.length &&
        question.tokens.length > 0
        ? null
        : "Arrange all tokens in order.";
    case "matching-pairs": {
      if (answer.kind !== "matching-pairs") {
        return "Match each item before submitting.";
      }
      const matchedCount = Object.values(answer.matches).filter(
        (val) => typeof val === "string" && val.length > 0
      ).length;
      return matchedCount === question.pairs.length
        ? null
        : `Match all ${question.pairs.length} pairs before submitting.`;
    }
  }
}

function evaluateSingleChoice(
  question: SingleChoiceQuestion,
  answer: QuestionAnswerValue | undefined
): { isCorrect: boolean; expectedSummary: string; userSummary: string } {
  const expectedOption = question.options.find((opt) => opt.id === question.correctOptionId);
  const expectedSummary = expectedOption?.label ?? question.correctOptionId;

  if (!answer || answer.kind !== "single-choice" || !answer.selectedOptionId) {
    return { isCorrect: false, expectedSummary, userSummary: "No selection" };
  }

  const chosenOption = question.options.find((opt) => opt.id === answer.selectedOptionId);
  const userSummary = chosenOption?.label ?? answer.selectedOptionId;
  return {
    isCorrect: answer.selectedOptionId === question.correctOptionId,
    expectedSummary,
    userSummary,
  };
}

function evaluateMultipleChoice(
  question: MultipleChoiceQuestion,
  answer: QuestionAnswerValue | undefined
): { isCorrect: boolean; expectedSummary: string; userSummary: string } {
  const expectedSet = new Set(question.correctOptionIds);
  const expectedSummary = question.options
    .filter((opt) => expectedSet.has(opt.id))
    .map((opt) => opt.label)
    .join(", ");

  if (!answer || answer.kind !== "multiple-choice") {
    return { isCorrect: false, expectedSummary, userSummary: "No selection" };
  }

  const selectedSet = new Set(answer.selectedOptionIds);
  const userSummary =
    answer.selectedOptionIds.length > 0
      ? question.options
          .filter((opt) => selectedSet.has(opt.id))
          .map((opt) => opt.label)
          .join(", ")
      : "No selection";

  const isExactMatch =
    selectedSet.size === expectedSet.size &&
    Array.from(expectedSet).every((id) => selectedSet.has(id));

  return {
    isCorrect: isExactMatch,
    expectedSummary,
    userSummary,
  };
}

function evaluateTrueFalse(
  question: TrueFalseQuestion,
  answer: QuestionAnswerValue | undefined
): { isCorrect: boolean; expectedSummary: string; userSummary: string } {
  const trueLabel = question.trueLabel ?? "True";
  const falseLabel = question.falseLabel ?? "False";
  const expectedSummary = question.correctValue ? trueLabel : falseLabel;

  if (!answer || answer.kind !== "true-false" || typeof answer.selectedValue !== "boolean") {
    return { isCorrect: false, expectedSummary, userSummary: "No selection" };
  }

  return {
    isCorrect: answer.selectedValue === question.correctValue,
    expectedSummary,
    userSummary: answer.selectedValue ? trueLabel : falseLabel,
  };
}

function evaluateFillInTheBlank(
  question: FillInBlankQuestion,
  answer: QuestionAnswerValue | undefined
): { isCorrect: boolean; expectedSummary: string; userSummary: string } {
  const expectedSummary = question.acceptedAnswers.join(" / ");
  if (!answer || answer.kind !== "fill-in-the-blank") {
    return { isCorrect: false, expectedSummary, userSummary: "" };
  }

  const normalizedUser = normalizeFillBlankText(answer.value, {
    trimWhitespace: question.trimWhitespace,
    caseSensitive: question.caseSensitive,
  });

  const isCorrect = question.acceptedAnswers.some(
    (candidate) =>
      normalizeFillBlankText(candidate, {
        trimWhitespace: question.trimWhitespace,
        caseSensitive: question.caseSensitive,
      }) === normalizedUser
  );

  return {
    isCorrect,
    expectedSummary,
    userSummary: answer.value,
  };
}

function evaluateSentenceOrdering(
  question: SentenceOrderingQuestion,
  answer: QuestionAnswerValue | undefined
): { isCorrect: boolean; expectedSummary: string; userSummary: string } {
  const tokenMap = new Map(question.tokens.map((t) => [t.id, t.text]));
  const expectedSummary =
    question.expectedSentenceDisplay ??
    question.correctOrderIds.map((id) => tokenMap.get(id) ?? id).join(" ");

  if (!answer || answer.kind !== "sentence-ordering") {
    return { isCorrect: false, expectedSummary, userSummary: "" };
  }

  const userSummary = answer.orderedTokenIds.map((id) => tokenMap.get(id) ?? id).join(" ");
  const isCorrect =
    answer.orderedTokenIds.length === question.correctOrderIds.length &&
    question.correctOrderIds.every((id, index) => answer.orderedTokenIds[index] === id);

  return {
    isCorrect,
    expectedSummary,
    userSummary,
  };
}

function evaluateMatchingPairs(
  question: MatchingPairsQuestion,
  answer: QuestionAnswerValue | undefined
): { isCorrect: boolean; expectedSummary: string; userSummary: string } {
  const expectedSummary = question.pairs.map((p) => `${p.left} -> ${p.right}`).join("; ");

  if (!answer || answer.kind !== "matching-pairs") {
    return { isCorrect: false, expectedSummary, userSummary: "No matches recorded" };
  }

  const userSummary = question.pairs
    .map((p) => `${p.left} -> ${answer.matches[p.id] ?? "(unmatched)"}`)
    .join("; ");

  const isCorrect = question.pairs.every((pair) => answer.matches[pair.id] === pair.right);

  return {
    isCorrect,
    expectedSummary,
    userSummary,
  };
}

export function evaluateExercise(
  exercise: ExerciseDefinition,
  answersByQuestionId: Record<string, QuestionAnswerValue>
): ExerciseEvaluationSummary {
  const orderedQuestions = [...exercise.questions].sort(
    (a, b) => a.displayOrder - b.displayOrder
  );

  let totalPoints = 0;
  let earnedPoints = 0;
  let correctCount = 0;

  const questionResults: EvaluatedQuestionResult[] = orderedQuestions.map((question) => {
    const rawPoints = Number.isFinite(question.points) && question.points > 0 ? question.points : 0;
    totalPoints += rawPoints;

    const answer = answersByQuestionId[question.id];
    let evaluation: { isCorrect: boolean; expectedSummary: string; userSummary: string };

    switch (question.questionType) {
      case "single-choice":
        evaluation = evaluateSingleChoice(question, answer);
        break;
      case "multiple-choice":
        evaluation = evaluateMultipleChoice(question, answer);
        break;
      case "true-false":
        evaluation = evaluateTrueFalse(question, answer);
        break;
      case "fill-in-the-blank":
        evaluation = evaluateFillInTheBlank(question, answer);
        break;
      case "sentence-ordering":
        evaluation = evaluateSentenceOrdering(question, answer);
        break;
      case "matching-pairs":
        evaluation = evaluateMatchingPairs(question, answer);
        break;
    }

    const pointsEarned = evaluation.isCorrect ? rawPoints : 0;
    if (evaluation.isCorrect) {
      correctCount += 1;
      earnedPoints += pointsEarned;
    }

    return {
      questionId: question.id,
      displayOrder: question.displayOrder,
      prompt: question.prompt,
      isCorrect: evaluation.isCorrect,
      pointsEarned,
      pointsPossible: rawPoints,
      explanation: question.explanation,
      expectedAnswerSummary: evaluation.expectedSummary,
      userAnswerSummary: evaluation.userSummary,
    };
  });

  const totalQuestions = orderedQuestions.length;
  const percentage =
    totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;

  return {
    exerciseId: exercise.id,
    exerciseTitle: exercise.title,
    totalQuestions,
    correctCount,
    earnedPoints,
    totalPoints,
    percentage,
    explanation: exercise.explanation,
    questionResults,
  };
}

