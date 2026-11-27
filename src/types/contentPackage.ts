export type CefrLevelCode = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export type ContentPublishStatus = "draft" | "coming_soon" | "published";

export type ContentBlockKind =
  | "text"
  | "vocabulary"
  | "verb"
  | "grammar"
  | "reading"
  | "exercise";

export type ExerciseQuestionKind =
  | "single_choice"
  | "multiple_choice"
  | "fill_in_blank"
  | "matching"
  | "sentence_ordering"
  | "sentence_construction"
  | "homework"
  | "assessment";

export interface PackageMetadata {
  title: string;
  description?: string;
  source?: string;
  createdAt?: string;
  tags?: string[];
}

export interface PublishingDirective {
  mode: "import_only" | "publish_explicit";
  allowPublishedUpdate?: boolean;
  reviewedBy?: string;
}

export interface VocabularyEntryPackage {
  id: string;
  slug: string;
  language: string;
  translationLanguage?: string;
  term: string;
  translation: string;
  partOfSpeech?: string;
  gender?: "masculine" | "feminine" | "neuter" | "none";
  pluralForm?: string;
  phonetic?: string;
  notes?: string;
  status: ContentPublishStatus;
}

export interface VerbConjugationForm {
  person: "1s" | "2s" | "3s" | "1p" | "2p" | "3p" | "formal";
  tense: string;
  form: string;
}

export interface VerbEntryPackage {
  id: string;
  slug: string;
  language: string;
  lemma: string;
  meaning: string;
  separable?: boolean;
  auxiliary?: "haben" | "sein" | "none";
  conjugations: VerbConjugationForm[];
  status: ContentPublishStatus;
}

export interface GrammarExplanationPackage {
  id: string;
  slug: string;
  language: string;
  title: string;
  summary: string;
  explanation: string;
  examples?: Array<{
    sourceText: string;
    targetText: string;
    note?: string;
  }>;
  status: ContentPublishStatus;
}

export interface ReadingPassagePackage {
  id: string;
  slug: string;
  language: string;
  title: string;
  body: string;
  wordCount?: number;
  comprehensionNotes?: string;
  status: ContentPublishStatus;
}

export interface ExerciseQuestionPackage {
  id: string;
  questionType: ExerciseQuestionKind;
  prompt: string;
  options?: string[];
  correctAnswer: string | string[] | Record<string, string>;
  acceptedAnswers?: string[];
  explanation?: string;
}

export interface ExercisePackage {
  id: string;
  slug: string;
  title: string;
  category: "practice" | "sentence_construction" | "homework" | "assessment";
  questions: ExerciseQuestionPackage[];
  status: ContentPublishStatus;
}

export interface ContentBlockPackage {
  id: string;
  order: number;
  kind: ContentBlockKind;
  status: ContentPublishStatus;
  body?: string;
  vocabularyId?: string;
  verbId?: string;
  grammarId?: string;
  readingId?: string;
  exerciseId?: string;
}

export interface LessonSectionPackage {
  id: string;
  slug: string;
  title: string;
  order: number;
  status: ContentPublishStatus;
  blocks: ContentBlockPackage[];
}

export interface LessonPackage {
  id: string;
  slug: string;
  title: string;
  order: number;
  status: ContentPublishStatus;
  sections: LessonSectionPackage[];
}

export interface WeekPackage {
  id: string;
  slug: string;
  title: string;
  order: number;
  status: ContentPublishStatus;
  lessons: LessonPackage[];
}

export interface CoursePackage {
  id: string;
  slug: string;
  title: string;
  levelCode: CefrLevelCode;
  order: number;
  status: ContentPublishStatus;
  weeks: WeekPackage[];
}

export interface CefrLevelPackage {
  code: CefrLevelCode;
  title: string;
  order: number;
  status: ContentPublishStatus;
}

export interface EducationalEntitiesCollection {
  vocabulary?: VocabularyEntryPackage[];
  verbs?: VerbEntryPackage[];
  grammar?: GrammarExplanationPackage[];
  readings?: ReadingPassagePackage[];
  exercises?: ExercisePackage[];
}

export interface ContentPackageV1 {
  formatVersion: "1.0.0";
  packageId: string;
  metadata: PackageMetadata;
  publishing?: PublishingDirective;
  levels: CefrLevelPackage[];
  courses: CoursePackage[];
  entities?: EducationalEntitiesCollection;
}

export type ValidationStage =
  | "structural"
  | "curriculum"
  | "educational"
  | "publishing";

export interface PackageValidationIssue {
  code: string;
  stage: ValidationStage;
  path: string;
  message: string;
}

export interface PackageValidationResult {
  valid: boolean;
  errors: PackageValidationIssue[];
  warnings: PackageValidationIssue[];
}

export type ImportOperationType = "create" | "update" | "unchanged" | "conflict";

export interface ImportChangeItem {
  entityType: string;
  id: string;
  slug?: string;
  path: string;
  operation: ImportOperationType;
  reason?: string;
}

export interface ImportPreviewReport {
  packageId: string;
  formatVersion: string;
  valid: boolean;
  canProceed: boolean;
  summary: {
    create: number;
    update: number;
    unchanged: number;
    conflict: number;
    errors: number;
    warnings: number;
  };
  changes: ImportChangeItem[];
  validation: PackageValidationResult;
}

export interface ContentImportResult {
  packageId: string;
  formatVersion: string;
  applied: boolean;
  rolledBack: boolean;
  preview: ImportPreviewReport;
  message: string;
}

