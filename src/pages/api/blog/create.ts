import { db, posts } from '@/lib/db';
import { generateId, generateSlug } from '@/lib/auth/utils';
import { withAuth } from '@/lib/middleware/auth';

export const POST = withAuth(async ({ request }, user) => {
  try {
    const body = await request.json();
    const { title, content, excerpt, coverImage, images, tags, published } = body;

    if (!title || !content) {
      return new Response(JSON.stringify({ error: 'Title and content are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const postId = generateId();
    const slug = generateSlug(title);
    const imageList: string[] = Array.isArray(images) ? images.slice(0, 5) : [];
    const primaryImage = imageList[0] || coverImage || null;

    await db.insert(posts).values({
      id: postId,
      title,
      slug,
      excerpt: excerpt || content.substring(0, 150) + '...',
      content,
      coverImage: primaryImage,
      images: JSON.stringify(imageList),
      authorId: user.id,
      authorName: user.name,
      tags: JSON.stringify(tags || []),
      published: published || false,
    });

    return new Response(JSON.stringify({ 
      success: true,
      post: {
        id: postId,
        slug,
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error creating post:', error);
    return new Response(JSON.stringify({ error: 'Failed to create post' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}, true);
