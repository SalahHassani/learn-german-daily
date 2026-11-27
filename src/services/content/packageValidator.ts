import type {
  CefrLevelCode,
  ContentBlockKind,
  ContentPackageV1,
  ContentPublishStatus,
  ExerciseQuestionKind,
  PackageValidationIssue,
  PackageValidationResult,
  VerbConjugationForm,
} from "../../types/contentPackage";

const SUPPORTED_VERSIONS = new Set(["1.0.0"]);
const VALID_LEVELS = new Set<CefrLevelCode>(["A1", "A2", "B1", "B2", "C1", "C2"]);
const VALID_STATUSES = new Set<ContentPublishStatus>([
  "draft",
  "coming_soon",
  "published",
]);
const VALID_BLOCK_KINDS = new Set<ContentBlockKind>([
  "text",
  "vocabulary",
  "verb",
  "grammar",
  "reading",
  "exercise",
]);
const VALID_QUESTION_KINDS = new Set<ExerciseQuestionKind>([
  "single_choice",
  "multiple_choice",
  "fill_in_blank",
  "matching",
  "sentence_ordering",
  "sentence_construction",
  "homework",
  "assessment",
]);

type UnknownRecord = Record<string, unknown>;

function isPlainObject(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isValidIdentifier(value: unknown): value is string {
  return typeof value === "string" && /^[a-zA-Z0-9._:-]{2,120}$/.test(value);
}

function isCefrLevelCode(value: unknown): value is CefrLevelCode {
  return typeof value === "string" && VALID_LEVELS.has(value as CefrLevelCode);
}

function isPublishStatus(value: unknown): value is ContentPublishStatus {
  return (
    typeof value === "string" && VALID_STATUSES.has(value as ContentPublishStatus)
  );
}

function isBlockKind(value: unknown): value is ContentBlockKind {
  return typeof value === "string" && VALID_BLOCK_KINDS.has(value as ContentBlockKind);
}

function isQuestionKind(value: unknown): value is ExerciseQuestionKind {
  return (
    typeof value === "string" &&
    VALID_QUESTION_KINDS.has(value as ExerciseQuestionKind)
  );
}

function canChildBePublished(
  parentStatus: ContentPublishStatus,
  childStatus: ContentPublishStatus
): boolean {
  if (childStatus !== "published") {
    return true;
  }
  return parentStatus === "published";
}

export function validateContentPackage(input: unknown): PackageValidationResult {
  const errors: PackageValidationIssue[] = [];
  const warnings: PackageValidationIssue[] = [];

  const addError = (
    stage: PackageValidationIssue["stage"],
    path: string,
    code: string,
    message: string
  ) => {
    errors.push({ stage, path, code, message });
  };

  const addWarning = (
    stage: PackageValidationIssue["stage"],
    path: string,
    code: string,
    message: string
  ) => {
    warnings.push({ stage, path, code, message });
  };

  if (!isPlainObject(input)) {
    addError(
      "structural",
      "$",
      "INVALID_PACKAGE_ROOT",
      "Content package must be a non-null JSON object."
    );
    return { valid: false, errors, warnings };
  }

  // 1. Structural validation
  const formatVersion = input.formatVersion;
  if (typeof formatVersion !== "string" || !SUPPORTED_VERSIONS.has(formatVersion)) {
    addError(
      "structural",
      "$.formatVersion",
      "UNSUPPORTED_PACKAGE_VERSION",
      `Unsupported formatVersion '${String(formatVersion)}'. Expected one of: ${Array.from(SUPPORTED_VERSIONS).join(", ")}.`
    );
  }

  if (!isValidIdentifier(input.packageId)) {
    addError(
      "structural",
      "$.packageId",
      "INVALID_PACKAGE_ID",
      "packageId is required and must be a valid identifier (2-120 chars: letters, numbers, ., _, :, -)."
    );
  }

  if (!isPlainObject(input.metadata) || !isNonEmptyString(input.metadata.title)) {
    addError(
      "structural",
      "$.metadata.title",
      "MISSING_METADATA_TITLE",
      "metadata.title is required and must be a non-empty string."
    );
  }

  let publishingMode: string | undefined;
  if (input.publishing !== undefined) {
    if (!isPlainObject(input.publishing)) {
      addError(
        "structural",
        "$.publishing",
        "INVALID_PUBLISHING_DIRECTIVE",
        "publishing must be an object when provided."
      );
    } else {
      publishingMode =
        typeof input.publishing.mode === "string" ? input.publishing.mode : undefined;
      if (publishingMode !== "import_only" && publishingMode !== "publish_explicit") {
        addError(
          "structural",
          "$.publishing.mode",
          "INVALID_PUBLISHING_MODE",
          "publishing.mode must be 'import_only' or 'publish_explicit'."
        );
      }
    }
  }

  const rawLevels: unknown[] = Array.isArray(input.levels) ? input.levels : [];
  if (!Array.isArray(input.levels)) {
    addError(
      "structural",
      "$.levels",
      "MISSING_LEVELS_ARRAY",
      "levels is required and must be an array."
    );
  }

  const rawCourses: unknown[] = Array.isArray(input.courses) ? input.courses : [];
  if (!Array.isArray(input.courses)) {
    addError(
      "structural",
      "$.courses",
      "MISSING_COURSES_ARRAY",
      "courses is required and must be an array."
    );
  }

  if (!Array.isArray(input.levels) || !Array.isArray(input.courses)) {
    return { valid: false, errors, warnings };
  }

  // Track seen IDs for duplicate detection
  const seenIds = new Map<string, string>();
  const registerId = (kind: string, id: unknown, path: string): boolean => {
    if (!isValidIdentifier(id)) {
      addError(
        "structural",
        `${path}.id`,
        "INVALID_IDENTIFIER",
        `${kind} id '${String(id)}' is missing or invalid.`
      );
      return false;
    }
    const key = `${kind}:${id}`;
    const existingPath = seenIds.get(key);
    if (existingPath) {
      addError(
        "curriculum",
        `${path}.id`,
        "DUPLICATE_IDENTIFIER",
        `Duplicate ${kind} id '${id}' already declared at ${existingPath}.`
      );
      return false;
    }
    seenIds.set(key, `${path}.id`);
    return true;
  };

  // 2. CEFR Levels validation
  const levelMap = new Map<CefrLevelCode, { status: ContentPublishStatus; path: string }>();

  rawLevels.forEach((level: unknown, lIdx: number) => {
    const lPath = `$.levels[${lIdx}]`;
    if (!isPlainObject(level)) {
      addError("structural", lPath, "INVALID_LEVEL_ITEM", "Level entry must be an object.");
      return;
    }
    if (!isCefrLevelCode(level.code)) {
      addError(
        "curriculum",
        `${lPath}.code`,
        "INVALID_CEFR_LEVEL",
        `Invalid CEFR level code '${String(level.code)}'. Expected A1..C2.`
      );
      return;
    }
    const code: CefrLevelCode = level.code;
    if (levelMap.has(code)) {
      addError(
        "curriculum",
        `${lPath}.code`,
        "DUPLICATE_CEFR_LEVEL",
        `Duplicate CEFR level '${code}' in package.`
      );
      return;
    }
    if (!isNonEmptyString(level.title)) {
      addError("structural", `${lPath}.title`, "MISSING_LEVEL_TITLE", "Level title is required.");
    }
    if (typeof level.order !== "number" || Number.isNaN(level.order)) {
      addError("structural", `${lPath}.order`, "INVALID_ORDER", "Level order must be a number.");
    }
    if (!isPublishStatus(level.status)) {
      addError(
        "publishing",
        `${lPath}.status`,
        "INVALID_STATUS",
        `Invalid status '${String(level.status)}'.`
      );
      return;
    }
    levelMap.set(code, { status: level.status, path: lPath });
  });

  // 3. Educational entities validation & indexing
  const vocabIds = new Set<string>();
  const verbIds = new Set<string>();
  const grammarIds = new Set<string>();
  const readingIds = new Set<string>();
  const exerciseIds = new Set<string>();

  const entities = input.entities;
  if (entities !== undefined && !isPlainObject(entities)) {
    addError(
      "structural",
      "$.entities",
      "INVALID_ENTITIES_OBJECT",
      "entities must be an object when provided."
    );
  } else if (isPlainObject(entities)) {
    const vocabList: unknown[] = Array.isArray(entities.vocabulary)
      ? entities.vocabulary
      : [];
    vocabList.forEach((item: unknown, idx: number) => {
      const p = `$.entities.vocabulary[${idx}]`;
      if (!isPlainObject(item)) {
        addError("educational", p, "INVALID_VOCAB_ITEM", "Vocabulary entry must be an object.");
        return;
      }
      if (registerId("vocabulary", item.id, p) && typeof item.id === "string") {
        vocabIds.add(item.id);
      }
      if (!isNonEmptyString(item.slug)) {
        addError("educational", `${p}.slug`, "MISSING_SLUG", "Vocabulary slug is required.");
      }
      if (!isNonEmptyString(item.language)) {
        addError(
          "educational",
          `${p}.language`,
          "MISSING_LANGUAGE",
          "Vocabulary language metadata is required."
        );
      }
      if (!isNonEmptyString(item.term) || !isNonEmptyString(item.translation)) {
        addError(
          "educational",
          p,
          "MISSING_VOCAB_FIELDS",
          "Vocabulary entry requires non-empty term and translation."
        );
      }
      if (!isPublishStatus(item.status)) {
        addError("publishing", `${p}.status`, "INVALID_STATUS", "Invalid vocabulary status.");
      }
    });

    const verbList: unknown[] = Array.isArray(entities.verbs) ? entities.verbs : [];
    verbList.forEach((verb: unknown, idx: number) => {
      const p = `$.entities.verbs[${idx}]`;
      if (!isPlainObject(verb)) {
        addError("educational", p, "INVALID_VERB_ITEM", "Verb entry must be an object.");
        return;
      }
      if (registerId("verb", verb.id, p) && typeof verb.id === "string") {
        verbIds.add(verb.id);
      }
      if (!isNonEmptyString(verb.slug)) {
        addError("educational", `${p}.slug`, "MISSING_SLUG", "Verb slug is required.");
      }
      if (!isNonEmptyString(verb.language)) {
        addError("educational", `${p}.language`, "MISSING_LANGUAGE", "Verb language is required.");
      }
      if (!isNonEmptyString(verb.lemma) || !isNonEmptyString(verb.meaning)) {
        addError(
          "educational",
          p,
          "MISSING_VERB_FIELDS",
          "Verb requires lemma and meaning."
        );
      }
      if (!Array.isArray(verb.conjugations) || verb.conjugations.length === 0) {
        addError(
          "educational",
          `${p}.conjugations`,
          "MISSING_CONJUGATIONS",
          "Verb must include at least one conjugation entry."
        );
      } else {
        verb.conjugations.forEach((conj: unknown, cIdx: number) => {
          const cp = `${p}.conjugations[${cIdx}]`;
          if (!isPlainObject(conj)) {
            addError(
              "educational",
              cp,
              "INVALID_CONJUGATION",
              "Conjugation entry must be an object."
            );
            return;
          }
          const cTyped = conj as Partial<VerbConjugationForm>;
          if (
            !isNonEmptyString(cTyped.tense) ||
            !isNonEmptyString(cTyped.form) ||
            !isNonEmptyString(cTyped.person)
          ) {
            addError(
              "educational",
              cp,
              "INVALID_CONJUGATION",
              "Each conjugation requires person, tense, and form."
            );
          }
        });
      }
      if (!isPublishStatus(verb.status)) {
        addError("publishing", `${p}.status`, "INVALID_STATUS", "Invalid verb status.");
      }
    });

    const grammarList: unknown[] = Array.isArray(entities.grammar) ? entities.grammar : [];
    grammarList.forEach((item: unknown, idx: number) => {
      const p = `$.entities.grammar[${idx}]`;
      if (!isPlainObject(item)) {
        addError("educational", p, "INVALID_GRAMMAR_ITEM", "Grammar item must be an object.");
        return;
      }
      if (registerId("grammar", item.id, p) && typeof item.id === "string") {
        grammarIds.add(item.id);
      }
      if (!isNonEmptyString(item.slug)) {
        addError("educational", `${p}.slug`, "MISSING_SLUG", "Grammar slug is required.");
      }
      if (!isNonEmptyString(item.language)) {
        addError("educational", `${p}.language`, "MISSING_LANGUAGE", "Grammar language is required.");
      }
      if (!isNonEmptyString(item.title) || !isNonEmptyString(item.explanation)) {
        addError(
          "educational",
          p,
          "MISSING_GRAMMAR_FIELDS",
          "Grammar explanation requires title and explanation."
        );
      }
      if (!isPublishStatus(item.status)) {
        addError("publishing", `${p}.status`, "INVALID_STATUS", "Invalid grammar status.");
      }
    });

    const readingList: unknown[] = Array.isArray(entities.readings) ? entities.readings : [];
    readingList.forEach((item: unknown, idx: number) => {
      const p = `$.entities.readings[${idx}]`;
      if (!isPlainObject(item)) {
        addError("educational", p, "INVALID_READING_ITEM", "Reading passage must be an object.");
        return;
      }
      if (registerId("reading", item.id, p) && typeof item.id === "string") {
        readingIds.add(item.id);
      }
      if (!isNonEmptyString(item.slug)) {
        addError("educational", `${p}.slug`, "MISSING_SLUG", "Reading slug is required.");
      }
      if (!isNonEmptyString(item.language)) {
        addError("educational", `${p}.language`, "MISSING_LANGUAGE", "Reading language is required.");
      }
      if (!isNonEmptyString(item.title) || !isNonEmptyString(item.body)) {
        addError(
          "educational",
          p,
          "MISSING_READING_FIELDS",
          "Reading passage requires title and body."
        );
      }
      if (!isPublishStatus(item.status)) {
        addError("publishing", `${p}.status`, "INVALID_STATUS", "Invalid reading status.");
      }
    });

    const exerciseList: unknown[] = Array.isArray(entities.exercises)
      ? entities.exercises
      : [];
    exerciseList.forEach((ex: unknown, idx: number) => {
      const p = `$.entities.exercises[${idx}]`;
      if (!isPlainObject(ex)) {
        addError("educational", p, "INVALID_EXERCISE_ITEM", "Exercise must be an object.");
        return;
      }
      if (registerId("exercise", ex.id, p) && typeof ex.id === "string") {
        exerciseIds.add(ex.id);
      }
      if (!isNonEmptyString(ex.slug) || !isNonEmptyString(ex.title)) {
        addError("educational", p, "MISSING_EXERCISE_FIELDS", "Exercise requires slug and title.");
      }
      if (!Array.isArray(ex.questions) || ex.questions.length === 0) {
        addError(
          "educational",
          `${p}.questions`,
          "MISSING_QUESTIONS",
          "Exercise must contain at least one question."
        );
      } else {
        ex.questions.forEach((q: unknown, qIdx: number) => {
          const qp = `${p}.questions[${qIdx}]`;
          if (!isPlainObject(q)) {
            addError("educational", qp, "INVALID_QUESTION", "Question must be an object.");
            return;
          }
          if (!isValidIdentifier(q.id)) {
            addError("educational", `${qp}.id`, "INVALID_QUESTION_ID", "Question id is invalid.");
          }
          if (!isQuestionKind(q.questionType)) {
            addError(
              "educational",
              `${qp}.questionType`,
              "INVALID_QUESTION_TYPE",
              `Unsupported questionType '${String(q.questionType)}'.`
            );
          }
          if (!isNonEmptyString(q.prompt)) {
            addError("educational", `${qp}.prompt`, "MISSING_PROMPT", "Question prompt is required.");
          }
          const hasCorrectAnswer =
            q.correctAnswer !== undefined &&
            q.correctAnswer !== null &&
            !(typeof q.correctAnswer === "string" && q.correctAnswer.trim() === "") &&
            !(Array.isArray(q.correctAnswer) && q.correctAnswer.length === 0);
          if (!hasCorrectAnswer) {
            addError(
              "educational",
              `${qp}.correctAnswer`,
              "MISSING_CORRECT_ANSWER",
              "Question must specify a valid correctAnswer."
            );
          }
          if (q.acceptedAnswers !== undefined && !Array.isArray(q.acceptedAnswers)) {
            addError(
              "educational",
              `${qp}.acceptedAnswers`,
              "INVALID_ACCEPTED_ANSWERS",
              "acceptedAnswers must be an array when provided."
            );
          }
        });
      }
      if (!isPublishStatus(ex.status)) {
        addError("publishing", `${p}.status`, "INVALID_STATUS", "Invalid exercise status.");
      }
    });
  }

  // 4. Curriculum hierarchy & publishing validation
  rawCourses.forEach((course: unknown, cIdx: number) => {
    const cPath = `$.courses[${cIdx}]`;
    if (!isPlainObject(course)) {
      addError("structural", cPath, "INVALID_COURSE_ITEM", "Course must be an object.");
      return;
    }
    registerId("course", course.id, cPath);
    const courseIdStr = typeof course.id === "string" ? course.id : `<course:${cIdx}>`;
    if (!isNonEmptyString(course.slug) || !isNonEmptyString(course.title)) {
      addError("structural", cPath, "MISSING_COURSE_FIELDS", "Course requires slug and title.");
    }
    if (!isPublishStatus(course.status)) {
      addError("publishing", `${cPath}.status`, "INVALID_STATUS", "Invalid course status.");
      return;
    }
    const courseStatus: ContentPublishStatus = course.status;

    const levelCode = isCefrLevelCode(course.levelCode) ? course.levelCode : undefined;
    const levelInfo = levelCode ? levelMap.get(levelCode) : undefined;
    if (!levelInfo) {
      addError(
        "curriculum",
        `${cPath}.levelCode`,
        "UNKNOWN_LEVEL_REFERENCE",
        `Course references CEFR level '${String(course.levelCode)}' not present in package levels.`
      );
    } else if (!canChildBePublished(levelInfo.status, courseStatus)) {
      addError(
        "publishing",
        `${cPath}.status`,
        "PARENT_NOT_PUBLISHED",
        `Course '${courseIdStr}' cannot be 'published' while parent level '${levelCode}' is '${levelInfo.status}'.`
      );
    }

    if (!Array.isArray(course.weeks)) {
      addError("curriculum", `${cPath}.weeks`, "MISSING_WEEKS_ARRAY", "Course weeks must be an array.");
      return;
    }

    course.weeks.forEach((week: unknown, wIdx: number) => {
      const wPath = `${cPath}.weeks[${wIdx}]`;
      if (!isPlainObject(week)) {
        addError("structural", wPath, "INVALID_WEEK_ITEM", "Week must be an object.");
        return;
      }
      registerId("week", week.id, wPath);
      const weekIdStr = typeof week.id === "string" ? week.id : `<week:${wIdx}>`;
      if (!isNonEmptyString(week.slug) || !isNonEmptyString(week.title)) {
        addError("structural", wPath, "MISSING_WEEK_FIELDS", "Week requires slug and title.");
      }
      if (!isPublishStatus(week.status)) {
        addError("publishing", `${wPath}.status`, "INVALID_STATUS", "Invalid week status.");
        return;
      }
      const weekStatus: ContentPublishStatus = week.status;
      if (!canChildBePublished(courseStatus, weekStatus)) {
        addError(
          "publishing",
          `${wPath}.status`,
          "PARENT_NOT_PUBLISHED",
          `Week '${weekIdStr}' cannot be 'published' while parent course '${courseIdStr}' is '${courseStatus}'.`
        );
      }

      if (!Array.isArray(week.lessons)) {
        addError(
          "curriculum",
          `${wPath}.lessons`,
          "MISSING_LESSONS_ARRAY",
          "Week lessons must be an array."
        );
        return;
      }

      week.lessons.forEach((lesson: unknown, lesIdx: number) => {
        const lesPath = `${wPath}.lessons[${lesIdx}]`;
        if (!isPlainObject(lesson)) {
          addError("structural", lesPath, "INVALID_LESSON_ITEM", "Lesson must be an object.");
          return;
        }
        registerId("lesson", lesson.id, lesPath);
        const lessonIdStr = typeof lesson.id === "string" ? lesson.id : `<lesson:${lesIdx}>`;
        if (!isNonEmptyString(lesson.slug) || !isNonEmptyString(lesson.title)) {
          addError("structural", lesPath, "MISSING_LESSON_FIELDS", "Lesson requires slug and title.");
        }
        if (!isPublishStatus(lesson.status)) {
          addError("publishing", `${lesPath}.status`, "INVALID_STATUS", "Invalid lesson status.");
          return;
        }
        const lessonStatus: ContentPublishStatus = lesson.status;
        if (!canChildBePublished(weekStatus, lessonStatus)) {
          addError(
            "publishing",
            `${lesPath}.status`,
            "PARENT_NOT_PUBLISHED",
            `Lesson '${lessonIdStr}' cannot be 'published' while parent week '${weekIdStr}' is '${weekStatus}'.`
          );
        }

        if (!Array.isArray(lesson.sections)) {
          addError(
            "curriculum",
            `${lesPath}.sections`,
            "MISSING_SECTIONS_ARRAY",
            "Lesson sections must be an array."
          );
          return;
        }

        lesson.sections.forEach((section: unknown, sIdx: number) => {
          const sPath = `${lesPath}.sections[${sIdx}]`;
          if (!isPlainObject(section)) {
            addError("structural", sPath, "INVALID_SECTION_ITEM", "Section must be an object.");
            return;
          }
          registerId("section", section.id, sPath);
          const sectionIdStr = typeof section.id === "string" ? section.id : `<section:${sIdx}>`;
          if (!isNonEmptyString(section.slug) || !isNonEmptyString(section.title)) {
            addError(
              "structural",
              sPath,
              "MISSING_SECTION_FIELDS",
              "Section requires slug and title."
            );
          }
          if (!isPublishStatus(section.status)) {
            addError(
              "publishing",
              `${sPath}.status`,
              "INVALID_STATUS",
              "Invalid section status."
            );
            return;
          }
          const sectionStatus: ContentPublishStatus = section.status;
          if (!canChildBePublished(lessonStatus, sectionStatus)) {
            addError(
              "publishing",
              `${sPath}.status`,
              "PARENT_NOT_PUBLISHED",
              `Section '${sectionIdStr}' cannot be 'published' while parent lesson '${lessonIdStr}' is '${lessonStatus}'.`
            );
          }

          if (!Array.isArray(section.blocks)) {
            addError(
              "curriculum",
              `${sPath}.blocks`,
              "MISSING_BLOCKS_ARRAY",
              "Section blocks must be an array."
            );
            return;
          }

          section.blocks.forEach((block: unknown, bIdx: number) => {
            const bPath = `${sPath}.blocks[${bIdx}]`;
            if (!isPlainObject(block)) {
              addError("structural", bPath, "INVALID_BLOCK_ITEM", "Content block must be an object.");
              return;
            }
            registerId("block", block.id, bPath);
            const blockIdStr = typeof block.id === "string" ? block.id : `<block:${bIdx}>`;
            if (!isBlockKind(block.kind)) {
              addError(
                "structural",
                `${bPath}.kind`,
                "INVALID_BLOCK_KIND",
                `Unsupported content block kind '${String(block.kind)}'.`
              );
              return;
            }
            if (!isPublishStatus(block.status)) {
              addError("publishing", `${bPath}.status`, "INVALID_STATUS", "Invalid block status.");
              return;
            }
            if (!canChildBePublished(sectionStatus, block.status)) {
              addError(
                "publishing",
                `${bPath}.status`,
                "PARENT_NOT_PUBLISHED",
                `Block '${blockIdStr}' cannot be 'published' while parent section '${sectionIdStr}' is '${sectionStatus}'.`
              );
            }

            if (block.kind === "text" && !isNonEmptyString(block.body)) {
              addError(
                "educational",
                `${bPath}.body`,
                "MISSING_TEXT_BODY",
                "Text content block requires non-empty body."
              );
            }
            if (block.kind === "vocabulary") {
              const vocabId =
                typeof block.vocabularyId === "string" ? block.vocabularyId : undefined;
              if (!vocabId || !vocabIds.has(vocabId)) {
                addError(
                  "curriculum",
                  `${bPath}.vocabularyId`,
                  "BROKEN_VOCAB_REF",
                  `Vocabulary block references unknown vocabularyId '${String(block.vocabularyId)}'.`
                );
              }
            }
            if (block.kind === "verb") {
              const verbId = typeof block.verbId === "string" ? block.verbId : undefined;
              if (!verbId || !verbIds.has(verbId)) {
                addError(
                  "curriculum",
                  `${bPath}.verbId`,
                  "BROKEN_VERB_REF",
                  `Verb block references unknown verbId '${String(block.verbId)}'.`
                );
              }
            }
            if (block.kind === "grammar") {
              const grammarId =
                typeof block.grammarId === "string" ? block.grammarId : undefined;
              if (!grammarId || !grammarIds.has(grammarId)) {
                addError(
                  "curriculum",
                  `${bPath}.grammarId`,
                  "BROKEN_GRAMMAR_REF",
                  `Grammar block references unknown grammarId '${String(block.grammarId)}'.`
                );
              }
            }
            if (block.kind === "reading") {
              const readingId =
                typeof block.readingId === "string" ? block.readingId : undefined;
              if (!readingId || !readingIds.has(readingId)) {
                addError(
                  "curriculum",
                  `${bPath}.readingId`,
                  "BROKEN_READING_REF",
                  `Reading block references unknown readingId '${String(block.readingId)}'.`
                );
              }
            }
            if (block.kind === "exercise") {
              const exerciseId =
                typeof block.exerciseId === "string" ? block.exerciseId : undefined;
              if (!exerciseId || !exerciseIds.has(exerciseId)) {
                addError(
                  "curriculum",
                  `${bPath}.exerciseId`,
                  "BROKEN_EXERCISE_REF",
                  `Exercise block references unknown exerciseId '${String(block.exerciseId)}'.`
                );
              }
            }
          });
        });
      });
    });
  });

  if (publishingMode === "publish_explicit" && warnings.length === 0 && errors.length === 0) {
    addWarning(
      "publishing",
      "$.publishing",
      "EXPLICIT_PUBLISH_REQUESTED",
      "Package requested publish_explicit; ensure parent hierarchy and review checks pass."
    );
  }

  void (input as unknown as ContentPackageV1);

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

