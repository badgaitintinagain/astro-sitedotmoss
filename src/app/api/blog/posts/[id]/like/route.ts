import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { postLikes } from '@/lib/db/schema';
import { eq, and, count } from 'drizzle-orm';

// Like a post
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params;
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      );
    }

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
      return NextResponse.json(
        { error: 'Already liked' },
        { status: 400 }
      );
    }

    // Add like
    const newLike = {
      id: crypto.randomUUID(),
      postId,
      userId,
      createdAt: new Date(),
    };

    await db.insert(postLikes).values(newLike);

    // Get total likes using COUNT
    const [result] = await db
      .select({ count: count() })
      .from(postLikes)
      .where(eq(postLikes.postId, postId));

    return NextResponse.json({
      success: true,
      likesCount: result.count,
      isLiked: true,
    });
  } catch (error) {
    console.error('Like error:', error);
    return NextResponse.json(
      { error: 'Failed to like post' },
      { status: 500 }
    );
  }
}

// Unlike a post
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params;
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      );
    }

    await db
      .delete(postLikes)
      .where(
        and(
          eq(postLikes.postId, postId),
          eq(postLikes.userId, userId)
        )
      );

    // Get total likes using COUNT
    const [result] = await db
      .select({ count: count() })
      .from(postLikes)
      .where(eq(postLikes.postId, postId));

    return NextResponse.json({
      success: true,
      likesCount: result.count,
      isLiked: false,
    });
  } catch (error) {
    console.error('Unlike error:', error);
    return NextResponse.json(
      { error: 'Failed to unlike post' },
      { status: 500 }
    );
  }
}

// Get like status and count
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params;
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    const [likesResult] = await db
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

    return NextResponse.json({
      likesCount: likesResult.count,
      isLiked,
    });
  } catch (error) {
    console.error('Get likes error:', error);
    return NextResponse.json(
      { error: 'Failed to get likes' },
      { status: 500 }
    );
  }
}
