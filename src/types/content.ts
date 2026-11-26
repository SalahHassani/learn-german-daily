import type {
  CEFRLevel,
  ContentStatus,
  Course,
  Lesson,
  LessonContent,
  LessonContentBlock,
  LessonSection,
  Week,
} from "./curriculum";

export type PublishingStatus = ContentStatus;

export type LessonSectionKey = LessonSection["key"];

export type GrammaticalArticle = "der" | "die" | "das";

export type VocabularyPartOfSpeech =
  | "noun"
  | "verb"
  | "adjective"
  | "adverb"
  | "phrase"
  | "other";

export interface AudioReference {
  readonly url?: string;
  readonly assetKey?: string;
  readonly durationSeconds?: number;
}

export type OptionalAudioReference = AudioReference | null | undefined;

export interface VocabularyEntry {
  id: string;
  germanWord: string;
  partOfSpeech: VocabularyPartOfSpeech;
  article?: GrammaticalArticle;
  plural?: string;
  englishMeaning: string;
  exampleSentence?: {
    german: string;
    english: string;
    audioReference?: OptionalAudioReference;
  };
  pronunciationReference?: string;
  audioReference?: OptionalAudioReference;
}

export interface VerbEntry {
  id: string;
  infinitive: string;
  englishMeaning: string;
  prateritum?: string;
  partizipII?: string;
  conjugation?: Record<string, string>;
  exampleSentence?: {
    german: string;
    english: string;
    audioReference?: OptionalAudioReference;
  };
  audioReference?: OptionalAudioReference;
}

export type TypedContentBlock =
  | {
      id: string;
      kind: "text";
      body: string;
    }
  | {
      id: string;
      kind: "heading";
      level: 2 | 3 | 4;
      text: string;
    }
  | {
      id: string;
      kind: "vocabulary-item";
      item: VocabularyEntry;
    }
  | {
      id: string;
      kind: "vocabulary-list";
      items: VocabularyEntry[];
    }
  | {
      id: string;
      kind: "verb-info";
      verb: VerbEntry;
    }
  | {
      id: string;
      kind: "verb-conjugation";
      infinitive: string;
      forms: Record<string, string>;
      notes?: string;
    }
  | {
      id: string;
      kind: "grammar-explanation";
      ruleTitle: string;
      explanation: string;
      examples?: string[];
    }
  | {
      id: string;
      kind: "example-sentence";
      german: string;
      english: string;
      audioReference?: OptionalAudioReference;
    }
  | {
      id: string;
      kind: "reading-passage";
      title: string;
      germanText: string;
      translationNote?: string;
      audioReference?: OptionalAudioReference;
    }
  | {
      id: string;
      kind: "sentence-construction";
      prompt: string;
      targetHint?: string;
    }
  | {
      id: string;
      kind: "exercise-reference";
      exerciseId: string;
      summary: string;
    };

export interface StructuredLessonSection {
  id: string;
  key: LessonSectionKey;
  title: string;
  order: number;
  blocks: TypedContentBlock[];
}

export interface StructuredLesson extends Lesson {
  estimatedDurationMinutes?: number;
  version?: string;
  sections: StructuredLessonSection[];
}

export type ContentDataset = {
  version: string;
  levels: readonly CEFRLevel[];
  courses: readonly Course[];
  weeks: readonly Week[];
  lessons: readonly StructuredLesson[];
  exercises?: readonly ExerciseDefinition[];
};

export interface ResolvedLevelView {
  level: CEFRLevel;
  courses: Course[];
}

export interface ResolvedCourseView {
  level: CEFRLevel;
  course: Course;
  weeks: Week[];
}

export interface ResolvedWeekView {
  level: CEFRLevel;
  course: Course;
  week: Week;
  lessons: StructuredLesson[];
}

export interface ResolvedLessonView {
  level: CEFRLevel;
  course: Course;
  week: Week;
  lesson: StructuredLesson;
  previousLessonSlug?: string;
  nextLessonSlug?: string;
}

export type {
  CEFRLevel,
  ContentStatus,
  Course,
  Lesson,
  LessonContent,
  LessonContentBlock,
  LessonSection,
  Week,
};


export type ExerciseQuestionType =
  | "single-choice"
  | "multiple-choice"
  | "true-false"
  | "fill-in-the-blank"
  | "sentence-ordering"
  | "matching-pairs";

export type ChoiceOption = {
  id: string;
  label: string;
};

export type SentenceToken = {
  id: string;
  text: string;
};

export type MatchingPairItem = {
  id: string;
  left: string;
  right: string;
};

export type BaseExerciseQuestion = {
  id: string;
  displayOrder: number;
  prompt: string;
  points: number;
  hint?: string;
  explanation?: string;
};

export type SingleChoiceQuestion = BaseExerciseQuestion & {
  questionType: "single-choice";
  options: readonly ChoiceOption[];
  correctOptionId: string;
};

export type MultipleChoiceQuestion = BaseExerciseQuestion & {
  questionType: "multiple-choice";
  options: readonly ChoiceOption[];
  correctOptionIds: readonly string[];
};

export type TrueFalseQuestion = BaseExerciseQuestion & {
  questionType: "true-false";
  trueLabel?: string;
  falseLabel?: string;
  correctValue: boolean;
};

export type FillInBlankQuestion = BaseExerciseQuestion & {
  questionType: "fill-in-the-blank";
  acceptedAnswers: readonly string[];
  caseSensitive?: boolean;
  trimWhitespace?: boolean;
  placeholder?: string;
};

export type SentenceOrderingQuestion = BaseExerciseQuestion & {
  questionType: "sentence-ordering";
  tokens: readonly SentenceToken[];
  correctOrderIds: readonly string[];
  expectedSentenceDisplay?: string;
};

export type MatchingPairsQuestion = BaseExerciseQuestion & {
  questionType: "matching-pairs";
  pairs: readonly MatchingPairItem[];
};

export type ExerciseQuestion =
  | SingleChoiceQuestion
  | MultipleChoiceQuestion
  | TrueFalseQuestion
  | FillInBlankQuestion
  | SentenceOrderingQuestion
  | MatchingPairsQuestion;

export type ExerciseDefinition = {
  id: string;
  slug?: string;
  title: string;
  instructions: string;
  order: number;
  status: ContentStatus;
  estimatedDurationMinutes?: number;
  explanation?: string;
  questions: readonly ExerciseQuestion[];
};