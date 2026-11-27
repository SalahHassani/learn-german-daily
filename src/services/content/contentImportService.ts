import "server-only";

import { getDb, type AppDatabase } from "../../db/index";
import {
  cefrLevels,
  contentBlocks,
  courses,
  exerciseQuestions,
  exercises,
  lessons,
  lessonSections,
  verbItems,
  vocabularyItems,
  weeks,
} from "../../db/schema";
import type {
  ContentImportResult,
  ContentPackageV1,
  ImportChangeItem,
  ImportPreviewReport,
} from "../../types/contentPackage";
import { validateContentPackage } from "./packageValidator";


type DbTransaction = Parameters<Parameters<AppDatabase["transaction"]>[0]>[0];

export interface ExistingContentSnapshot {
  levelIds: Set<string>;
  publishedLevelIds: Set<string>;
  courseIds: Set<string>;
  publishedCourseIds: Set<string>;
  weekIds: Set<string>;
  publishedWeekIds: Set<string>;
  lessonIds: Set<string>;
  publishedLessonIds: Set<string>;
  sectionIds: Set<string>;
  publishedSectionIds: Set<string>;
  blockIds: Set<string>;
  publishedBlockIds: Set<string>;
  vocabIds: Set<string>;
  verbIds: Set<string>;
  exerciseIds: Set<string>;
  publishedExerciseIds: Set<string>;
  questionIds: Set<string>;
}

export interface ImportExecutionOptions {
  dryRun?: boolean;
  allowPublishedUpdate?: boolean;
  forceFailureBeforeCommit?: boolean;
  snapshotLoader?: () => Promise<ExistingContentSnapshot>;
}

function emptySnapshot(): ExistingContentSnapshot {
  return {
    levelIds: new Set(),
    publishedLevelIds: new Set(),
    courseIds: new Set(),
    publishedCourseIds: new Set(),
    weekIds: new Set(),
    publishedWeekIds: new Set(),
    lessonIds: new Set(),
    publishedLessonIds: new Set(),
    sectionIds: new Set(),
    publishedSectionIds: new Set(),
    blockIds: new Set(),
    publishedBlockIds: new Set(),
    vocabIds: new Set(),
    verbIds: new Set(),
    exerciseIds: new Set(),
    publishedExerciseIds: new Set(),
    questionIds: new Set(),
  };
}

export async function loadDatabaseSnapshot(): Promise<ExistingContentSnapshot> {
  const snap = emptySnapshot();
  const db = getDb();

  const [
    dbLevels,
    dbCourses,
    dbWeeks,
    dbLessons,
    dbSections,
    dbBlocks,
    dbVocab,
    dbVerbs,
    dbExercises,
    dbQuestions,
  ] = await Promise.all([
    db.select({ id: cefrLevels.id, status: cefrLevels.status }).from(cefrLevels),
    db.select({ id: courses.id, status: courses.status }).from(courses),
    db.select({ id: weeks.id, status: weeks.status }).from(weeks),
    db.select({ id: lessons.id, status: lessons.status }).from(lessons),
    db.select({ id: lessonSections.id, status: lessonSections.status }).from(lessonSections),
    db.select({ id: contentBlocks.id, sectionId: contentBlocks.sectionId }).from(contentBlocks),
    db.select({ id: vocabularyItems.id }).from(vocabularyItems),
    db.select({ id: verbItems.id }).from(verbItems),
    db.select({ id: exercises.id, status: exercises.status }).from(exercises),
    db.select({ id: exerciseQuestions.id }).from(exerciseQuestions),
  ]);

  for (const row of dbLevels) {
    snap.levelIds.add(row.id);
    if (row.status === "published") snap.publishedLevelIds.add(row.id);
  }
  for (const row of dbCourses) {
    snap.courseIds.add(row.id);
    if (row.status === "published") snap.publishedCourseIds.add(row.id);
  }
  for (const row of dbWeeks) {
    snap.weekIds.add(row.id);
    if (row.status === "published") snap.publishedWeekIds.add(row.id);
  }
  for (const row of dbLessons) {
    snap.lessonIds.add(row.id);
    if (row.status === "published") snap.publishedLessonIds.add(row.id);
  }
  for (const row of dbSections) {
    snap.sectionIds.add(row.id);
    if (row.status === "published") snap.publishedSectionIds.add(row.id);
  }
  for (const row of dbBlocks) {
    snap.blockIds.add(row.id);
    if (snap.publishedSectionIds.has(row.sectionId)) {
      snap.publishedBlockIds.add(row.id);
    }
  }
  for (const row of dbVocab) {
    snap.vocabIds.add(row.id);
  }
  for (const row of dbVerbs) {
    snap.verbIds.add(row.id);
  }
  for (const row of dbExercises) {
    snap.exerciseIds.add(row.id);
    if (row.status === "published") snap.publishedExerciseIds.add(row.id);
  }
  for (const row of dbQuestions) {
    snap.questionIds.add(row.id);
  }

  return snap;
}

