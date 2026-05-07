import { createClient } from "@libsql/client/web";

let _turso: ReturnType<typeof createClient> | null = null;

export function getTurso() {
  if (_turso) return _turso;

  // Attempt to read from process.env (polyfilled by middleware on Cloudflare) or import.meta.env
  let url = typeof process !== 'undefined' && process.env ? process.env.TURSO_DATABASE_URL : undefined;
  let token = typeof process !== 'undefined' && process.env ? process.env.TURSO_AUTH_TOKEN : undefined;

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
