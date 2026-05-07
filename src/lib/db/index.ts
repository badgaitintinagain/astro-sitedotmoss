import { drizzle } from "drizzle-orm/libsql/web";
import { turso } from "./client";
import * as schema from "./schema";

// Drizzle receives the proxied 'turso' client here safely at startup.
// It will intercept all `.execute()` and `.batch()` calls on the fly.
export const db = drizzle(turso, { schema });

export * from "./schema";
