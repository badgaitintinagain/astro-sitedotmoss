import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ cookies }) => {
  try {
    const authCookie = cookies.get('auth_user');
    
    if (!authCookie) {
      return new Response(JSON.stringify({ user: null }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const user = JSON.parse(authCookie.value);
    
    return new Response(JSON.stringify({ user }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch {
    return new Response(JSON.stringify({ user: null }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
