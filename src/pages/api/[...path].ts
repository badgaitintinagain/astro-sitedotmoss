import type { APIRoute } from 'astro';
import { NextRequest } from '../../shims/next-server';

type LegacyHandler = (request: NextRequest, context?: { params: Record<string, string> }) => Promise<Response>;

type LegacyModule = {
  GET?: LegacyHandler;
  POST?: LegacyHandler;
  PUT?: LegacyHandler;
  PATCH?: LegacyHandler;
  DELETE?: LegacyHandler;
  default?: any;
};

const handleAll: APIRoute = async (context) => {
  const { path } = context.params;
  const method = context.request.method as keyof LegacyModule;

  if (!path) {
      return new Response(JSON.stringify({ error: "Path missing" }), { status: 400 });
  }

  const segments = path.split('/');
  const potentialPaths = [
    `../../app/api/${path}/route.ts`,
    `../../app/api/${path}/route.js`,
  ];

  if (segments.length > 0) {
      const last = segments.length - 1;
      const copy = [...segments];
      copy[last] = '[id]';
      potentialPaths.push(`../../app/api/${copy.join('/')}/route.ts`);
      copy[last] = '[slug]';
      potentialPaths.push(`../../app/api/${copy.join('/')}/route.ts`);
  }

  let matchedModule: LegacyModule | null = null;
  let usedPath = "";

  for (const p of potentialPaths) {
      try {
          matchedModule = await import(/* @vite-ignore */ p);
          if (matchedModule && (matchedModule[method] || matchedModule.default?.[method])) {
              usedPath = p;
              break;
          }
      } catch (e) {}
  }

  const handler = matchedModule?.[method] || matchedModule?.default?.[method];

  if (!handler) {
    return new Response(JSON.stringify({ 
        error: `Not Found: ${method} ${context.url.pathname}`,
        debug_tried: potentialPaths
    }), { status: 404 });
  }

  const nextRequest = new NextRequest(context.request);
  const params: Record<string, string> = {};
  if (usedPath.includes('[id]')) {
      params['id'] = segments[segments.length - 1];
  } else if (usedPath.includes('[slug]')) {
      params['slug'] = segments[segments.length - 1];
  }
  
  try {
      return await handler(nextRequest, { params });
  } catch (err: any) {
      console.error(`API Error (${context.url.pathname}):`, err);
      return new Response(JSON.stringify({ error: err.message || "Internal Server Error" }), { status: 500 });
  }
};

export const GET = handleAll;
export const POST = handleAll;
export const PUT = handleAll;
export const PATCH = handleAll;
export const DELETE = handleAll;
export const ALL = handleAll;