export async function previewContentPackageImport(
  input: unknown,
  options: ImportExecutionOptions = {}
): Promise<ImportPreviewReport> {
  const validation = validateContentPackage(input);
  const pkg = (input && typeof input === "object" ? input : {}) as Partial<ContentPackageV1>;
  const packageId = typeof pkg.packageId === "string" ? pkg.packageId : "unknown";
  const formatVersion =
    typeof pkg.formatVersion === "string" ? pkg.formatVersion : "unknown";

  const changes: ImportChangeItem[] = [];
  const allowPublishedUpdate =
    options.allowPublishedUpdate ?? Boolean(pkg.publishing?.allowPublishedUpdate);

  const snapshot = validation.valid
    ? await (options.snapshotLoader ? options.snapshotLoader() : loadDatabaseSnapshot())
    : emptySnapshot();

  const classify = (
    entityType: string,
    id: string,
    path: string,
    exists: boolean,
    isPublished: boolean,
    slug?: string
  ) => {
    if (!exists) {
      changes.push({ entityType, id, slug, path, operation: "create" });
      return;
    }
    if (isPublished && !allowPublishedUpdate) {
      changes.push({
        entityType,
        id,
        slug,
        path,
        operation: "conflict",
        reason:
          "Record is already published; pass allowPublishedUpdate=true or --allow-published-update to update published content.",
      });
      return;
    }
    changes.push({ entityType, id, slug, path, operation: "update" });
  };

  if (validation.valid && Array.isArray(pkg.levels)) {
    pkg.levels.forEach((lvl, idx) => {
      const levelId = lvl.code.toLowerCase();
      classify(
        "level",
        levelId,
        `$.levels[${idx}]`,
        snapshot.levelIds.has(levelId),
        snapshot.publishedLevelIds.has(levelId),
        levelId
      );
    });
  }

  if (validation.valid && Array.isArray(pkg.courses)) {
    pkg.courses.forEach((course, cIdx) => {
      const cPath = `$.courses[${cIdx}]`;
      classify(
        "course",
        course.id,
        cPath,
        snapshot.courseIds.has(course.id),
        snapshot.publishedCourseIds.has(course.id),
        course.slug
      );

      (course.weeks ?? []).forEach((week, wIdx) => {
        const wPath = `${cPath}.weeks[${wIdx}]`;
        classify(
          "week",
          week.id,
          wPath,
          snapshot.weekIds.has(week.id),
          snapshot.publishedWeekIds.has(week.id),
          week.slug
        );

        (week.lessons ?? []).forEach((lesson, lIdx) => {
          const lPath = `${wPath}.lessons[${lIdx}]`;
          classify(
            "lesson",
            lesson.id,
            lPath,
            snapshot.lessonIds.has(lesson.id),
            snapshot.publishedLessonIds.has(lesson.id),
            lesson.slug
          );

          (lesson.sections ?? []).forEach((section, sIdx) => {
            const sPath = `${lPath}.sections[${sIdx}]`;
            classify(
              "section",
              section.id,
              sPath,
              snapshot.sectionIds.has(section.id),
              snapshot.publishedSectionIds.has(section.id),
              section.slug
            );

            (section.blocks ?? []).forEach((block, bIdx) => {
              const bPath = `${sPath}.blocks[${bIdx}]`;
              classify(
                "block",
                block.id,
                bPath,
                snapshot.blockIds.has(block.id),
                snapshot.publishedBlockIds.has(block.id)
              );
            });
          });
        });
      });
    });
  }

  if (validation.valid && pkg.entities) {
    (pkg.entities.vocabulary ?? []).forEach((item, idx) => {
      classify(
        "vocabulary",
        item.id,
        `$.entities.vocabulary[${idx}]`,
        snapshot.vocabIds.has(item.id),
        false,
        item.slug
      );
    });
    (pkg.entities.verbs ?? []).forEach((item, idx) => {
      classify(
        "verb",
        item.id,
        `$.entities.verbs[${idx}]`,
        snapshot.verbIds.has(item.id),
        false,
        item.slug
      );
    });
    (pkg.entities.exercises ?? []).forEach((item, idx) => {
      classify(
        "exercise",
        item.id,
        `$.entities.exercises[${idx}]`,
        snapshot.exerciseIds.has(item.id),
        snapshot.publishedExerciseIds.has(item.id),
        item.slug
      );

      (item.questions ?? []).forEach((q, qIdx) => {
        classify(
          "exercise_question",
          q.id,
          `$.entities.exercises[${idx}].questions[${qIdx}]`,
          snapshot.questionIds.has(q.id),
          snapshot.publishedExerciseIds.has(item.id)
        );
      });
    });
  }

  const summary = {
    create: changes.filter((c) => c.operation === "create").length,
    update: changes.filter((c) => c.operation === "update").length,
    unchanged: changes.filter((c) => c.operation === "unchanged").length,
    conflict: changes.filter((c) => c.operation === "conflict").length,
    errors: validation.errors.length,
    warnings: validation.warnings.length,
  };

  const canProceed = validation.valid && summary.conflict === 0;

  return {
    packageId,
    formatVersion,
    valid: validation.valid,
    canProceed,
    summary,
    changes,
    validation,
  };
}

