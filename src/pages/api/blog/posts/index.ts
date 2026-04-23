import type { APIRoute } from 'astro';
import { db, posts } from '@/lib/db';
import { desc, eq, sql } from 'drizzle-orm';

export const GET: APIRoute = async ({ url }) => {
  try {
    const limit = parseInt(url.searchParams.get('limit') || '50');

    // Use Drizzle to get posts with counts
    const allPosts = await db
      .select({
        id: posts.id,
        title: posts.title,
        slug: posts.slug,
        excerpt: posts.excerpt,
        content: posts.content,
        coverImage: posts.coverImage,
        images: posts.images,
        authorId: posts.authorId,
        authorName: posts.authorName,
        tags: posts.tags,
        published: posts.published,
        createdAt: posts.createdAt,
        updatedAt: posts.updatedAt,
        likesCount: sql<number>`(SELECT COUNT(*) FROM post_likes WHERE post_likes.post_id = ${posts.id})`.mapWith(Number),
        commentsCount: sql<number>`(SELECT COUNT(*) FROM comments WHERE comments.post_slug = ${posts.slug})`.mapWith(Number),
      })
      .from(posts)
      .where(eq(posts.published, true))
      .orderBy(desc(posts.createdAt))
      .limit(limit);

    const postsWithParsed = allPosts.map(post => {
      let parsedTags = [];
      let parsedImages = [];
      try {
        parsedTags = post.tags ? (typeof post.tags === 'string' ? JSON.parse(post.tags) : post.tags) : [];
      } catch (e) { parsedTags = []; }
      try {
        parsedImages = post.images ? (typeof post.images === 'string' ? JSON.parse(post.images) : post.images) : [];
      } catch (e) { parsedImages = []; }

      return {
        ...post,
        tags: parsedTags,
        images: parsedImages,
      };
    });

    return new Response(JSON.stringify({
      posts: postsWithParsed,
      total: allPosts.length
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('Error fetching posts:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch posts', details: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
