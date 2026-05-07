import { createClient } from "@libsql/client/web";

let _turso: ReturnType<typeof createClient> | null = null;

export function getTurso() {
  if (_turso) return _turso;

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

  if (!url) {
    // Return a dummy client at build time if env is not found to prevent crashes,
    // Note: Astro may evaluate this module at build time.
    url = "libsql://missing-database.turso.io";
    token = "missing-token";
  }

  _turso = createClient({
    url,
    authToken: token,
  });

  return _turso;
}

export const turso = new Proxy({} as ReturnType<typeof createClient>, {
  get(target, prop, receiver) {
    const client = getTurso();
    const val = Reflect.get(client, prop, receiver);
    return typeof val === 'function' ? val.bind(client) : val;
  }
});
