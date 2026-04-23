import { db, posts } from '@/lib/db';
import { desc } from 'drizzle-orm';
import { withAuth } from '@/lib/middleware/auth';

export const GET = withAuth(async () => {
  try {
    const allPosts = await db
      .select()
      .from(posts)
      .orderBy(desc(posts.createdAt));

    const postsWithParsedTags = allPosts.map(post => {
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
      posts: postsWithParsedTags,
      total: allPosts.length 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error fetching all posts:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch posts' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}, true);
