import { NextResponse } from 'next/server';
import { db, posts } from '@/lib/db';
import { desc } from 'drizzle-orm';
import { withAuth } from '@/lib/middleware/auth';

async function getAllPostsHandler() {
  try {
    const allPosts = await db
      .select()
      .from(posts)
      .orderBy(desc(posts.createdAt));

    const postsWithParsedTags = allPosts.map(post => ({
      ...post,
      tags: post.tags ? JSON.parse(post.tags) : [],
      images: post.images ? JSON.parse(post.images) : [],
    }));

    return NextResponse.json({ 
      posts: postsWithParsedTags,
      total: allPosts.length 
    });
  } catch (error) {
    console.error('Error fetching all posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}

export const GET = withAuth(getAllPostsHandler, true);
