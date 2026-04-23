import { NextRequest, NextResponse } from 'next/server';
import { db, posts } from '@/lib/db';
import { generateId, generateSlug } from '@/lib/auth/utils';
import { withAuth } from '@/lib/middleware/auth';

async function createPostHandler(request: NextRequest, user: { id: string; email: string; name: string; role: string }) {
  try {
    const body = await request.json();
    const { title, content, excerpt, coverImage, images, tags, published } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
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

    return NextResponse.json({ 
      success: true,
      post: {
        id: postId,
        slug,
      }
    });
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    );
  }
}

export const POST = withAuth(createPostHandler, true);
