import type { APIRoute, APIContext } from 'astro';

export type User = { id: string; email: string; name: string; role: string };

type AuthenticatedHandler = (context: APIContext, user: User) => Response | Promise<Response>;

export function withAuth(handler: AuthenticatedHandler, requireAdmin = false): APIRoute {
  return async (context) => {
    try {
      const { cookies } = context;
      const authCookie = cookies.get('auth_user');
      
      if (!authCookie) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      const user = JSON.parse(authCookie.value);

      if (requireAdmin && user.role !== 'admin') {
        return new Response(JSON.stringify({ error: 'Forbidden - Admin access required' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      return await handler(context, user);
    } catch (error) {
      console.error('Auth middleware error:', error);
      return new Response(JSON.stringify({ error: 'Invalid session' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  };
}
