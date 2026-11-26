import type { ContentDataset, ContentStatus, TypedContentBlock } from "@/types/content";

const VALID_STATUSES: ReadonlySet<ContentStatus> = new Set([
  "draft",
  "published",
  "coming_soon",
]);

function isValidStatus(status: unknown): status is ContentStatus {
  return typeof status === "string" && VALID_STATUSES.has(status as ContentStatus);
}

function validateBlock(block: TypedContentBlock, context: string): string[] {
  const errors: string[] = [];

  if (!block.id || block.id.trim().length === 0) {
    errors.push(`${context}: content block missing non-empty id.`);
  }

  switch (block.kind) {
    case "text":
      if (!block.body || block.body.trim().length === 0) {
        errors.push(`${context} (${block.id}): text block requires body.`);
      }
      break;
    case "heading":
      if (!block.text || block.text.trim().length === 0) {
        errors.push(`${context} (${block.id}): heading block requires text.`);
      }
      break;
    case "vocabulary-item":
      if (!block.item.id || !block.item.germanWord || !block.item.englishMeaning) {
        errors.push(`${context} (${block.id}): vocabulary-item requires id, germanWord, and englishMeaning.`);
      }
      break;
    case "vocabulary-list":
      if (!Array.isArray(block.items) || block.items.length === 0) {
        errors.push(`${context} (${block.id}): vocabulary-list requires non-empty items.`);
      }
      break;
    case "verb-info":
      if (!block.verb.id || !block.verb.infinitive || !block.verb.englishMeaning) {
        errors.push(`${context} (${block.id}): verb-info requires id, infinitive, and englishMeaning.`);
      }
      break;
    case "verb-conjugation":
      if (!block.infinitive || Object.keys(block.forms ?? {}).length === 0) {
        errors.push(`${context} (${block.id}): verb-conjugation requires infinitive and forms.`);
      }
      break;
    case "grammar-explanation":
      if (!block.ruleTitle || !block.explanation) {
        errors.push(`${context} (${block.id}): grammar-explanation requires ruleTitle and explanation.`);
      }
      break;
    case "example-sentence":
      if (!block.german || !block.english) {
        errors.push(`${context} (${block.id}): example-sentence requires german and english.`);
      }
      break;
    case "reading-passage":
      if (!block.title || !block.germanText) {
        errors.push(`${context} (${block.id}): reading-passage requires title and germanText.`);
      }
      break;
    case "sentence-construction":
      if (!block.prompt) {
        errors.push(`${context} (${block.id}): sentence-construction requires prompt.`);
      }
      break;
    case "exercise-reference":
      if (!block.exerciseId || !block.summary) {
        errors.push(`${context} (${block.id}): exercise-reference requires exerciseId and summary.`);
      }
      break;
  }

  return errors;
}

