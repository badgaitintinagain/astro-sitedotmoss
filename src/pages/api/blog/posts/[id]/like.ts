import type { APIRoute } from 'astro';
import { db, postLikes } from '@/lib/db';
import { eq, and, count } from 'drizzle-orm';

export const POST: APIRoute = async ({ params, request }) => {
  try {
    const { id: postId } = params;
    if (!postId) return new Response(JSON.stringify({ error: 'Post ID required' }), { status: 400 });

    const { userId } = await request.json();
    if (!userId) return new Response(JSON.stringify({ error: 'User ID required' }), { status: 400 });

    // Check if already liked
    const existing = await db
      .select()
      .from(postLikes)
      .where(
        and(
          eq(postLikes.postId, postId),
          eq(postLikes.userId, userId)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      return new Response(JSON.stringify({ error: 'Already liked' }), { status: 400 });
    }

    // Add like
    await db.insert(postLikes).values({
      id: crypto.randomUUID(),
      postId,
      userId,
    });

    // Get total likes
    const result = await db
      .select({ count: count() })
      .from(postLikes)
      .where(eq(postLikes.postId, postId));

    return new Response(JSON.stringify({
      success: true,
      likesCount: result[0].count,
      isLiked: true,
    }), { status: 200 });
  } catch (error) {
    console.error('Like error:', error);
    return new Response(JSON.stringify({ error: 'Failed to like post' }), { status: 500 });
  }
}

export const DELETE: APIRoute = async ({ params, request }) => {
  try {
    const { id: postId } = params;
    if (!postId) return new Response(JSON.stringify({ error: 'Post ID required' }), { status: 400 });

    const { userId } = await request.json();
    if (!userId) return new Response(JSON.stringify({ error: 'User ID required' }), { status: 400 });

    await db
      .delete(postLikes)
      .where(
        and(
          eq(postLikes.postId, postId),
          eq(postLikes.userId, userId)
        )
      );

    // Get total likes
    const result = await db
      .select({ count: count() })
      .from(postLikes)
      .where(eq(postLikes.postId, postId));

    return new Response(JSON.stringify({
      success: true,
      likesCount: result[0].count,
      isLiked: false,
    }), { status: 200 });
  } catch (error) {
    console.error('Unlike error:', error);
    return new Response(JSON.stringify({ error: 'Failed to unlike post' }), { status: 500 });
  }
}

export const GET: APIRoute = async ({ params, url }) => {
  try {
    const { id: postId } = params;
    if (!postId) return new Response(JSON.stringify({ error: 'Post ID required' }), { status: 400 });

    const userId = url.searchParams.get('userId');

    const likesResult = await db
      .select({ count: count() })
      .from(postLikes)
      .where(eq(postLikes.postId, postId));

    let isLiked = false;
    if (userId) {
      const userLike = await db
        .select({ id: postLikes.id })
        .from(postLikes)
        .where(and(eq(postLikes.postId, postId), eq(postLikes.userId, userId)))
        .limit(1);
      isLiked = userLike.length > 0;
    }

    return new Response(JSON.stringify({
      likesCount: likesResult[0].count,
      isLiked,
    }), { status: 200 });
  } catch (error) {
    console.error('Get likes error:', error);
    return new Response(JSON.stringify({ error: 'Failed to get likes' }), { status: 500 });
  }
}
