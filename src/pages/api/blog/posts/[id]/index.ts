import { db, posts, comments } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { withAuth } from '@/lib/middleware/auth';
import { generateSlug } from '@/lib/auth/utils';

// GET - Fetch a single post by ID (for admin edit)
export const GET = withAuth(async ({ params }) => {
  try {
    const { id } = params;
    if (!id) return new Response(JSON.stringify({ error: 'Post ID required' }), { status: 400 });

    const postList = await db
      .select()
      .from(posts)
      .where(eq(posts.id, id))
      .limit(1);

    const post = postList[0];

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
        ...post,
        tags: parsedTags,
        images: parsedImages,
      }
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('Error fetching post:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch post' }), { status: 500 });
  }
}, true);

// PATCH - Update a post
export const PATCH = withAuth(async ({ params, request }) => {
  try {
    const { id } = params;
    if (!id) return new Response(JSON.stringify({ error: 'Post ID required' }), { status: 400 });

    const body = await request.json();
    const { title, content, excerpt, coverImage, images, tags, published } = body;

    // Fetch the current post to get the old slug
    const existing = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
    const oldSlug = existing[0]?.slug;

    // Generate slug from title
    const slug = generateSlug(title);
    const imageList: string[] = Array.isArray(images) ? images.slice(0, 5) : [];
    const primaryImage = imageList[0] || coverImage || null;

    await db
      .update(posts)
      .set({
        title,
        slug,
        content,
        excerpt: excerpt || content.substring(0, 150) + '...',
        coverImage: primaryImage,
        images: JSON.stringify(imageList),
        tags: JSON.stringify(tags || []),
        published: published ?? false,
        updatedAt: new Date(),
      })
      .where(eq(posts.id, id));

    // If the slug changed, migrate comments to the new slug
    if (oldSlug && oldSlug !== slug) {
      await db
        .update(comments)
        .set({ postSlug: slug })
        .where(eq(comments.postSlug, oldSlug));
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error('Error updating post:', error);
    return new Response(JSON.stringify({ error: 'Failed to update post' }), { status: 500 });
  }
}, true);

// DELETE - Delete a post
export const DELETE = withAuth(async ({ params }) => {
  try {
    const { id } = params;
    if (!id) return new Response(JSON.stringify({ error: 'Post ID required' }), { status: 400 });

    await db.delete(posts).where(eq(posts.id, id));

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error('Error deleting post:', error);
    return new Response(JSON.stringify({ error: 'Failed to delete post' }), { status: 500 });
  }
}, true);
