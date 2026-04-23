import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ cookies }) => {
  // Clear auth cookie by setting it to expire immediately
  cookies.set('auth_user', '', {
    path: '/',
    expires: new Date(0),
    httpOnly: true,
  });
  
  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}
