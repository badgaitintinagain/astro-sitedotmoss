import type { APIRoute } from 'astro';
import { db, comments } from '@/lib/db';
import { eq, and, desc } from 'drizzle-orm';

export const GET: APIRoute = async ({ url }) => {
  try {
    const slug = url.searchParams.get('slug');
    
    if (!slug) {
      return new Response(JSON.stringify({ error: 'Slug parameter is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const approvedComments = await db
      .select()
      .from(comments)
      .where(and(
        eq(comments.postSlug, slug),
        eq(comments.status, 'approved')
      ))
      .orderBy(desc(comments.createdAt));

    return new Response(JSON.stringify({ comments: approvedComments }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch comments' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
