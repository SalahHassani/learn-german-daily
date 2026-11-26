import "server-only";

import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

export type AppDatabase = NodePgDatabase<typeof schema>;

let cachedPool: Pool | null = null;
let cachedDb: AppDatabase | null = null;

export class DatabaseConfigurationError extends Error {
  constructor(message = "Database connection is not configured.") {
    super(message);
    this.name = "DatabaseConfigurationError";
  }
}

export function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) {
    throw new DatabaseConfigurationError(
      "Missing DATABASE_URL environment variable. Configure PostgreSQL before using the database provider."
    );
  }
  return url;
}

export function getDb(): AppDatabase {
  if (cachedDb) {
    return cachedDb;
  }

  const connectionString = getDatabaseUrl();
  cachedPool = new Pool({
    connectionString,
  });
  cachedDb = drizzle(cachedPool, { schema });

  return cachedDb;
}

export async function closeDb(): Promise<void> {
  if (cachedPool) {
    await cachedPool.end();
    cachedPool = null;
    cachedDb = null;
  }
}