export async function importContentPackage(
  input: unknown,
  options: ImportExecutionOptions = {}
): Promise<ContentImportResult> {
  const preview = await previewContentPackageImport(input, options);
  const pkg = input as ContentPackageV1;

  if (!preview.canProceed) {
    return {
      packageId: preview.packageId,
      formatVersion: preview.formatVersion,
      applied: false,
      rolledBack: false,
      preview,
      message: preview.valid
        ? `Import aborted due to ${preview.summary.conflict} published-content conflict(s).`
        : `Import aborted due to ${preview.summary.errors} validation error(s).`,
    };
  }

  if (options.dryRun) {
    return {
      packageId: preview.packageId,
      formatVersion: preview.formatVersion,
      applied: false,
      rolledBack: false,
      preview,
      message: "Dry-run complete; no database changes applied.",
    };
  }

  const grammarById = new Map(
    (pkg.entities?.grammar ?? []).map((g) => [g.id, g])
  );
  const readingById = new Map(
    (pkg.entities?.readings ?? []).map((r) => [r.id, r])
  );

  try {

    const db = getDb();
      await db.transaction(async (tx: DbTransaction) => {
      const now = new Date();


      for (const lvl of pkg.levels) {
        const levelId = lvl.code.toLowerCase();
        await tx
          .insert(cefrLevels)
          .values({
            id: levelId,
            slug: levelId,
            code: lvl.code,
            title: lvl.title,
            description: `${lvl.code} curriculum level`,
            sortOrder: lvl.order,
            status: lvl.status,
            publishedAt: lvl.status === "published" ? now : null,
            updatedAt: now,
          })
          .onConflictDoUpdate({
            target: cefrLevels.id,
            set: {
              slug: levelId,
              code: lvl.code,
              title: lvl.title,
              sortOrder: lvl.order,
              status: lvl.status,
              publishedAt: lvl.status === "published" ? now : null,
              updatedAt: now,
            },
          });
      }

      if (pkg.entities?.vocabulary) {
        for (const item of pkg.entities.vocabulary) {
          await tx
            .insert(vocabularyItems)
            .values({
              id: item.id,
              word: item.term,
              partOfSpeech: item.partOfSpeech ?? "noun",
              article: item.gender ?? null,
              pluralForm: item.pluralForm ?? null,
              englishMeaning: item.translation,
              exampleSentence: null,
              pronunciationRef: item.phonetic ?? null,
              audioRef: null,
              metadata: {
                slug: item.slug,
                language: item.language,
                translationLanguage: item.translationLanguage ?? "en",
                notes: item.notes ?? null,
                status: item.status,
              },
              updatedAt: now,
            })
            .onConflictDoUpdate({
              target: vocabularyItems.id,
              set: {
                word: item.term,
                partOfSpeech: item.partOfSpeech ?? "noun",
                article: item.gender ?? null,
                pluralForm: item.pluralForm ?? null,
                englishMeaning: item.translation,
                pronunciationRef: item.phonetic ?? null,
                metadata: {
                  slug: item.slug,
                  language: item.language,
                  translationLanguage: item.translationLanguage ?? "en",
                  notes: item.notes ?? null,
                  status: item.status,
                },
                updatedAt: now,
              },
            });
        }
      }

      if (pkg.entities?.verbs) {
        for (const verb of pkg.entities.verbs) {
          const conjugationRecord = Object.fromEntries(
            verb.conjugations.map((c, index) => [
              `${c.tense}:${c.person}:${index}`,
              c.form,
            ])
          );
          await tx
            .insert(verbItems)
            .values({
              id: verb.id,
              infinitive: verb.lemma,
              englishMeaning: verb.meaning,
              praeteritum: null,
              partizipIi: null,
              conjugations: {
                slug: verb.slug,
                language: verb.language,
                separable: verb.separable ?? false,
                auxiliary: verb.auxiliary ?? "none",
                status: verb.status,
                forms: conjugationRecord,
              },
              exampleSentences: [],
              audioRef: null,
              updatedAt: now,
            })
            .onConflictDoUpdate({
              target: verbItems.id,
              set: {
                infinitive: verb.lemma,
                englishMeaning: verb.meaning,
                conjugations: {
                  slug: verb.slug,
                  language: verb.language,
                  separable: verb.separable ?? false,
                  auxiliary: verb.auxiliary ?? "none",
                  status: verb.status,
                  forms: conjugationRecord,
                },
                updatedAt: now,
              },
            });
        }
      }

      const lessonByExerciseId = new Map<string, string>();
      for (const course of pkg.courses) {
        for (const week of course.weeks) {
          for (const lesson of week.lessons) {
            for (const section of lesson.sections) {
              for (const block of section.blocks) {
                if (block.kind === "exercise" && block.exerciseId) {
                  lessonByExerciseId.set(block.exerciseId, lesson.id);
                }
              }
            }
          }
        }
      }

      if (pkg.entities?.exercises) {
        for (const ex of pkg.entities.exercises) {
          await tx
            .insert(exercises)
            .values({
              id: ex.id,
              lessonId: lessonByExerciseId.get(ex.id) ?? null,
              slug: ex.slug,
              title: ex.title,
              instructions: `${ex.category}: ${ex.title}`,
              sortOrder: 0,
              status: ex.status,
              updatedAt: now,
            })
            .onConflictDoUpdate({
              target: exercises.id,
              set: {
                lessonId: lessonByExerciseId.get(ex.id) ?? null,
                slug: ex.slug,
                title: ex.title,
                instructions: `${ex.category}: ${ex.title}`,
                status: ex.status,
                updatedAt: now,
              },
            });

          for (let qIdx = 0; qIdx < ex.questions.length; qIdx += 1) {
            const q = ex.questions[qIdx];
            await tx
              .insert(exerciseQuestions)
              .values({
                id: q.id,
                exerciseId: ex.id,
                questionType: q.questionType,
                prompt: q.prompt,
                points: 1,
                hint: null,
                explanation: q.explanation ?? null,
                sortOrder: qIdx,
                questionData: {
                  options: q.options ?? [],
                  correctAnswer: q.correctAnswer,
                  acceptedAnswers: q.acceptedAnswers ?? [],
                },
                updatedAt: now,
              })
              .onConflictDoUpdate({
                target: exerciseQuestions.id,
                set: {
                  exerciseId: ex.id,
                  questionType: q.questionType,
                  prompt: q.prompt,
                  explanation: q.explanation ?? null,
                  sortOrder: qIdx,
                  questionData: {
                    options: q.options ?? [],
                    correctAnswer: q.correctAnswer,
                    acceptedAnswers: q.acceptedAnswers ?? [],
                  },
                  updatedAt: now,
                },
              });
          }
        }
      }

      for (const course of pkg.courses) {
        const levelId = course.levelCode.toLowerCase();
        await tx
          .insert(courses)
          .values({
            id: course.id,
            levelId,
            slug: course.slug,
            title: course.title,
            summary: `${course.levelCode} course: ${course.title}`,
            sortOrder: course.order,
            status: course.status,
            publishedAt: course.status === "published" ? now : null,
            updatedAt: now,
          })
          .onConflictDoUpdate({
            target: courses.id,
            set: {
              levelId,
              slug: course.slug,
              title: course.title,
              summary: `${course.levelCode} course: ${course.title}`,
              sortOrder: course.order,
              status: course.status,
              publishedAt: course.status === "published" ? now : null,
              updatedAt: now,
            },
          });

        for (let wIdx = 0; wIdx < course.weeks.length; wIdx += 1) {
          const week = course.weeks[wIdx];
          await tx
            .insert(weeks)
            .values({
              id: week.id,
              courseId: course.id,
              slug: week.slug,
              weekNumber: week.order || wIdx + 1,
              title: week.title,
              summary: week.title,
              sortOrder: week.order,
              status: week.status,
              publishedAt: week.status === "published" ? now : null,
              updatedAt: now,
            })
            .onConflictDoUpdate({
              target: weeks.id,
              set: {
                courseId: course.id,
                slug: week.slug,
                weekNumber: week.order || wIdx + 1,
                title: week.title,
                summary: week.title,
                sortOrder: week.order,
                status: week.status,
                publishedAt: week.status === "published" ? now : null,
                updatedAt: now,
              },
            });

          for (let lIdx = 0; lIdx < week.lessons.length; lIdx += 1) {
            const lesson = week.lessons[lIdx];
            await tx
              .insert(lessons)
              .values({
                id: lesson.id,
                weekId: week.id,
                slug: lesson.slug,
                dayNumber: lesson.order || lIdx + 1,
                title: lesson.title,
                summary: lesson.title,
                estimatedMinutes: null,
                sortOrder: lesson.order,
                status: lesson.status,
                publishedAt: lesson.status === "published" ? now : null,
                updatedAt: now,
              })
              .onConflictDoUpdate({
                target: lessons.id,
                set: {
                  weekId: week.id,
                  slug: lesson.slug,
                  dayNumber: lesson.order || lIdx + 1,
                  title: lesson.title,
                  summary: lesson.title,
                  sortOrder: lesson.order,
                  status: lesson.status,
                  publishedAt: lesson.status === "published" ? now : null,
                  updatedAt: now,
                },
              });

            for (const section of lesson.sections) {
              await tx
                .insert(lessonSections)
                .values({
                  id: section.id,
                  lessonId: lesson.id,
                  category: section.slug,
                  title: section.title,
                  sortOrder: section.order,
                  status: section.status,
                  updatedAt: now,
                })
                .onConflictDoUpdate({
                  target: lessonSections.id,
                  set: {
                    lessonId: lesson.id,
                    category: section.slug,
                    title: section.title,
                    sortOrder: section.order,
                    status: section.status,
                    updatedAt: now,
                  },
                });

              for (const block of section.blocks) {
                const grammarRef = block.grammarId ? grammarById.get(block.grammarId) : undefined;
                const readingRef = block.readingId ? readingById.get(block.readingId) : undefined;
                const payload: Record<string, unknown> = {
                  status: block.status,
                  ...(block.body !== undefined ? { body: block.body } : {}),
                  ...(grammarRef
                    ? {
                        grammar: {
                          id: grammarRef.id,
                          slug: grammarRef.slug,
                          language: grammarRef.language,
                          title: grammarRef.title,
                          summary: grammarRef.summary,
                          explanation: grammarRef.explanation,
                          examples: grammarRef.examples ?? [],
                          status: grammarRef.status,
                        },
                      }
                    : {}),
                  ...(readingRef
                    ? {
                        reading: {
                          id: readingRef.id,
                          slug: readingRef.slug,
                          language: readingRef.language,
                          title: readingRef.title,
                          body: readingRef.body,
                          wordCount: readingRef.wordCount ?? null,
                          comprehensionNotes: readingRef.comprehensionNotes ?? null,
                          status: readingRef.status,
                        },
                      }
                    : {}),
                };

                await tx
                  .insert(contentBlocks)
                  .values({
                    id: block.id,
                    sectionId: section.id,
                    blockType: block.kind,
                    sortOrder: block.order,
                    payload,
                    vocabularyId: block.vocabularyId ?? null,
                    verbId: block.verbId ?? null,
                    exerciseId: block.exerciseId ?? null,
                    updatedAt: now,
                  })
                  .onConflictDoUpdate({
                    target: contentBlocks.id,
                    set: {
                      sectionId: section.id,
                      blockType: block.kind,
                      sortOrder: block.order,
                      payload,
                      vocabularyId: block.vocabularyId ?? null,
                      verbId: block.verbId ?? null,
                      exerciseId: block.exerciseId ?? null,
                      updatedAt: now,
                    },
                  });
              }
            }
          }
        }
      }

      if (options.forceFailureBeforeCommit) {
        throw new Error(
          "Simulated failure before transaction commit for rollback verification."
        );
      }
    });

    return {
      packageId: preview.packageId,
      formatVersion: preview.formatVersion,
      applied: true,
      rolledBack: false,
      preview,
      message: `Import applied (${preview.summary.create} created, ${preview.summary.update} updated).`,
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    return {
      packageId: preview.packageId,
      formatVersion: preview.formatVersion,
      applied: false,
      rolledBack: true,
      preview,
      message: `Import failed and rolled back: ${errorMessage}`,
    };
  }
}

