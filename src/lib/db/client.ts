import { createClient } from "@libsql/client/web";

const tursoUrl = import.meta.env.TURSO_DATABASE_URL ?? process.env.TURSO_DATABASE_URL;
const tursoAuthToken = import.meta.env.TURSO_AUTH_TOKEN ?? process.env.TURSO_AUTH_TOKEN;

if (!tursoUrl) {
  throw new Error("Missing TURSO_DATABASE_URL in environment variables");
}

export const turso = createClient({
  url: tursoUrl,
  authToken: tursoAuthToken,
});
