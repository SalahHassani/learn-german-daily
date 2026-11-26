# Database Schema — Learn German Daily (Milestone 8)

## Overview

Learn German Daily uses **PostgreSQL** with **Drizzle ORM** (`src/db/schema.ts`) to store structured curriculum hierarchies, reusable lexical entries, exercises, and typed lesson content blocks. Learner progress remains in browser `localStorage` and is deliberately excluded from relational content tables in M8.

## Entity-Relationship Diagram

```text
cefr_levels (1) ────< (N) courses (1) ────< (N) weeks (1) ────< (N) lessons
                                                                      │
                         ┌────────────────────────────────────────────┴──────────────┐
                         ▼ (1:N)                                                     ▼ (1:N)
                  lesson_sections                                                 exercises
                         │                                                           │
                         ▼ (1:N)                                                     ▼ (1:N)
                  content_blocks ──────(0..1)──────> vocabulary_items         exercise_questions
                         │   └──────(0..1)──────> verb_items
                         └──────────(0..1)──────> exercises (optional direct ref)

                         