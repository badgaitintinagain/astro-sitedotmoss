import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async (context, next) => {
  // Inject Cloudflare runtime environment variables into process.env
  // so that lazily-evaluated variables can still pick them up.
  if (context.locals.runtime?.env) {
    // Assign the Cloudflare bindings directly to a global variable
    // because Object.keys() doesn't work on Cloudflare's C++ binding objects.
    (globalThis as any).CF_ENV = context.locals.runtime.env;
    
    try {
      if (typeof globalThis.process === 'undefined') {
        (globalThis as any).process = { env: {} };
      } else if (!globalThis.process.env) {
        (globalThis as any).process.env = {};
      }
      
      // Explicitly map known required variables just in case
      const CF_ENV = context.locals.runtime.env as any;
      if (CF_ENV.TURSO_DATABASE_URL) globalThis.process.env.TURSO_DATABASE_URL = CF_ENV.TURSO_DATABASE_URL;
      if (CF_ENV.TURSO_AUTH_TOKEN) globalThis.process.env.TURSO_AUTH_TOKEN = CF_ENV.TURSO_AUTH_TOKEN;
      if (CF_ENV.CLOUDINARY_API_KEY) globalThis.process.env.CLOUDINARY_API_KEY = CF_ENV.CLOUDINARY_API_KEY;
      if (CF_ENV.CLOUDINARY_API_SECRET) globalThis.process.env.CLOUDINARY_API_SECRET = CF_ENV.CLOUDINARY_API_SECRET;
      if (CF_ENV.CLOUDINARY_CLOUD_NAME) globalThis.process.env.CLOUDINARY_CLOUD_NAME = CF_ENV.CLOUDINARY_CLOUD_NAME;
      if (CF_ENV.JWT_SECRET) globalThis.process.env.JWT_SECRET = CF_ENV.JWT_SECRET;
    } catch(err) {
      console.error("Error setting env", err);
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