export function collectContentValidationErrors(dataset: ContentDataset): string[] {
  const errors: string[] = [];
  const seenIds = new Set<string>();

  const trackUniqueId = (id: string, entityType: string) => {
    if (!id || id.trim().length === 0) {
      errors.push(`${entityType} is missing a non-empty id.`);
      return;
    }
    if (seenIds.has(id)) {
      errors.push(`Duplicate id "${id}" encountered on ${entityType}.`);
    }
    seenIds.add(id);
  };

  const levelSlugs = new Set<string>();
  const levelById = new Map<string, ContentDataset["levels"][number]>();

  for (const level of dataset.levels) {
    trackUniqueId(level.id, "CEFRLevel");
    if (!level.slug || level.slug.trim().length === 0) {
      errors.push(`CEFRLevel "${level.id}" is missing slug.`);
    } else if (levelSlugs.has(level.slug)) {
      errors.push(`Duplicate CEFRLevel slug "${level.slug}".`);
    } else {
      levelSlugs.add(level.slug);
    }

    if (!level.name || level.name.trim().length === 0) {
      errors.push(`CEFRLevel "${level.id}" is missing name.`);
    }
    if (!isValidStatus(level.status)) {
      errors.push(`CEFRLevel "${level.id}" has invalid status "${String(level.status)}".`);
    }
    if (!Number.isFinite(level.displayOrder) || level.displayOrder <= 0) {
      errors.push(`CEFRLevel "${level.id}" has invalid displayOrder "${level.displayOrder}".`);
    }
    levelById.set(level.id, level);
  }

  const courseSlugs = new Set<string>();
  const courseById = new Map<string, ContentDataset["courses"][number]>();

  for (const course of dataset.courses) {
    trackUniqueId(course.id, "Course");
    if (!course.slug || course.slug.trim().length === 0) {
      errors.push(`Course "${course.id}" is missing slug.`);
    } else if (courseSlugs.has(course.slug)) {
      errors.push(`Duplicate Course slug "${course.slug}".`);
    } else {
      courseSlugs.add(course.slug);
    }

    if (!course.title || course.title.trim().length === 0) {
      errors.push(`Course "${course.id}" is missing title.`);
    }
    if (!isValidStatus(course.status)) {
      errors.push(`Course "${course.id}" has invalid status "${String(course.status)}".`);
    }
    if (!Number.isFinite(course.displayOrder) || course.displayOrder <= 0) {
      errors.push(`Course "${course.id}" has invalid displayOrder "${course.displayOrder}".`);
    }

    const parentLevel = levelById.get(course.levelId);
    if (!parentLevel) {
      errors.push(`Course "${course.id}" references missing levelId "${course.levelId}".`);
    } else if (parentLevel.status === "draft" && course.status === "published") {
      errors.push(`Published Course "${course.id}" cannot have draft parent level "${parentLevel.id}".`);
    }

    courseById.set(course.id, course);
  }

  const weekSlugsByCourse = new Map<string, Set<string>>();
  const weekById = new Map<string, ContentDataset["weeks"][number]>();

  for (const week of dataset.weeks) {
    trackUniqueId(week.id, "Week");
    if (!week.slug || week.slug.trim().length === 0) {
      errors.push(`Week "${week.id}" is missing slug.`);
    } else {
      const courseSlugs = weekSlugsByCourse.get(week.courseId) ?? new Set<string>();
      if (courseSlugs.has(week.slug)) {
        errors.push(`Duplicate Week slug "${week.slug}" within course "${week.courseId}".`);
      }
      courseSlugs.add(week.slug);
      weekSlugsByCourse.set(week.courseId, courseSlugs);
    }

    if (!week.title || week.title.trim().length === 0) {
      errors.push(`Week "${week.id}" is missing title.`);
    }
    if (!isValidStatus(week.status)) {
      errors.push(`Week "${week.id}" has invalid status "${String(week.status)}".`);
    }
    if (!Number.isFinite(week.displayOrder) || week.displayOrder <= 0) {
      errors.push(`Week "${week.id}" has invalid displayOrder "${week.displayOrder}".`);
    }

    const parentCourse = courseById.get(week.courseId);
    if (!parentCourse) {
      errors.push(`Week "${week.id}" references missing courseId "${week.courseId}".`);
    } else {
      const parentLevel = levelById.get(parentCourse.levelId);
      if (
        week.status === "published" &&
        (parentCourse.status === "draft" || parentLevel?.status === "draft")
      ) {
        errors.push(`Published Week "${week.id}" cannot have a draft ancestor.`);
      }
    }

    weekById.set(week.id, week);
  }

  const lessonSlugsByWeek = new Map<string, Set<string>>();

  for (const lesson of dataset.lessons) {
    trackUniqueId(lesson.id, "Lesson");
    if (!lesson.slug || lesson.slug.trim().length === 0) {
      errors.push(`Lesson "${lesson.id}" is missing slug.`);
    } else {
      const weekSlugs = lessonSlugsByWeek.get(lesson.weekId) ?? new Set<string>();
      if (weekSlugs.has(lesson.slug)) {
        errors.push(`Duplicate Lesson slug "${lesson.slug}" within week "${lesson.weekId}".`);
      }
      weekSlugs.add(lesson.slug);
      lessonSlugsByWeek.set(lesson.weekId, weekSlugs);
    }

    if (!lesson.title || lesson.title.trim().length === 0) {
      errors.push(`Lesson "${lesson.id}" is missing title.`);
    }
    if (!isValidStatus(lesson.status)) {
      errors.push(`Lesson "${lesson.id}" has invalid status "${String(lesson.status)}".`);
    }
    if (!Number.isFinite(lesson.displayOrder) || lesson.displayOrder <= 0) {
      errors.push(`Lesson "${lesson.id}" has invalid displayOrder "${lesson.displayOrder}".`);
    }

    const parentWeek = weekById.get(lesson.weekId);
    if (!parentWeek) {
      errors.push(`Lesson "${lesson.id}" references missing weekId "${lesson.weekId}".`);
    } else {
      const parentCourse = courseById.get(parentWeek.courseId);
      const parentLevel = parentCourse ? levelById.get(parentCourse.levelId) : undefined;
      if (
        lesson.status === "published" &&
        (parentWeek.status === "draft" ||
          parentCourse?.status === "draft" ||
          parentLevel?.status === "draft")
      ) {
        errors.push(`Published Lesson "${lesson.id}" cannot have a draft ancestor.`);
      }
    }

    for (const section of lesson.sections) {
      trackUniqueId(section.id, "LessonSection");
      for (const block of section.blocks) {
        errors.push(...validateBlock(block, `Lesson "${lesson.id}" / Section "${section.id}"`));
      }
    }
  }

  const exercises = dataset.exercises ?? [];
  const seenExerciseIds = new Set<string>();
  const validExerciseIds = new Set<string>();

  for (const ex of exercises) {
    if (!ex.id || seenExerciseIds.has(ex.id)) {
      errors.push(`Duplicate or missing exercise id: "${ex.id}".`);
    }
    seenExerciseIds.add(ex.id);
    if (ex.id) {
      validExerciseIds.add(ex.id);
    }
    if (!isValidStatus(ex.status)) {
      errors.push(`Invalid exercise status "${String(ex.status)}" on "${ex.id}".`);
    }
    if (!ex.title?.trim()) {
      errors.push(`Exercise "${ex.id}" is missing a title.`);
    }

    const seenQuestionIds = new Set<string>();
    for (const q of ex.questions) {
      if (!q.id || seenQuestionIds.has(q.id)) {
        errors.push(`Duplicate or missing question id "${q.id}" in exercise "${ex.id}".`);
      }
      seenQuestionIds.add(q.id);
      if (!q.prompt?.trim()) {
        errors.push(`Question "${q.id}" in exercise "${ex.id}" is missing a prompt.`);
      }
      if (!Number.isFinite(q.points) || q.points < 0) {
        errors.push(`Question "${q.id}" in exercise "${ex.id}" has invalid points.`);
      }
    }
  }

  if (exercises.length > 0) {
    for (const lesson of dataset.lessons) {
      for (const section of lesson.sections) {
        for (const block of section.blocks) {
          if (block.kind === "exercise-reference" && !validExerciseIds.has(block.exerciseId)) {
            errors.push(
              `Exercise reference "${block.exerciseId}" in lesson "${lesson.slug}" references a missing exercise.`
            );
          }
        }
      }
    }
  }

  return errors;
}

export function validateContentDataset(dataset: ContentDataset): void {
  const errors = collectContentValidationErrors(dataset);
  if (errors.length > 0) {
    throw new Error(`Invalid content dataset:\n- ${errors.join("\n- ")}`);
  }
}