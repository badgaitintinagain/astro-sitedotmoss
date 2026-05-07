import { createClient } from "@libsql/client/web";

// Create a dummy client to satisfy Drizzle during initialization + build time
const _dummyTurso = createClient({
  url: "libsql://missing-database.turso.io",
  authToken: "missing-token",
});

let _realTurso: ReturnType<typeof createClient> | null = null;

export function getTurso() {
  if (_realTurso) return _realTurso;

  // Try to get variables from Cloudflare global context or process.env
  const cfEnv = (globalThis as any).CF_ENV || {};
  let url = cfEnv.TURSO_DATABASE_URL;
  let token = cfEnv.TURSO_AUTH_TOKEN;

  if (!url && typeof process !== 'undefined' && process.env) {
    url = process.env.TURSO_DATABASE_URL;
    token = process.env.TURSO_AUTH_TOKEN;
  }

  if (typeof import.meta !== 'undefined' && import.meta.env) {
    url = url || import.meta.env.TURSO_DATABASE_URL;
    token = token || import.meta.env.TURSO_AUTH_TOKEN;
  }

  if (url) {
    _realTurso = createClient({
      url,
      authToken: token,
    });
    return _realTurso;
  }

  return _dummyTurso;
}

// Proxy all calls to the real client if configured, otherwise fallback to dummy
export const turso = new Proxy(_dummyTurso, {
  get(_target, prop) {
    const client = getTurso();
    const val = (client as any)[prop];
    // Return functions bound to the client so 'this' is correct
    return typeof val === 'function' ? val.bind(client) : val;
  }
});
