import { db, posts } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { withAuth } from '@/lib/middleware/auth';

export const PATCH = withAuth(async ({ params, request }) => {
  try {
    const { id } = params;
    if (!id) return new Response(JSON.stringify({ error: 'Post ID required' }), { status: 400 });

    const { published } = await request.json();

    await db
      .update(posts)
      .set({ 
        published,
        updatedAt: new Date()
      })
      .where(eq(posts.id, id));

    return new Response(JSON.stringify({ 
      success: true,
      message: `Post ${published ? 'published' : 'unpublished'} successfully`
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error updating post status:', error);
    return new Response(JSON.stringify({ error: 'Failed to update post status' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}, true);
