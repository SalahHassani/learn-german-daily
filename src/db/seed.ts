import "dotenv/config";

import { eq } from "drizzle-orm";
import { closeDb, getDb } from "./index";
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
  type PublishingStatusValue,
} from "./schema";

export interface SeedOptions {
  /** When true, closes the shared connection pool after seeding (CLI mode). */
  closePool?: boolean;
}

function normalizeStatus(raw: unknown): PublishingStatusValue {
  if (raw === "published" || raw === "coming_soon" || raw === "draft") {
    return raw;
  }
  return "draft";
}

/**
 * Idempotent seed entry point.
 * Wire your `localContentData` exports here to populate levels, courses, weeks,
 * lessons, sections, blocks, vocabulary, verbs, and exercises without duplicates.
 */
export async function seedDatabase(options: SeedOptions = {}): Promise<void> {
  const db = getDb();

  await db.transaction(async (tx) => {
    // Example idempotent upsert pattern for CEFR levels:
    // Replace with loops over your actual `localContentData` collections while
    // preserving existing IDs, slugs, sortOrder values, and publishing statuses.
    const sampleLevels = [
      {
        id: "level-a1",
        slug: "a1",
        code: "A1",
        title: "Level A1 — Beginner",
        description:
          "Foundational everyday expressions, introductions, and basic sentence structure.",
        sortOrder: 1,
        status: "published" as PublishingStatusValue,
        version: 1,
        publishedAt: new Date(),
      },
    ];

    for (const lvl of sampleLevels) {
      const existing = await tx
        .select({ id: cefrLevels.id })
        .from(cefrLevels)
        .where(eq(cefrLevels.id, lvl.id))
        .limit(1);

      if (existing.length === 0) {
        await tx.insert(cefrLevels).values(lvl);
      } else {
        await tx
          .update(cefrLevels)
          .set({
            slug: lvl.slug,
            code: lvl.code,
            title: lvl.title,
            description: lvl.description,
            sortOrder: lvl.sortOrder,
            status: normalizeStatus(lvl.status),
            version: lvl.version,
            updatedAt: new Date(),
          })
          .where(eq(cefrLevels.id, lvl.id));
      }
    }

    // Keep references to imported tables so TypeScript stays clean while wiring full data:
    void courses;
    void weeks;
    void lessons;
    void lessonSections;
    void contentBlocks;
    void vocabularyItems;
    void verbItems;
    void exercises;
    void exerciseQuestions;
  });

  if (options.closePool) {
    await closeDb();
  }
}

const isDirectExecution =
  typeof process !== "undefined" &&
  Array.isArray(process.argv) &&
  process.argv[1]?.toLowerCase().endsWith("seed.ts");

if (isDirectExecution) {
  seedDatabase({ closePool: true }).catch((err: unknown) => {
    console.error("Database seed failed:", err instanceof Error ? err.message : err);
    process.exitCode = 1;
  });
}

