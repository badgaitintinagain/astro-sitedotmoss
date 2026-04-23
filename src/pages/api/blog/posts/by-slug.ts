import type { APIRoute } from 'astro';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

export const GET: APIRoute = async ({ url }) => {
  try {
    const slug = url.searchParams.get('slug');
    
    if (!slug) {
      return new Response(JSON.stringify({ error: 'Slug parameter is required' }), { status: 400 });
    }

    const result = await db.run(sql`SELECT * FROM posts WHERE slug = ${slug} LIMIT 1`);
    const post = result.rows[0] as any;

    if (!post) {
      return new Response(JSON.stringify({ error: 'Post not found' }), { status: 404 });
    }

    let parsedTags = [];
    let parsedImages = [];
    try {
      parsedTags = post.tags ? (typeof post.tags === 'string' ? JSON.parse(post.tags) : post.tags) : [];
    } catch (e) { parsedTags = []; }
    try {
      parsedImages = post.images ? (typeof post.images === 'string' ? JSON.parse(post.images) : post.images) : [];
    } catch (e) { parsedImages = []; }

    return new Response(JSON.stringify({ 
      post: {
        id: post.id,
        title: post.title,
        slug: post.slug,
        content: post.content,
        excerpt: post.excerpt,
        coverImage: post.cover_image,
        authorName: post.author_name,
        createdAt: post.created_at,
        tags: parsedTags,
        images: parsedImages,
      }
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error: any) {
    console.error('Error fetching post:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch post', details: error.message }), { status: 500 });
  }
}
