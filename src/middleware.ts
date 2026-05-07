import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async (context, next) => {
  // Inject Cloudflare runtime environment variables into process.env
  // so that lazily-evaluated variables can still pick them up.
  if (context.locals.runtime?.env) {
    if (typeof globalThis.process === 'undefined') {
      (globalThis as any).process = { env: {} };
    } else if (!globalThis.process.env) {
      (globalThis as any).process.env = {};
    }
    
    const envObj = context.locals.runtime.env;
    for (const key of Object.keys(envObj)) {
      if (typeof envObj[key] === 'string') {
        globalThis.process.env[key] = envObj[key];
      }
    }
  }
  try {
    return await next();
  } catch (error: any) {
    console.error("Middleware caught an error:", error);
    return new Response(`Server Error: ${error.message}\n${error.stack}`, {
      status: 500,
    });
  }
});
